import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer, Download, Award, FileText, QrCode } from 'lucide-react';

export default function DigitalReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award size={18} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-white">
                CPCB Form-6 E-Waste Handover Manifest
              </h2>
              <p className="text-[11px] text-slate-400">
                Rule 14(2) E-Waste (Management) Rules, 2022
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Body (Printable) */}
        <div id="printable-receipt" className="p-6 overflow-y-auto space-y-4 bg-slate-900 text-slate-200">
          
          {/* Header Seal Banner */}
          <div className="border-b-2 border-emerald-500/30 pb-4 text-center space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black text-emerald-300">
              <ShieldCheck size={16} />
              <span>CENTRAL POLLUTION CONTROL BOARD (CPCB) VERIFIED</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider mt-2">
              Official Transfer Manifest / पावती
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Manifest No: <span className="text-emerald-400 font-bold">{receipt.receipt_id}</span>
            </p>
          </div>

          {/* Key Parties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Authorized Recycler (EPR Facility)
              </span>
              <p className="font-extrabold text-white text-sm">
                {receipt.facility_name}
              </p>
              <p className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5">
                EPR ID: {receipt.recycler_cpcb_id}
              </p>
              <p className="text-[10px] text-slate-400">JNARDDC Cluster, Nagpur</p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Informal Collector (कबाड़ी मित्र)
              </span>
              <p className="font-extrabold text-white text-sm">
                Collector ID: {receipt.collector_id}
              </p>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                UPI / Direct Cash Handover
              </p>
              <p className="text-[10px] text-slate-400">Status: Formally Integrated</p>
            </div>
          </div>

          {/* Material & Weight Verification Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Material Category:</span>
              <span className="font-extrabold text-white">{receipt.category_name}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Estimated Weight:</span>
              <span className="font-mono text-slate-300">{receipt.estimated_weight_kg} kg</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Verified Weighing Scale:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                {receipt.verified_weight_kg} kg
              </span>
            </div>

            {receipt.anomaly_detected && (
              <div className="bg-amber-950/40 border border-amber-500/40 p-2 rounded-xl text-[11px] text-amber-300 font-semibold">
                ⚠️ Weight Variance Adjusted: {receipt.weight_divergence_pct}%
              </div>
            )}

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Base Unit Rate:</span>
              <span className="font-mono text-slate-300">₹{receipt.base_rate_per_kg} / kg</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="font-extrabold text-white">Final Settled Pay:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                ₹{receipt.final_payout?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Blockchain & Timestamp Validation */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold">SHA-256 Ledger Hash:</span>
              <span className="font-mono text-emerald-400/90 break-all">
                {receipt.blockchain_hash}
              </span>
              <span className="text-slate-500 block mt-0.5">
                Timestamp: {new Date(receipt.handover_timestamp).toLocaleString()}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white text-slate-950 flex-shrink-0 ml-2">
              <QrCode size={36} />
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs touch-press"
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs touch-press"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
