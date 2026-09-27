import React, { useEffect } from 'react';
import { ShieldAlert, AlertOctagon, Flame, Skull, CheckCircle, Volume2 } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function HazardAlertModal({ isOpen, onClose, material, lang }) {
  if (!isOpen || !material) return null;

  const isBattery = material.id === 2 || material.name?.toLowerCase().includes('battery');
  const isCrt = material.id === 3 || material.name?.toLowerCase().includes('crt');

  const warningText = lang === 'mr'
    ? (material.hazard_voice_prompt_mr || material.hazard_prompt_mr || 'सावधान! हा अतिधोकादायक ई-कचरा आहे!')
    : (material.hazard_voice_prompt_hi || material.hazard_prompt_hi || 'सावधान! यह खतरनाक ई-कचरा है!');

  useEffect(() => {
    // Play urgent sound and automatically speak warning prompt
    ttsService.playChime('hazard');
    const timer = setTimeout(() => {
      ttsService.speak(warningText, lang);
    }, 400);

    return () => clearTimeout(timer);
  }, [material, lang]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl shadow-red-600/50 flex flex-col text-center">
        
        {/* Animated Emergency Shield Banner */}
        <div className="bg-gradient-to-b from-red-600 to-red-800 p-6 flex flex-col items-center justify-center text-white relative">
          <div className="w-24 h-24 rounded-full bg-red-950/40 border-4 border-red-400/80 flex items-center justify-center mb-3 animate-hazard-pulse">
            <ShieldAlert size={56} className="text-white drop-shadow-md" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-red-950/80 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-red-200 border border-red-400">
            <AlertOctagon size={14} className="text-yellow-300 animate-spin" />
            <span>{lang === 'mr' ? 'अति-धोकादायक कचरा' : 'अत्यधिक खतरनाक ई-कचरा'}</span>
          </div>

          <h2 className="text-2xl font-black mt-2 tracking-tight">
            {lang === 'mr' ? 'धोका! खबरदारी बाळगा' : 'सावधान! जलने व विस्फोट का खतरा'}
          </h2>
        </div>

        {/* Hazard Chemical Warning Breakdown */}
        <div className="p-5 space-y-4">
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-3.5 text-left flex items-start gap-3">
            <SpeakerButton text={warningText} lang={lang} size="md" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-200 leading-relaxed">
                {warningText}
              </p>
            </div>
          </div>

          {/* Low-Literacy Visual Pictograms */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                <Flame size={18} />
              </div>
              <span className="text-[11px] font-bold text-slate-200 leading-tight">
                {lang === 'mr' ? 'कधीही जाळू नका (No Fire)' : 'आग में कभी न जलाएं (No Fire)'}
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Skull size={18} />
              </div>
              <span className="text-[11px] font-bold text-slate-200 leading-tight">
                {lang === 'mr' ? 'विषारी ॲसिड / वायू' : 'जहरीला तेजाब / गैस'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            {lang === 'mr'
              ? 'हे थेट सीपीसीबी मान्यताप्राप्त रिसायकलरला सुरक्षित सीलबंद डब्यात दिले जाईल.'
              : 'इसे सीधे सीपीसीबी अधिकृत प्लांट में रीसायकल किया जाएगा। कोई रिस्क न लें।'}
          </p>

          {/* Huge Safety Pledge Confirmation Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-black text-base rounded-2xl shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 touch-press"
          >
            <CheckCircle size={22} />
            <span>
              {lang === 'mr' ? 'मी समजलो, सुरक्षित हाताळणार' : 'मैंने समझ लिया, सुरक्षित रखूंगा'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
