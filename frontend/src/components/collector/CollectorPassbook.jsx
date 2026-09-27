import React from 'react';
import { Wallet, CheckCircle2, Clock, KeyRound, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function CollectorPassbook({ ledgerData, pendingLots = [], offlineDrafts = [], lang }) {
  const settledTotal = ledgerData?.settled_total || 0;
  const pendingTotal = pendingLots.reduce((acc, curr) => acc + (curr.quoted_amount || 0), 0);
  const settledEntries = ledgerData?.settled_entries || [];

  const balanceSpeech = lang === 'mr'
    ? `तुमचे एकूण मिळालेले पैसे ${settledTotal} रुपये. प्रलंबित रक्कम ${pendingTotal} रुपये.`
    : `आपकी कुल प्राप्त कमाई ${settledTotal} रुपये है। लंबित भुगतान ${pendingTotal} रुपये है।`;

  const speakOtp = (otp, lotId) => {
    const text = lang === 'mr'
      ? `लॉट क्रमांक ${lotId} चा गुप्त कोड आहे: ${otp.split('').join(' ')}.`
      : `लॉट नंबर ${lotId} का गुप्त कोड है: ${otp.split('').join(' ')}. रीसायकलर को बताएं।`;
    ttsService.speak(text, lang);
  };

  return (
    <div className="space-y-4">
      
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Wallet size={22} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">
                {lang === 'mr' ? 'कबाड़ी खाता / पासबुक' : 'कबाड़ी खाता / पासबुक'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'mr' ? 'अधिकृत थेट कमाई' : 'सीपीसीबी प्रमाणित सीधी कमाई'}
              </p>
            </div>
          </div>
          <SpeakerButton text={balanceSpeech} lang={lang} size="md" />
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 size={12} />
              {lang === 'mr' ? 'मिळालेली रोकड (Cash/UPI)' : 'मिली हुई रकम (Cash/UPI)'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ₹{settledTotal.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
              <Clock size={12} />
              {lang === 'mr' ? 'प्रतिक्षेत (Pending)' : 'लंबित (हैंडओवर बाकी)'}
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              ₹{pendingTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Offline Drafts Section (if any) */}
      {offlineDrafts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            {lang === 'mr' ? 'ऑफलाइन सुरक्षित लॉट (सिंक बाकी)' : 'ऑफलाइन सुरक्षित लॉट (इंटरनेट पर सिंक बाकी)'}
          </h3>

          {offlineDrafts.map((draft, idx) => (
            <div
              key={draft.lot_id || idx}
              className="bg-slate-900 border-2 border-dashed border-amber-500/50 rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-amber-300">
                    {lang === 'mr' ? draft.vernacular_mr || draft.category_name : draft.vernacular_hi || draft.category_name}
                  </span>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    Offline Draft
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {draft.est_weight_kg} kg • ₹{draft.quoted_amount}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg">
                Ready to Sync
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pending Lots (Yellow Cards) with 4-Digit Handover OTP */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          {lang === 'mr' ? 'प्रलंबित हॅंडओव्हर (OTP रिसायकलरला द्या)' : 'हैंडओवर बाकी (रीसायकलर को OTP बताएं)'}
        </h3>

        {pendingLots.length === 0 ? (
          <p className="text-xs text-slate-500 italic px-1">
            {lang === 'mr' ? 'कोणताही प्रलंबित लॉट नाही' : 'कोई लंबित लॉट नहीं है'}
          </p>
        ) : (
          pendingLots.map((lot) => (
            <div
              key={lot.lot_id}
              className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 shadow-md space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {lot.lot_id}
                  </span>
                  <h4 className="text-sm font-extrabold text-white">
                    {lang === 'mr' ? lot.vernacular_mr || lot.category_name : lot.vernacular_hi || lot.category_name}
                  </h4>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">
                    {lot.est_weight_kg} kg • ₹{lot.quoted_amount}
                  </p>
                </div>

                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                  <Clock size={18} />
                </div>
              </div>

              {/* 4-Digit Secret Code Box */}
              <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-amber-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                      {lang === 'mr' ? 'हॅंडओव्हर कोड (OTP)' : 'हैंडओवर सीक्रेट कोड (OTP)'}
                    </span>
                    <span className="text-xl font-black text-amber-400 tracking-widest font-mono">
                      {lot.verification_otp || '----'}
                    </span>
                  </div>
                </div>

                {lot.verification_otp && (
                  <button
                    type="button"
                    onClick={() => speakOtp(lot.verification_otp, lot.lot_id)}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 touch-press"
                  >
                    <span>बोलें</span>
                    <SpeakerButton
                      text={`${lot.verification_otp.split('').join(' ')}`}
                      lang={lang}
                      size="sm"
                    />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settled Green Cards */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 px-1">
          {lang === 'mr' ? 'यशस्वी मिळालेले पैसे (Cash Received)' : 'सफलतापूर्वक नकद / यूपीआई प्राप्त (Cash Received)'}
        </h3>

        {settledEntries.length === 0 ? (
          <p className="text-xs text-slate-500 italic px-1">
            {lang === 'mr' ? 'अद्याप कोणतेही जुने हिशोब नाहीत' : 'अभी कोई पुराना लेनदेन नहीं है'}
          </p>
        ) : (
          settledEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-4 shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {lang === 'mr' ? entry.vernacular_mr || entry.category_name : entry.vernacular_hi || entry.category_name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {entry.verified_weight_kg || entry.est_weight_kg || 5} kg • {entry.payment_mode}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400/80">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-emerald-400 font-mono">
                  +₹{entry.amount}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/40">
                  {entry.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
