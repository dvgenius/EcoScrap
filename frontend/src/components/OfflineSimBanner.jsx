import React from 'react';
import { Wifi, WifiOff, RefreshCw, Smartphone, Building2, Scale, Zap } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

export default function OfflineSimBanner({
  isOnline, isSimulatedOffline, onToggleSimulatedOffline,
  offlineQueueCount, onManualSync, isSyncing,
  currentView, onViewChange, lang, onLanguageChange
}) {
  return (
    <header className="sticky top-0 z-50 px-3 py-2.5" style={{
      background: 'rgba(6, 10, 22, 0.82)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.40)'
    }}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center gap-2">
            {/* Live status orb */}
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <div className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="shimmer-text">कबाड़ी</span>
              <span className="text-slate-200">Connect</span>
              <span className="ml-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.30)' }}>
                SIH 26229
              </span>
            </div>
          </div>
          <span className="hidden lg:inline-block text-[11px] text-slate-500 font-medium">
            Ministry of Mines & JNARDDC
          </span>
        </div>

        {/* View Switcher — glass pill navigation */}
        <nav className="flex items-center rounded-xl p-1 gap-0.5" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(12px)',
        }}>
          {[
            { id: 'collector', icon: Smartphone, labelHi: '📱 कबाड़ी मित्र', labelMr: '📱 कबाडी मित्र', accent: 'emerald' },
            { id: 'recycler',  icon: Building2,  labelHi: '🏭 CPCB Recycler', labelMr: '🏭 CPCB Recycler', accent: 'blue' },
            { id: 'jury',      icon: Scale,      labelHi: '⚖️ Jury Impact', labelMr: '⚖️ Jury Impact', accent: 'purple' },
          ].map(({ id, icon: Icon, labelHi, labelMr, accent }) => {
            const active = currentView === id;
            const colors = {
              emerald: { bg: 'rgba(16,185,129,0.20)', border: 'rgba(16,185,129,0.45)', text: '#34d399', shadow: 'rgba(16,185,129,0.30)' },
              blue:    { bg: 'rgba(59,130,246,0.20)',  border: 'rgba(59,130,246,0.45)',  text: '#93c5fd', shadow: 'rgba(59,130,246,0.30)' },
              purple:  { bg: 'rgba(139,92,246,0.20)',  border: 'rgba(139,92,246,0.45)',  text: '#c4b5fd', shadow: 'rgba(139,92,246,0.30)' },
            }[accent];
            return (
              <button key={id} type="button" onClick={() => onViewChange(id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all touch-press"
                style={active ? {
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  boxShadow: `0 0 14px ${colors.shadow}`,
                } : { color: '#94a3b8', border: '1px solid transparent' }}
              >
                <Icon size={13} />
                <span>{lang === 'mr' ? labelMr : labelHi}</span>
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Simulate Offline toggle */}
          <button type="button" onClick={onToggleSimulatedOffline}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs touch-press"
            style={{
              background: isSimulatedOffline ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.06)',
              border: isSimulatedOffline ? '1px solid rgba(245,158,11,0.50)' : '1px solid rgba(255,255,255,0.10)',
              color: isSimulatedOffline ? '#fcd34d' : '#94a3b8',
              boxShadow: isSimulatedOffline ? '0 0 12px rgba(245,158,11,0.20)' : 'none',
            }}
          >
            {isOnline
              ? <Wifi size={12} style={{ color: '#34d399' }} />
              : <WifiOff size={12} style={{ color: '#fbbf24' }} />
            }
            <span>{isSimulatedOffline ? 'Simulated: OFFLINE' : 'Simulate Offline'}</span>
          </button>

          {/* Sync queue badge */}
          {offlineQueueCount > 0 && (
            <button type="button" onClick={onManualSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs text-white touch-press"
              style={{
                background: isOnline ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)',
                border: isOnline ? '1px solid rgba(16,185,129,0.50)' : '1px solid rgba(255,255,255,0.10)',
                animation: isOnline ? 'orb-pulse 2s ease-in-out infinite' : 'none',
                color: isOnline ? '#6ee7b7' : '#64748b',
              }}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{offlineQueueCount} {lang === 'mr' ? 'ड्राफ्ट' : 'ड्राफ्ट'}</span>
              {isOnline && (
                <span className="px-1 rounded text-[10px] font-black"
                  style={{ background: 'rgba(16,185,129,0.30)', color: '#a7f3d0' }}>
                  Sync
                </span>
              )}
            </button>
          )}

          {/* Language switcher */}
          <LanguageToggle currentLang={lang} onToggle={onLanguageChange} />
        </div>
      </div>
    </header>
  );
}
