import React, { useState } from 'react';
import { Scale, TrendingUp, ShieldCheck, Flame, Skull, Sparkles, IndianRupee, ArrowUpRight, Cpu, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function JuryImpactCalculator() {
  const [volumeKg, setVolumeKg] = useState(100); // Interactive scale slider in KG

  // Baseline market rate model (₹ per KG average across mixed e-waste):
  // Formal CPCB Platform rate: ~₹ 210/kg average weighted
  // Informal middleman rate: ~₹ 120/kg (57% of actual value)
  const formalRatePerKg = 210;
  const middlemanRatePerKg = 120;

  const formalTotal = volumeKg * formalRatePerKg;
  const middlemanTotal = volumeKg * middlemanRatePerKg;
  const directGainInr = formalTotal - middlemanTotal;
  const percentageGain = ((directGainInr / middlemanTotal) * 100).toFixed(1);

  // Critical mineral recovery calculation per volume based on JNARDDC data:
  // 100 kg mixed e-waste yields approximately:
  // - 18 kg pure copper
  // - 750 grams lithium
  // - 1,200 grams cobalt
  // - 140 grams rare-earth neodymium
  // - 2.8 grams gold & palladium
  const copperKg = ((volumeKg * 0.18)).toFixed(1);
  const lithiumGrams = Math.round(volumeKg * 7.5);
  const cobaltGrams = Math.round(volumeKg * 12);
  const neodymiumGrams = Math.round(volumeKg * 1.4);
  const preciousMetalsGrams = ((volumeKg * 0.028)).toFixed(1);

  // Toxic elements prevented from informal burning:
  const leadPreventedKg = ((volumeKg * 0.08)).toFixed(1); // 8% lead in older boards/CRTs
  const co2AvoidedKg = Math.round(volumeKg * 2.8);

  const comparisonChartData = [
    { name: 'Informal Middleman Rate', payout: middlemanTotal, fill: '#64748B' },
    { name: 'Formal CPCB Platform', payout: formalTotal, fill: '#10B981' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-purple-400" />
              <span>SIH Problem Statement ID 26229 — Jury Evaluation Module</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Unit Economics & Strategic Mineral Sovereignty
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Evaluating the structural shift from unregulated backyard acid smelting to the formal CPCB / JNARDDC closed-loop circular supply chain.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Collector Net Income Surge
            </span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 font-mono">
              +{percentageGain}%
            </span>
            <span className="text-[11px] text-emerald-400 block font-bold mt-0.5">
              Direct Bank / UPI Settlement
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Scaling Volume Slider */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Scale size={18} className="text-purple-400" />
              <span>Simulate E-Waste Volume Sourced from Informal Collectors</span>
            </h3>
            <p className="text-xs text-slate-400">
              Drag the slider to test unit-economics across single wards, municipal wards, or city clusters.
            </p>
          </div>

          <div className="bg-slate-950 border border-purple-500/40 px-4 py-2 rounded-2xl flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-purple-400 font-mono">{volumeKg.toLocaleString()}</span>
            <span className="text-sm font-bold text-slate-400">KG</span>
          </div>
        </div>

        <input
          type="range"
          min="10"
          max="5000"
          step="10"
          value={volumeKg}
          onChange={(e) => setVolumeKg(Number(e.target.value))}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />

        <div className="flex justify-between text-xs text-slate-500 font-bold px-1">
          <span>10 KG (Single Collector Day)</span>
          <span>500 KG (Weekly Hub)</span>
          <span>2,500 KG (Zonal Depot)</span>
          <span>5,000 KG (Nagpur Cluster)</span>
        </div>
      </div>

      {/* 2-Column Comparison: Unit Economics vs Environmental Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Financial Unit Economics Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <IndianRupee size={18} className="text-emerald-400" />
              <span>Direct Informal Income Transformation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Middlemen siphon off value through opacity, rigged scales, and delayed informal credit.
            </p>
          </div>

          {/* Bar Chart Comparison */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Collector Payout']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="payout" radius={[0, 8, 8, 0]}>
                  {comparisonChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics comparison cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Local Middleman Net
              </span>
              <span className="text-xl font-black text-slate-400 font-mono mt-0.5 block">
                ₹{middlemanTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-red-400 font-semibold">
                -43% Value Loss to Collector
              </span>
            </div>

            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/40">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                CPCB Platform Net
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                ₹{formalTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold">
                +₹{directGainInr.toLocaleString('en-IN')} Extra Income!
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Critical Minerals for Ministry of Mines & JNARDDC */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1">
              <Cpu size={18} className="text-purple-400" />
              <span>National Strategic Mineral Recovery (JNARDDC)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Critical minerals secured for India's clean energy transition instead of lost to toxic ash.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-orange-500/30">
              <span className="text-[11px] font-bold text-orange-400 block">Refined Copper (Cu)</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {copperKg} <span className="text-xs text-slate-400">KG</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Replaces virgin copper mining</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/30">
              <span className="text-[11px] font-bold text-red-400 block">Lithium (Li)</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {lithiumGrams} <span className="text-xs text-slate-400">Grams</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Battery-grade precursor yield</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30">
              <span className="text-[11px] font-bold text-blue-400 block">Cobalt (Co)</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {cobaltGrams} <span className="text-xs text-slate-400">Grams</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">High-grade cathode raw material</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30">
              <span className="text-[11px] font-bold text-purple-400 block">Neodymium (Nd)</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {neodymiumGrams} <span className="text-xs text-slate-400">Grams</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Rare-earth motor magnets</p>
            </div>
          </div>

          {/* Environmental Hazards Prevented */}
          <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-red-300">
              <Skull size={18} className="text-red-400" />
              <span>Toxic Lead (Pb) Leaching Prevented:</span>
            </div>
            <span className="text-base font-black text-white font-mono">{leadPreventedKg} KG</span>
          </div>

          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <Flame size={18} className="text-emerald-400" />
              <span>CO2 Eq. Burning Emissions Prevented:</span>
            </div>
            <span className="text-base font-black text-emerald-400 font-mono">{co2AvoidedKg} KG</span>
          </div>
        </div>

      </div>

    </div>
  );
}
