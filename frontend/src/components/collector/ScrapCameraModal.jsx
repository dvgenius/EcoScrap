import React, { useState, useRef } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_PRESETS, classifyEWasteImage } from '../../../../ml-pipeline/classifier.js';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function ScrapCameraModal({ isOpen, onClose, onClassificationComplete, lang }) {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PRESETS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classifiedResult, setClassifiedResult] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleRunInference = async (preset) => {
    setIsAnalyzing(true);
    setClassifiedResult(null);
    ttsService.playChime('click');
    try {
      const result = await classifyEWasteImage(null, preset.category_id);
      setClassifiedResult(result);
      if (result.hazard_level === 'HIGH_HAZARD') {
        ttsService.playChime('hazard');
        ttsService.speak(lang === 'mr' ? result.hazard_prompt_mr : result.hazard_prompt_hi, lang);
      } else {
        ttsService.playChime('success');
        const name = lang === 'mr' ? result.vernacular_mr : result.vernacular_hi;
        ttsService.speak(`${name}. भाव ${result.base_market_price_per_kg} रुपये प्रति किलो.`, lang);
      }
    } catch (e) { console.error(e); }
    finally { setIsAnalyzing(false); }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomImage(null);
    handleRunInference(preset);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target.result;
        setCustomImage(url);
        const random = SAMPLE_PRESETS[Math.floor(Math.random() * SAMPLE_PRESETS.length)];
        setSelectedPreset({ ...random, previewUrl: url });
        handleRunInference(random);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (classifiedResult) {
      onClassificationComplete({ ...classifiedResult, previewUrl: customImage || selectedPreset.previewUrl });
      onClose();
    }
  };

  const activeImage = customImage || selectedPreset?.previewUrl;
  const isHazardResult = classifiedResult?.hazard_level === 'HIGH_HAZARD';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: 'rgba(8,16,32,0.92)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1.5px solid rgba(255,255,255,0.13)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)' }}>
              <Camera size={18} style={{ color: '#34d399' }} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white devanagari-safe">
                {lang === 'mr' ? 'एआय कचरा स्कॅनर' : 'एआई स्क्रैप कैमरा'}
              </h2>
              <p className="text-[11px] text-slate-400 devanagari-caption">On-Device Edge Wasm Inference</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 touch-press">
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black flex-shrink-0 h-60 overflow-hidden">
          <img src={activeImage} alt="Scrap preview" className="w-full h-full object-cover opacity-90" />

          {/* Reticle corners */}
          <div className="absolute inset-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
          </div>

          {/* Scan sweep */}
          {isAnalyzing && (
            <div className="absolute inset-x-5 top-5 h-0.5 animate-scan-line"
              style={{ background: 'linear-gradient(90deg, transparent, #34d399, transparent)', boxShadow: '0 0 12px #34d399' }} />
          )}

          {/* Bounding box */}
          {classifiedResult && !isAnalyzing && (
            <div className="absolute inset-10 pointer-events-none rounded-lg flex items-start p-1.5"
              style={{
                border: `2px solid ${isHazardResult ? '#f43f5e' : '#10b981'}`,
                background: isHazardResult ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
                boxShadow: isHazardResult ? '0 0 20px rgba(244,63,94,0.20)' : '0 0 20px rgba(16,185,129,0.18)',
              }}>
              <span className="text-[11px] font-black px-2 py-0.5 rounded"
                style={{ background: isHazardResult ? '#f43f5e' : '#10b981', color: '#fff' }}>
                {(classifiedResult.confidence * 100).toFixed(0)}% MATCH
              </span>
            </div>
          )}

          {/* Engine badge */}
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}>
            ⚡ Edge TensorFlow / Wasm
          </div>
        </div>

        {/* Preset selector */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles size={11} style={{ color: '#fbbf24' }} />
              {lang === 'mr' ? 'नमुना निवडा किंवा फोटो अपलोड करा' : 'नमूना चुनें या फोटो अपलोड करें'}
            </span>
            <button onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold flex items-center gap-1 touch-press" style={{ color: '#6ee7b7' }}>
              <ImageIcon size={12} /> Upload
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SAMPLE_PRESETS.map((p) => {
              const active = selectedPreset?.category_id === p.category_id && !customImage;
              const hazard = p.category_id === 2 || p.category_id === 3;
              return (
                <button key={p.category_id} onClick={() => handleSelectPreset(p)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all touch-press"
                  style={{
                    background: active ? 'rgba(16,185,129,0.20)' : 'rgba(255,255,255,0.05)',
                    border: active ? '1px solid rgba(16,185,129,0.55)' : '1px solid rgba(255,255,255,0.08)',
                    color: active ? '#a7f3d0' : '#94a3b8',
                  }}>
                  <img src={p.previewUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />
                  <span className="truncate max-w-[90px]">{p.name}</span>
                  {hazard && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center py-5 gap-2" style={{ color: '#34d399' }}>
              <RefreshCw size={26} className="animate-spin" />
              <span className="text-sm font-bold devanagari-safe">
                {lang === 'mr' ? 'एआय तपासत आहे...' : 'एआई जांच कर रहा है...'}
              </span>
            </div>
          ) : classifiedResult ? (
            <div className="space-y-2.5">
              <div className="rounded-2xl p-3.5 flex items-center justify-between"
                style={isHazardResult ? {
                  background: 'rgba(44,5,15,0.65)',
                  border: '1.5px solid rgba(244,63,94,0.50)',
                  boxShadow: '0 0 20px rgba(244,63,94,0.12)',
                } : {
                  background: 'rgba(5,46,22,0.55)',
                  border: '1.5px solid rgba(16,185,129,0.50)',
                  boxShadow: '0 0 20px rgba(16,185,129,0.10)',
                }}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl" style={{
                    background: isHazardResult ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)',
                    border: isHazardResult ? '1px solid rgba(244,63,94,0.50)' : '1px solid rgba(16,185,129,0.45)',
                    animation: isHazardResult ? 'hazard-pulse 1.2s infinite' : 'none',
                  }}>
                    {isHazardResult
                      ? <AlertTriangle size={18} style={{ color: '#fca5a5' }} />
                      : <CheckCircle2 size={18} style={{ color: '#6ee7b7' }} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white devanagari-safe">
                      {lang === 'mr' ? classifiedResult.vernacular_mr : classifiedResult.vernacular_hi}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 devanagari-caption">
                      <span className="font-black text-base" style={{ color: isHazardResult ? '#fca5a5' : '#34d399' }}>
                        ₹{classifiedResult.base_market_price_per_kg}
                      </span>
                      /kg &nbsp;
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({(classifiedResult.confidence * 100).toFixed(0)}% conf.)
                      </span>
                    </p>
                  </div>
                </div>
                <SpeakerButton
                  text={isHazardResult
                    ? (lang === 'mr' ? classifiedResult.hazard_prompt_mr : classifiedResult.hazard_prompt_hi)
                    : `${lang === 'mr' ? classifiedResult.vernacular_mr : classifiedResult.vernacular_hi}. भाव ${classifiedResult.base_market_price_per_kg} रुपये.`}
                  lang={lang} size="md" />
              </div>

              <button type="button" onClick={handleConfirm}
                className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 touch-press"
                style={{
                  background: 'linear-gradient(135deg, #059669, #0891b2)',
                  boxShadow: '0 6px 24px rgba(16,185,129,0.35)',
                  color: '#fff',
                }}>
                <CheckCircle2 size={18} />
                <span className="devanagari-safe">
                  {lang === 'mr' ? 'हेच! वजन टाका →' : 'यही है! वजन दर्ज करें →'}
                </span>
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => handleRunInference(selectedPreset)}
              className="w-full py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 mx-auto touch-press"
              style={{ background: 'rgba(16,185,129,0.20)', border: '1px solid rgba(16,185,129,0.45)', color: '#6ee7b7' }}>
              <Camera size={16} />
              <span className="devanagari-safe">{lang === 'mr' ? 'स्कॅन करा' : 'स्कैन करें'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
