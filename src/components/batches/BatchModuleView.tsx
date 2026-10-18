import React, { useState, useEffect } from 'react';
import { BatchCampaign, BatchLeadRecord, BusinessLead, LeadStatus } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Layers,
  ShieldCheck,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  Copy,
  TrendingUp,
  Plus,
  Play,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface Props {
  onSelectLeadById: (leadId: string) => void;
  availableLeads: BusinessLead[];
}

export const BatchModuleView: React.FC<Props> = ({
  onSelectLeadById,
  availableLeads,
}) => {
  const [batches, setBatches] = useState<BatchCampaign[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const stored = StorageService.getBatches();
    if (stored.length === 0 && availableLeads.length > 0) {
      // Auto-create Lote 1 if not present
      const initialCity = availableLeads[0].city || 'Bogotá';
      const initialNiche = availableLeads[0].niche || 'Clínicas dentales';
      const batch1 = StorageService.createBatchFromLeads(initialCity, initialNiche, availableLeads);
      setBatches([batch1]);
      setSelectedBatchId(batch1.id);
    } else {
      setBatches(stored);
      if (stored.length > 0 && !selectedBatchId) {
        setSelectedBatchId(stored[0].id);
      }
    }
  }, [availableLeads]);

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || null;
  const auditStats = StorageService.getEscalationAuditStats();

  const handleCreateNewBatch = () => {
    const city = availableLeads[0]?.city || 'Colombia';
    const niche = availableLeads[0]?.niche || 'Clínicas dentales';
    const newBatch = StorageService.createBatchFromLeads(city, niche, availableLeads);
    const updated = StorageService.getBatches();
    setBatches(updated);
    setSelectedBatchId(newBatch.id);
    showToast(`Nuevo lote creado: ${newBatch.name}`);
  };

  const handleUpdateRecordStatus = (
    batchId: string,
    leadId: string,
    newStatus: 'no_response' | 'responded' | 'demo_booked' | 'pilot_won' | 'bounced' | 'discarded'
  ) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const record = batch.records.find((r) => r.leadId === leadId);
    if (!record) return;

    record.responseStatus = newStatus;
    if (newStatus !== 'no_response') {
      record.sentStatus = 'sent';
      if (!record.sentAt) record.sentAt = new Date().toISOString();
    }

    // Recalculate metrics
    batch.metrics.sentCount = batch.records.filter((r) => r.sentStatus === 'sent').length;
    batch.metrics.responsesCount = batch.records.filter((r) => r.responseStatus === 'responded' || r.responseStatus === 'demo_booked' || r.responseStatus === 'pilot_won').length;
    batch.metrics.demosCount = batch.records.filter((r) => r.responseStatus === 'demo_booked' || r.responseStatus === 'pilot_won').length;
    batch.metrics.pilotsCount = batch.records.filter((r) => r.responseStatus === 'pilot_won').length;

    // A/B summary
    const varA = batch.records.filter((r) => r.variant.variantLetter === 'A');
    const varB = batch.records.filter((r) => r.variant.variantLetter === 'B');
    batch.abSummary = {
      variantA: {
        count: varA.length,
        responses: varA.filter((r) => r.responseStatus !== 'no_response').length,
        demos: varA.filter((r) => r.responseStatus === 'demo_booked' || r.responseStatus === 'pilot_won').length,
      },
      variantB: {
        count: varB.length,
        responses: varB.filter((r) => r.responseStatus !== 'no_response').length,
        demos: varB.filter((r) => r.responseStatus === 'demo_booked' || r.responseStatus === 'pilot_won').length,
      },
    };

    StorageService.saveBatch(batch);
    setBatches([...batches]);
    showToast(`Estado actualizado: ${newStatus}`);
  };

  const handleStartSendingBatch = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const now = new Date();
    batch.sentAt = now.toISOString();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    batch.deadline72h = deadline.toISOString();
    batch.status = 'in_progress_72h';

    // Mark all pending records as sent
    batch.records.forEach((r) => {
      r.sentStatus = 'sent';
      r.sentAt = now.toISOString();
    });
    batch.metrics.sentCount = batch.records.length;

    StorageService.saveBatch(batch);
    setBatches([...batches]);
    showToast(`Lote en marcha: Ventana de 72 horas iniciada`);
  };

  return (
    <div className="p-4 sm:p-6 pb-28 md:pb-8 max-w-7xl mx-auto space-y-6">
      
      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & ESCALATION CONTROLLER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lotes de Prospección & Pruebas A/B
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Metodología Anti-Fallo de S.Mideros Agency: Lotes controlados de 25 clínicas Prioridad A con seguimiento estricto a 72h.
          </p>
        </div>

        <button
          onClick={handleCreateNewBatch}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Lote de 25 Clínicas</span>
        </button>
      </div>

      {/* ALERTA DE PARADA Y ESCALADO ANTI-FALLO (CRÍTICO: REGLA 300-500) */}
      {auditStats.haltRequired && (
        <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-2xl shadow-sm text-rose-950 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-800">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <h2 className="text-base font-black uppercase tracking-wide">
              ¡Parada de Escalado Anti-Fallo Activada!
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">
            Se han procesado <strong>{auditStats.totalAudited} prospectos</strong> pero solo se han alcanzado{' '}
            <strong>{auditStats.totalDemos} de 3 demos</strong> requeridas. Según la regla anti-fallo, debes detener el escalado masivo inmediatamente y auditar estos 5 factores antes de culpar al nicho:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-semibold pt-1">
            <div className="p-2.5 rounded-lg bg-white border border-rose-200">
              <span className="text-rose-500 block text-[10px]">1. ICP</span>
              <span>¿Clínicas con flujo real o consultorios unipersonales?</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-rose-200">
              <span className="text-rose-500 block text-[10px]">2. OFERTA</span>
              <span>¿El Piloto de 30 días ataca el dolor de citas perdidas?</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-rose-200">
              <span className="text-rose-500 block text-[10px]">3. MENSAJE</span>
              <span>¿Ángulo de fuga de WhatsApp o parece publicidad fría?</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-rose-200">
              <span className="text-rose-500 block text-[10px]">4. CANAL</span>
              <span>¿WhatsApp vs llamada telefónica vs Instagram DM?</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-rose-200">
              <span className="text-rose-500 block text-[10px]">5. DEMO</span>
              <span>¿Auditoría de embudo de 15 min sin fricción?</span>
            </div>
          </div>
        </div>
      )}

      {/* METODOLOGÍA DEL FLUJO POR LOTES (PASO A PASO OBLIGATORIO) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Protocolo de Trabajo por Lotes (Master Prompt Módulo Anti-Fallo)</span>
          </span>
          <span className="text-xs text-slate-500">25 clínicas por lote</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
            <span className="text-[10px] text-emerald-700 block font-bold">1. Generación</span>
            <span>25 Prioridad A</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
            <span className="text-[10px] text-emerald-700 block font-bold">2. Validación</span>
            <span>Decisor & WhatsApp</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium">
            <span className="text-[10px] text-indigo-700 block font-bold">3. Pruebas A/B</span>
            <span>Variantes A y B</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-medium">
            <span className="text-[10px] text-amber-700 block font-bold">4. Envío</span>
            <span>Contacto activo</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 font-medium">
            <span className="text-[10px] text-blue-700 block font-bold">5. Medición 72h</span>
            <span>Ventana respuesta</span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 font-medium">
            <span className="text-[10px] text-purple-700 block font-bold">6. Ajustes</span>
            <span>Ángulo / Oferta</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 text-white font-medium">
            <span className="text-[10px] text-emerald-400 block font-bold">7. Escalado</span>
            <span>Siguiente lote</span>
          </div>
        </div>
      </div>

      {/* BATCH SELECTOR PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {batches.map((batch) => (
          <button
            key={batch.id}
            onClick={() => setSelectedBatchId(batch.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
              selectedBatchId === batch.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{batch.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              batch.status === 'in_progress_72h'
                ? 'bg-amber-400 text-slate-950 font-bold animate-pulse'
                : 'bg-white/20 text-slate-300'
            }`}>
              {batch.status === 'in_progress_72h' ? '72h Activo' : `${batch.records.length} clínicas`}
            </span>
          </button>
        ))}
      </div>

      {activeBatch ? (
        <div className="space-y-6">
          
          {/* ACTIVE BATCH HERO BANNER & 72H COUNTDOWN */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{activeBatch.name}</h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {activeBatch.city} · {activeBatch.niche}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Creado el {new Date(activeBatch.createdAt).toLocaleDateString('es-CO')} · {activeBatch.records.length} clínicas calificadas
                </p>
              </div>

              {activeBatch.status === 'ready_to_send' ? (
                <button
                  onClick={() => handleStartSendingBatch(activeBatch.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Iniciar Envío & Activar 72 Horas</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Ventana de Medición</span>
                    <span className="font-bold text-amber-300">Medición a 72h activa</span>
                  </div>
                </div>
              )}
            </div>

            {/* BATCH KPIS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Total en Lote</span>
                <span className="text-xl font-black text-white mt-0.5 block">{activeBatch.records.length}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Enviados</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">{activeBatch.metrics.sentCount}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Respuestas 72h</span>
                <span className="text-xl font-black text-blue-400 mt-0.5 block">{activeBatch.metrics.responsesCount}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Demos Agendadas</span>
                <span className="text-xl font-black text-amber-400 mt-0.5 block">{activeBatch.metrics.demosCount}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Pilotos Ganados</span>
                <span className="text-xl font-black text-emerald-300 mt-0.5 block">{activeBatch.metrics.pilotsCount} 🎉</span>
              </div>
            </div>
          </div>

          {/* PRUEBAS A/B COMPARATIVE DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* VARIANTE A */}
            <div className="p-5 bg-white rounded-2xl border-2 border-indigo-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    A
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Variante A: Respuesta Lenta</h3>
                    <span className="text-[11px] text-indigo-700 font-medium">
                      Canal: WhatsApp · Decisor: Dueño / Director Médico
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded bg-indigo-50 text-indigo-800">
                  {activeBatch.abSummary.variantA.count} clínicas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Respuestas</span>
                  <span className="text-base font-bold text-slate-800">{activeBatch.abSummary.variantA.responses}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Tasa Resp.</span>
                  <span className="text-base font-bold text-emerald-700">
                    {activeBatch.abSummary.variantA.count > 0
                      ? `${Math.round((activeBatch.abSummary.variantA.responses / activeBatch.abSummary.variantA.count) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Demos</span>
                  <span className="text-base font-bold text-indigo-700">{activeBatch.abSummary.variantA.demos}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "Ángulo: Tapar fuga de consultas en tratamientos de alto valor por demorar más de 2 horas en responder en WhatsApp."
              </p>
            </div>

            {/* VARIANTE B */}
            <div className="p-5 bg-white rounded-2xl border-2 border-purple-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-purple-50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    B
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Variante B: Pacientes Inactivos</h3>
                    <span className="text-[11px] text-purple-700 font-medium">
                      Canal: WhatsApp · Decisor: Gerente / Administrador
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded bg-purple-50 text-purple-800">
                  {activeBatch.abSummary.variantB.count} clínicas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Respuestas</span>
                  <span className="text-base font-bold text-slate-800">{activeBatch.abSummary.variantB.responses}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Tasa Resp.</span>
                  <span className="text-base font-bold text-emerald-700">
                    {activeBatch.abSummary.variantB.count > 0
                      ? `${Math.round((activeBatch.abSummary.variantB.responses / activeBatch.abSummary.variantB.count) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Demos</span>
                  <span className="text-base font-bold text-purple-700">{activeBatch.abSummary.variantB.demos}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "Ángulo: Reactivación automática de 200+ pacientes dormidos con cotizaciones abiertas para llenar agenda sin gastar en pauta."
              </p>
            </div>
          </div>

          {/* TABLE OF LEADS IN BATCH */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Prospectos del Lote ({activeBatch.records.length})</span>
              </h3>
              <span className="text-xs text-slate-500">
                Selecciona el estado de respuesta para alimentar la comparativa A/B
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Clínica / Prospecto</th>
                    <th className="px-3 py-3">Prioridad</th>
                    <th className="px-3 py-3">Lista para Comprar</th>
                    <th className="px-3 py-3">Variante A/B</th>
                    <th className="px-3 py-3">Pitch & Mensaje</th>
                    <th className="px-4 py-3">Estado a 72h</th>
                    <th className="px-3 py-3 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {activeBatch.records.map((rec) => (
                    <tr key={rec.leadId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <span>{rec.leadName}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {rec.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rec.readyToBuy === 'SÍ'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {rec.readyToBuy}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rec.variant.variantLetter === 'A'
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          Variante {rec.variant.variantLetter} ({rec.variant.angle})
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(rec.variant.customPitch);
                            showToast(`Pitch copiado para ${rec.leadName}`);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copiar Pitch</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={rec.responseStatus}
                          onChange={(e) =>
                            handleUpdateRecordStatus(
                              activeBatch.id,
                              rec.leadId,
                              e.target.value as any
                            )
                          }
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:outline-emerald-600 cursor-pointer"
                        >
                          <option value="no_response">⏳ Sin respuesta aún</option>
                          <option value="responded">💬 Respondió al mensaje</option>
                          <option value="demo_booked">📅 Demo / Reunión agendada</option>
                          <option value="pilot_won">🎉 Piloto Growth cerrado</option>
                          <option value="bounced">❌ Teléfono/Rebote fallido</option>
                          <option value="discarded">🚫 Descartado</option>
                        </select>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <button
                          onClick={() => onSelectLeadById(rec.leadId)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                          title="Abrir ficha completa de inteligencia comercial"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay lotes creados todavía</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haz clic en "Crear Lote de 25 Clínicas" para armar tu primer lote calibrado con pruebas A/B y medición de 72 horas.
          </p>
          <button
            onClick={handleCreateNewBatch}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Crear Lote 1 (25 Clínicas)
          </button>
        </div>
      )}
    </div>
  );
};
