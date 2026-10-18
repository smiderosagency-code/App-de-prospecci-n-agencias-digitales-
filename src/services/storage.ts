/**
 * Local storage abstraction layer for Radar de Clientes.
 * Designed with a clean repository interface to allow seamless migration to Firestore later.
 */

import { AppSettings, BusinessLead, BatchCampaign, BatchLeadRecord, ABVariant } from '../types';

const LEADS_STORAGE_KEY = 'radar_clientes_leads_v1';
const SETTINGS_STORAGE_KEY = 'radar_clientes_settings_v1';
const CACHE_STORAGE_KEY = 'radar_clientes_cache_v1';

const DEFAULT_SETTINGS: AppSettings = {
  searchProvider: 'gemini_free',
  googleCloudApiKey: '',
  sellerProfile: {
    name: 'S.Mideros Growth Team',
    agencyName: 'S.Mideros Agency',
    servicesOffered: [
      'Sistema de Conversión de Pacientes 360°',
      'Piloto Growth de 30 días para clínicas dentales y estéticas',
      'Respuesta y seguimiento ultra rápido de leads por WhatsApp e Instagram DM',
      'Automatización de recordatorios, reactivación de pacientes y citas',
      'CRM comercial y organización del embudo de consultas a citas',
      'Contenido en video y redes para generar confianza y autoridad',
    ],
    valueProposition:
      'Instalamos el Sistema de Conversión de Pacientes 360° con un Piloto Growth de 30 días para resolver consultas sin respuesta, leads que se enfrían y pérdida de tratamientos de alto valor en clínicas colombianas.',
    defaultTone: 'consultive',
    whatsappContact: '+57 300 000 0000',
    email: 's.miderosagency@gmail.com',
  },
  monthlyUsage: {
    month: new Date().toISOString().slice(0, 7), // "YYYY-MM"
    placesCallsCount: 0,
    freeQueriesCount: 0,
    maxFreePlacesThreshold: 1000,
  },
};

