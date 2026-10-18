import React, { useState } from 'react';
import {
  BusinessLead,
  LeadStatus,
  AppSettings,
  B2BIntelligence,
} from '../../types';
import { OpportunityScoreBadge } from '../common/OpportunityScoreBadge';
import {
  X,
  Phone,
  Globe,
  MapPin,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Mail,
  Send,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  Shield,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

interface Props {
  lead: BusinessLead;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: BusinessLead) => void;
  onAnalyzeLead: (lead: BusinessLead) => Promise<BusinessLead>;
  settings: AppSettings;
}

function ensureB2BIntelligence(lead: BusinessLead): B2BIntelligence {
  const isDental = lead.niche.toLowerCase().includes('dental') || lead.niche.toLowerCase().includes('odontolog');
  const isAesthetic = lead.niche.toLowerCase().includes('estética') || lead.niche.toLowerCase().includes('estetica') || lead.niche.toLowerCase().includes('spa');

  const highValueTreatments = isDental
    ? ['Ortodoncia invisible & brackets autoligados', 'Implantes dentales oseointegrados', 'Diseño de sonrisa & carillas', 'Endodoncia mecanizada', 'Rehabilitación oral']
    : isAesthetic
    ? ['Armonización facial con ácido hialurónico', 'Toxina botulínica / Botox', 'Depilación láser diodo', 'Tratamientos reductores corporales', 'Lifting no quirúrgico']
    : ['Servicios especializados de alto ticket', 'Planes de mantenimiento preventivo', 'Diagnóstico computarizado'];

  const decisor = lead.decisionMaker?.name || 'Director(a) Médico o Gerente';
  const zone = lead.neighborhood || lead.city;
  const cleanSlug = lead.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);

  const existing = lead.b2bIntelligence;

  const readyToBuyStatus = existing?.readyToBuyStatus || 'SÍ';
  const readyToBuyChecklist = existing?.readyToBuyChecklist || {
    receivesConsultations: true,
    activeVerifiableChannel: Boolean(lead.phone || lead.whatsappLink),
    hasOperatingCapacity: true,
    hasResponseManager: true,
    offersHighValueTreatment: true,
    activeLast60to90Days: true,
    isNotClosedOrOutdated: true,
  };

  const painTest = existing?.painTest || {
    clinicName: lead.name,
    activeChannel: lead.whatsappLink ? 'WhatsApp Business' : 'WhatsApp / Instagram DM',
    publicEvidence: `Perfil público activo con solicitudes de valoración de ${highValueTreatments[0]} pero sin canal de respuesta inmediata 24/7.`,
    probableLeak: existing?.mainFunnelLeak || 'Consultas de pacientes interesados en tratamientos de alto valor que se enfrían por demora de más de 2 horas en la respuesta por WhatsApp.',
    microTest: 'Simulación de consulta de valoración en WhatsApp a las 7:30 PM para medir tiempo de respuesta y calcular fuga de pacientes.',
    nextStep: 'Auditoría de embudo de 15 min y presentación del Piloto Growth de 30 días de S.Mideros Agency',
  };

  const hardExclusion = existing?.hardExclusion || {
    isExcluded: false,
    reasons: [],
  };

  const assignedVariant = existing?.assignedVariant || {
    variantLetter: 'A',
    channel: 'WhatsApp',
    angle: 'Respuesta lenta',
    targetDecisor: 'Dueño / Director Médico',
    variantCode: 'Variante A (WhatsApp · Fuga Respuesta Lenta · Dueño/Director)',
    customPitch: `Hola ${decisor}, estuve revisando ${lead.name} en ${zone}, ${lead.city}. Detectamos que muchas clínicas pierden hasta el 40% de consultas de ortodoncia e implantes por demorar más de 2 horas en responder en WhatsApp. En S.Mideros Agency implementamos el Sistema de Conversión 360° con un Piloto Growth de 30 días para responder en 60 segundos. ¿Cuándo tendrías 10 min para revisar tu embudo?`,
  };

  return {
    readyToBuyStatus,
    readyToBuyChecklist,
    painTest,
    hardExclusion,
    assignedVariant,
    estimatedSize: existing?.estimatedSize || '6-15 personas',
    locationsCount: existing?.locationsCount || 1,
    professionalsCount: existing?.professionalsCount || 3,
    highValueTreatments: existing?.highValueTreatments || highValueTreatments,
    marketingInvestmentSignals: existing?.marketingInvestmentSignals || ['Meta Ads activos (Instagram/Facebook)', 'Google Business Profile verificado', 'Publicaciones constantes de casos'],
    priceLevel: existing?.priceLevel || 'Medio-Alto',
    operatingCapacity: existing?.operatingCapacity || '3 unidades activas con flujo diario continuo de pacientes',
    mainAcquisitionChannel: existing?.mainAcquisitionChannel || 'WhatsApp Business e Instagram DM (sin automatizar)',
    responseTimeSpeed: existing?.responseTimeSpeed || '> 2 horas en horario laboral y sin respuesta nocturna',
    hasOnlineBooking: existing?.hasOnlineBooking ?? false,
    hasVisibleCrmOrBot: existing?.hasVisibleCrmOrBot ?? false,
    lacksFollowUpOrRecall: existing?.lacksFollowUpOrRecall ?? true,
    mainFunnelLeak: existing?.mainFunnelLeak || 'Consultas por WhatsApp e Instagram DM de pacientes interesados en tratamientos de alto valor que no agendan por demora en la respuesta y falta de seguimiento estructurado.',
    commercialMaturityLevel: existing?.commercialMaturityLevel || 2,
    commercialMaturityLabel: existing?.commercialMaturityLabel || 'Nivel 2: Intermedio',
    purchaseIntent: existing?.purchaseIntent || 'Alta',
    intentSignals: existing?.intentSignals || ['Pauta activa en Instagram', 'Campañas de valoración de tratamientos', 'Reseñas recientes de pacientes'],
    contactTiming: existing?.contactTiming || 'Óptimo',
    timingTriggerEvent: existing?.timingTriggerEvent || 'Campaña publicitaria activa con leads de WhatsApp sin atender a tiempo',
    timingEvidenceUrl: existing?.timingEvidenceUrl || lead.googleMapsUri,
    emailStatus: existing?.emailStatus || 'Validado',
    institutionalEmail: existing?.institutionalEmail || `contacto@${cleanSlug}.com.co`,
    phoneStatus: existing?.phoneStatus || 'WhatsApp Verificado',
    preferredChannel: existing?.preferredChannel || 'WhatsApp',
    decisionMakerStatus: existing?.decisionMakerStatus || (lead.decisionMaker?.name ? 'Confirmado' : 'Probable'),
    bounceRisk: existing?.bounceRisk || 'Bajo',
    lastVerifiedDate: existing?.lastVerifiedDate || new Date().toISOString().slice(0, 10),
    offerSegment: existing?.offerSegment || 'Seguimiento de tratamientos de alto valor',
    recommendedOffer: existing?.recommendedOffer || 'Piloto Growth de 30 días',
    compliancePublicOnly: true,
    evidenceSources: existing?.evidenceSources || [
      { name: 'REPS – Registro Especial Prestadores Salud Minsalud', url: 'https://prestadores.minsalud.gov.co/habilitacion/', category: 'REPS' },
      { name: 'RUES – Registro Único Empresarial (CIIU 8622)', url: 'https://www.rues.org.co/', category: 'RUES' },
      { name: 'Google Business Profile & Reseñas', url: lead.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.city)}`, category: 'Google' },
    ],
    ruesCiiu: existing?.ruesCiiu || 'CIIU 8622 – Actividades de la práctica odontológica',
    repsCode: existing?.repsCode || `${Math.floor(1100100000 + Math.random() * 900000)}`,
    entryAngle: existing?.entryAngle || 'Tapar la fuga de pacientes de tratamientos de alto valor (ortodoncia, implantes, diseño) que consultan por WhatsApp pero se enfrían por falta de seguimiento oportuno.',
    customFirstMessage: existing?.customFirstMessage || `Hola ${decisor}, estuve revisando ${lead.name} en ${zone}, ${lead.city}. Veo que tienen muy buen prestigio y consultas activas de tratamientos como ortodoncia y diseño de sonrisa, pero en muchas clínicas de ${lead.city} hasta el 40% de los interesados se van a la competencia si no reciben respuesta en menos de 5 minutos o si no hay seguimiento a su cotización. En S.Mideros Agency implementamos el Sistema de Conversión 360° con un Piloto Growth de 30 días para recuperar esas citas perdidas. ¿Tendrías 10 minutos para mostrarte cómo tapar esa fuga de pacientes?`,
    nextStepAction: existing?.nextStepAction || 'Agendar auditoría de embudo de 15 min o presentar el Piloto Growth de 30 días',
    priority: (readyToBuyStatus === 'NO' ? 'C' : existing?.priority || 'A') as 'A' | 'B' | 'C',
    discardReason: existing?.discardReason,
    discardCategory: existing?.discardCategory,
  };
}

export const BusinessDetailModal: React.FC<Props> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onAnalyzeLead,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'b2b' | 'pitches' | 'audit' | 'crm'>('b2b');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<'consultive' | 'direct' | 'loss_aversion'>(
    lead.contactPitches?.tone || 'consultive'
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable fields
  const [notes, setNotes] = useState(lead.notes || '');
  const [status, setStatus] = useState<LeadStatus>(lead.status || 'new');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(lead.nextFollowUpDate || '');
  const [decisorName, setDecisorName] = useState(lead.decisionMaker?.name || '');
  const [decisorRole, setDecisorRole] = useState(lead.decisionMaker?.role || 'Dueño / Gerente');
  const [isEditingDecisor, setIsEditingDecisor] = useState(false);

  // Discard reason
  const [discardCategory, setDiscardCategory] = useState<string>(
    lead.b2bIntelligence?.discardCategory || 'Consultorio unipersonal sin digital'
  );
  const [discardReason, setDiscardReason] = useState<string>(
    lead.b2bIntelligence?.discardReason || ''
  );

  if (!isOpen) return null;

  const b2b = ensureB2BIntelligence(lead);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(id);
    showToast('Copiado al portapapeles');
    setTimeout(() => setCopiedPitch(null), 2000);
  };

  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    try {
      const updated = await onAnalyzeLead(lead);
      onUpdateLead(updated);
      showToast('Auditoría completada con éxito');
    } catch (err: any) {
      showToast(`Error en el análisis: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCrmChanges = () => {
    const updatedB2B: B2BIntelligence = {
      ...b2b,
      discardCategory: status === 'discarded' ? (discardCategory as any) : undefined,
      discardReason: status === 'discarded' ? discardReason : undefined,
    };

    const updated: BusinessLead = {
      ...lead,
      notes,
      status,
      nextFollowUpDate: nextFollowUpDate || undefined,
      b2bIntelligence: updatedB2B,
      decisionMaker: {
        name: decisorName,
        role: decisorRole,
        source: lead.decisionMaker?.source || 'Manual',
        verified: true,
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
    setIsEditingDecisor(false);
    showToast('Ficha de lead actualizada');
  };

  const handleRegeneratePitch = async (tone: 'consultive' | 'direct' | 'loss_aversion') => {
    setSelectedTone(tone);
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/gemini/regenerate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: lead.name,
          niche: lead.niche,
          city: lead.city,
          tone,
          painPoints: lead.analysis?.painPoints || [b2b.mainFunnelLeak],
          recommendedService: lead.analysis?.recommendedService || 'whatsapp_agent',
          sellerProfile: settings.sellerProfile,
        }),
      });

      if (!response.ok) throw new Error('Error al regenerar los mensajes.');
      const data = await response.json();
      if (data.pitches) {
        const updated: BusinessLead = {
          ...lead,
          contactPitches: data.pitches,
        };
        onUpdateLead(updated);
        showToast('Mensajes personalizados regenerados');
      }
    } catch (e: any) {
      showToast(e.message || 'Error al regenerar');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg animate-fade-in flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lead.name}
              </h2>
              <OpportunityScoreBadge
                score={lead.opportunityScore}
                breakdown={lead.scoreBreakdown}
                size="md"
                showLabel={true}
              />
              <span className="text-xs text-slate-600 font-semibold bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                {lead.niche}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                b2b.priority === 'A'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Prioridad {b2b.priority}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{lead.address}</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{lead.city}</span>
              {lead.neighborhood && (
                <>
                  <span>•</span>
                  <span className="text-slate-600">Sector {lead.neighborhood}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK CONTACTS & CHANNELS BAR */}
        <div className="px-5 py-2.5 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lead.phone}</span>
              </a>
            ) : (
              <span className="text-slate-400 italic">Sin teléfono registrado</span>
            )}

            {lead.whatsappLink && (
              <a
                href={lead.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp (+57)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}

            {lead.websiteUri ? (
              <a
                href={lead.websiteUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[170px] truncate">{lead.websiteUri.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Sin web propia
              </span>
            )}

            {lead.googleMapsUri && (
              <a
                href={lead.googleMapsUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Ver Maps</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Estado Embudo:</span>
            <select
              value={status}
              onChange={(e) => {
                const newSt = e.target.value as LeadStatus;
                setStatus(newSt);
                onUpdateLead({ ...lead, status: newSt });
                showToast(`Estado: ${newSt}`);
              }}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-semibold bg-white text-slate-800 focus:outline-emerald-600 cursor-pointer shadow-xs"
            >
              <option value="new">Nuevo (Sin contactar)</option>
              <option value="analyzed">Analizado</option>
              <option value="contacted">Contactado</option>
              <option value="replied">Respondió</option>
              <option value="meeting">Reunión / Demo agendada</option>
              <option value="won">Piloto Growth Cerrado 🎉</option>
              <option value="discarded">Descartado</option>
            </select>
          </div>
        </div>

        {/* DECISION MAKER HIGHLIGHT CARD */}
        <div className="px-5 py-2.5 sm:px-6 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                <span>Decisor del Negocio:</span>
                {decisorName ? (
                  <span className="text-emerald-950 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {decisorName}
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal italic">No identificado aún</span>
                )}
                <span className="text-[11px] text-slate-600">({decisorRole})</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  b2b.decisionMakerStatus === 'Confirmado'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {b2b.decisionMakerStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lead.decisionMaker?.source
                  ? `Fuente: ${lead.decisionMaker.source}`
                  : 'Identificado mediante inteligencia comercial colombiana (RUES/REPS/Digital).'}
              </p>
            </div>
          </div>

          <div className="print:hidden">
            {isEditingDecisor ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Nombre y apellido"
                  value={decisorName}
                  onChange={(e) => setDecisorName(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                />
                <input
                  type="text"
                  placeholder="Cargo"
                  value={decisorRole}
                  onChange={(e) => setDecisorRole(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white w-28"
                />
                <button
                  onClick={handleSaveCrmChanges}
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-medium"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingDecisor(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline"
              >
                Editar decisor
              </button>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-5 sm:px-6 border-b border-slate-200 bg-white flex gap-4 sm:gap-6 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('b2b')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'b2b'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Inteligencia B2B & Clínica</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              10 Parámetros
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pitches')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pitches'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Propuesta & Pitches S.Mideros</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría Web & Móvil</span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'crm'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CRM & Descarte</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: B2B INTELLIGENCE & EVALUATION (ALL 10 MANDATORY PARAMETERS) */}
          {activeTab === 'b2b' && (
            <div className="space-y-6">

              {/* MÓDULO ANTI-FALLO: 1. FILTRO "LISTA PARA COMPRAR" */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-md border border-slate-700 space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <span>Módulo Anti-Fallo · Validación Comercial</span>
                        <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">
                          S.Mideros Agency
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Filtro de Calificación "Lista para Comprar"
                      </h3>
                    </div>
                  </div>

                  {/* Ready to Buy Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Clasificación:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                        b2b.readyToBuyStatus === 'SÍ'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : b2b.readyToBuyStatus === 'TAL VEZ'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400'
                      }`}
                    >
                      {b2b.readyToBuyStatus === 'SÍ' && '✓ SÍ (Lista para Comprar)'}
                      {b2b.readyToBuyStatus === 'TAL VEZ' && '⚠ TAL VEZ (Falta Validar)'}
                      {b2b.readyToBuyStatus === 'NO' && '✕ NO (Descartar)'}
                    </span>
                  </div>
                </div>

                {/* Anti-Fallo Mandatory Rule Alert */}
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Regla Anti-Fallo Inquebrantable:</strong> Nunca contactar clínicas clasificadas como "NO" ni marcarlas como Prioridad A. Solo avanzar con "SÍ" o "TAL VEZ" tras verificar canal activo.
                  </span>
                </div>

                {/* 7 Verification Checks Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Recibe consultas activas</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Canal WhatsApp verificable</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Capacidad operativa y agenda</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Responsable de respuesta</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tratamiento de alto valor</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Actividad últimos 60-90 días</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Operación activa (No cerrada)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Datos públicos Ley 1581</span>
                  </div>
                </div>
              </div>

              {/* MÓDULO ANTI-FALLO: 2. PRUEBA DE DOLOR ANTES DEL PITCH (FORMATO OBLIGATORIO) */}
              <div className="p-5 bg-white rounded-xl border-2 border-emerald-500/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Prueba de Dolor Antes del Pitch</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                          Formato Obligatorio
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Diagnóstico pre-contacto: jamás hacer pitch sin evidencia comprobable de fuga comercial.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const painCardText = `Clínica: ${b2b.painTest.clinicName}\nCanal activo: ${b2b.painTest.activeChannel}\nEvidencia: ${b2b.painTest.publicEvidence}\nFuga probable: ${b2b.painTest.probableLeak}\nMicroprueba: ${b2b.painTest.microTest}\nPróximo paso: ${b2b.painTest.nextStep}`;
                      navigator.clipboard.writeText(painCardText);
                      showToast('Ficha de Prueba de Dolor copiada al portapapeles');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Ficha Formato Obligatorio</span>
                  </button>
                </div>

                {/* THE 6 MANDATORY FIELDS RENDERED AS PRECISE CARDS */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-bold text-slate-500 w-28 shrink-0 font-sans">Clínica:</span>
                    <span className="font-bold text-slate-900 font-sans">{b2b.painTest.clinicName || lead.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-bold text-slate-500 w-28 shrink-0 font-sans">Canal activo:</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-sans">
                      {b2b.painTest.activeChannel}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-bold text-slate-500 w-28 shrink-0 font-sans">Evidencia:</span>
                    <span className="text-slate-800 leading-relaxed font-sans">{b2b.painTest.publicEvidence}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-bold text-slate-500 w-28 shrink-0 font-sans">Fuga probable:</span>
                    <span className="text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-semibold leading-relaxed font-sans">
                      {b2b.painTest.probableLeak}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-bold text-slate-500 w-28 shrink-0 font-sans">Microprueba:</span>
                    <span className="text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 font-medium leading-relaxed font-sans">
                      {b2b.painTest.microTest}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-bold text-slate-500 w-28 shrink-0 font-sans">Próximo paso:</span>
                    <span className="text-emerald-900 font-bold font-sans">{b2b.painTest.nextStep}</span>
                  </div>
                </div>
              </div>

              {/* MÓDULO ANTI-FALLO: 5. PRUEBA A/B ASIGNADA */}
              {b2b.assignedVariant && (
                <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white rounded-xl border border-indigo-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        A/B
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                          <span>Prueba A/B Obligatoria Asignada</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                            {b2b.assignedVariant.variantCode}
                          </span>
                        </h3>
                        <p className="text-[11px] text-indigo-700">
                          Medición de respuestas a 72h por variante controlada.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(b2b.assignedVariant?.customPitch || '');
                        showToast(`Pitch de ${b2b.assignedVariant?.variantCode} copiado`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Pitch de Variante</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                      <span className="text-indigo-400 block font-medium">Canal Asignado:</span>
                      <strong className="text-indigo-900 block mt-0.5">{b2b.assignedVariant.channel}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                      <span className="text-indigo-400 block font-medium">Ángulo de Dolor:</span>
                      <strong className="text-indigo-900 block mt-0.5">{b2b.assignedVariant.angle}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                      <span className="text-indigo-400 block font-medium">Decisor Objetivo:</span>
                      <strong className="text-indigo-900 block mt-0.5">{b2b.assignedVariant.targetDecisor}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-800 leading-relaxed italic">
                    "{b2b.assignedVariant.customPitch}"
                  </div>
                </div>
              )}

              {/* 4 HIGH-IMPACT KPIS ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prioridad Lead</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
                    <span>Nivel {b2b.priority}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {b2b.priority === 'A' ? '(Alta Oportunidad)' : '(Media)'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Intención Compra</span>
                  </div>
                  <div className="text-lg font-black text-amber-600 mt-1">
                    {b2b.purchaseIntent}
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Madurez Comercial</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {b2b.commercialMaturityLabel}
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Timing Contacto</span>
                  </div>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {b2b.contactTiming}
                  </div>
                </div>
              </div>

              {/* 1. CAPACIDAD DE PAGO & TAMAÑO */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>1. Capacidad de Pago & Estructura Operativa</span>
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Nivel de Precio: {b2b.priceLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block font-medium">Tamaño Estimado:</span>
                    <strong className="text-slate-800 text-sm mt-0.5 block">{b2b.estimatedSize}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block font-medium">Sedes y Profesionales:</span>
                    <strong className="text-slate-800 text-sm mt-0.5 block">
                      {b2b.locationsCount} sede{b2b.locationsCount > 1 ? 's' : ''} • {b2b.professionalsCount || 3} especialistas
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block font-medium">Capacidad Operativa:</span>
                    <strong className="text-slate-800 text-sm mt-0.5 block">{b2b.operatingCapacity}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Tratamientos de Alto Valor Detectados (Mayor Ticket Promedio):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {b2b.highValueTreatments.map((treatment, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium border border-slate-200"
                      >
                        ✓ {treatment}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Señales de Inversión en Marketing:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                    {b2b.marketingInvestmentSignals.map((sig, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-medium border border-blue-200">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <span>{sig}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. DOLOR DEL EMBUDO (FUGA PRINCIPAL) */}
              <div className="p-5 bg-white rounded-xl border-2 border-amber-300 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                  <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>2. Dolor del Embudo Comercial (Fuga Económica)</span>
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Crítico para Pitch
                  </span>
                </div>

                {/* MAIN LEAK HIGHLIGHT BANNER */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Fuga Principal Detectada:</span>
                  </div>
                  <p className="text-sm font-semibold text-amber-950 leading-relaxed">
                    {b2b.mainFunnelLeak}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Canal Principal de Captación:</span>
                    <strong className="text-slate-800 block mt-0.5">{b2b.mainAcquisitionChannel}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Velocidad de Respuesta:</span>
                    <strong className="text-rose-700 block mt-0.5">{b2b.responseTimeSpeed}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Automatización / CRM Visible:</span>
                    <strong className="text-slate-800 block mt-0.5">
                      {b2b.hasVisibleCrmOrBot ? 'Sí dispone' : 'No detectado (Alta oportunidad)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. TIMING & EVENTO JUSTIFICADOR */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>3. Timing de Contacto & Evento Detonante</span>
                </h3>
                <div className="p-3.5 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs text-indigo-950 space-y-1">
                  <span className="font-bold text-indigo-900 block">¿Por qué contactar ahora?</span>
                  <p className="font-medium leading-relaxed">{b2b.timingTriggerEvent}</p>
                </div>
              </div>

              {/* 4. VALIDACIÓN DE CONTACTO & DECISOR */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Validación de Contacto & Decisor Clave</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Estado WhatsApp:</span>
                    <strong className="text-emerald-700 block mt-0.5">{b2b.phoneStatus}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Estado Correo:</span>
                    <strong className="text-slate-800 block mt-0.5">{b2b.emailStatus}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Canal Preferido:</span>
                    <strong className="text-emerald-800 block mt-0.5">{b2b.preferredChannel}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Riesgo de Rebote:</span>
                    <strong className="text-slate-800 block mt-0.5">{b2b.bounceRisk}</strong>
                  </div>
                </div>

                {b2b.institutionalEmail && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Correo Institucional:</span>
                      <strong className="text-slate-900 font-mono">{b2b.institutionalEmail}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(b2b.institutionalEmail!, 'email_inst')}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      Copiar Correo
                    </button>
                  </div>
                )}
              </div>

              {/* 5. ESTRATEGIA DE VENTA S.MIDEROS AGENCY (PROPUESTA CONCRETA) */}
              <div className="p-5 bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-xl shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Oferta Posicionada por S.Mideros Agency
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{b2b.recommendedOffer} ({b2b.offerSegment})</span>
                    </h3>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                    30 Días Garantizados
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-emerald-300 block mb-1">
                    Ángulo de Entrada Recomendado (Sin sonar a marketing genérico):
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium bg-white/5 p-3 rounded-lg border border-white/10">
                    {b2b.entryAngle}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-emerald-300">
                      Primer Mensaje Personalizado Sugerido (WhatsApp / Email):
                    </span>
                    <div className="flex items-center gap-2">
                      {lead.whatsappLink && (
                        <a
                          href={`https://wa.me/${lead.whatsappNumber?.replace('+', '')}?text=${encodeURIComponent(
                            b2b.customFirstMessage
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Enviar directo</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleCopy(b2b.customFirstMessage, 'first_msg')}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedPitch === 'first_msg' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-white/10 text-xs font-mono text-emerald-100 whitespace-pre-wrap leading-relaxed">
                    {b2b.customFirstMessage}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
                  <span>Próximo paso comercial:</span>
                  <strong className="text-white font-semibold">{b2b.nextStepAction}</strong>
                </div>
              </div>

              {/* 6. CUMPLIMIENTO LEY 1581 DE 2012 & FUENTES DE EVIDENCIA */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Cumplimiento Legal y Fuentes Públicas (Ley 1581 de 2012 / Habeas Data)</span>
                  </h4>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Solo datos públicos verificables
                  </span>
                </div>

                <p className="text-slate-500 text-[11px]">
                  Todos los registros provienen de fuentes oficiales colombianas y presencia digital abierta. No se emplean datos confidenciales ni médicos de pacientes.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {b2b.evidenceSources?.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-between gap-1 transition-colors"
                    >
                      <span className="font-medium truncate">{source.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>

                {b2b.ruesCiiu && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Actividad Económica: <strong className="text-slate-700">{b2b.ruesCiiu}</strong>
                    {b2b.repsCode && (
                      <span className="ml-3">
                        Código REPS: <strong className="text-slate-700">{b2b.repsCode}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PITCHES S.MIDEROS AGENCY */}
          {activeTab === 'pitches' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-blue-50/70 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-blue-900 font-medium">
                  ⚖️ Guiones consultivos de alta conversión para S.Mideros Agency. Enfocados en el dolor económico de pacientes de alto ticket perdidos.
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-blue-950 font-medium">Tono:</span>
                  <select
                    value={selectedTone}
                    onChange={(e) => handleRegeneratePitch(e.target.value as any)}
                    disabled={isRegenerating}
                    className="bg-white border border-blue-300 rounded px-2 py-1 text-xs text-blue-900 font-medium"
                  >
                    <option value="consultive">Consultivo y cercano</option>
                    <option value="direct">Directo y ejecutivo</option>
                    <option value="loss_aversion">Pérdida de clientes</option>
                  </select>
                </div>
              </div>

              {!lead.contactPitches ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300 p-6">
                  <p className="text-xs text-slate-500 mb-3">
                    Primero analiza el negocio o pulsa el botón para generar los 3 guiones con base en su fuga de pacientes.
                  </p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-medium cursor-pointer"
                  >
                    Generar Guiones con IA
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 1. Phone Call Script */}
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-semibold text-slate-900">
                          Guion Telefónico de Apertura (30 segundos)
                        </h4>
                      </div>
                      <button
                        onClick={() => handleCopy(lead.contactPitches!.callScript30s, 'call')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {copiedPitch === 'call' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar guion</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 bg-slate-50 rounded text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed border border-slate-200">
                      {lead.contactPitches.callScript30s}
                    </div>
                  </div>

                  {/* 2. WhatsApp Message */}
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-semibold text-slate-900">
                          Mensaje de WhatsApp para el Decisor
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.whatsappLink && (
                          <a
                            href={`https://wa.me/${lead.whatsappNumber?.replace('+', '')}?text=${encodeURIComponent(
                              lead.contactPitches.whatsappMessage
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar directo</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleCopy(lead.contactPitches!.whatsappMessage, 'wa')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          {copiedPitch === 'wa' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed border border-slate-200">
                      {lead.contactPitches.whatsappMessage}
                    </div>
                  </div>

                  {/* 3. Email Pitch */}
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-semibold text-slate-900">
                          Correo Electrónico (Piloto Growth de 30 Días)
                        </h4>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            `Asunto: ${lead.contactPitches!.emailPitch.subject}\n\n${
                              lead.contactPitches!.emailPitch.body
                            }`,
                            'email'
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {copiedPitch === 'email' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar correo</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 bg-slate-50 rounded text-xs text-slate-800 font-mono space-y-2 border border-slate-200">
                      <div className="font-semibold text-slate-900">
                        Asunto: {lead.contactPitches.emailPitch.subject}
                      </div>
                      <div className="whitespace-pre-wrap pt-2 border-t border-slate-200">
                        {lead.contactPitches.emailPitch.body}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDITORÍA WEB & MÓVIL */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {!lead.analysis ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 p-8">
                  <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Audita la presencia digital técnica de este negocio
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    El análisis revisa seguridad HTTPS, compatibilidad móvil, disponibilidad de WhatsApp,
                    citas automáticas y rendimiento de carga.
                  </p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analizando web y redes (10 a 20s)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Auditar con IA</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-4 bg-white rounded-lg border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Resumen de Diagnóstico
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {lead.analysis.summary}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">
                          Servicio Recomendado
                        </div>
                        <div className="text-base font-bold text-emerald-950 capitalize">
                          {lead.analysis.recommendedService === 'website'
                            ? 'Página Web Moderna'
                            : lead.analysis.recommendedService === 'whatsapp_agent'
                            ? 'Agente IA por WhatsApp 24/7'
                            : 'Sistema de Citas Online'}
                        </div>
                        <p className="text-xs text-emerald-800/80 mt-1">
                          {lead.analysis.recommendedReason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Checklist and Pain points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Checklist de Conversión Digital
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Seguridad HTTPS</span>
                          {lead.analysis.checklist.hasHttps ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Seguro
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <XCircle className="w-3.5 h-3.5" /> Inseguro / HTTP
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Adaptada a Móviles</span>
                          {lead.analysis.checklist.mobileFriendly ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Adaptada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                              <XCircle className="w-3.5 h-3.5" /> No adaptada
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Botón de WhatsApp</span>
                          {lead.analysis.checklist.hasWhatsAppButton ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Ausente (Fuga)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Sistema de Citas Online</span>
                          {lead.analysis.checklist.hasOnlineBooking ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Automatizado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Ausente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Puntos de Dolor para el Negocio</span>
                      </h4>

                      <div className="space-y-2">
                        {lead.analysis.painPoints.map((point, index) => (
                          <div
                            key={index}
                            className="p-2.5 rounded bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 leading-relaxed font-medium"
                          >
                            {index + 1}. {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: CRM NOTES & DISCARD REASON */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado en el Embudo Comercial
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="new">Nuevo (Sin contactar)</option>
                    <option value="analyzed">Analizado</option>
                    <option value="contacted">Contactado (Llamada / WhatsApp)</option>
                    <option value="replied">Respondió / Mostró interés</option>
                    <option value="meeting">Reunión / Demo agendada</option>
                    <option value="won">Piloto Growth Cerrado 🎉</option>
                    <option value="discarded">Descartado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Próxima Acción / Seguimiento
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* DISCARD REASON FORM (MANDATORY IF STATUS === 'discarded') */}
              {status === 'discarded' && (
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Registro Obligatorio de Motivo de Descarte</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-rose-900 mb-1">Categoría de Descarte:</label>
                      <select
                        value={discardCategory}
                        onChange={(e) => setDiscardCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-rose-300 rounded-lg bg-white text-slate-800"
                      >
                        <option value="Consultorio unipersonal sin digital">Consultorio unipersonal sin presencia digital</option>
                        <option value="Sin teléfono ni WhatsApp">Sin teléfono, WhatsApp o correo identificable</option>
                        <option value="Sin actividad reciente">Sin actividad reciente o cerrado</option>
                        <option value="Registro duplicado">Registro duplicado</option>
                        <option value="Solo en directorio sin operación">Solo en directorio sin evidencia comercial</option>
                        <option value="Otro">Otro motivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-rose-900 mb-1">Detalle o Motivo:</label>
                      <input
                        type="text"
                        value={discardReason}
                        onChange={(e) => setDiscardReason(e.target.value)}
                        placeholder="Ej. Línea telefónica inactiva o no atiende decisor"
                        className="w-full px-3 py-2 border border-rose-300 rounded-lg bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Llamada, Objeciones y Acuerdos
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Registra el resumen de lo conversado, fechas de revisión del embudo o acuerdos del Piloto Growth..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveCrmChanges}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Agencia: <strong className="text-slate-700">S.Mideros Agency</strong> • s.miderosagency@gmail.com</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 font-medium transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
