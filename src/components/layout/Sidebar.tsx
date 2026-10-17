import React from 'react';
import { Search, Compass, Users, Settings, Target, MapPin, Zap } from 'lucide-react';
import { AppSettings } from '../../types';

export type NavView = 'search' | 'leads' | 'radar' | 'settings';

interface Props {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  leadsCount: number;
  settings: AppSettings;
}

export const Sidebar: React.FC<Props> = ({
  currentView,
  onNavigate,
  leadsCount,
  settings,
}) => {
  const navItems = [
    {
      id: 'search' as NavView,
      label: 'Buscar',
      fullLabel: 'Buscar Negocios',
      icon: Search,
      badge: null,
    },
    {
      id: 'radar' as NavView,
      label: 'Radar',
      fullLabel: 'Radar de Nichos',
      icon: Compass,
      badge: 'IA',
    },
    {
      id: 'leads' as NavView,
      label: 'Mis Leads',
      fullLabel: 'Mis Leads',
      icon: Users,
      badge: leadsCount > 0 ? leadsCount.toString() : null,
    },
    {
      id: 'settings' as NavView,
      label: 'Ajustes',
      fullLabel: 'Ajustes',
      icon: Settings,
      badge: null,
    },
  ];

  const isGoogleCloud = settings.searchProvider === 'google_cloud' && Boolean(settings.googleCloudApiKey);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-200 flex-col shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Radar de Clientes
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Mercado Colombia
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.fullLabel}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mode Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Zap className="w-3 h-3 text-amber-400" />
                Motor activo:
              </span>
              <span className="font-medium text-slate-200 text-[11px]">
                {isGoogleCloud ? 'Google Places' : 'Búsqueda en Vivo (Gratis)'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Consultas este mes:</span>
              <span className="font-mono text-emerald-400">
                {isGoogleCloud
                  ? `${settings.monthlyUsage.placesCallsCount} / 1000`
                  : `${settings.monthlyUsage.freeQueriesCount} gratis`}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-50 flex items-center justify-around px-2 shadow-2xl safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 font-mono text-[9px] px-1 py-0.2 bg-emerald-600 text-white rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
