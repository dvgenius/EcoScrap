import React from 'react';
import { Globe } from 'lucide-react';
import { ttsService } from '../services/tts';

export default function LanguageToggle({ currentLang, onToggle }) {
  const switchLang = (newLang) => {
    onToggle(newLang);
    ttsService.playChime('click');
    if (newLang === 'hi') ttsService.speak('भाषा हिंदी चुनी गई', 'hi');
    else ttsService.speak('मराठी भाषा निवडली', 'mr');
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl" style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: 'blur(10px)',
    }}>
      <Globe size={13} className="text-emerald-400 ml-1.5 mr-0.5" />
      {[
        { code: 'hi', label: 'हिंदी', accent: { bg: 'rgba(16,185,129,0.22)', border: 'rgba(16,185,129,0.50)', color: '#6ee7b7', shadow: 'rgba(16,185,129,0.25)' } },
        { code: 'mr', label: 'मराठी', accent: { bg: 'rgba(245,158,11,0.22)', border: 'rgba(245,158,11,0.50)', color: '#fcd34d', shadow: 'rgba(245,158,11,0.25)' } },
      ].map(({ code, label, accent }) => (
        <button key={code} type="button" onClick={() => switchLang(code)}
          className="px-2.5 py-1 text-[11px] font-black rounded-lg transition-all touch-press devanagari-caption"
          style={currentLang === code ? {
            background: accent.bg,
            border: `1px solid ${accent.border}`,
            color: accent.color,
            boxShadow: `0 0 10px ${accent.shadow}`,
          } : {
            color: '#94a3b8',
            border: '1px solid transparent',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
