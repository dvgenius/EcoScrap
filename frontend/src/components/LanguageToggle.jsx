import React from 'react';
import { Globe } from 'lucide-react';
import { ttsService } from '../services/tts';

export default function LanguageToggle({ currentLang, onToggle }) {
  const switchLang = (newLang) => {
    onToggle(newLang);
    if (newLang === 'hi') {
      ttsService.speak('भाषा हिंदी चुनी गई है', 'hi');
    } else {
      ttsService.speak('मराठी भाषा निवडली आहे', 'mr');
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full p-1 shadow-md backdrop-blur-md">
      <div className="px-2 py-1 text-slate-400 flex items-center gap-1 text-xs font-semibold">
        <Globe size={14} className="text-emerald-400" />
      </div>
      <button
        type="button"
        onClick={() => switchLang('hi')}
        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all touch-press ${
          currentLang === 'hi'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 ring-2 ring-emerald-400/50'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        हिंदी (HI)
      </button>
      <button
        type="button"
        onClick={() => switchLang('mr')}
        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all touch-press ${
          currentLang === 'mr'
            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 ring-2 ring-amber-400/50'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        मराठी (MR)
      </button>
    </div>
  );
}
