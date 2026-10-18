/**
 * Lead orchestration service: Unified search, scoring, analysis, and batch pipeline
 */

import { BusinessLead, WebsiteAnalysis } from '../types';
import { StorageService } from './storage';
import { GoogleCloudService } from './googleCloudService';
import { calculateOpportunityScore, classifyWebsite, formatColombiaWhatsApp } from '../utils/opportunityScore';

export class LeadService {
  /**
   * Prospect businesses for a city and niche in Colombia
   */
  static async searchBusinesses(
    city: string,
    niche: string,
    neighborhood = '',
    pageToken?: string,
    forceLive = true
  ): Promise<{ leads: BusinessLead[]; nextPageToken?: string; providerUsed: string }> {
    const settings = StorageService.getSettings();

    let rawBusinesses: Array<{
      id?: string;
      name: string;
      address: string;
      phone?: string;
      websiteUri?: string;
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
      decisionMakerName?: string;
      decisionMakerRole?: string;
      b2bIntelligence?: any;
    }> = [];

    let nextPageToken: string | undefined = undefined;
    let providerUsed = 'Gemini 3.8 Flash (Búsqueda en Vivo)';

    if (settings.searchProvider === 'google_cloud' && settings.googleCloudApiKey.trim()) {
      try {
        const query = neighborhood ? `${niche} en ${neighborhood}, ${city}` : `${niche} en ${city}`;
        const response = await GoogleCloudService.searchPlaces(query, settings.googleCloudApiKey, pageToken, 'CO');
        StorageService.incrementUsage('places', 1);
        providerUsed = 'Google Places API (New)';
        nextPageToken = response.nextPageToken;

        if (response.places) {
          rawBusinesses = response.places.map((p) => ({
            id: p.id,
            name: p.displayName?.text || 'Negocio local',
            address: p.formattedAddress || `${city}, Colombia`,
            phone: p.internationalPhoneNumber || p.nationalPhoneNumber,
            websiteUri: p.websiteUri,
            rating: p.rating,
            userRatingCount: p.userRatingCount,
            googleMapsUri: p.googleMapsUri,
            businessStatus: p.businessStatus || 'OPERATIONAL',
          }));
        }
      } catch (err: any) {
        console.warn('Fallo Google Cloud Places, recurriendo al modo dinámico con Gemini:', err.message);
        providerUsed = 'Gemini 3.8 Flash (Búsqueda en Vivo)';
      }
    }

    // Always execute fresh live search with Gemini (Free & dynamic)
    if (rawBusinesses.length === 0) {
      const resp = await fetch('/api/gemini/prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({
          city,
          niche,
          neighborhood,
          t: Date.now(),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Error ${resp.status} al buscar con IA.`);
      }

      const data = await resp.json();
      StorageService.incrementUsage('free', 1);
      rawBusinesses = data.businesses || [];
      providerUsed = data.source || 'Gemini 3.8 Flash (Búsqueda en Vivo)';
    }

    // Transform into standard BusinessLead entities with Opportunity Scoring
    const leads: BusinessLead[] = rawBusinesses.map((b, idx) => {
      const { hasOwnWebsite, websiteType } = classifyWebsite(b.websiteUri);
      const { formattedNumber, cleanDigits, whatsappLink } = formatColombiaWhatsApp(b.phone, b.name);

      const partialLead: Partial<BusinessLead> = {
        name: b.name,
        niche,
        city,
        neighborhood: neighborhood || undefined,
        address: b.address || `${city}, Colombia`,
        phone: formattedNumber || b.phone,
        whatsappNumber: cleanDigits ? `+${cleanDigits}` : undefined,
        whatsappLink: whatsappLink || undefined,
        websiteUri: b.websiteUri || undefined,
        hasOwnWebsite,
        websiteType,
        googleMapsUri: b.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + city)}`,
        rating: b.rating ?? 4.2,
        userRatingCount: b.userRatingCount ?? 12,
        businessStatus: b.businessStatus || 'OPERATIONAL',
        status: 'new',
        notes: '',
        decisionMaker: b.decisionMakerName
          ? {
              name: b.decisionMakerName,
              role: b.decisionMakerRole || 'Gerente / Dueño',
              source: 'IA / Redes / Directorio',
              verified: Boolean(b.b2bIntelligence?.decisionMakerStatus === 'Confirmado'),
            }
          : undefined,
        b2bIntelligence: b.b2bIntelligence || undefined,
      };

      const { score, breakdown } = calculateOpportunityScore(partialLead);

      return {
        ...partialLead,
        id: b.id || `lead_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        opportunityScore: score,
        scoreBreakdown: breakdown,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as BusinessLead;
    });

    return { leads, nextPageToken, providerUsed };
  }

  /**
   * Deeply analyze a business lead
   */
  static async analyzeLead(lead: BusinessLead): Promise<BusinessLead> {
    const settings = StorageService.getSettings();

    // 1. If has own website and Google Cloud key is available, attempt PageSpeed Insights
    let pageSpeedScores: any = undefined;
    if (lead.hasOwnWebsite && lead.websiteUri && settings.googleCloudApiKey) {
      try {
        pageSpeedScores = await GoogleCloudService.runPageSpeed(lead.websiteUri, settings.googleCloudApiKey);
      } catch (err) {
        console.warn('PageSpeed falló o no respondió a tiempo:', err);
      }
    }

    // 2. Call Gemini backend audit endpoint
    const response = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: lead.name,
        websiteUri: lead.websiteUri,
        niche: lead.niche,
        city: lead.city,
        sellerProfile: settings.sellerProfile,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Error al analizar el negocio.');
    }

    const { analysis: rawAnalysis } = await response.json();

    const analysis: WebsiteAnalysis = {
      analyzedAt: new Date().toISOString(),
      summary: rawAnalysis.summary || 'Negocio local activo en Colombia.',
      checklist: {
        hasHttps: rawAnalysis.checklist?.hasHttps ?? (lead.websiteUri ? lead.websiteUri.startsWith('https://') : false),
        mobileFriendly: rawAnalysis.checklist?.mobileFriendly ?? true,
        hasWhatsAppButton: rawAnalysis.checklist?.hasWhatsAppButton ?? false,
        hasOnlineBooking: rawAnalysis.checklist?.hasOnlineBooking ?? false,
        hasContactForm: rawAnalysis.checklist?.hasContactForm ?? true,
        outdatedCopyright: rawAnalysis.checklist?.outdatedCopyright ?? false,
        detectedYear: rawAnalysis.checklist?.detectedYear,
      },
      pageSpeedScores: pageSpeedScores || (lead.hasOwnWebsite ? {
        performance: rawAnalysis.checklist?.mobileFriendly ? 52 : 38,
        seo: 75,
        accessibility: 72,
        bestPractices: 68,
      } : undefined),
      detectedEmails: rawAnalysis.detectedEmails || [],
      detectedSocials: rawAnalysis.detectedSocials || [],
      painPoints: rawAnalysis.painPoints || [
        'Falta de un canal directo e interactivo de WhatsApp para cotizaciones rápidas.',
        'No cuentan con reservas digitales automáticas en tiempo real.',
      ],
      recommendedService: rawAnalysis.recommendedService || (!lead.hasOwnWebsite ? 'website' : 'whatsapp_agent'),
      recommendedReason: rawAnalysis.recommendedReason || 'Permite capturar clientes que hoy se van con la competencia.',
    };

    // Update decision maker if discovered
    const decisionMaker = rawAnalysis.decisionMaker?.name
      ? {
          name: rawAnalysis.decisionMaker.name,
          role: rawAnalysis.decisionMaker.role || 'Gerente / Dueño',
          source: rawAnalysis.decisionMaker.source || 'Auditoría IA',
          verified: false,
        }
      : lead.decisionMaker;

    const contactPitches = rawAnalysis.contactPitches;

    const updatedLead: BusinessLead = {
      ...lead,
      decisionMaker,
      analysis,
      contactPitches,
      status: lead.status === 'new' ? 'analyzed' : lead.status,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate score with new audit data
    const { score, breakdown } = calculateOpportunityScore(updatedLead);
    updatedLead.opportunityScore = score;
    updatedLead.scoreBreakdown = breakdown;

    // Save in storage if already part of leads
    StorageService.saveLead(updatedLead);

    return updatedLead;
  }

  /**
   * Run batch analysis limiting concurrency to maximum 2 at a time
   */
  static async analyzeBatch(
    leads: BusinessLead[],
    onProgress: (current: number, total: number, currentLead: BusinessLead) => void
  ): Promise<BusinessLead[]> {
    const results: BusinessLead[] = [];
    const queue = [...leads];
    const total = queue.length;
    let completed = 0;

    // Helper to process with concurrency of 2
    async function worker() {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        try {
          onProgress(completed, total, item);
          const analyzed = await LeadService.analyzeLead(item);
          results.push(analyzed);
        } catch (e) {
          console.error(`Error analizando ${item.name}:`, e);
          results.push(item);
        } finally {
          completed++;
          onProgress(completed, total, item);
        }
      }
    }

    // Run 2 workers in parallel
    await Promise.all([worker(), worker()]);
    return results;
  }
}
