import React from 'react';
import { IndianRupee, ArrowUpRight, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function InstantValuationCard({ material, weight, onConfirmLot, isSubmitting, isOffline, lang }) {
  if (!material) return null;

  const ratePerKg = material.base_market_price_per_kg || 0;
  const totalValuation = Math.round(weight * ratePerKg);
  
  // Traditional informal middleman/kabadiwala cut is ~42% less
  const middlemanRate = Math.round(ratePerKg * 0.58);
  const middlemanTotal = Math.round(weight * middlemanRate);
  const extraEarnings = totalValuation - middlemanTotal;

  const speechText = lang === 'mr'
    ? `एकूण अंदाज किंमत ${totalValuation} रुपये. थेट अधिकृत रिसायकलर दर मिळून तुम्हाला ${extraEarnings} रुपये जास्त मिळतील.`
    : `कुल अनुमानित भाव ${totalValuation} रुपये. सीधे अधिकृत रीसायकलर से आपको ${extraEarnings} रुपये का सीधा मुनाफा होगा.`;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header and Voice Speaker */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <IndianRupee size={16} />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            {lang === 'mr' ? 'थेट बँक / रोख रक्कम' : 'सीधा बैंक / नकद भुगतान'}
          </span>
        </div>
        <SpeakerButton text={speechText} lang={lang} size="sm" />
      </div>

      {/* Huge Bold Valuation Display */}
      <div className="my-2 text-center py-2 bg-slate-950/60 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-center text-slate-400">
          <span className="text-2xl font-bold mr-1">₹</span>
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 tracking-tight font-mono">
            {totalValuation.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-400 mt-1">
          {ratePerKg} ₹/kg × {weight} kg
        </p>
      </div>

      {/* Middleman vs Formal Platform Comparison Badge */}
      <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 my-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
            <ArrowUpRight size={16} />
            <span>
              {lang === 'mr' ? '+७२% जास्त नफा!' : '+72% सीधा अधिक मुनाफा!'}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-0.5">
            {lang === 'mr'
              ? `दलालाचा दर: ₹${middlemanTotal} (तुम्हाला ₹${extraEarnings} जास्त)`
              : `बिचौलिया भाव: ₹${middlemanTotal} (आपको ₹${extraEarnings} ज्यादा)`}
          </p>
        </div>
        <div className="text-right">
          <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
            CPCB Verified
          </span>
        </div>
      </div>

      {/* Submit / Create Lot Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onConfirmLot}
        className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all touch-press ${
          isOffline
            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40'
        }`}
      >
        {isSubmitting ? (
          <span>{lang === 'mr' ? 'नोंद होत आहे...' : 'दर्ज हो रहा है...'}</span>
        ) : isOffline ? (
          <>
            <ShieldCheck size={20} />
            <span>{lang === 'mr' ? 'ऑफलाइन ड्राफ्ट जतन करा' : 'ऑफलाइन ड्राफ्ट सुरक्षित करें'}</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span>{lang === 'mr' ? 'रिसायकलरकडे लॉट पाठवा' : 'रीसायकलर को लॉट भेजें'}</span>
          </>
        )}
      </button>

      {isOffline && (
        <p className="text-[11px] text-amber-400/90 text-center mt-2 font-medium">
          {lang === 'mr'
            ? '⚠️ इंटरनेट नाही. हा लॉट फोनमध्ये सुरक्षित राहील व नंतर आपोआप सिंक होईल.'
            : '⚠️ इंटरनेट नहीं है। यह लॉट फोन में सुरक्षित रहेगा और ऑनलाइन आते ही सिंक होगा।'}
        </p>
      )}

    </div>
  );
}
