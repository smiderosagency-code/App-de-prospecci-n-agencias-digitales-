/**
 * Data types for Radar de Clientes
 */

export type WebsiteType = 'none' | 'social_or_directory' | 'own_website';

export type LeadStatus =
  | 'new'
  | 'analyzed'
  | 'contacted'
  | 'replied'
  | 'meeting'
  | 'won'
  | 'discarded';

export interface DecisionMaker {
  name?: string;
  role?: string; // Dueño, Gerente, Administrador, Fundador
  source?: string; // Web, Redes, Registro
  verified: boolean;
  linkedinUrl?: string;
  notes?: string;
}

export interface ScoreBreakdown {
  noWebsiteBonus: number;     // hasta 40 pts si no tiene web o es red social
  lacksWhatsAppBonus: number; // hasta 15 pts si no tiene botón de WhatsApp
  lacksBookingBonus: number;  // hasta 15 pts si no tiene reservas online
  lowSpeedBonus: number;      // hasta 10 pts si velocidad es baja o copyright viejo
  highActivityBonus: number;  // hasta 20 pts si tiene buen flujo de clientes/reseñas
}

export interface WebsiteChecklist {
  hasHttps: boolean;
  mobileFriendly: boolean;
  hasWhatsAppButton: boolean;
  hasOnlineBooking: boolean;
  hasContactForm: boolean;
  outdatedCopyright: boolean;
  detectedYear?: number;
}

export interface PageSpeedScores {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  screenshotBase64?: string;
}

export interface WebsiteAnalysis {
  analyzedAt: string;
  summary: string;
  checklist: WebsiteChecklist;
  pageSpeedScores?: PageSpeedScores;
  detectedEmails: string[];
  detectedSocials: { network: string; url: string }[];
  painPoints: string[];
  recommendedService: 'website' | 'whatsapp_agent' | 'booking_system';
  recommendedReason: string;
}

export interface ContactPitches {
  callScript30s: string;
  whatsappMessage: string;
  emailPitch: {
    subject: string;
    body: string;
  };
  tone: 'consultive' | 'direct' | 'loss_aversion';
}

export interface BusinessLead {
  id: string;
  name: string;
  niche: string;
  city: string;
  neighborhood?: string;
  address: string;
  phone?: string;
  whatsappNumber?: string;
  whatsappLink?: string;
  websiteUri?: string;
  hasOwnWebsite: boolean;
  websiteType: WebsiteType;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  
  decisionMaker?: DecisionMaker;
  opportunityScore: number;
  scoreBreakdown: ScoreBreakdown;

  analysis?: WebsiteAnalysis;
  contactPitches?: ContactPitches;

  status: LeadStatus;
  notes: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  name: string;
  agencyName: string;
  servicesOffered: string[];
  valueProposition: string;
  defaultTone: 'consultive' | 'direct' | 'loss_aversion';
  whatsappContact?: string;
}

export interface AppSettings {
  searchProvider: 'gemini_free' | 'google_cloud';
  googleCloudApiKey: string;
  sellerProfile: SellerProfile;
  monthlyUsage: {
    month: string;
    placesCallsCount: number;
    freeQueriesCount: number;
    maxFreePlacesThreshold: number;
  };
}

export interface NicheAuditResult {
  niche: string;
  totalCount: number;
  withoutOwnWebsiteCount: number;
  withoutOwnWebsitePercent: number;
  avgRating: number;
  avgReviews: number;
  opportunityRank: number;
  aiRecommendation: string;
  recommendedService: 'website' | 'whatsapp_agent' | 'booking_system';
  isTopPick: boolean;
}

export interface SearchFilters {
  onlyNoWebsite: boolean;
  onlyWithPhone: boolean;
  minRating: number;
  minReviews: number;
  hideClosed: boolean;
}
