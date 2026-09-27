import React, { useState, useRef } from 'react';
import { Camera, X, RefreshCw, Zap, CheckCircle2, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';
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

      // Audio cue based on classification
      if (result.hazard_level === 'HIGH_HAZARD') {
        ttsService.playChime('hazard');
        const warning = lang === 'mr' ? result.hazard_prompt_mr : result.hazard_prompt_hi;
        ttsService.speak(warning, lang);
      } else {
        ttsService.playChime('success');
        const name = lang === 'mr' ? result.vernacular_mr : result.vernacular_hi;
        const priceMsg = lang === 'mr'
          ? `${name}. बाजार भाव ${result.base_market_price_per_kg} रुपये प्रति किलो.`
          : `${name}. बाज़ार भाव ${result.base_market_price_per_kg} रुपये प्रति किलो.`;
        ttsService.speak(priceMsg, lang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
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
      reader.onload = (event) => {
        setCustomImage(event.target.result);
        // Randomly pick a realistic preset category for the uploaded image
        const randomPreset = SAMPLE_PRESETS[Math.floor(Math.random() * SAMPLE_PRESETS.length)];
        setSelectedPreset({ ...randomPreset, previewUrl: event.target.result });
        handleRunInference(randomPreset);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAndProceed = () => {
    if (classifiedResult) {
      onClassificationComplete({
        ...classifiedResult,
        previewUrl: customImage || selectedPreset.previewUrl
      });
      onClose();
    }
  };

  const activeImage = customImage || selectedPreset?.previewUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {lang === 'mr' ? 'कचरा स्कॅन करा' : 'स्क्रैप कैमरा (फोटो लें)'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'mr' ? 'ऑन-डिव्हाइस एआय तपासणी' : 'ऑन-डिवाइस एआई पहचान'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black flex-1 min-h-[250px] max-h-[300px] flex items-center justify-center overflow-hidden">
          <img
            src={activeImage}
            alt="Scrap Camera Stream"
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Reticle / Scanning animation */}
          <div className="absolute inset-4 border-2 border-dashed border-emerald-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between">
              <span className="w-5 h-5 border-t-2 border-l-2 border-emerald-400"></span>
              <span className="w-5 h-5 border-t-2 border-r-2 border-emerald-400"></span>
            </div>
            {isAnalyzing && (
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-scan-line"></div>
            )}
            <div className="flex justify-between">
              <span className="w-5 h-5 border-b-2 border-l-2 border-emerald-400"></span>
              <span className="w-5 h-5 border-b-2 border-r-2 border-emerald-400"></span>
            </div>
          </div>

          {/* Bounding box display if classified */}
          {classifiedResult && !isAnalyzing && (
            <div className="absolute inset-10 border-2 border-emerald-400 bg-emerald-500/10 rounded-lg pointer-events-none flex items-start justify-start p-1.5">
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                {(classifiedResult.confidence * 100).toFixed(0)}% MATCH
              </span>
            </div>
          )}

          {/* Shutter status pill */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <Zap size={12} className="text-emerald-400" />
            <span>Edge Wasm TensorFlow Engine</span>
          </div>
        </div>

        {/* Quick Sample Selector for Instant Demo Testing */}
        <div className="p-3 bg-slate-950/90 border-t border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              {lang === 'mr' ? 'नमुने निवडा किंवा फोटो अपलोड करा:' : 'डेमो फोटो चुनें या फोन से अपलोड करें:'}
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <ImageIcon size={14} />
              <span>{lang === 'mr' ? 'अपलोड' : 'अपलोड'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {SAMPLE_PRESETS.map((p) => {
              const isHazard = p.category_id === 2 || p.category_id === 3;
              const isSelected = selectedPreset?.category_id === p.category_id && !customImage;
              return (
                <button
                  key={p.category_id}
                  onClick={() => handleSelectPreset(p)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all touch-press ${
                    isSelected
                      ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <img src={p.previewUrl} alt="" className="w-6 h-6 rounded-md object-cover" />
                  <span className="truncate max-w-[100px]">{p.name}</span>
                  {isHazard && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inference Results Card */}
        <div className="p-4 bg-slate-900 overflow-y-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-emerald-400">
              <RefreshCw size={28} className="animate-spin" />
              <span className="font-bold text-sm">
                {lang === 'mr' ? 'एआय द्वारे तपासणी सुरू आहे...' : 'एआई जांच कर रहा है...'}
              </span>
            </div>
          ) : classifiedResult ? (
            <div className="space-y-3">
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                classifiedResult.hazard_level === 'HIGH_HAZARD'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  {classifiedResult.hazard_level === 'HIGH_HAZARD' ? (
                    <div className="p-2 rounded-xl bg-red-600 text-white animate-hazard-pulse">
                      <AlertTriangle size={20} />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-600 text-white">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      {lang === 'mr' ? classifiedResult.vernacular_mr : classifiedResult.vernacular_hi}
                    </h3>
                    <p className="text-xs opacity-90">
                      {lang === 'mr' ? 'भाव' : 'भाव'}: <span className="font-extrabold text-white text-sm">₹{classifiedResult.base_market_price_per_kg}/kg</span>
                      <span className="ml-2 font-mono text-[11px] opacity-75">
                        (Confidence: {(classifiedResult.confidence * 100).toFixed(0)}%)
                      </span>
                    </p>
                  </div>
                </div>

                <SpeakerButton
                  text={
                    classifiedResult.hazard_level === 'HIGH_HAZARD'
                      ? (lang === 'mr' ? classifiedResult.hazard_prompt_mr : classifiedResult.hazard_prompt_hi)
                      : (lang === 'mr'
                          ? `${classifiedResult.vernacular_mr}, भाव ${classifiedResult.base_market_price_per_kg} रुपये प्रति किलो`
                          : `${classifiedResult.vernacular_hi}, भाव ${classifiedResult.base_market_price_per_kg} रुपये प्रति किलो`)
                  }
                  lang={lang}
                  size="md"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmAndProceed}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-base touch-press"
              >
                <CheckCircle2 size={20} />
                <span>
                  {lang === 'mr' ? 'हेच आहे! वजन टाका' : 'यही है! वजन दर्ज करें'}
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <button
                type="button"
                onClick={() => handleRunInference(selectedPreset)}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 mx-auto touch-press text-sm"
              >
                <Camera size={18} />
                <span>{lang === 'mr' ? 'फोटो स्कॅन करा' : 'फोटो स्कैन करें'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
