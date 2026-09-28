import React, { useState, useEffect } from 'react';
import {
  BarChart2, MapPin, ClipboardList, TrendingUp, RefreshCw,
  CheckCircle2, Clock, ArrowUpRight, Zap, Shield
} from 'lucide-react';
import VerificationTerminal from './VerificationTerminal';
import DigitalReceiptModal from './DigitalReceiptModal';
import RecoveryAnalytics from './RecoveryAnalytics';
import { fetchLots } from '../../services/api';
import { ttsService } from '../../services/tts';

const NAV_ITEMS = [
  { id: 'lots',      icon: ClipboardList, label: 'Incoming Lots',   accent: { base: '#3b82f6', glow: 'rgba(59,130,246,0.30)' } },
  { id: 'analytics', icon: BarChart2,     label: 'EPR Analytics',   accent: { base: '#10b981', glow: 'rgba(16,185,129,0.30)' } },
  { id: 'map',       icon: MapPin,        label: 'Geo Map',          accent: { base: '#8b5cf6', glow: 'rgba(139,92,246,0.30)' } },
];

const STATUS_STYLES = {
  SYNCED:        { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.40)',  color: '#93c5fd', label: 'New Lot' },
  BID_ACCEPTED:  { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.40)',  color: '#fcd34d', label: 'Bid Accepted' },
  VERIFIED:      { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.40)',  color: '#6ee7b7', label: 'Verified ✓' },
  SETTLED:       { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.40)',  color: '#c4b5fd', label: 'Settled' },
};

const HAZARD_CATS = [2, 3];

