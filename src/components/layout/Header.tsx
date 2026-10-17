import React from 'react';
import { NavView } from './Sidebar';
import { AppSettings } from '../../types';
import { AlertCircle, UserCheck } from 'lucide-react';

interface Props {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  settings: AppSettings;
}

export const Header: React.FC<Props> = ({ currentView, onNavigate, settings }) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    search: {
      title: 'Búsqueda de Prospectos',
      subtitle: 'Encuentra negocios locales en Colombia, detecta su brecha digital y genera tu primer contacto.',
    },
    radar: {
      title: 'Radar de Nichos',
      subtitle: 'Descubre en qué sectores de tu ciudad hay menor competencia web y mayor disposición a pagar.',
    },
    leads: {
      title: 'Gestión de Leads (CRM)',
      subtitle: 'Seguimiento de prospectos guardados por etapas de venta, desde nuevo hasta cliente ganado.',
    },
    settings: {
      title: 'Ajustes y Configuración',
      subtitle: 'Perfil del vendedor, propuesta comercial y configuración de proveedores de búsqueda.',
    },
  };

  const current = titles[currentView] || titles.search;
  const isNearLimit = settings.monthlyUsage.placesCallsCount >= 800;

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-none">
            {current.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isNearLimit && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Llegaste a {settings.monthlyUsage.placesCallsCount} llamadas de Places</span>
          </div>
        )}

        <div className="text-right hidden sm:block">
          <div className="text-xs font-medium text-slate-800">
            {settings.sellerProfile.name || 'Consultor'}
          </div>
          <div className="text-[11px] text-slate-400">
            {settings.sellerProfile.agencyName || 'Agencia Digital'}
          </div>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          title="Editar perfil de vendedor"
        >
          <UserCheck className="w-4 h-4 text-slate-700" />
        </button>
      </div>
    </header>
  );
};