export class StorageService {
  /**
   * Get all saved leads
   */
  static getLeads(): BusinessLead[] {
    try {
      const data = localStorage.getItem(LEADS_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading leads from storage', e);
      return [];
    }
  }

  /**
   * Save or update a single lead
   */
  static saveLead(lead: BusinessLead): void {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === lead.id);
    const updatedLead = {
      ...lead,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      leads[index] = updatedLead;
    } else {
      leads.unshift(updatedLead);
    }

    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Error saving lead to storage', e);
    }
  }

  /**
   * Batch save leads
   */
  static saveLeadsBatch(newLeads: BusinessLead[]): number {
    const leads = this.getLeads();
    let addedCount = 0;

    newLeads.forEach((lead) => {
      const existsIndex = leads.findIndex((l) => l.id === lead.id || (l.name.toLowerCase() === lead.name.toLowerCase() && l.city.toLowerCase() === lead.city.toLowerCase()));
      if (existsIndex >= 0) {
        leads[existsIndex] = { ...leads[existsIndex], ...lead, updatedAt: new Date().toISOString() };
      } else {
        leads.unshift(lead);
        addedCount++;
      }
    });

    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Error batch saving leads', e);
    }

    return addedCount;
  }

  /**
   * Delete lead by ID
   */
  static deleteLead(id: string): void {
    const leads = this.getLeads().filter((l) => l.id !== id);
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Error deleting lead', e);
    }
  }

  /**
   * Get app settings
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      // Sync current month usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (parsed.monthlyUsage && parsed.monthlyUsage.month !== currentMonth) {
        parsed.monthlyUsage.month = currentMonth;
        parsed.monthlyUsage.placesCallsCount = 0;
        parsed.monthlyUsage.freeQueriesCount = 0;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Error reading settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update app settings
   */
  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }

  /**
   * Increment usage counter
   */
  static incrementUsage(type: 'places' | 'free', count = 1): void {
    const settings = this.getSettings();
    if (type === 'places') {
      settings.monthlyUsage.placesCallsCount += count;
    } else {
      settings.monthlyUsage.freeQueriesCount += count;
    }
    this.saveSettings(settings);
  }

  /**
   * Search cache helper (Disabled to guarantee 100% fresh, dynamic live searches on every query)
   */
  static getCachedSearch(_cacheKey: string): BusinessLead[] | null {
    return null;
  }

  static setCachedSearch(_cacheKey: string, _results: BusinessLead[]): void {
    // No-op: do not cache searches to ensure live dynamic results
  }

  /**
   * Export leads to CSV file
   */
  static exportLeadsToCSV(leads: BusinessLead[]): void {
    const headers = [
      'ID',
      'Nombre',
      'Nicho',
      'Ciudad',
      'Dirección',
      'Teléfono',
      'WhatsApp',
      'Web',
      'Tiene Web Propia',
      'Decisor (Nombre)',
      'Decisor (Cargo)',
      'Puntuación Oportunidad',
      'Estado Comercial',
      'Servicio Recomendado',
      'Próxima Acción',
      'Notas',
    ];

    const rows = leads.map((lead) => [
      lead.id,
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.niche || '').replace(/"/g, '""')}"`,
      `"${(lead.city || '').replace(/"/g, '""')}"`,
      `"${(lead.address || '').replace(/"/g, '""')}"`,
      `"${lead.phone || ''}"`,
      `"${lead.whatsappNumber || ''}"`,
      `"${lead.websiteUri || ''}"`,
      lead.hasOwnWebsite ? 'Sí' : 'No',
      `"${(lead.decisionMaker?.name || '').replace(/"/g, '""')}"`,
      `"${(lead.decisionMaker?.role || '').replace(/"/g, '""')}"`,
      lead.opportunityScore,
      lead.status,
      lead.analysis?.recommendedService || '',
      lead.nextFollowUpDate || '',
      `"${(lead.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `radar_leads_colombia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get all batches
   */
  static getBatches(): BatchCampaign[] {
    try {
      const data = localStorage.getItem('radar_clientes_batches_v1');
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading batches from storage', e);
      return [];
    }
  }

  /**
   * Save or update a batch
   */
  static saveBatch(batch: BatchCampaign): void {
    const batches = this.getBatches();
    const index = batches.findIndex((b) => b.id === batch.id);
    if (index >= 0) {
      batches[index] = batch;
    } else {
      batches.unshift(batch);
    }
    try {
      localStorage.setItem('radar_clientes_batches_v1', JSON.stringify(batches));
    } catch (e) {
      console.error('Error saving batch', e);
    }
  }

  /**
   * Delete batch by ID
   */
  static deleteBatch(batchId: string): void {
    const batches = this.getBatches().filter((b) => b.id !== batchId);
    try {
      localStorage.setItem('radar_clientes_batches_v1', JSON.stringify(batches));
    } catch (e) {
      console.error('Error deleting batch', e);
    }
  }

  /**
   * Create a new 25-lead batch with controlled A/B split
   */
  static createBatchFromLeads(
    cityName: string,
    nicheName: string,
    inputLeads: BusinessLead[]
  ): BatchCampaign {
    const batches = this.getBatches();
    const batchNumber = batches.length + 1;
    const batchId = `lote-${batchNumber}-${Date.now().toString(36)}`;

    // Pick top Priority A and 'SÍ'/'TAL VEZ' readyToBuy up to 25
    const eligibleLeads = inputLeads
      .filter((l) => l.b2bIntelligence?.readyToBuyStatus !== 'NO')
      .slice(0, 25);

    const records: BatchLeadRecord[] = eligibleLeads.map((lead, idx) => {
      const isVariantA = idx % 2 === 0;
      const b2b = lead.b2bIntelligence;
      const decisorName = lead.decisionMaker?.name || 'Director(a)';

      // Assign A/B Variant
      const variant: ABVariant = isVariantA
        ? {
            variantLetter: 'A',
            channel: 'WhatsApp',
            angle: 'Respuesta lenta',
            targetDecisor: 'Dueño / Director Médico',
            variantCode: 'Variante A (WhatsApp · Fuga Respuesta Lenta · Dueño/Director)',
            customPitch: `Hola ${decisorName}, estuve revisando ${lead.name} en ${lead.city}. Detectamos que muchas clínicas pierden hasta el 40% de consultas de ortodoncia e implantes por demorar más de 2 horas en responder en WhatsApp. En S.Mideros Agency instalamos un sistema que responde y califica en 60 segundos con un Piloto Growth de 30 días. ¿Cuándo tendrías 10 min para revisar tu embudo?`,
          }
        : {
            variantLetter: 'B',
            channel: 'WhatsApp',
            angle: 'Pacientes inactivos',
            targetDecisor: 'Gerente / Administrador',
            variantCode: 'Variante B (WhatsApp · Reactivación Pacientes · Gerente)',
            customPitch: `Hola ${decisorName}, te escribo respecto a ${lead.name} en ${lead.city}. Muchas clínicas tienen más de 200 pacientes inactivos que ya conocen el consultorio pero no volvieron. Con el Piloto Growth de S.Mideros Agency reactivamos entre 15 y 30 citas el primer mes sin gastar más en pauta. ¿Te gustaría ver cómo funciona el piloto de 30 días?`,
          };

      return {
        leadId: lead.id,
        leadName: lead.name,
        priority: b2b?.priority || 'A',
        readyToBuy: b2b?.readyToBuyStatus || 'SÍ',
        variant,
        sentStatus: 'pending',
        responseStatus: 'no_response',
        sentChannel: variant.channel,
      };
    });

    const newBatch: BatchCampaign = {
      id: batchId,
      batchNumber,
      name: `Lote ${batchNumber} · 25 Clínicas Prioridad A (${cityName})`,
      city: cityName,
      niche: nicheName,
      createdAt: new Date().toISOString(),
      targetSize: 25,
      status: 'ready_to_send',
      records,
      metrics: {
        totalInBatch: records.length,
        priorityACount: records.filter((r) => r.priority === 'A').length,
        readyToBuyYesCount: records.filter((r) => r.readyToBuy === 'SÍ').length,
        sentCount: 0,
        responsesCount: 0,
        demosCount: 0,
        pilotsCount: 0,
      },
      abSummary: {
        variantA: {
          count: records.filter((r) => r.variant.variantLetter === 'A').length,
          responses: 0,
          demos: 0,
        },
        variantB: {
          count: records.filter((r) => r.variant.variantLetter === 'B').length,
          responses: 0,
          demos: 0,
        },
      },
    };

    this.saveBatch(newBatch);
    return newBatch;
  }

  /**
   * Check Anti-Fallo Escalation Rule:
   * "Si tras 300–500 prospectos bien calificados no se logran al menos 3 demos y 1 piloto o cliente pagante, detén el escalado.
   * Revisa primero: ICP, oferta, mensaje, canal y demo."
   */
  static getEscalationAuditStats(): {
    totalAudited: number;
    totalDemos: number;
    totalPilots: number;
    haltRequired: boolean;
    reason?: string;
  } {
    const batches = this.getBatches();
    const leads = this.getLeads();

    // Total leads audited in pipeline
    const totalAudited = Math.max(
      leads.length,
      batches.reduce((acc, b) => acc + (b.records?.length || 0), 0)
    );

    const totalDemos = leads.filter((l) => l.status === 'meeting').length +
      batches.reduce((acc, b) => acc + (b.metrics?.demosCount || 0), 0);

    const totalPilots = leads.filter((l) => l.status === 'won').length +
      batches.reduce((acc, b) => acc + (b.metrics?.pilotsCount || 0), 0);

    const haltRequired = totalAudited >= 300 && (totalDemos < 3 || totalPilots < 1);

    return {
      totalAudited,
      totalDemos,
      totalPilots,
      haltRequired,
      reason: haltRequired
        ? 'Alerta Anti-Fallo: Se han contactado más de 300 prospectos sin alcanzar el mínimo de 3 demos y 1 piloto pagante. Detén el escalado masivo y audita los 5 factores: 1. ICP, 2. Oferta, 3. Mensaje, 4. Canal, 5. Demo.'
        : undefined,
    };
  }
}
