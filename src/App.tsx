import React, { useState, useEffect } from 'react';
import { BusinessLead, LeadStatus, AppSettings } from './types';
import { StorageService } from './services/storage';
import { LeadService } from './services/leadService';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SearchView } from './components/search/SearchView';
import { LeadsView } from './components/leads/LeadsView';
import { NicheRadarView } from './components/radar/NicheRadarView';
import { SettingsView } from './components/settings/SettingsView';
import { BusinessDetailModal } from './components/business/BusinessDetailModal';
import { BatchModuleView } from './components/batches/BatchModuleView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('search');
  const [savedLeads, setSavedLeads] = useState<BusinessLead[]>([]);
  const [searchResults, setSearchResults] = useState<BusinessLead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [providerUsed, setProviderUsed] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Modal detail
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Batch progress
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    isRunning: boolean;
  }>({ current: 0, total: 0, isRunning: false });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenLeadById = (leadId: string) => {
    const found = searchResults.find((l) => l.id === leadId) || savedLeads.find((l) => l.id === leadId);
    if (found) {
      handleOpenLeadModal(found);
    }
  };

  // Load leads and run an initial live search on start
  useEffect(() => {
    const existing = StorageService.getLeads();
    setSavedLeads(existing);

    // Run real live search for Colombia on initial mount
    handleSearch('Bogotá', 'Clínicas dentales', '');
  }, []);

  // Search handler
  const handleSearch = async (city: string, niche: string, neighborhood: string) => {
    setIsSearching(true);
    try {
      const result = await LeadService.searchBusinesses(city, niche, neighborhood);
      setSearchResults(result.leads);
      setProviderUsed(result.providerUsed);
      setSettings(StorageService.getSettings());
      showToast(`${result.leads.length} negocios encontrados en ${city}`);
    } catch (err: any) {
      showToast(`Error al buscar: ${err.message || 'Intenta de nuevo'}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Open lead detail modal
  const handleOpenLeadModal = (lead: BusinessLead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  // Update lead in state and storage
  const handleUpdateLead = (updated: BusinessLead) => {
    setSelectedLead(updated);
    StorageService.saveLead(updated);

    // Update in searchResults if present
    setSearchResults((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    // Update in savedLeads
    setSavedLeads((prev) => {
      const index = prev.findIndex((l) => l.id === updated.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  // Update lead status in Kanban/table
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    const lead = savedLeads.find((l) => l.id === leadId) || searchResults.find((l) => l.id === leadId);
    if (lead) {
      const updated = { ...lead, status: newStatus, updatedAt: new Date().toISOString() };
      handleUpdateLead(updated);
      showToast(`Estado cambiado a: ${newStatus}`);
    }
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    StorageService.deleteLead(leadId);
    setSavedLeads((prev) => prev.filter((l) => l.id !== leadId));
    showToast('Lead eliminado');
  };

  // Save batch to leads
  const handleSaveBatchToLeads = (leadsToSave: BusinessLead[]) => {
    const count = StorageService.saveLeadsBatch(leadsToSave);
    setSavedLeads(StorageService.getLeads());
    showToast(`${count} prospectos guardados en Mis Leads`);
  };

  // Batch analyze
  const handleAnalyzeBatch = async (leadsToAnalyze: BusinessLead[]) => {
    setBatchProgress({ current: 0, total: leadsToAnalyze.length, isRunning: true });
    try {
      const results = await LeadService.analyzeBatch(leadsToAnalyze, (current, total) => {
        setBatchProgress({ current, total, isRunning: true });
      });

      // Update state with analyzed leads
      const resultsMap = new Map(results.map((r) => [r.id, r]));
      setSearchResults((prev) => prev.map((l) => resultsMap.get(l.id) || l));
      setSavedLeads(StorageService.getLeads());
      showToast('Análisis en lote completado');
    } catch (e: any) {
      alert(`Error en lote: ${e.message}`);
    } finally {
      setBatchProgress({ current: 0, total: 0, isRunning: false });
    }
  };

  // Explore niche from Radar
  const handleExploreNiche = (city: string, niche: string) => {
    setCurrentView('search');
    handleSearch(city, niche, '');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        leadsCount={savedLeads.length}
        settings={settings}
      />

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentView={currentView}
          onNavigate={setCurrentView}
          settings={settings}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {currentView === 'search' && (
            <SearchView
              onSearch={handleSearch}
              isLoading={isSearching}
              leads={searchResults}
              onSelectLead={handleOpenLeadModal}
              onSaveBatchToLeads={handleSaveBatchToLeads}
              onAnalyzeBatch={handleAnalyzeBatch}
              batchProgress={batchProgress}
              providerUsed={providerUsed}
              settings={settings}
              onCreateBatch={() => setCurrentView('batches')}
            />
          )}

          {currentView === 'batches' && (
            <BatchModuleView
              onSelectLeadById={handleOpenLeadById}
              availableLeads={searchResults.length > 0 ? searchResults : savedLeads}
            />
          )}

          {currentView === 'radar' && (
            <NicheRadarView
              onExploreNiche={handleExploreNiche}
              settings={settings}
            />
          )}

          {currentView === 'leads' && (
            <LeadsView
              leads={savedLeads}
              onSelectLead={handleOpenLeadModal}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings(newSettings)}
            />
          )}
        </main>
      </div>

      {/* BUSINESS DETAIL MODAL */}
      {selectedLead && (
        <BusinessDetailModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdateLead={handleUpdateLead}
          onAnalyzeLead={(lead) => LeadService.analyzeLead(lead)}
          settings={settings}
        />
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
