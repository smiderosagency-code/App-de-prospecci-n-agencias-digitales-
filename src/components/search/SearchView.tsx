import React, { useState } from 'react';
import { BusinessLead, SearchFilters, AppSettings } from '../../types';
import { OpportunityScoreBadge } from '../common/OpportunityScoreBadge';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  BookmarkPlus,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  MessageCircle,
  ExternalLink,
  User,
  Star,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface Props {
  onSearch: (city: string, niche: string, neighborhood: string) => Promise<void>;
  isLoading: boolean;
  leads: BusinessLead[];
  onSelectLead: (lead: BusinessLead) => void;
  onSaveBatchToLeads: (selectedLeads: BusinessLead[]) => void;
  onAnalyzeBatch: (selectedLeads: BusinessLead[]) => void;
  batchProgress?: { current: number; total: number; isRunning: boolean };
  providerUsed?: string;
  settings: AppSettings;
  onCreateBatch?: () => void;
}

export const SearchView: React.FC<Props> = ({
  onSearch,
  isLoading,
  leads,
  onSelectLead,
  onSaveBatchToLeads,
  onAnalyzeBatch,
  batchProgress,
  providerUsed,
  settings,
  onCreateBatch,
}) => {
  // Search parameters
  const [selectedCity, setSelectedCity] = useState('Bogotá');
  const [customCity, setCustomCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('Clínicas dentales');
  const [customNiche, setCustomNiche] = useState('');
  const [isCustomNiche, setIsCustomNiche] = useState(false);

  // UI state (cards view default for optimal mobile and desktop prospecting)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    onlyNoWebsite: false,
    onlyWithPhone: false,
    minRating: 0,
    minReviews: 0,
    hideClosed: true,
    priorityFilter: 'ALL',
    onlyHighIntent: false,
    onlyWithDecisor: false,
    readyToBuyFilter: 'ALL',
  });

  const colombianCities = [
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Bucaramanga',
    'Cartagena',
    'Pereira',
  ];

  // Prioritize Clínicas dentales and Centros de estética as requested
  const nicheSuggestions = [
    'Clínicas dentales',
    'Centros de estética',
    'Fisioterapeutas',
    'Talleres mecánicos',
    'Peluquerías y barberías',
    'Restaurantes',
    'Gimnasios',
    'Inmobiliarias',
    'Veterinarias',
    'Academias',
    'Reformas y construcción',
    'Autoescuelas',
    'Ópticas',
    'Gestorías y contadores',
  ];

  const effectiveCity = customCity.trim() || selectedCity;
  const effectiveNiche = isCustomNiche ? customNiche.trim() || 'Clínicas dentales' : selectedNiche;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(effectiveCity, effectiveNiche, neighborhood);
    setSelectedIds(new Set());
  };

  const handleQuickNicheSelect = (niche: string) => {
    setIsCustomNiche(false);
    setSelectedNiche(niche);
    setCustomNiche('');
    onSearch(effectiveCity, niche, neighborhood);
  };

  // Filter application
  const filteredLeads = leads.filter((lead) => {
    if (filters.onlyNoWebsite && lead.hasOwnWebsite) return false;
    if (filters.onlyWithPhone && !lead.phone) return false;
    if (filters.priorityFilter === 'A' && lead.b2bIntelligence?.priority !== 'A') return false;
    if (filters.readyToBuyFilter && filters.readyToBuyFilter !== 'ALL' && lead.b2bIntelligence?.readyToBuyStatus !== filters.readyToBuyFilter) return false;
    if (filters.onlyHighIntent && lead.b2bIntelligence?.purchaseIntent !== 'Alta') return false;
    if (filters.onlyWithDecisor && !lead.decisionMaker?.name) return false;
    if (filters.minRating > 0 && (lead.rating || 0) < filters.minRating) return false;
    if (filters.minReviews > 0 && (lead.userRatingCount || 0) < filters.minReviews) return false;
    if (filters.hideClosed && lead.businessStatus !== 'OPERATIONAL') return false;
    return true;
  });

  // B2B Quality Metrics (Master Prompt Parameter #9 & Módulo Anti-Fallo)
  const priorityACount = leads.filter((l) => l.b2bIntelligence?.priority === 'A').length;
  const readyToBuyYesCount = leads.filter((l) => l.b2bIntelligence?.readyToBuyStatus === 'SÍ').length;
  const withDecisorCount = leads.filter((l) => Boolean(l.decisionMaker?.name)).length;
  const withWhatsAppCount = leads.filter((l) => Boolean(l.whatsappLink || l.whatsappNumber)).length;
  const highIntentCount = leads.filter((l) => l.b2bIntelligence?.purchaseIntent === 'Alta').length;
  const withEmailCount = leads.filter((l) => Boolean(l.b2bIntelligence?.institutionalEmail)).length;

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const toggleSelectLead = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedLeadsList = filteredLeads.filter((l) => selectedIds.has(l.id));

  return (
    <div className="p-3 sm:p-6 pb-28 md:pb-8 max-w-7xl mx-auto space-y-5">
      
      {/* LIVE PROSPECTING STATUS BANNER */}
      {isLoading && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center gap-3 text-emerald-950 shadow-sm animate-pulse">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold flex items-center gap-2">
              <span>Prospección en vivo con Gemini 3.8 Flash</span>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-mono uppercase">IA Activa</span>
            </div>
            <div className="text-xs text-emerald-800 truncate mt-0.5">
              Consultando y extrayendo prospectos de <strong>{effectiveNiche}</strong> en <strong>{effectiveCity}</strong> con teléfonos de WhatsApp y decisores...
            </div>
          </div>
        </div>
      )}

      {/* SEARCH FORM CONTAINER */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          
          {/* Quick city selectors */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium">Ciudades rápidas:</span>
            {colombianCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  setCustomCity('');
                  onSearch(city, effectiveNiche, neighborhood);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1 cursor-pointer ${
                  selectedCity === city && !customCity
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{city}</span>
              </button>
            ))}
          </div>

          {/* Quick niche selectors (Clínicas dentales & Centros de estética first!) */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-500 font-medium">Nichos rápidos:</span>
            {['Clínicas dentales', 'Centros de estética', 'Fisioterapeutas', 'Talleres mecánicos', 'Restaurantes'].map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => handleQuickNicheSelect(niche)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium cursor-pointer ${
                  effectiveNiche === niche
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {(niche === 'Clínicas dentales' || niche === 'Centros de estética') && <span>⭐</span>}
                <span>{niche}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* City & Neighborhood */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Zona / Municipio de Colombia
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ciudad o municipio (ej. Envigado, Cali)"
                  value={customCity || selectedCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Barrio o Localidad (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Chapinero, El Poblado, Granada"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
              />
            </div>

            {/* Niche Dropdown (Deploys properly when clicked and launches search immediately) */}
            <div className="sm:col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Nicho / Sector
                </label>
                {isCustomNiche && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomNiche(false);
                      setCustomNiche('');
                    }}
                    className="text-[11px] text-emerald-700 font-medium hover:underline cursor-pointer"
                  >
                    ← Ver lista desplegable
                  </button>
                )}
              </div>

              {isCustomNiche ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Escribe tu nicho personalizado..."
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium shrink-0 hover:bg-slate-800"
                  >
                    Buscar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedNiche}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom_option') {
                        setIsCustomNiche(true);
                        setCustomNiche('');
                      } else {
                        setSelectedNiche(val);
                        // Trigger search dynamically when selecting a niche
                        onSearch(effectiveCity, val, neighborhood);
                      }
                    }}
                    className="w-full px-3 py-2.5 text-sm border-2 border-emerald-600/30 hover:border-emerald-600 rounded-lg focus:outline-emerald-600 bg-white font-medium text-slate-800 cursor-pointer shadow-xs appearance-none pr-9 transition-colors"
                  >
                    <optgroup label="⭐ Nichos con Mayor Tasa de Cierre en Colombia (Recomendados)">
                      <option value="Clínicas dentales">⭐ Clínicas dentales (Citas & WhatsApp IA)</option>
                      <option value="Centros de estética">⭐ Centros de estética (Reservas & Presencia Web)</option>
                      <option value="Fisioterapeutas">Fisioterapeutas y centros de rehabilitación</option>
                    </optgroup>
                    <optgroup label="Servicios y Comercios Locales">
                      <option value="Talleres mecánicos">Talleres mecánicos y servitecas</option>
                      <option value="Restaurantes">Restaurantes y gastronomía</option>
                      <option value="Peluquerías y barberías">Peluquerías y barberías</option>
                      <option value="Gimnasios">Gimnasios y centros fitness</option>
                      <option value="Inmobiliarias">Inmobiliarias y arriendos</option>
                      <option value="Veterinarias">Veterinarias y pet shops</option>
                      <option value="Academias">Academias y cursos</option>
                      <option value="Reformas y construcción">Reformas y construcción</option>
                      <option value="Ópticas">Ópticas</option>
                      <option value="Gestorías y contadores">Gestorías y contadores</option>
                      <option value="Autoescuelas">Autoescuelas</option>
                    </optgroup>
                    <option value="custom_option">✍️ Escribir otro nicho libremente...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-emerald-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Submit & Refresh buttons */}
            <div className="sm:col-span-2 flex items-end gap-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-[42px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                title="Buscar prospectos con IA"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Prospectar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSearch(effectiveCity, effectiveNiche, neighborhood)}
                disabled={isLoading}
                className="h-[42px] px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title="Generar nuevos prospectos frescos con IA"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        </form>

        {/* QUICK ONE-TOUCH FILTER PILLS (MOBILE FRIENDLY) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap shrink-0">Filtros:</span>
          
          <button
            type="button"
            onClick={() => setFilters({ ...filters, readyToBuyFilter: filters.readyToBuyFilter === 'SÍ' ? 'ALL' : 'SÍ' })}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-bold border cursor-pointer ${
              filters.readyToBuyFilter === 'SÍ'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {filters.readyToBuyFilter === 'SÍ' ? '✓ Lista para Comprar' : 'Lista para Comprar (SÍ)'}
          </button>

          <button
            type="button"
            onClick={() => setFilters({ ...filters, priorityFilter: filters.priorityFilter === 'A' ? 'ALL' : 'A' })}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-semibold border cursor-pointer ${
              filters.priorityFilter === 'A'
                ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {filters.priorityFilter === 'A' ? '✓ Prioridad A' : 'Prioridad A'}
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, onlyHighIntent: !filters.onlyHighIntent })}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-semibold border cursor-pointer ${
              filters.onlyHighIntent
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {filters.onlyHighIntent ? '✓ Intención Alta' : 'Intención Alta'}
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, onlyWithDecisor: !filters.onlyWithDecisor })}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-semibold border cursor-pointer ${
              filters.onlyWithDecisor
                ? 'bg-indigo-100 text-indigo-900 border-indigo-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {filters.onlyWithDecisor ? '✓ Con Decisor' : 'Con Decisor'}
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, onlyWithPhone: !filters.onlyWithPhone })}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium border cursor-pointer ${
              filters.onlyWithPhone
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {filters.onlyWithPhone ? '✓ WhatsApp / Tel' : 'WhatsApp / Tel'}
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, onlyNoWebsite: !filters.onlyNoWebsite })}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium border cursor-pointer ${
              filters.onlyNoWebsite
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {filters.onlyNoWebsite ? '✓ Sin Web Propia' : 'Sin Web Propia'}
          </button>
        </div>

        {/* FILTERS & STATS STRIP */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                showFilters
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros avanzados</span>
            </button>

            {onCreateBatch && (
              <button
                type="button"
                onClick={onCreateBatch}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
                title="Armar lote de 25 clínicas con pruebas A/B y medición a 72h"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Crear Lote 25 (A/B)</span>
              </button>
            )}

            {providerUsed && (
              <span className="text-slate-400">
                Fuente: <strong className="text-slate-700">{providerUsed}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-slate-200 rounded p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista tabla de prospección"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1 rounded ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* EXPANDABLE FILTER DRAWER */}
        {showFilters && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.onlyNoWebsite}
                onChange={(e) => setFilters({ ...filters, onlyNoWebsite: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Solo negocios sin web propia</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.onlyWithPhone}
                onChange={(e) => setFilters({ ...filters, onlyWithPhone: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Solo con teléfono registrado</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Valoración mín:</span>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                className="px-2 py-1 bg-white border border-slate-300 rounded"
              >
                <option value={0}>Cualquiera</option>
                <option value={3.5}>3.5+ estrellas</option>
                <option value={4.0}>4.0+ estrellas</option>
                <option value={4.5}>4.5+ estrellas</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Mín reseñas:</span>
              <select
                value={filters.minReviews}
                onChange={(e) => setFilters({ ...filters, minReviews: Number(e.target.value) })}
                className="px-2 py-1 bg-white border border-slate-300 rounded"
              >
                <option value={0}>0+ reseñas</option>
                <option value={5}>5+ reseñas</option>
                <option value={15}>15+ reseñas</option>
                <option value={30}>30+ reseñas</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* BATCH PROGRESS BAR IF ANALYZING */}
      {batchProgress && batchProgress.isRunning && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
            <div>
              <div className="text-sm font-semibold text-emerald-950">
                Analizando webs en cola (máximo 2 a la vez)...
              </div>
              <div className="text-xs text-emerald-800">
                Completados {batchProgress.current} de {batchProgress.total} negocios
              </div>
            </div>
          </div>
          <div className="w-48 bg-emerald-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all"
              style={{
                width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* MULTI-SELECTION ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between gap-4 shadow-lg animate-in fade-in text-xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{selectedIds.size}</span> negocios seleccionados
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveBatchToLeads(selectedLeadsList)}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardar en Mis Leads</span>
            </button>

            <button
              onClick={() => onAnalyzeBatch(selectedLeadsList)}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analizar seleccionados</span>
            </button>
          </div>
        </div>
      )}

      {/* B2B PIPELINE QUALITY METRICS DASHBOARD (Parameter #9) */}
      {leads.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-700/60 pb-2 flex-wrap gap-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Métricas de Calidad de la Base de Prospección (S.Mideros Agency)</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              {leads.length} prospectos en <strong className="text-white">{effectiveCity}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">Prioridad A</span>
              <span className="text-base sm:text-lg font-black text-rose-400">{priorityACount}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">Lista p/ Comprar</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">{readyToBuyYesCount}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">Con Decisor</span>
              <span className="text-base sm:text-lg font-black text-white">{withDecisorCount}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">WhatsApp Válido</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">{withWhatsAppCount}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">Intención Alta</span>
              <span className="text-base sm:text-lg font-black text-amber-400">{highIntentCount}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">Correo Inst.</span>
              <span className="text-base sm:text-lg font-black text-blue-300">{withEmailCount}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">Ley 1581</span>
              <span className="text-base sm:text-lg font-black text-emerald-300">100% Pública</span>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {leads.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            Comienza buscando negocios en Colombia
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Selecciona una ciudad (ej. Bogotá, Medellín, Cali) y una categoría comercial para encontrar
            negocios activos, auditar si tienen web o WhatsApp y descubrir a sus decisores.
          </p>
        </div>
      ) : filteredLeads.length === 0 && leads.length > 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
          Ningún negocio coincide con los filtros aplicados. Prueba desactivando los filtros avanzados.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Negocio / Decisor</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Presencia Web</th>
                  <th className="p-3">Reseñas</th>
                  <th className="p-3">Oportunidad</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td
                        className="p-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectLead(lead.id);
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 inline" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 inline" />
                        )}
                      </td>

                      {/* Business & Decisor */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{lead.address}</div>
                        {lead.decisionMaker?.name && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                            <User className="w-3 h-3 text-emerald-600" />
                            <span>
                              {lead.decisionMaker.name} ({lead.decisionMaker.role || 'Dueño'})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Contact & WhatsApp */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-300 italic">Sin tel</span>
                          )}

                          {lead.whatsappLink && (
                            <a
                              href={lead.whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50"
                              title="Chatear por WhatsApp (+57)"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Web Presence */}
                      <td className="p-3">
                        {lead.hasOwnWebsite && lead.websiteUri ? (
                          <a
                            href={lead.websiteUri}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 underline truncate max-w-[150px]"
                          >
                            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.websiteUri.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium text-[11px] border border-amber-200">
                            {lead.websiteType === 'social_or_directory' ? 'Solo Redes' : 'Sin web'}
                          </span>
                        )}
                      </td>

                      {/* Rating & Reviews */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{lead.rating ?? '-'}</span>
                          <span className="text-slate-400 text-[11px]">({lead.userRatingCount ?? 0})</span>
                        </div>
                      </td>

                      {/* Opportunity Score */}
                      <td className="p-3">
                        <OpportunityScoreBadge
                          score={lead.opportunityScore}
                          breakdown={lead.scoreBreakdown}
                          size="sm"
                        />
                      </td>

                      {/* Quick Action */}
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-slate-700 transition-colors"
                        >
                          Ver ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW (OPTIMIZED FOR MOBILE & DESKTOP PROSPECTING) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const isSelected = selectedIds.has(lead.id);
            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={`bg-white rounded-xl border p-4.5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer relative ${
                  isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header with Priority and Intent badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                        lead.b2bIntelligence?.priority === 'A'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Prioridad {lead.b2bIntelligence?.priority || 'A'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        lead.b2bIntelligence?.readyToBuyStatus === 'SÍ'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : lead.b2bIntelligence?.readyToBuyStatus === 'TAL VEZ'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        Lista: {lead.b2bIntelligence?.readyToBuyStatus || 'SÍ'}
                      </span>
                      {lead.b2bIntelligence?.assignedVariant && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {lead.b2bIntelligence.assignedVariant.variantLetter === 'A' ? 'A (Resp. Lenta)' : 'B (Pacientes)'}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Intención: {lead.b2bIntelligence?.purchaseIntent || 'Alta'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{lead.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{lead.address}</p>
                  </div>
                  <OpportunityScoreBadge
                    score={lead.opportunityScore}
                    breakdown={lead.scoreBreakdown}
                    size="sm"
                  />
                </div>

                {/* Commercial Leak Highlight */}
                {lead.b2bIntelligence?.mainFunnelLeak && (
                  <div className="text-[11px] bg-amber-50/70 text-amber-950 p-2 rounded-lg border border-amber-200/80 line-clamp-2 leading-relaxed">
                    <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wide">Fuga Comercial:</span>
                    {lead.b2bIntelligence.mainFunnelLeak}
                  </div>
                )}

                {/* Microprueba Tag (Módulo Anti-Fallo) */}
                {lead.b2bIntelligence?.painTest?.microTest && (
                  <div className="text-[11px] bg-indigo-50/60 text-indigo-950 p-2 rounded-lg border border-indigo-100 flex items-start gap-1.5">
                    <span className="font-bold text-indigo-800 text-[10px] uppercase shrink-0">Microprueba:</span>
                    <span className="text-slate-700 line-clamp-1">{lead.b2bIntelligence.painTest.microTest}</span>
                  </div>
                )}

                {/* Decisor Tag if any */}
                {lead.decisionMaker?.name && (
                  <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded-lg flex items-center justify-between gap-1.5 font-medium border border-emerald-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">
                        Decisor: <strong>{lead.decisionMaker.name}</strong> ({lead.decisionMaker.role || 'Dueño'})
                      </span>
                    </div>
                    {lead.b2bIntelligence?.decisionMakerStatus === 'Confirmado' && (
                      <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded font-bold uppercase shrink-0">
                        Confirmado
                      </span>
                    )}
                  </div>
                )}

                {/* Treatments tags if available */}
                {lead.b2bIntelligence?.highValueTreatments && lead.b2bIntelligence.highValueTreatments.length > 0 && (
                  <div className="flex items-center gap-1 overflow-hidden text-[10px]">
                    <span className="text-slate-400 font-semibold shrink-0">Tratamientos:</span>
                    <span className="text-slate-700 font-medium truncate">
                      {lead.b2bIntelligence.highValueTreatments.slice(0, 2).join(' • ')}
                    </span>
                  </div>
                )}

                {/* Web & Rating row */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    {lead.hasOwnWebsite && lead.websiteUri ? (
                      <span className="text-slate-700 truncate max-w-[140px] block font-medium underline">
                        {lead.websiteUri.replace(/^https?:\/\//, '')}
                      </span>
                    ) : (
                      <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {lead.websiteType === 'social_or_directory' ? 'Solo Redes' : 'Sin web propia'}
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{lead.rating ?? '-'}</span>
                    <span className="text-slate-400">({lead.userRatingCount ?? 0})</span>
                  </div>
                </div>

                {/* MOBILE OPTIMIZED TOUCH ACTION BUTTONS */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  {lead.whatsappLink ? (
                    <a
                      href={lead.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[42px] px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <div className="min-h-[42px] flex items-center justify-center text-slate-400 text-[11px] italic bg-slate-50 rounded-lg">
                      Sin WhatsApp
                    </div>
                  )}

                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[42px] px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span className="truncate">Llamar</span>
                    </a>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="min-h-[42px] px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center justify-center text-xs"
                    >
                      Ver Ficha
                    </button>
                  )}
                </div>

                {/* Full width button to open details on mobile */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead);
                  }}
                  className="w-full py-1.5 text-center text-xs text-slate-600 hover:text-emerald-700 font-medium border-t border-slate-100 mt-1 flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Ver Ficha, Auditoría y Guiones</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
