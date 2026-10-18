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

export interface B2BEvidenceSource {
  name: string;
  url: string;
  category: 'REPS' | 'RUES' | 'Google' | 'Instagram' | 'Web' | 'Directorio';
}

export type ReadyToBuyStatus = 'SÍ' | 'TAL VEZ' | 'NO';

export interface ReadyToBuyChecklist {
  receivesConsultations: boolean; // Recibe consultas por al menos un canal
  activeVerifiableChannel: boolean; // Canal de contacto activo y verificable
  hasOperatingCapacity: boolean; // Capacidad de agenda o personal visible
  hasResponseManager: boolean; // Responsable de respuesta (dueño, recepción, CM)
  offersHighValueTreatment: boolean; // Ofrece al menos un tratamiento de valor
  activeLast60to90Days: boolean; // Actividad reciente en últimos 60-90 días
  isNotClosedOrOutdated: boolean; // No parece cerrada ni desactualizada
}

export interface PainTestBeforePitch {
  clinicName: string;
  activeChannel: 'WhatsApp' | 'Instagram' | 'Web' | 'Teléfono' | string;
  publicEvidence: string;
  probableLeak: string; // Problema comercial concreto o 'Fuga no verificable'
  microTest: string; // Acción pequeña y de bajo riesgo
  nextStep: string; // Revisión de embudo, demo o conversación de 15 minutos
}

export interface HardExclusionEvaluation {
  isExcluded: boolean;
  reasons: string[];
}

export interface ABVariant {
  variantLetter: 'A' | 'B';
  channel: 'WhatsApp' | 'Correo' | 'Instagram DM';
  angle: 'Respuesta lenta' | 'Pacientes inactivos' | 'Contenido que no convierte';
  targetDecisor: 'Dueño / Director Médico' | 'Gerente / Administrador' | 'Coordinador de Admisiones';
  variantCode: string;
  customPitch: string;
}

export interface BatchLeadRecord {
  leadId: string;
  leadName: string;
  priority: 'A' | 'B' | 'C';
  readyToBuy: ReadyToBuyStatus;
  variant: ABVariant;
  sentAt?: string;
  sentStatus: 'pending' | 'sent';
  responseStatus: 'no_response' | 'responded' | 'demo_booked' | 'pilot_won' | 'bounced' | 'discarded';
  responseNotes?: string;
  sentChannel: 'WhatsApp' | 'Correo' | 'Instagram DM';
}

export interface BatchCampaign {
  id: string;
  batchNumber: number;
  name: string; // ej: "Lote 1 – 25 Clínicas Prioridad A Bogotá"
  city: string;
  niche: string;
  createdAt: string;
  targetSize: number; // 25
  status: 'building' | 'ready_to_send' | 'in_progress_72h' | 'completed' | 'halted_diagnostic';
  sentAt?: string;
  deadline72h?: string;
  records: BatchLeadRecord[];
  metrics: {
    totalInBatch: number;
    priorityACount: number;
    readyToBuyYesCount: number;
    sentCount: number;
    responsesCount: number;
    demosCount: number;
    pilotsCount: number;
  };
  abSummary: {
    variantA: { count: number; responses: number; demos: number };
    variantB: { count: number; responses: number; demos: number };
  };
  diagnosticHaltTriggered?: boolean;
  diagnosticNotes?: string;
}

export interface B2BIntelligence {
  // MÓDULO ANTI-FALLO: 1. Filtro "Lista para Comprar"
  readyToBuyStatus: ReadyToBuyStatus;
  readyToBuyChecklist: ReadyToBuyChecklist;

  // MÓDULO ANTI-FALLO: 2. Prueba de Dolor antes del Pitch (Formato obligatorio)
  painTest: PainTestBeforePitch;

  // MÓDULO ANTI-FALLO: 3. Criterios de Exclusión Duros
  hardExclusion: HardExclusionEvaluation;

  // MÓDULO ANTI-FALLO: 5. Prueba A/B Asignada
  assignedVariant?: ABVariant;
  batchId?: string;

