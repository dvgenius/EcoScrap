import React, { useEffect } from 'react';
import { ShieldAlert, AlertOctagon, Flame, Skull, CheckCircle } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function HazardAlertModal({ isOpen, onClose, material, lang }) {
  if (!isOpen || !material) return null;

  const warningText = lang === 'mr'
    ? (material.hazard_voice_prompt_mr || material.hazard_prompt_mr || 'सावधान! हा अतिधोकादायक कचरा आहे!')
    : (material.hazard_voice_prompt_hi || material.hazard_prompt_hi || 'सावधान! यह खतरनाक ई-कचरा है!');

  useEffect(() => {
    ttsService.playChime('hazard');
    const t = setTimeout(() => ttsService.speak(warningText, lang), 400);
    return () => clearTimeout(t);
  }, [material, lang]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: 'rgba(30,0,10,0.88)', backdropFilter: 'blur(16px)' }}>

      {/* Outer crimson glow halo */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(244,63,94,0.18) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm rounded-3xl overflow-hidden glass-crimson relative" style={{
        boxShadow: '0 0 60px rgba(244,63,94,0.28), 0 20px 50px rgba(0,0,0,0.60)',
        animation: 'float-card 3.5s ease-in-out infinite',
      }}>
        {/* Top shimmer line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.80), transparent)' }} />

        {/* Crimson shield banner */}
        <div className="relative p-7 flex flex-col items-center text-center"
          style={{ background: 'linear-gradient(180deg, rgba(220,38,38,0.25) 0%, transparent 100%)' }}>
          {/* Pulsing shield icon */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{
              background: 'rgba(244,63,94,0.18)',
              border: '2px solid rgba(244,63,94,0.55)',
              boxShadow: '0 0 40px rgba(244,63,94,0.35)',
              animation: 'hazard-pulse 1.2s infinite',
            }}>
            <ShieldAlert size={52} style={{ color: '#fca5a5', filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.8))' }} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2 text-[11px] font-black uppercase tracking-wider"
            style={{ background: 'rgba(244,63,94,0.20)', border: '1px solid rgba(244,63,94,0.45)', color: '#fca5a5' }}>
            <AlertOctagon size={13} className="animate-spin" style={{ animationDuration: '3s', color: '#fbbf24' }} />
            <span>{lang === 'mr' ? 'अति-धोकादायक ई-कचरा' : 'अत्यधिक खतरनाक ई-कचरा'}</span>
          </div>

          <h2 className="text-xl font-black text-white devanagari-safe" style={{ textShadow: '0 0 20px rgba(244,63,94,0.50)' }}>
            {lang === 'mr' ? 'धोका! खबरदारी बाळगा' : 'सावधान! जलाना सख्त मना है'}
          </h2>
        </div>

        {/* Warning body */}
        <div className="px-5 pb-5 space-y-4">
          {/* Voice warning card */}
          <div className="rounded-2xl p-3.5 flex items-start gap-3"
            style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.30)' }}>
            <SpeakerButton text={warningText} lang={lang} size="md" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed devanagari-safe" style={{ color: '#fecaca' }}>
              {warningText}
            </p>
          </div>

          {/* Visual safety pictograms */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Flame, colorBg: 'rgba(239,68,68,0.18)', colorBorder: 'rgba(239,68,68,0.40)', colorIcon: '#f87171',
                textHi: 'आग में न जलाएं', textMr: 'कधीही जाळू नका' },
              { icon: Skull, colorBg: 'rgba(245,158,11,0.18)', colorBorder: 'rgba(245,158,11,0.40)', colorIcon: '#fbbf24',
                textHi: 'जहरीला एसिड / गैस', textMr: 'विषारी ॲसिड / वायू' },
            ].map(({ icon: Icon, colorBg, colorBorder, colorIcon, textHi, textMr }, i) => (
              <div key={i} className="rounded-xl p-2.5 flex items-center gap-2"
                style={{ background: colorBg, border: `1px solid ${colorBorder}` }}>
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${colorBg}` }}>
                  <Icon size={18} style={{ color: colorIcon }} />
                </div>
                <span className="text-[11px] font-bold leading-tight devanagari-safe" style={{ color: '#f8fafc' }}>
                  {lang === 'mr' ? textMr : textHi}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-center devanagari-caption" style={{ color: '#94a3b8' }}>
            {lang === 'mr'
              ? 'हे थेट CPCB अधिकृत रिसायकलरला सुरक्षित पाठवले जाईल.'
              : 'इसे CPCB अधिकृत प्लांट पर सुरक्षित रीसायकल किया जाएगा।'}
          </p>

          {/* Big confirmation button */}
          <button type="button" onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 touch-press"
            style={{
              background: 'linear-gradient(135deg, rgba(220,38,38,0.60), rgba(185,28,28,0.80))',
              border: '1.5px solid rgba(244,63,94,0.55)',
              color: '#fff',
              boxShadow: '0 6px 24px rgba(244,63,94,0.30)',
            }}>
            <CheckCircle size={20} />
            <span className="devanagari-safe">
              {lang === 'mr' ? 'मी समजलो, सुरक्षित हाताळणार' : 'मैंने समझ लिया, सुरक्षित रखूंगा'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
