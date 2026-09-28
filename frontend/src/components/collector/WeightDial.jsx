import React from 'react';
import { Plus, Minus, Package, Scale } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function WeightDial({ weight, onChange, lang }) {
  const adjust = (delta) => {
    const next = Math.min(250, Math.max(0.5, Number((weight + delta).toFixed(1))));
    onChange(next);
    ttsService.playChime('weight');
  };

  const bagCount = Math.min(8, Math.max(1, Math.ceil(weight / 3)));

  const speakWeight = () => {
    ttsService.speak(
      lang === 'mr' ? `एकूण वजन ${weight} किलो.` : `कुल वज़न ${weight} किलोग्राम.`, lang);
  };

  return (
    <div className="rounded-3xl p-4 relative overflow-hidden" style={{
      background: 'rgba(20,30,50,0.72)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* Ambient weight orb */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <Scale size={18} style={{ color: '#fcd34d' }} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white devanagari-safe">
              {lang === 'mr' ? 'अंदाजे वजन (किलो)' : 'अनुमानित वज़न (किलो)'}
            </h3>
            <p className="text-[10px] text-slate-400 devanagari-caption">
              {lang === 'mr' ? 'मोठ्या बटणांनी वाढवा' : 'बड़े बटनों से सेट करें'}
            </p>
          </div>
        </div>
        <SpeakerButton
          text={lang === 'mr' ? `वजन ${weight} किलो.` : `वज़न ${weight} किलोग्राम.`}
          lang={lang} size="sm" />
      </div>

      {/* Giant weight readout — tappable to speak */}
      <button type="button" onClick={speakWeight}
        className="w-full rounded-2xl py-4 flex flex-col items-center touch-press mb-4 relative overflow-hidden"
        style={{
          background: 'rgba(6,10,20,0.80)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.30)',
        }}>
        {/* Inner top line shimmer */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.40), transparent)' }} />

        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">
          {lang === 'mr' ? 'एकूण किलो' : 'कुल KG'}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black font-mono" style={{ color: '#fcd34d', textShadow: '0 0 20px rgba(245,158,11,0.45)' }}>
            {weight}
          </span>
          <span className="text-xl font-extrabold text-slate-300">
            {lang === 'mr' ? 'किलो' : 'KG'}
          </span>
        </div>

        {/* Visual sack bag row */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
          {Array.from({ length: bagCount }).map((_, i) => (
            <div key={i} className="p-1 rounded-lg" style={{
              background: 'rgba(245,158,11,0.16)',
              border: '1px solid rgba(245,158,11,0.30)',
            }}>
              <Package size={15} style={{ color: '#fcd34d' }} />
            </div>
          ))}
          {weight > 24 && (
            <span className="text-[11px] font-bold ml-1 devanagari-caption" style={{ color: '#fcd34d' }}>
              {Math.floor(weight / 3)}+ बोरी
            </span>
          )}
        </div>
      </button>

      {/* Slider */}
      <div className="mb-4 px-0.5">
        <input type="range" min="0.5" max="100" step="0.5" value={weight}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full" style={{ accentColor: '#f59e0b' }} />
        <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1 px-0.5">
          <span>0.5</span><span>25 kg</span><span>50 kg</span><span>100 kg</span>
        </div>
      </div>

      {/* Big tap increment buttons — 4 solid accessible targets */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { delta: -1, label: '-1', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.30)', icon: Minus },
          { delta: +1, label: '+1', color: '#94a3b8', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', icon: Plus },
          { delta: +5, label: '+5', color: '#34d399', bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.35)', icon: Plus },
          { delta: +10,label: '+10',color: '#fcd34d', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.40)', icon: Plus },
        ].map(({ delta, label, color, bg, border, icon: Ic }) => (
          <button key={delta + label} type="button" onClick={() => adjust(delta)}
            className="py-3 rounded-2xl flex flex-col items-center justify-center font-black touch-press"
            style={{ background: bg, border: `1px solid ${border}`, color }}>
            <Ic size={16} />
            <span className="text-xs mt-0.5">{label} KG</span>
          </button>
        ))}
      </div>
    </div>
  );
}
