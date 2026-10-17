import React, { useState } from 'react';
import { BusinessLead, LeadStatus } from '../../types';
import { OpportunityScoreBadge } from '../common/OpportunityScoreBadge';
import { StorageService } from '../../services/storage';
import {
  Users,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Phone,
  MessageCircle,
  Calendar,
  User,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface Props {
  leads: BusinessLead[];
  onSelectLead: (lead: BusinessLead) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead: (leadId: string) => void;
}

export const LeadsView: React.FC<Props> = ({
  leads,
  onSelectLead,
  onUpdateLeadStatus,
  onDeleteLead,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterNiche, setFilterNiche] = useState<string>('all');

  const kanbanColumns: Array<{ id: LeadStatus; label: string; color: string }> = [
    { id: 'new', label: 'Nuevo', color: 'border-slate-300' },
    { id: 'analyzed', label: 'Analizado', color: 'border-blue-400' },
    { id: 'contacted', label: 'Contactado', color: 'border-amber-400' },
    { id: 'replied', label: 'Respondió', color: 'border-purple-400' },
    { id: 'meeting', label: 'Reunión Agendada', color: 'border-indigo-500' },
    { id: 'won', label: 'Cliente Ganado 🎉', color: 'border-emerald-500' },
    { id: 'discarded', label: 'Descartado', color: 'border-slate-200' },
  ];

  // Distinct cities and niches from saved leads
  const cities = Array.from(new Set(leads.map((l) => l.city).filter(Boolean)));
  const niches = Array.from(new Set(leads.map((l) => l.niche).filter(Boolean)));

  const filteredLeads = leads.filter((lead) => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    if (filterCity !== 'all' && lead.city !== filterCity) return false;
    if (filterNiche !== 'all' && lead.niche !== filterNiche) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchAddress = lead.address.toLowerCase().includes(q);
      const matchDecisor = lead.decisionMaker?.name?.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchDecisor) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    StorageService.exportLeadsToCSV(filteredLeads);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      
      {/* TOOLBAR & CONTROLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por negocio, decisor o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
            />
          </div>

          {/* Export & View Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar CSV</span>
            </button>

            <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded ${
                  viewMode === 'kanban' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista Tablero Kanban"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevo</option>
            <option value="analyzed">Analizado</option>
            <option value="contacted">Contactado</option>
            <option value="replied">Respondió</option>
            <option value="meeting">Reunión</option>
            <option value="won">Cliente Ganado</option>
            <option value="discarded">Descartado</option>
          </select>

          {cities.length > 0 && (
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700"
            >
              <option value="all">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {niches.length > 0 && (
            <select
              value={filterNiche}
              onChange={(e) => setFilterNiche(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700"
            >
              <option value="all">Todos los nichos</option>
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}

          <span className="text-slate-400 ml-auto font-mono">
            {filteredLeads.length} de {leads.length} leads
          </span>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
          {kanbanColumns.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-col max-h-[75vh]"
              >
                {/* Column header */}
                <div className={`pb-2.5 mb-2.5 border-b-2 ${col.color} flex items-center justify-between`}>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Cards container */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                  {columnLeads.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Sin prospectos
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {lead.name}
                          </h4>
                          <OpportunityScoreBadge
                            score={lead.opportunityScore}
                            breakdown={lead.scoreBreakdown}
                            size="sm"
                          />
                        </div>

                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {lead.city} · {lead.niche}
                        </div>

                        {lead.decisionMaker?.name && (
                          <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <User className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{lead.decisionMaker.name}</span>
                          </div>
                        )}

                        {lead.nextFollowUpDate && (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{lead.nextFollowUpDate}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {lead.whatsappLink && (
                              <a
                                href={lead.whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Abrir WhatsApp (+57)"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-500 hover:text-slate-900"
                                title="Llamar"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Quick move status dropdown */}
                          <select
                            value={lead.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600"
                          >
                            {kanbanColumns.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Negocio</th>
                  <th className="p-3">Decisor</th>
                  <th className="p-3">Ciudad / Nicho</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Oportunidad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Próximo Seguimiento</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal line-clamp-1">{lead.address}</div>
                    </td>

                    <td className="p-3">
                      {lead.decisionMaker?.name ? (
                        <div className="text-emerald-900 font-medium">
                          {lead.decisionMaker.name}
                          <div className="text-[11px] text-slate-400 font-normal">
                            {lead.decisionMaker.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">No asignado</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div>{lead.city}</div>
                      <div className="text-[11px] text-slate-400">{lead.niche}</div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {lead.phone && <span>{lead.phone}</span>}
                        {lead.whatsappLink && (
                          <a
                            href={lead.whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <OpportunityScoreBadge
                        score={lead.opportunityScore}
                        breakdown={lead.scoreBreakdown}
                        size="sm"
                      />
                    </td>

                    <td className="p-3">
                      <select
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium"
                      >
                        <option value="new">Nuevo</option>
                        <option value="analyzed">Analizado</option>
                        <option value="contacted">Contactado</option>
                        <option value="replied">Respondió</option>
                        <option value="meeting">Reunión</option>
                        <option value="won">Cliente ganado 🎉</option>
                        <option value="discarded">Descartado</option>
                      </select>
                    </td>

                    <td className="p-3 whitespace-nowrap text-slate-600">
                      {lead.nextFollowUpDate || <span className="text-slate-300">-</span>}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar ${lead.name} de tus leads?`)) {
                            onDeleteLead(lead.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar de leads"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