export default function RecyclerPortal({ onLotVerified, newLotAlert }) {
  const [activeTab, setActiveTab] = useState('lots');
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [receiptLot, setReceiptLot] = useState(null);
  const [flashLotId, setFlashLotId] = useState(null);

  useEffect(() => { loadLots(); }, []);

  useEffect(() => {
    if (newLotAlert) {
      setFlashLotId(newLotAlert.lot_id);
      setLots(prev => {
        const exists = prev.some(l => l.lot_id === newLotAlert.lot_id);
        return exists ? prev : [newLotAlert, ...prev];
      });
      ttsService.playChime('notification');
      setTimeout(() => setFlashLotId(null), 3500);
    }
  }, [newLotAlert]);

  const loadLots = async () => {
    setIsLoading(true);
    try {
      const res = await fetchLots();
      if (res.success) setLots(res.data);
    } catch {}
    finally { setIsLoading(false); }
  };

  const handleVerify = (lot) => { setSelectedLot(lot); setIsVerifyOpen(true); };

  const handleVerified = (data) => {
    const updated = { ...selectedLot, status: 'VERIFIED', verified_weight_kg: data.weight };
    setLots(prev => prev.map(l => l.lot_id === updated.lot_id ? updated : l));
    setIsVerifyOpen(false);
    setReceiptLot(updated);
    if (onLotVerified) onLotVerified(updated);
  };

  const metrics = {
    total: lots.length,
    verified: lots.filter(l => l.status === 'VERIFIED' || l.status === 'SETTLED').length,
    pending: lots.filter(l => l.status === 'SYNCED').length,
    kg: lots.reduce((s, l) => s + (l.verified_weight_kg || l.est_weight_kg || 0), 0).toFixed(1),
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'transparent' }}>
      {/* Portal header */}
      <div className="px-6 py-4" style={{
        background: 'rgba(6,10,22,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg text-lg"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', boxShadow: '0 4px 14px rgba(59,130,246,0.40)' }}>
              🏭
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white">CPCB Recycler Portal</h1>
              <p className="text-[11px] text-slate-400 font-semibold">E-Waste Management Dashboard • JNARDDC</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7' }}>
              <Shield size={13} />REC-MH-0045
            </span>
            <button type="button" onClick={loadLots} className="p-2 rounded-xl touch-press"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <RefreshCw size={15} className={isLoading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-5 p-5 flex-1">
        {/* Sidebar navigation */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="rounded-3xl p-2 flex lg:flex-col gap-1.5" style={{
            background: 'rgba(10,18,40,0.70)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.30)',
          }}>
            {NAV_ITEMS.map(({ id, icon: Icon, label, accent }) => {
              const active = activeTab === id;
              return (
                <button key={id} type="button" onClick={() => { setActiveTab(id); ttsService.playChime('click'); }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all touch-press w-full text-left"
                  style={active ? {
                    background: `${accent.glow}`,
                    border: `1px solid ${accent.base}55`,
                    color: accent.base,
                    boxShadow: `0 0 16px ${accent.glow}`,
                  } : { color: '#64748b', border: '1px solid transparent' }}
                >
                  <div className="p-1.5 rounded-xl flex-shrink-0" style={active ? {
                    background: `rgba(${accent.base === '#3b82f6' ? '59,130,246' : accent.base === '#10b981' ? '16,185,129' : '139,92,246'},0.20)`,
                    border: `1px solid ${accent.base}40`,
                  } : { background: 'rgba(255,255,255,0.05)' }}>
                    <Icon size={15} />
                  </div>
                  <span>{label}</span>
                  {id === 'lots' && metrics.pending > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                      style={{ background: 'rgba(59,130,246,0.30)', color: '#93c5fd' }}>
                      {metrics.pending}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mini metrics in sidebar */}
            <div className="mt-auto pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { label: 'Verified', val: metrics.verified, color: '#6ee7b7', bg: 'rgba(16,185,129,0.10)' },
                { label: 'Total KG', val: `${metrics.kg}`, color: '#93c5fd', bg: 'rgba(59,130,246,0.10)' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className="px-3 py-2.5 rounded-2xl" style={{ background: bg, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
                  <div className="text-lg font-black font-mono mt-0.5" style={{ color }}>{val}</div>
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 space-y-4">
          {/* Headline stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Lots', val: metrics.total, icon: ClipboardList,
                color: '#93c5fd', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.30)', glow: 'rgba(59,130,246,0.20)' },
              { label: 'Verified', val: metrics.verified, icon: CheckCircle2,
                color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.30)', glow: 'rgba(16,185,129,0.20)' },
              { label: 'Pending', val: metrics.pending, icon: Clock,
                color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.30)', glow: 'rgba(245,158,11,0.20)' },
              { label: 'Total KG', val: `${metrics.kg}`, icon: TrendingUp,
                color: '#c4b5fd', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.30)', glow: 'rgba(139,92,246,0.20)' },
            ].map(({ label, val, icon: Icon, color, bg, border, glow }) => (
              <div key={label} className="rounded-2xl p-4 relative overflow-hidden" style={{
                background: bg,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `1px solid ${border}`,
                boxShadow: `0 4px 16px ${glow}`,
              }}>
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />
                <Icon size={18} style={{ color, marginBottom: '8px' }} />
                <div className="text-2xl font-black font-mono" style={{ color, textShadow: `0 0 14px ${glow}` }}>{val}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Active tab content */}
          {activeTab === 'lots' && (
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                <Zap size={15} style={{ color: '#fbbf24' }} />
                Lot Queue — Real-time
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-14 gap-2" style={{ color: '#6ee7b7' }}>
                  <RefreshCw size={20} className="animate-spin" />
                  <span className="text-sm font-bold">Loading lots...</span>
                </div>
              ) : lots.length === 0 ? (
                <div className="rounded-3xl p-10 text-center" style={{ background: 'rgba(10,18,40,0.50)', border: '1px dashed rgba(255,255,255,0.10)' }}>
                  <ClipboardList size={36} className="mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400 text-sm">No lots in queue yet</p>
                </div>
              ) : (
                lots.map((lot) => {
                  const st = STATUS_STYLES[lot.status] || STATUS_STYLES.SYNCED;
                  const isFlash = flashLotId === lot.lot_id;
                  const isHazard = HAZARD_CATS.includes(lot.category_id);
                  return (
                    <div key={lot.lot_id}
                      className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all"
                      style={{
                        background: isFlash ? 'rgba(16,185,129,0.14)' : 'rgba(12,20,40,0.72)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        border: isFlash ? '1.5px solid rgba(16,185,129,0.60)' : '1px solid rgba(255,255,255,0.09)',
                        boxShadow: isFlash ? '0 0 24px rgba(16,185,129,0.18)' : '0 4px 14px rgba(0,0,0,0.24)',
                        transition: 'all 0.4s ease',
                      }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] text-slate-400">{lot.lot_id}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                            {st.label}
                          </span>
                          {isHazard && (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(244,63,94,0.18)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.40)' }}>
                              ⚠ High Hazard
                            </span>
                          )}
                          {isFlash && (
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse"
                              style={{ background: 'rgba(16,185,129,0.25)', color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.55)' }}>
                              🆕 Live
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-white mt-1.5">
                          {lot.vernacular_hi || lot.category_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-slate-300">{lot.est_weight_kg} kg</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-bold" style={{ color: '#6ee7b7' }}>₹{lot.quoted_amount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            <span>{lot.geo_lat?.toFixed(3)}, {lot.geo_lng?.toFixed(3)}</span>
                          </span>
                        </div>
                      </div>
                      {lot.status === 'SYNCED' && (
                        <button type="button" onClick={() => handleVerify(lot)}
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm touch-press"
                          style={{
                            background: 'linear-gradient(135deg, #059669, #0891b2)',
                            boxShadow: '0 4px 16px rgba(16,185,129,0.30)',
                            color: '#fff',
                          }}>
                          <CheckCircle2 size={16} />
                          <span>Verify Lot</span>
                        </button>
                      )}
                      {lot.status === 'VERIFIED' && (
                        <button type="button" onClick={() => setReceiptLot(lot)}
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm touch-press"
                          style={{
                            background: 'rgba(139,92,246,0.20)',
                            border: '1px solid rgba(139,92,246,0.45)',
                            color: '#c4b5fd',
                          }}>
                          <ArrowUpRight size={16} />
                          <span>Form 6</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'analytics' && <RecoveryAnalytics lots={lots} />}

          {activeTab === 'map' && (
            <div className="rounded-3xl p-6 relative overflow-hidden" style={{
              background: 'rgba(10,18,40,0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.30)',
            }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} style={{ color: '#a78bfa' }} />
                <h2 className="text-sm font-extrabold text-white">Geotagged Lot Map</h2>
              </div>
              <div className="h-56 rounded-2xl flex items-center justify-center relative overflow-hidden" style={{
                background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(59,130,246,0.06))',
                border: '1px dashed rgba(255,255,255,0.12)',
              }}>
                <div className="text-center text-slate-500">
                  <MapPin size={36} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold">Map integration ready</p>
                  <p className="text-xs mt-1 text-slate-600">Leaflet / Mapbox GL JS</p>
                </div>
                {lots.filter(l => l.geo_lat).map((lot, i) => (
                  <div key={lot.lot_id}
                    className="absolute w-3 h-3 rounded-full animate-ping"
                    style={{
                      left: `${15 + (i * 18) % 70}%`,
                      top: `${20 + (i * 22) % 60}%`,
                      background: lot.status === 'VERIFIED' ? '#10b981' : '#3b82f6',
                      boxShadow: lot.status === 'VERIFIED'
                        ? '0 0 8px rgba(16,185,129,0.70)'
                        : '0 0 8px rgba(59,130,246,0.70)',
                    }} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {isVerifyOpen && selectedLot && (
        <VerificationTerminal lot={selectedLot} onVerified={handleVerified} onClose={() => setIsVerifyOpen(false)} />
      )}
      {receiptLot && (
        <DigitalReceiptModal lot={receiptLot} onClose={() => setReceiptLot(null)} />
      )}
    </div>
  );
}
