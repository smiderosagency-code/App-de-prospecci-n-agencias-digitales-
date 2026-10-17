import React, { useState } from 'react';
import { NicheAuditResult, AppSettings } from '../../types';
import {
  Compass,
  Sparkles,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Globe,
  Star,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

interface Props {
  onExploreNiche: (city: string, niche: string) => void;
  settings: AppSettings;
}

export const NicheRadarView: React.FC<Props> = ({ onExploreNiche, settings }) => {
  const [targetCity, setTargetCity] = useState('Bogotá');
  const [categories, setCategories] = useState<string[]>([
    'Clínicas dentales',
    'Talleres mecánicos',
    'Fisioterapeutas',
    'Centros de estética',
    'Restaurantes',
    'Gimnasios',
    'Inmobiliarias',
    'Veterinarias',
    'Reformas y construcción',
    'Gestorías y contadores',
  ]);
  const [newCatInput, setNewCatInput] = useState('');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [radarResults, setRadarResults] = useState<NicheAuditResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCatInput.trim() && !categories.includes(newCatInput.trim())) {
      setCategories([...categories, newCatInput.trim()]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const executeRadar = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const resp = await fetch('/api/gemini/radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: targetCity,
          categories,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Error al ejecutar el radar de nichos.');
      }

      const data = await resp.json();
      setRadarResults(data.results || []);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error inesperado al auditar nichos.');
    } finally {
      setIsLoading(false);
    }
  };

  const isGoogleCloud = settings.searchProvider === 'google_cloud' && Boolean(settings.googleCloudApiKey);
  const estimatedCost = isGoogleCloud ? `${categories.length} llamadas a Places API` : 'Gratuito (Gemini con Búsqueda Web)';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Radar de Nichos en Colombia
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Audita y compara qué sectores comerciales en tu ciudad tienen menor madurez digital,
              mayor necesidad de agentes de WhatsApp o citas, y dónde cerrarás clientes más rápido.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              placeholder="Ciudad (ej. Bogotá, Medellín)"
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white w-48 font-medium text-slate-800"
            />
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isLoading || categories.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditando sectores...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Escanear Oportunidad</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CATEGORIES CHIPS LIST (EDITABLE) */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Categorías que se analizarán ({categories.length}):
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="Añadir nicho..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="px-2 py-0.5 text-xs border border-slate-300 rounded bg-white w-32"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Confirmar escaneo de nichos</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estás a punto de auditar <strong>{categories.length} categorías</strong> en{' '}
              <strong>{targetCity}, Colombia</strong>.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="text-slate-700">
                <strong>Consumo estimado:</strong> {estimatedCost}
              </div>
              <div className="text-slate-500">
                Gemini analizará la madurez digital y ordenará los mejores 3 nichos para prospectar.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={executeRadar}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
              >
                Iniciar Escaneo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS LIST */}
      {radarResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Ranking de Oportunidades en {targetCity}
            </h3>
            <span className="text-xs text-slate-500">
              Ordenado por probabilidad de venta de servicios
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {radarResults.map((item, idx) => (
              <div
                key={item.niche}
                className={`p-5 rounded-xl border transition-all ${
                  item.isTopPick
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{item.niche}</h4>
                      {item.isTopPick && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold text-[11px] shadow-xs">
                          <CheckCircle2 className="w-3 h-3" /> Top Oportunidad
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        Ofrecer:{' '}
                        <strong>
                          {item.recommendedService === 'website'
                            ? 'Web Moderna'
                            : item.recommendedService === 'whatsapp_agent'
                            ? 'Agente IA WhatsApp'
                            : 'Sistema de Citas'}
                        </strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {item.aiRecommendation}
                    </p>

                    {/* Quantitative statistics */}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 pt-1 font-mono tabular-nums">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Sin web propia:{' '}
                        <strong className="text-amber-700 font-bold">
                          {item.withoutOwnWebsitePercent}%
                        </strong>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        Valoración media: <strong className="text-slate-800">{item.avgRating}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Reseñas promedio: <strong className="text-slate-800">{item.avgReviews}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <button
                      onClick={() => onExploreNiche(targetCity, item.niche)}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Ver negocios</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
