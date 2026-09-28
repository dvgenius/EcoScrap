import React from 'react';
import { Wallet, CheckCircle2, Clock, KeyRound, ArrowDownLeft } from 'lucide-react';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';

export default function CollectorPassbook({ ledgerData, pendingLots = [], offlineDrafts = [], lang }) {
  const settledTotal = ledgerData?.settled_total || 0;
  const pendingTotal = pendingLots.reduce((acc, l) => acc + (l.quoted_amount || 0), 0);
  const settled = ledgerData?.settled_entries || [];

  const balanceSpeech = lang === 'mr'
    ? `मिळालेले ${settledTotal} रुपये. प्रलंबित ${pendingTotal} रुपये.`
    : `प्राप्त ₹${settledTotal}। लंबित ₹${pendingTotal}।`;

  const speakOtp = (otp, lotId) => {
    ttsService.speak(
      lang === 'mr'
        ? `लॉट ${lotId} चा कोड: ${otp.split('').join(' ')}.`
        : `लॉट ${lotId} का कोड: ${otp.split('').join(' ')}.`, lang);
  };

  return (
    <div className="space-y-4">
      {/* Balance header card */}
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{
        background: 'rgba(5,40,25,0.50)',
        backdropFilter: 'blur(18px) saturate(170%)',
        WebkitBackdropFilter: 'blur(18px) saturate(170%)',
        border: '1.5px solid rgba(16,185,129,0.36)',
        boxShadow: '0 8px 32px rgba(16,185,129,0.10), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.55), transparent)' }} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)' }}>
              <Wallet size={20} style={{ color: '#34d399' }} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white devanagari-safe">
                {lang === 'mr' ? 'कबाड़ी खाता / पासबुक' : 'कबाड़ी खाता / Passbook'}
              </h2>
              <p className="text-[10px] text-slate-400 devanagari-caption">
                {lang === 'mr' ? 'थेट अधिकृत कमाई' : 'CPCB प्रमाणित सीधी कमाई'}
              </p>
            </div>
          </div>
          <SpeakerButton text={balanceSpeech} lang={lang} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)' }}>
            <span className="text-[10px] uppercase font-black flex items-center gap-1 mb-1" style={{ color: '#6ee7b7' }}>
              <CheckCircle2 size={11} /> {lang === 'mr' ? 'मिळालेले' : 'मिला'}
            </span>
            <div className="text-2xl font-black font-mono" style={{ color: '#34d399', textShadow: '0 0 16px rgba(16,185,129,0.50)' }}>
              ₹{settledTotal.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)' }}>
            <span className="text-[10px] uppercase font-black flex items-center gap-1 mb-1" style={{ color: '#fcd34d' }}>
              <Clock size={11} /> {lang === 'mr' ? 'प्रतीक्षित' : 'लंबित'}
            </span>
            <div className="text-2xl font-black font-mono" style={{ color: '#fbbf24', textShadow: '0 0 16px rgba(245,158,11,0.45)' }}>
              ₹{pendingTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Offline drafts */}
      {offlineDrafts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 px-0.5" style={{ color: '#fbbf24' }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            {lang === 'mr' ? 'ऑफलाइन ड्राफ्ट (सिंक बाकी)' : 'ऑफलाइन ड्राफ्ट (सिंक बाकी)'}
          </h3>
          {offlineDrafts.map((d, i) => (
            <div key={d.lot_id || i} className="rounded-2xl p-3.5 flex items-center justify-between" style={{
              background: 'rgba(41,24,0,0.45)',
              border: '1.5px dashed rgba(245,158,11,0.45)',
            }}>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-white devanagari-safe">
                    {lang === 'mr' ? d.vernacular_mr || d.category_name : d.vernacular_hi || d.category_name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 rounded-full" style={{ background: 'rgba(245,158,11,0.20)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.35)' }}>
                    Offline
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{d.est_weight_kg} kg • ₹{d.quoted_amount}</p>
              </div>
              <span className="text-[10px] font-black font-mono px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                Queued
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pending Lots — Yellow glass cards with OTP */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-black uppercase tracking-wider px-0.5 devanagari-caption" style={{ color: '#94a3b8' }}>
          {lang === 'mr' ? 'हॅंडओव्हर OTP (रिसायकलरला द्या)' : 'हैंडओवर OTP (रीसायकलर को बताएं)'}
        </h3>
        {pendingLots.length === 0 ? (
          <p className="text-xs text-slate-500 italic px-1 devanagari-caption">
            {lang === 'mr' ? 'प्रलंबित लॉट नाही' : 'कोई लंबित लॉट नहीं'}
          </p>
        ) : pendingLots.map((lot) => (
          <div key={lot.lot_id} className="rounded-2xl p-4 space-y-3" style={{
            background: 'rgba(41,24,0,0.45)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(245,158,11,0.35)',
            boxShadow: '0 4px 16px rgba(245,158,11,0.06)',
          }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{lot.lot_id}</span>
                <h4 className="text-sm font-extrabold text-white devanagari-safe">
                  {lang === 'mr' ? lot.vernacular_mr || lot.category_name : lot.vernacular_hi || lot.category_name}
                </h4>
                <p className="text-xs mt-0.5" style={{ color: '#fcd34d' }}>
                  {lot.est_weight_kg} kg • ₹{lot.quoted_amount}
                </p>
              </div>
              <Clock size={18} style={{ color: '#fbbf24' }} />
            </div>

            {/* OTP box */}
            <div className="rounded-xl p-2.5 flex items-center justify-between" style={{
              background: 'rgba(6,10,20,0.70)',
              border: '1px solid rgba(245,158,11,0.40)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.30)',
            }}>
              <div className="flex items-center gap-2">
                <KeyRound size={16} style={{ color: '#fbbf24' }} />
                <div>
                  <span className="text-[10px] uppercase font-black block" style={{ color: '#94a3b8' }}>
                    {lang === 'mr' ? 'गुप्त कोड (OTP)' : 'सीक्रेट कोड (OTP)'}
                  </span>
                  <span className="text-2xl font-black font-mono tracking-widest"
                    style={{ color: '#fcd34d', textShadow: '0 0 14px rgba(245,158,11,0.50)' }}>
                    {lot.verification_otp || '----'}
                  </span>
                </div>
              </div>
              {lot.verification_otp && (
                <SpeakerButton
                  text={`${lot.verification_otp.split('').join(' ')}`}
                  lang={lang} size="sm" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Settled — Green glass cards */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-black uppercase tracking-wider px-0.5 devanagari-caption" style={{ color: '#6ee7b7' }}>
          {lang === 'mr' ? 'मिळालेले पैसे ✓' : 'Cash / UPI प्राप्त ✓'}
        </h3>
        {settled.length === 0 ? (
          <p className="text-xs text-slate-500 italic px-1 devanagari-caption">
            {lang === 'mr' ? 'अद्याप कोणती नोंद नाही' : 'अभी कोई रिकॉर्ड नहीं'}
          </p>
        ) : settled.map((e) => (
          <div key={e.id} className="rounded-2xl p-4 flex items-center justify-between" style={{
            background: 'rgba(5,46,22,0.40)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(16,185,129,0.32)',
            boxShadow: '0 4px 16px rgba(16,185,129,0.06)',
          }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)' }}>
                <ArrowDownLeft size={18} style={{ color: '#34d399' }} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white devanagari-safe">
                  {lang === 'mr' ? e.vernacular_mr || e.category_name : e.vernacular_hi || e.category_name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {e.verified_weight_kg || e.est_weight_kg || 5} kg • {e.payment_mode}
                </p>
                <span className="text-[10px] font-mono" style={{ color: '#6ee7b7' }}>
                  {new Date(e.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black font-mono" style={{ color: '#34d399', textShadow: '0 0 12px rgba(16,185,129,0.40)' }}>
                +₹{e.amount}
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{
                background: 'rgba(16,185,129,0.18)',
                color: '#a7f3d0',
                border: '1px solid rgba(16,185,129,0.35)',
              }}>
                {e.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
