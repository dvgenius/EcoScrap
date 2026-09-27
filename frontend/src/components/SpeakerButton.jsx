import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
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
      // Automatically reset playing state after a duration proportional to text length
      const durationMs = Math.max(1500, Math.min(6000, text.length * 80));
      setTimeout(() => {
        setIsPlaying(false);
      }, durationMs);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 w-8 h-8 text-sm',
    md: 'p-2.5 w-11 h-11 text-base',
    lg: 'p-3.5 w-14 h-14 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 28
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title="सुनें (Audio Help)"
      aria-label="Audio read out"
      className={`relative inline-flex items-center justify-center rounded-full transition-all touch-press ${
        isPlaying
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110 animate-audio-pulse'
          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {isPlaying ? (
        <Volume2 size={iconSizes[size] || 22} className="animate-pulse" />
      ) : (
        <Volume2 size={iconSizes[size] || 22} />
      )}
      {isPlaying && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      )}
    </button>
  );
}
