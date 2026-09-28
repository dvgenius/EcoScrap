import React from 'react';
import { IndianRupee, ArrowUpRight, Send, ShieldCheck } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function InstantValuationCard({ material, weight, onConfirmLot, isSubmitting, isOffline, lang }) {
  if (!material) return null;

  const rate = material.base_market_price_per_kg || 0;
  const total = Math.round(weight * rate);
  const middlemanRate = Math.round(rate * 0.58);
  const middlemanTotal = Math.round(weight * middlemanRate);
  const extra = total - middlemanTotal;

  const speechText = lang === 'mr'
    ? `एकूण किंमत ${total} रुपये. थेट भाव मिळून ${extra} रुपये जास्त!`
    : `कुल भाव ${total} रुपये। सीधे रीसायकलर से ${extra} रुपये का अतिरिक्त लाभ!`;

  return (
    <div className="rounded-3xl p-5 relative overflow-hidden" style={{
      background: 'rgba(5,46,22,0.35)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      border: '1.5px solid rgba(16,185,129,0.38)',
      boxShadow: '0 8px 32px rgba(16,185,129,0.10), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* Ambient emerald glow top-right */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.20) 0%, transparent 70%)' }} />
      {/* Top shimmer line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.60), transparent)' }} />

      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <IndianRupee size={15} style={{ color: '#34d399' }} />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            {lang === 'mr' ? 'थेट बँक / रोख' : 'सीधा बैंक / नकद'}
          </span>
        </div>
        <SpeakerButton text={speechText} lang={lang} size="sm" />
      </div>

      {/* Giant currency display */}
      <div className="py-3 rounded-2xl text-center mb-3" style={{
        background: 'rgba(0,0,0,0.40)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)',
      }}>
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-bold text-slate-300">₹</span>
          <span className="text-5xl font-black font-mono"
            style={{
              color: '#34d399',
              textShadow: '0 0 28px rgba(16,185,129,0.55)',
              letterSpacing: '-1px',
            }}>
            {total.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-semibold">
          {rate} ₹/kg × {weight} kg
        </p>
      </div>

      {/* Middleman comparison badge */}
      <div className="rounded-2xl p-3 mb-4 flex items-center justify-between" style={{
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.30)',
      }}>
        <div>
          <div className="flex items-center gap-1 text-[12px] font-black" style={{ color: '#6ee7b7' }}>
            <ArrowUpRight size={14} />
            <span>{lang === 'mr' ? '+७२% जास्त नफा!' : '+72% सीधा अधिक मुनाफा!'}</span>
          </div>
          <p className="text-[10px] text-slate-300 mt-0.5 devanagari-caption">
            {lang === 'mr'
              ? `दलाल दर: ₹${middlemanTotal} (तुम्हाला ₹${extra} जास्त)`
              : `बिचौलिया: ₹${middlemanTotal} (आपको ₹${extra} ज्यादा)`}
          </p>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-full devanagari-caption"
          style={{ background: 'rgba(16,185,129,0.20)', color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.40)' }}>
          CPCB Verified ✓
        </span>
      </div>

      {/* Submit CTA */}
      <button type="button" disabled={isSubmitting} onClick={onConfirmLot}
        className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 touch-press"
        style={isOffline ? {
          background: 'linear-gradient(135deg, rgba(180,83,9,0.80), rgba(146,64,14,0.80))',
          border: '1.5px solid rgba(245,158,11,0.55)',
          boxShadow: '0 6px 22px rgba(245,158,11,0.25)',
          color: '#fef3c7',
        } : {
          background: 'linear-gradient(135deg, #059669, #0891b2)',
          border: '1.5px solid rgba(16,185,129,0.50)',
          boxShadow: '0 6px 22px rgba(16,185,129,0.35)',
          color: '#fff',
        }}>
        {isSubmitting ? (
          <span className="devanagari-safe">{lang === 'mr' ? 'पाठवत आहे...' : 'भेजा जा रहा है...'}</span>
        ) : isOffline ? (
          <><ShieldCheck size={18} />
            <span className="devanagari-safe">{lang === 'mr' ? 'ऑफलाइन ड्राफ्ट जतन करा' : 'ऑफलाइन ड्राफ्ट सहेजें'}</span></>
        ) : (
          <><Send size={18} />
            <span className="devanagari-safe">{lang === 'mr' ? 'रिसायकलरकडे पाठवा' : 'रीसायकलर को भेजें'}</span></>
        )}
      </button>

      {isOffline && (
        <p className="text-[11px] text-center mt-2 devanagari-caption" style={{ color: '#fcd34d' }}>
          {lang === 'mr'
            ? '⚡ इंटरनेट आल्यावर आपोआप सिंक होईल.'
            : '⚡ इंटरनेट आने पर अपने आप सिंक होगा।'}
        </p>
      )}
    </div>
  );
}
