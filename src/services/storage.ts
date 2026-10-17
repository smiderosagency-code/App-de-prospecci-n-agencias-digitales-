/**
 * Local storage abstraction layer for Radar de Clientes.
 * Designed with a clean repository interface to allow seamless migration to Firestore later.
 */

import { AppSettings, BusinessLead } from '../types';

const LEADS_STORAGE_KEY = 'radar_clientes_leads_v1';
const SETTINGS_STORAGE_KEY = 'radar_clientes_settings_v1';
const CACHE_STORAGE_KEY = 'radar_clientes_cache_v1';

const DEFAULT_SETTINGS: AppSettings = {
  searchProvider: 'gemini_free',
  googleCloudApiKey: '',
  sellerProfile: {
    name: 'Consultor Digital',
    agencyName: 'Agencia de Automatización Digital',
    servicesOffered: [
      'Páginas web modernas de alta conversión',
      'Agentes de Inteligencia Artificial por WhatsApp para citas y ventas 24/7',
      'Sistemas automatizados de reservas y recordatorios para negocios locales',
    ],
    valueProposition:
      'Ayudamos a negocios locales a digitalizarse, responder inmediatamente a prospectos por WhatsApp y no perder clientes frente a la competencia.',
    defaultTone: 'consultive',
    whatsappContact: '+57 300 000 0000',
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
}
