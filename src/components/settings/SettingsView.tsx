import React, { useState } from 'react';
import { AppSettings, SellerProfile } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Settings,
  Key,
  User,
  Zap,
  ShieldCheck,
  Check,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [searchProvider, setSearchProvider] = useState<'gemini_free' | 'google_cloud'>(
    settings.searchProvider
  );
  const [googleCloudApiKey, setGoogleCloudApiKey] = useState(settings.googleCloudApiKey);

  // Seller profile
  const [profile, setProfile] = useState<SellerProfile>(settings.sellerProfile);
  const [serviceInput, setServiceInput] = useState('');

  // Threshold
  const [threshold, setThreshold] = useState(settings.monthlyUsage.maxFreePlacesThreshold || 1000);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      searchProvider,
      googleCloudApiKey: googleCloudApiKey.trim(),
      sellerProfile: profile,
      monthlyUsage: {
        ...settings.monthlyUsage,
        maxFreePlacesThreshold: Number(threshold) || 1000,
      },
    };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddService = () => {
    if (serviceInput.trim() && !profile.servicesOffered.includes(serviceInput.trim())) {
      setProfile({
        ...profile,
        servicesOffered: [...profile.servicesOffered, serviceInput.trim()],
      });
      setServiceInput('');
    }
  };

  const handleRemoveService = (service: string) => {
    setProfile({
      ...profile,
      servicesOffered: profile.servicesOffered.filter((s) => s !== service),
    });
  };

  const placesCount = settings.monthlyUsage.placesCallsCount;
  const isNearLimit = placesCount >= (Number(threshold) * 0.8);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Ajustes y Configuración</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personaliza cómo busca la aplicación, tu perfil de vendedor y los límites de consumo.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Ajustes guardados correctamente</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* PROVIDER SELECTION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Motor de Búsqueda y Prospección
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Puedes prospectar 100% gratis hoy mismo en Colombia sin pagar Google Cloud utilizando Gemini con búsqueda web,
            o activar Google Cloud si ya dispones de tu clave de API.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Free Mode */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                searchProvider === 'gemini_free'
                  ? 'border-emerald-600 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="provider"
                  value="gemini_free"
                  checked={searchProvider === 'gemini_free'}
                  onChange={() => setSearchProvider('gemini_free')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Modo Gratuito (Gemini IA)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    0 costes. Sin vincular tarjeta bancaria ni configurar Google Cloud Console. Encuentra negocios en
                    Colombia con IA, extrae números de WhatsApp y rastrea al decisor.
                  </p>
                </div>
              </div>
            </label>

            {/* Google Cloud Mode */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                searchProvider === 'google_cloud'
                  ? 'border-emerald-600 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="provider"
                  value="google_cloud"
                  checked={searchProvider === 'google_cloud'}
                  onChange={() => setSearchProvider('google_cloud')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Google Cloud API (Places + PageSpeed)
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Usa directamente la Places API (New) y PageSpeed Insights v5 con tu clave de Google Cloud.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Google Cloud API Key Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clave de Google Cloud API (opcional)
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={googleCloudApiKey}
                onChange={(e) => setGoogleCloudApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono bg-white"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              🔒 Tu clave se almacena exclusivamente en tu navegador (`localStorage`) y nunca se envía a servidores externos.
            </p>
          </div>
        </div>

        {/* USAGE AND THRESHOLD MONITOR */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Control de Consumo Mensual ({settings.monthlyUsage.month})
              </h3>
            </div>

            {isNearLimit && (
              <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Alerta de límite próximo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Consultas Gratuitas con IA:</div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {settings.monthlyUsage.freeQueriesCount}
              </div>
              <div className="text-[11px] text-slate-400">Sin límite de facturación</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Llamadas a Places API:</div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {placesCount} <span className="text-sm font-normal text-slate-400">/ {threshold}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isNearLimit ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (placesCount / Number(threshold)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs text-slate-600 font-medium">
              Avisar al alcanzar:
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded w-28 bg-white font-mono"
            />
            <span className="text-xs text-slate-400">llamadas (límite mensual editable)</span>
          </div>
        </div>

        {/* SELLER PROFILE */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Mi Perfil de Vendedor / Agencia
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Esta información se utiliza para que la Inteligencia Artificial redacte los guiones de llamada,
            mensajes de WhatsApp y correos con tu nombre, agencia y propuesta de valor real.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tu Nombre o Nombre de Contacto
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Ej. Santiago Mideros"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de tu Agencia / Negocio
              </label>
              <input
                type="text"
                value={profile.agencyName}
                onChange={(e) => setProfile({ ...profile, agencyName: e.target.value })}
                placeholder="Ej. Mideros Agency"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tono por Defecto de los Borradores
              </label>
              <select
                value={profile.defaultTone}
                onChange={(e) => setProfile({ ...profile, defaultTone: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="consultive">Consultivo y cercano (Recomendado)</option>
                <option value="direct">Directo y ejecutivo</option>
                <option value="loss_aversion">Enfocado en pérdida de clientes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tu WhatsApp para Firma de Mensajes
              </label>
              <input
                type="text"
                value={profile.whatsappContact || ''}
                onChange={(e) => setProfile({ ...profile, whatsappContact: e.target.value })}
                placeholder="+57 300 123 4567"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tu Propuesta de Valor Central
            </label>
            <textarea
              rows={2}
              value={profile.valueProposition}
              onChange={(e) => setProfile({ ...profile, valueProposition: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          {/* Services offered list */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Servicios que Ofreces a los Negocios
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.servicesOffered.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Añadir otro servicio (ej. Campañas Meta Ads)..."
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg w-72 bg-white"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
