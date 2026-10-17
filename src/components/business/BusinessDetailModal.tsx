import React, { useState } from 'react';
import {
  BusinessLead,
  LeadStatus,
  AppSettings,
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
} from 'lucide-react';

interface Props {
  lead: BusinessLead;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: BusinessLead) => void;
  onAnalyzeLead: (lead: BusinessLead) => Promise<BusinessLead>;
  settings: AppSettings;
}

export const BusinessDetailModal: React.FC<Props> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onAnalyzeLead,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'pitches' | 'crm'>('audit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<'consultive' | 'direct' | 'loss_aversion'>(
    lead.contactPitches?.tone || 'consultive'
  );
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Editable fields
  const [notes, setNotes] = useState(lead.notes || '');
  const [status, setStatus] = useState<LeadStatus>(lead.status || 'new');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(lead.nextFollowUpDate || '');
  const [decisorName, setDecisorName] = useState(lead.decisionMaker?.name || '');
  const [decisorRole, setDecisorRole] = useState(lead.decisionMaker?.role || 'Dueño / Gerente');
  const [isEditingDecisor, setIsEditingDecisor] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(id);
    setTimeout(() => setCopiedPitch(null), 2000);
  };

  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    try {
      const updated = await onAnalyzeLead(lead);
      onUpdateLead(updated);
    } catch (err: any) {
      alert(`Error en el análisis: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCrmChanges = () => {
    const updated: BusinessLead = {
      ...lead,
      notes,
      status,
      nextFollowUpDate: nextFollowUpDate || undefined,
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
          painPoints: lead.analysis?.painPoints || [],
          recommendedService: lead.analysis?.recommendedService,
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
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {lead.name}
              </h2>
              <OpportunityScoreBadge
                score={lead.opportunityScore}
                breakdown={lead.scoreBreakdown}
                size="md"
                showLabel={true}
              />
              <span className="text-xs text-slate-500 font-medium bg-slate-200/70 px-2 py-0.5 rounded">
                {lead.niche}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{lead.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Exportar o imprimir ficha completa"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar / Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK CONTACT ACTION BAR */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp (+57)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}

            {lead.websiteUri ? (
              <a
                href={lead.websiteUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[180px] truncate">{lead.websiteUri}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                Sin web propia
              </span>
            )}

            {lead.googleMapsUri && (
              <a
                href={lead.googleMapsUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Ver en Maps</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Estado:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as LeadStatus);
                onUpdateLead({ ...lead, status: e.target.value as LeadStatus });
              }}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded font-medium bg-white text-slate-800 focus:outline-emerald-600"
            >
              <option value="new">Nuevo</option>
              <option value="analyzed">Analizado</option>
              <option value="contacted">Contactado</option>
              <option value="replied">Respondió</option>
              <option value="meeting">Reunión agendada</option>
              <option value="won">Cliente cerrado 🎉</option>
              <option value="discarded">Descartado</option>
            </select>
          </div>
        </div>

        {/* DECISION MAKER HIGHLIGHT CARD */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <span>Decisor del Negocio:</span>
                {decisorName ? (
                  <span className="text-emerald-900 font-bold">{decisorName}</span>
                ) : (
                  <span className="text-slate-400 font-normal italic">No identificado aún</span>
                )}
                <span className="text-[11px] text-slate-500">({decisorRole})</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {lead.decisionMaker?.source
                  ? `Detectado vía: ${lead.decisionMaker.source}`
                  : 'Contacta y pregunta por el dueño o gerente para actualizar este dato.'}
              </p>
            </div>
          </div>

          <div className="print:hidden">
            {isEditingDecisor ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
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
                  className="px-2 py-1 bg-emerald-700 text-white rounded text-xs"
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
        <div className="px-6 border-b border-slate-200 bg-white flex gap-6 print:hidden">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría de Conversión</span>
          </button>
          <button
            onClick={() => setActiveTab('pitches')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pitches'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Primer Contacto (Borradores)</span>
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'crm'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notas y Seguimiento</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: AUDIT & CONVERSION */}
          {(activeTab === 'audit' || typeof window !== 'undefined' && window.matchMedia?.('print')?.matches) && (
            <div className="space-y-6">
              {!lead.analysis ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8">
                  <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Este negocio aún no ha sido auditado a fondo
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    El análisis revisa su presencia web, velocidad móvil, disponibilidad de WhatsApp,
                    citas automáticas, rastreo del dueño y genera los 3 guiones de venta personalizados.
                  </p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analizando web y redes (10 a 20s)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analizar negocio con IA</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary & Service recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        A qué se dedican
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {lead.analysis.summary}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">
                          Servicio que debes ofrecerle
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

                  {/* PageSpeed & Screenshot section */}
                  {lead.hasOwnWebsite && lead.analysis.pageSpeedScores && (
                    <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          Rendimiento Móvil (PageSpeed Insights)
                        </h4>
                        <span className="text-[11px] text-slate-400">Estrategia: Móvil</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                          <div className="text-[11px] text-slate-500 font-medium">Rendimiento</div>
                          <div
                            className={`text-xl font-bold font-mono tabular-nums ${
                              lead.analysis.pageSpeedScores.performance >= 70
                                ? 'text-emerald-600'
                                : lead.analysis.pageSpeedScores.performance >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {lead.analysis.pageSpeedScores.performance}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                          <div className="text-[11px] text-slate-500 font-medium">SEO</div>
                          <div className="text-xl font-bold font-mono tabular-nums text-slate-800">
                            {lead.analysis.pageSpeedScores.seo}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                          <div className="text-[11px] text-slate-500 font-medium">Accesibilidad</div>
                          <div className="text-xl font-bold font-mono tabular-nums text-slate-800">
                            {lead.analysis.pageSpeedScores.accessibility}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                          <div className="text-[11px] text-slate-500 font-medium">Buenas Prácticas</div>
                          <div className="text-xl font-bold font-mono tabular-nums text-slate-800">
                            {lead.analysis.pageSpeedScores.bestPractices}
                          </div>
                        </div>
                      </div>

                      {lead.analysis.pageSpeedScores.screenshotBase64 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="text-xs text-slate-500 mb-1.5 font-medium">Captura real en móvil:</div>
                          <img
                            src={lead.analysis.pageSpeedScores.screenshotBase64}
                            alt="Captura web"
                            className="w-40 rounded border border-slate-300 shadow-xs"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checklist and Pain points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Checklist */}
                    <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Checklist Crítico de Conversión
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
                          <span className="text-slate-700">Adaptada a Móviles (Responsive)</span>
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
                          <span className="text-slate-700">Botón flotante de WhatsApp</span>
                          {lead.analysis.checklist.hasWhatsAppButton ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> No tiene (Oportunidad)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Sistema de Citas / Reservas Online</span>
                          {lead.analysis.checklist.hasOnlineBooking ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Automatizado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> No tiene (Oportunidad)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-700">Formulario de Contacto</span>
                          {lead.analysis.checklist.hasContactForm ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                              <XCircle className="w-3.5 h-3.5" /> Ausente
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-700">Año del Copyright</span>
                          <span className="font-mono text-slate-600 font-medium">
                            {lead.analysis.checklist.detectedYear || 'No detectado'}
                            {lead.analysis.checklist.outdatedCopyright && (
                              <span className="text-rose-600 font-semibold ml-1">(Desactualizado)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plain language pain points */}
                    <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Problemas Explicados en Lenguaje Llano</span>
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

                      {/* Detected emails and socials */}
                      {(lead.analysis.detectedEmails.length > 0 || lead.analysis.detectedSocials.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1">
                          {lead.analysis.detectedEmails.length > 0 && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>Emails: {lead.analysis.detectedEmails.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end print:hidden">
                    <button
                      onClick={handleAnalyzeClick}
                      disabled={isAnalyzing}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>Volver a auditar este negocio</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: PERSONALIZED PITCHES */}
          {activeTab === 'pitches' && (
            <div className="space-y-5">
              {/* Notice & Tone selector */}
              <div className="p-3.5 bg-blue-50/70 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-blue-900 font-medium">
                  ⚖️ Borradores para contactar de forma personal. No envíes mensajes comerciales masivos sin consentimiento.
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
                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300 p-6">
                  <p className="text-xs text-slate-500 mb-3">
                    Primero analiza el negocio para generar guiones basados en sus problemas reales.
                  </p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-medium"
                  >
                    Analizar ahora
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
                          Guion de Llamada Telefónica (30 segundos)
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
                          Mensaje Personalizado de WhatsApp
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
                          Correo Electrónico Persuasivo
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

          {/* TAB 3: CRM NOTES & NEXT ACTION */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Comercial en el Embudo
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
                    <option value="meeting">Reunión agendada</option>
                    <option value="won">Cliente ganado 🎉</option>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Llamada y Objeciones del Cliente
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe lo que hablaron en la llamada, si el decisor te dio otro teléfono, qué objeción puso, etc."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveCrmChanges}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-xs"
                >
                  Guardar Cambios en Lead
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Creado el {new Date(lead.createdAt).toLocaleDateString('es-CO')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