  // 1. Capacidad de pago
  estimatedSize: '1-5 personas' | '6-15 personas' | '16-50 personas' | '50+ personas';
  locationsCount: number;
  professionalsCount?: number;
  highValueTreatments: string[]; // ej: 'Ortodoncia', 'Implantes', 'Rehabilitación oral', 'Estética dental'
  marketingInvestmentSignals: string[]; // ej: 'Meta Ads', 'Google Business Activo', 'TikTok'
  priceLevel: 'Económico' | 'Medio' | 'Medio-Alto' | 'Alto / Premium';
  operatingCapacity: string; // ej: "3 unidades activas con alta afluencia"

  // 2. Dolor del embudo
  mainAcquisitionChannel: string; // ej: "WhatsApp e Instagram DM"
  responseTimeSpeed: string; // ej: "> 2 horas o sin respuesta fuera de horario"
  hasOnlineBooking: boolean;
  hasVisibleCrmOrBot: boolean;
  lacksFollowUpOrRecall: boolean;
  mainFunnelLeak: string; // Fuga económica concreta

  // 3. Madurez comercial (Priorizar Nivel 1 y 2)
  commercialMaturityLevel: 1 | 2 | 3 | 4;
  commercialMaturityLabel: 'Nivel 1: Básico' | 'Nivel 2: Intermedio' | 'Nivel 3: Avanzado' | 'Nivel 4: Saturado';

  // 4. Intención de compra
  purchaseIntent: 'Alta' | 'Media' | 'Baja';
  intentSignals: string[]; // ej: 'Campañas activas en redes', 'Contratación comercial'

  // 5. Timing de contacto
  contactTiming: 'Óptimo' | 'Neutro' | 'Desfavorable';
  timingTriggerEvent: string; // Evento concreto que justifica contactar ahora
  timingEvidenceUrl?: string;

  // 6. Validación de contacto
  emailStatus: 'Validado' | 'Probable' | 'No identificado' | 'Rebote probable';
  institutionalEmail?: string;
  phoneStatus: 'WhatsApp Verificado' | 'Línea Fija' | 'No verificado';
  preferredChannel: 'WhatsApp' | 'Llamada' | 'Correo' | 'Instagram DM';
  decisionMakerStatus: 'Confirmado' | 'Probable' | 'No identificado';
  bounceRisk: 'Bajo' | 'Medio' | 'Alto';
  lastVerifiedDate: string;

  // 7. Segmento de oferta (S.Mideros Agency)
  offerSegment:
    | 'Conversión de consultas'
    | 'Reactivación de pacientes'
    | 'Contenido que convierte'
    | 'Seguimiento de tratamientos de alto valor'
    | 'Turismo médico'
    | 'Captación para clínica nueva o en expansión';
  recommendedOffer: 'Piloto Growth de 30 días' | 'Sistema de Conversión de Pacientes 360°';

  // 8. Cumplimiento & Fuentes (Ley 1581 de 2012)
  compliancePublicOnly: boolean;
  evidenceSources: B2BEvidenceSource[];
  ruesCiiu?: string; // ej: 'CIIU 8622'
  repsCode?: string;

  // Estrategia y propuesta comercial personalizada
  entryAngle: string;
  customFirstMessage: string;
  nextStepAction: string;
  priority: 'A' | 'B' | 'C';

  // 10. Razón de descarte (si aplica)
  discardReason?: string;
  discardCategory?:
    | 'Consultorio unipersonal sin digital'
    | 'Sin teléfono ni WhatsApp'
    | 'Sin actividad reciente'
    | 'Registro duplicado'
    | 'Solo en directorio sin operación'
    | 'Otro';
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
  b2bIntelligence?: B2BIntelligence;
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
  email?: string;
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
  priorityFilter?: 'ALL' | 'A' | 'B' | 'C';
  onlyHighIntent?: boolean;
  onlyWithDecisor?: boolean;
  readyToBuyFilter?: 'ALL' | 'SÍ' | 'TAL VEZ' | 'NO';
}
