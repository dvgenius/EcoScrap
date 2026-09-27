import React from 'react';
import { Wifi, WifiOff, RefreshCw, Smartphone, Building2, Scale, Zap } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

export default function OfflineSimBanner({
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  offlineQueueCount,
  onManualSync,
  isSyncing,
  currentView,
  onViewChange,
  lang,
  onLanguageChange
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-3 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Hackathon Meta */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="text-emerald-400">कबाड़ी</span>Connect
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SIH 26229
              </span>
            </div>
          </div>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden lg:inline-block text-[11px] text-slate-400 font-medium">
            Ministry of Mines & JNARDDC E-Waste Formalization
          </span>
        </div>

        {/* Center: Presentation Navigation (Collector, Recycler, Jury) */}
        <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => onViewChange('collector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all touch-press ${
              currentView === 'collector'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>📱 {lang === 'mr' ? 'कबाडी मित्र' : 'कबाड़ी मित्र'}</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('recycler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all touch-press ${
              currentView === 'recycler'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={14} />
            <span>🏭 CPCB Recycler</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('jury')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all touch-press ${
              currentView === 'jury'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale size={14} />
            <span>⚖️ Jury Impact</span>
          </button>
        </div>

        {/* Right: Offline Simulator Controls, Sync Queue & Language */}
        <div className="flex items-center gap-2">
          {/* Simulated Offline Toggle */}
          <button
            type="button"
            onClick={onToggleSimulatedOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-bold border transition-all touch-press ${
              isSimulatedOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600'
            }`}
            title="Toggle simulated offline mode for field testing"
          >
            {isOnline ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-amber-400" />}
            <span>
              {isSimulatedOffline ? 'Simulated: OFFLINE' : 'Simulate Offline'}
            </span>
          </button>

          {/* Offline Sync Queue Pill */}
          {offlineQueueCount > 0 && (
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing || !isOnline}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-bold text-white shadow transition-all touch-press ${
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              }`}
              title="Sync offline lots to server"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>
                {offlineQueueCount} {lang === 'mr' ? 'प्रतिक्षेत' : 'ड्राफ्ट'}
              </span>
              {isOnline && <span className="bg-emerald-800 px-1 rounded text-[10px]">Sync</span>}
            </button>
          )}

          {/* Language Switcher */}
          <LanguageToggle currentLang={lang} onToggle={onLanguageChange} />
        </div>
      </div>
    </header>
  );
}
