import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { ttsService } from '../services/tts';

export default function SpeakerButton({ text, lang = 'hi', size = 'md', className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!text) return;
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      ttsService.speak(text, lang);
      const duration = Math.max(1500, Math.min(6500, text.length * 80));
      setTimeout(() => setIsPlaying(false), duration);
    }
  };

  const sizeDim = { sm: 32, md: 40, lg: 52 }[size] ?? 40;
  const iconSz  = { sm: 14, md: 19, lg: 26 }[size] ?? 19;
  const pad     = { sm: 6,  md: 10, lg: 14 }[size] ?? 10;

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title="Audio सुनें"
      aria-label="Play audio"
      className={`relative inline-flex items-center justify-center rounded-full transition-all touch-press ${className}`}
      style={{
        width: sizeDim, height: sizeDim,
        padding: pad,
        background: isPlaying
          ? 'rgba(16,185,129,0.30)'
          : 'rgba(16,185,129,0.12)',
        border: isPlaying
          ? '1.5px solid rgba(16,185,129,0.70)'
          : '1.5px solid rgba(16,185,129,0.30)',
        boxShadow: isPlaying
          ? '0 0 16px rgba(16,185,129,0.40), inset 0 1px 0 rgba(255,255,255,0.08)'
          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        animation: isPlaying ? 'audio-pulse 1.8s infinite' : 'none',
      }}
    >
      <Volume2 size={iconSz} style={{ color: isPlaying ? '#34d399' : '#6ee7b7' }}
        className={isPlaying ? 'animate-pulse' : ''} />
      {isPlaying && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      )}
    </button>
  );
}
