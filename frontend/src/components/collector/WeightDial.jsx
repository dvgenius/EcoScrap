import React from 'react';
import { Plus, Minus, Package, Scale } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function WeightDial({ weight, onChange, lang }) {
  const handleIncrement = (amount) => {
    const newWeight = Math.min(250, Math.max(0.5, Number((weight + amount).toFixed(1))));
    onChange(newWeight);
    ttsService.playChime('weight');
  };

  const handleSlider = (e) => {
    const val = parseFloat(e.target.value);
    onChange(val);
  };

  const handleSpeakWeight = () => {
    const speech = lang === 'mr'
      ? `एकूण अंदाजे वजन ${weight} किलो.`
      : `कुल अनुमानित वजन ${weight} किलोग्राम.`;
    ttsService.speak(speech, lang);
  };

  // Determine sack count icons to display (up to 8 bags visually)
  const bagCount = Math.min(8, Math.max(1, Math.ceil(weight / 3)));

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              {lang === 'mr' ? 'अंदाजे वजन (वजन काटा)' : 'अनुमानित वज़न (किलो में)'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'mr' ? 'मोठ्या बटनांवर दाबून वजन वाढवा' : 'बड़े बटनों से वजन सेट करें'}
            </p>
          </div>
        </div>

        <SpeakerButton
          text={lang === 'mr' ? `वजन ${weight} किलो.` : `वज़न ${weight} किलोग्राम.`}
          lang={lang}
          size="sm"
        />
      </div>

      {/* Main Giant Weight Display with Audio Readout */}
      <div
        onClick={handleSpeakWeight}
        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all touch-press group"
      >
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
          {lang === 'mr' ? 'एकूण किलो' : 'कुल किलोग्राम'}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-emerald-400 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {weight}
          </span>
          <span className="text-xl font-extrabold text-slate-300">
            {lang === 'mr' ? 'किलो' : 'KG'}
          </span>
        </div>

        {/* Visual Bag / Sack Counter for Low-Literacy representation */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
          {Array.from({ length: bagCount }).map((_, i) => (
            <div
              key={i}
              className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-fade-in"
              title={`Sack ${i + 1}`}
            >
              <Package size={16} />
            </div>
          ))}
          {weight > 24 && (
            <span className="text-[11px] font-bold text-amber-400 ml-1">+{Math.floor(weight / 3)} बोरी</span>
          )}
        </div>
      </div>

      {/* Touch-Friendly Range Slider */}
      <div className="mt-4 px-1">
        <input
          type="range"
          min="0.5"
          max="100"
          step="0.5"
          value={weight}
          onChange={handleSlider}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1 px-1">
          <span>0.5 KG</span>
          <span>25 KG</span>
          <span>50 KG</span>
          <span>100 KG</span>
        </div>
      </div>

      {/* Large Big-Finger Increment & Decrement Buttons */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <button
          type="button"
          onClick={() => handleIncrement(-1)}
          className="py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-black rounded-2xl border border-slate-700 flex flex-col items-center justify-center touch-press"
        >
          <Minus size={18} className="text-red-400" />
          <span className="text-xs mt-0.5">-1 KG</span>
        </button>

        <button
          type="button"
          onClick={() => handleIncrement(1)}
          className="py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-black rounded-2xl border border-slate-700 flex flex-col items-center justify-center touch-press"
        >
          <Plus size={18} className="text-emerald-400" />
          <span className="text-xs mt-0.5">+1 KG</span>
        </button>

        <button
          type="button"
          onClick={() => handleIncrement(5)}
          className="py-3 bg-emerald-950/60 hover:bg-emerald-900/80 active:bg-emerald-800 text-emerald-300 font-black rounded-2xl border border-emerald-500/40 flex flex-col items-center justify-center touch-press"
        >
          <Plus size={18} className="text-emerald-400" />
          <span className="text-xs mt-0.5">+5 KG</span>
        </button>

        <button
          type="button"
          onClick={() => handleIncrement(10)}
          className="py-3 bg-amber-950/60 hover:bg-amber-900/80 active:bg-amber-800 text-amber-300 font-black rounded-2xl border border-amber-500/40 flex flex-col items-center justify-center touch-press"
        >
          <Plus size={18} className="text-amber-400" />
          <span className="text-xs mt-0.5">+10 KG</span>
        </button>
      </div>

    </div>
  );
}
