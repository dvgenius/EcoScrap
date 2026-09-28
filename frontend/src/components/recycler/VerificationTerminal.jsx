import React, { useState } from 'react';
import { X, Scale, KeyRound, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { verifyLot } from '../../services/api';
import { ttsService } from '../../services/tts';

export default function VerificationTerminal({ lot, onVerified, onClose }) {
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifiedWeight, setVerifiedWeight] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (enteredOtp.length !== 4 || !verifiedWeight || parseFloat(verifiedWeight) <= 0) {
      setError('कृपया 4-अंकी OTP और वैध वजन दर्ज करें।');
      return;
    }
    setIsVerifying(true); setError('');
    try {
      const res = await verifyLot(lot.lot_id, {
        otp: enteredOtp, weight: parseFloat(verifiedWeight), recycler_id: 'REC-MH-0045'
      });
      if (res.success) {
        ttsService.playChime('success');
        onVerified({ lot_id: lot.lot_id, weight: parseFloat(verifiedWeight) });
      } else {
        setError(res.message || 'Verification failed — OTP mismatch.');
        ttsService.playChime('error');
      }
    } catch (e) { setError('Server error: ' + e.message); }
    finally { setIsVerifying(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,10,0.88)', backdropFilter: 'blur(20px)' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59,130,246,0.14) 0%, transparent 70%)' }} />

      {/* Crystal card */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden relative" style={{
        background: 'rgba(6,14,32,0.94)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1.5px solid rgba(255,255,255,0.14)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
        animation: 'float-card 3.5s ease-in-out infinite',
      }}>
        {/* Top shimmer accent */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.80), rgba(16,185,129,0.60), transparent)' }} />

        {/* Header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl" style={{
                background: 'rgba(59,130,246,0.18)',
                border: '1px solid rgba(59,130,246,0.40)',
                boxShadow: '0 0 14px rgba(59,130,246,0.20)',
              }}>
                <ShieldCheck size={22} style={{ color: '#93c5fd' }} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Lot Verification</h2>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{lot.lot_id}</div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/6 text-slate-400 touch-press">
              <X size={18} />
            </button>
          </div>

          {/* Lot info pill row */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: lot.vernacular_hi || lot.category_name, color: '#93c5fd', bg: 'rgba(59,130,246,0.12)' },
              { label: `${lot.est_weight_kg} kg (est.)`, color: '#fcd34d', bg: 'rgba(245,158,11,0.12)' },
              { label: `₹${lot.quoted_amount}`, color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)' },
            ].map(({ label, color, bg }) => (
              <span key={label} className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: bg, color, border: `1px solid ${color}44` }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Scale weight re-entry */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              <Scale size={12} />
              <span>Scale Weight (kg) — Physical Re-check</span>
            </label>
            <input type="number" placeholder="e.g. 14.2" min="0.1" step="0.1"
              value={verifiedWeight} onChange={e => setVerifiedWeight(e.target.value)}
              className="glass-input w-full px-4 py-3.5 rounded-2xl text-xl font-black font-mono"
              style={{ letterSpacing: '2px' }}
            />
          </div>

          {/* 4-digit OTP input */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              <KeyRound size={12} />
              <span>Collector OTP — 4-Digit Secret Code</span>
            </label>
            <input type="text" inputMode="numeric" maxLength={4} placeholder="••••"
              value={enteredOtp} onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="glass-input glass-input-amber w-full px-4 py-3.5 rounded-2xl text-3xl font-black font-mono text-center"
              style={{ letterSpacing: '12px' }}
            />
          </div>

          {/* OTP progress dots */}
          <div className="flex justify-center gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-3 h-3 rounded-full transition-all" style={{
                background: i < enteredOtp.length ? '#f59e0b' : 'rgba(255,255,255,0.10)',
                boxShadow: i < enteredOtp.length ? '0 0 8px rgba(245,158,11,0.55)' : 'none',
              }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)', color: '#fca5a5' }}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Verify CTA */}
          <button type="button" disabled={isVerifying || enteredOtp.length !== 4 || !verifiedWeight}
            onClick={handleVerify}
            className="w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 touch-press"
            style={enteredOtp.length === 4 && verifiedWeight ? {
              background: 'linear-gradient(135deg, #1d4ed8, #059669)',
              boxShadow: '0 8px 28px rgba(29,78,216,0.35)',
              color: '#fff',
            } : {
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#475569',
            }}>
            {isVerifying
              ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /><span>Verifying...</span></>
              : <><CheckCircle2 size={18} /><span>Verify & Lock Handover</span></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
