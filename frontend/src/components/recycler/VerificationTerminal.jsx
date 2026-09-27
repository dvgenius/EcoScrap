import React, { useState, useEffect } from 'react';
import { Scale, ShieldAlert, CheckCircle2, QrCode, AlertTriangle, IndianRupee, KeyRound, ArrowRight } from 'lucide-react';
import { verifyHandover } from '../../services/api';
import confetti from 'canvas-confetti';

export default function VerificationTerminal({ activeLot, onHandoverSuccess, onSelectLotId }) {
  const [lotInput, setLotInput] = useState(activeLot?.lot_id || '');
  const [scaleWeight, setScaleWeight] = useState(activeLot ? activeLot.est_weight_kg : 0);
  const [otpCode, setOtpCode] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CASH'
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (activeLot) {
      setLotInput(activeLot.lot_id);
      setScaleWeight(activeLot.verified_weight_kg || activeLot.est_weight_kg || 0);
      setOtpCode('');
      setErrorMsg('');
    }
  }, [activeLot]);

  if (!activeLot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-400">
        <Scale size={40} className="mx-auto text-slate-600 mb-2" />
        <h3 className="text-base font-bold text-slate-300">No Lot Selected for Verification</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select an incoming lot from the live radar feed or enter a Lot ID.
        </p>
      </div>
    );
  }

  const estWeight = Number(activeLot.est_weight_kg || 0);
  const currentScale = Number(scaleWeight || 0);
  const baseRate = Number(activeLot.base_market_price_per_kg || 0);

  // Anomaly Calculation (>10% divergence)
  const weightDiff = currentScale - estWeight;
  const divergencePct = estWeight > 0 ? (Math.abs(weightDiff) / estWeight) * 100 : 0;
  const isAnomaly = divergencePct > 10.0;

  // Final adjusted payout
  const adjustedPay = Math.round(currentScale * baseRate);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMsg('Please enter the 4-digit verification code from the collector.');
      return;
    }
    if (currentScale <= 0) {
      setErrorMsg('Please enter a valid scale weight greater than 0.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await verifyHandover(activeLot.lot_id, {
        verified_weight_kg: currentScale,
        verification_otp: otpCode.trim(),
        payment_mode: paymentMode,
        recycler_id: 1
      });

      if (response.success) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        onHandoverSuccess(response.receipt, response.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm text-white">
              CPCB Certified Scale & Handover Terminal
            </h3>
            <p className="text-[11px] text-slate-400">
              Lot ID: <span className="font-mono text-emerald-400 font-bold">{activeLot.lot_id}</span>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40">
          Scale: CALIBRATED (ISO-17025)
        </span>
      </div>

      <form onSubmit={handleSubmitVerification} className="space-y-4">
        
        {/* Material & Estimated Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Declared Material
            </span>
            <span className="text-white font-extrabold text-sm block mt-0.5">
              {activeLot.category_name}
            </span>
            <span className="text-slate-400 text-[11px]">
              Rate: ₹{baseRate} / kg
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Collector Estimate
            </span>
            <span className="text-slate-300 font-mono font-extrabold text-sm block mt-0.5">
              {estWeight} kg
            </span>
            <span className="text-slate-400 text-[11px]">
              Quoted: ₹{activeLot.quoted_amount}
            </span>
          </div>
        </div>

        {/* Step 1: Re-weighing Terminal Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Scale size={14} className="text-blue-400" />
              <span>Digital Weighing Scale Reading (KG):</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Tolerance: ±0.05kg
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={scaleWeight}
              onChange={(e) => setScaleWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-black font-mono text-emerald-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-lg font-bold text-slate-400 px-2">KG</span>
          </div>
        </div>

        {/* Step 2: Anomaly Detection Banner (>10% variance) */}
        {isAnomaly && (
          <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3.5 space-y-1 text-xs animate-shake">
            <div className="flex items-center gap-2 text-amber-300 font-black">
              <AlertTriangle size={16} className="text-amber-400 animate-pulse" />
              <span>Weight Divergence Flagged ({divergencePct.toFixed(1)}%)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Scale reading differs by {Math.abs(weightDiff).toFixed(1)} kg from declared weight.
              Fair payout will be calibrated strictly according to the verified scale weight.
            </p>
          </div>
        )}

        {/* Adjusted Payout Summary */}
        <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Adjusted Scale Valuation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentScale} kg × ₹{baseRate}/kg
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ₹{adjustedPay.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Step 3: Payment Mode Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            Immediate Disbursement Mode:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all touch-press ${
                paymentMode === 'UPI'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <IndianRupee size={14} />
              <span>Instant Bank UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all touch-press ${
                paymentMode === 'CASH'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>Cash on Handover</span>
            </button>
          </div>
        </div>

        {/* Step 4: 4-Digit Collector Verification Code (OTP) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <KeyRound size={14} className="text-amber-400" />
            <span>Enter 4-Digit Handover Code (from Collector Passbook):</span>
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="e.g. 7394"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-3xl font-black font-mono tracking-widest text-amber-400 placeholder:text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/50 p-2.5 rounded-xl text-xs text-red-300 font-bold">
            {errorMsg}
          </div>
        )}

        {/* Step 5: Seal Handover & Issue Manifest */}
        <button
          type="submit"
          disabled={isVerifying || activeLot.status === 'HANDOVER_VERIFIED'}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all touch-press ${
            activeLot.status === 'HANDOVER_VERIFIED'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:brightness-110 text-white shadow-blue-600/30'
          }`}
        >
          {isVerifying ? (
            <span>Verifying & Sealing Transfer...</span>
          ) : activeLot.status === 'HANDOVER_VERIFIED' ? (
            <>
              <CheckCircle2 size={18} />
              <span>Lot Already Verified & Handover Completed</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Verify Handover & Generate CPCB Form-6 Manifest</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
