import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, Settings, Menu, X, BarChart3, Save, RotateCcw } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { DEFAULT_CONFIG, MOCK_HISTORY_LENGTH } from './constants';
import { generateMockData } from './utils/calculations';
import { DailyData, ScoringConfig } from './types';

// Tab Definitions
type Tab = 'dashboard' | 'log' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState<DailyData[]>([]);
  const [config, setConfig] = useState<ScoringConfig>(DEFAULT_CONFIG);

  // Initialize with mock data (Simulating Google Sheet data retrieval)
  useEffect(() => {
    const mock = generateMockData(MOCK_HISTORY_LENGTH);
    setData(mock);
    
    // In a real Google Apps Script environment, you would use:
    // google.script.run.withSuccessHandler(setData).getDataFromSheet();
  }, []);

  const handleSaveEntry = (newEntry: DailyData) => {
    setData(prev => {
      // Check if entry for date exists, update it, otherwise add new
      const index = prev.findIndex(d => d.date === newEntry.date);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newEntry;
        return updated;
      }
      return [...prev, newEntry];
    });
    
    // Switch back to dashboard to see result
    setActiveTab('dashboard');
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const NavItem = ({ tab, label, icon: Icon }: { tab: Tab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${
        activeTab === tab 
        ? 'bg-brand-500/10 text-brand-400 font-medium' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="text-brand-400"/>
            Nexus Tracker
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem tab="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem tab="log" label="Log Activity" icon={PlusCircle} />
          <NavItem tab="settings" label="Settings" icon={Settings} />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">v2.1 • Google Sheet Integrated</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg text-brand-400">Nexus Tracker</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-950 z-40 pt-16 p-4">
          <nav className="space-y-4">
            <NavItem tab="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem tab="log" label="Log Activity" icon={PlusCircle} />
            <NavItem tab="settings" label="Settings" icon={Settings} />
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Here is your daily productivity analysis.</p>
              </header>
              <Dashboard data={data} config={config} />
            </div>
          )}

          {activeTab === 'log' && (
            <div className="animate-fade-in">
              <EntryForm onSave={handleSaveEntry} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl border border-slate-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-500/20 rounded-lg">
                  <Settings className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Scoring Configuration</h3>
                  <p className="text-slate-400 text-sm">Adjust how your productivity score is calculated.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Work Weight (Points/Hr)</label>
                    <input 
                      type="number" 
                      name="workWeight"
                      value={config.workWeight}
                      onChange={handleConfigChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Daily Target Score</label>
                    <input 
                      type="number" 
                      name="dailyTargetScore"
                      value={config.dailyTargetScore}
                      onChange={handleConfigChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Exercise Weight (Pts/Min)</label>
                    <input 
                      type="number" 
                      name="exerciseWeight"
                      value={config.exerciseWeight}
                      onChange={handleConfigChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Study Weight (Pts/Min)</label>
                    <input 
                      type="number" 
                      name="studyWeight"
                      value={config.studyWeight}
                      onChange={handleConfigChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sleep Target (Hours)</label>
                    <input 
                      type="number" 
                      name="sleepTarget"
                      value={config.sleepTarget}
                      onChange={handleConfigChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Penalty (Pts/Min)</label>
                    <input 
                      type="number" 
                      name="phonePenalty"
                      value={config.phonePenalty}
                      onChange={handleConfigChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700 flex justify-between">
                  <button 
                    onClick={resetConfig}
                    className="px-4 py-2 text-slate-400 hover:text-white flex items-center gap-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <RotateCcw size={16} /> Reset to Default
                  </button>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-400 flex items-center gap-2 shadow-lg shadow-brand-500/20"
                  >
                    <Save size={16} /> Save & View
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;