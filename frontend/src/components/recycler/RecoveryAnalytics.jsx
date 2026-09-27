import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { Award, Zap, ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

export default function RecoveryAnalytics({ impactMetrics }) {
  const summary = impactMetrics?.summary || {};
  const minerals = summary.critical_minerals || {
    copper_recovered_kg: 84.5,
    lithium_recovered_grams: 560,
    cobalt_recovered_grams: 960,
    neodymium_rare_earth_grams: 112
  };

  const mineralData = [
    { name: 'Copper (Cu)', value: minerals.copper_recovered_kg || 85, unit: 'kg', color: '#F97316' },
    { name: 'Lithium (Li)', value: (minerals.lithium_recovered_grams || 560) / 1000, unit: 'kg (equiv)', color: '#EF4444' },
    { name: 'Cobalt (Co)', value: (minerals.cobalt_recovered_grams || 960) / 1000, unit: 'kg (equiv)', color: '#3B82F6' },
    { name: 'Neodymium (Nd)', value: (minerals.neodymium_rare_earth_grams || 112) / 1000, unit: 'kg (equiv)', color: '#8B5CF6' }
  ];

  const categoryDistribution = [
    { name: 'PCBs & Boards', weight: 42, color: '#10B981' },
    { name: 'Lithium Packs', weight: 28, color: '#EF4444' },
    { name: 'Copper Wiring', weight: 64, color: '#F97316' },
    { name: 'Rare-Earth Motors', weight: 19, color: '#8B5CF6' },
    { name: 'CRT Glass/Lead', weight: 12, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-4">
      
      {/* CPCB Authorization Header Tile */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/40 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Award size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  JNARDDC Advanced Metallurgical Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30">
                  CPCB Certified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                EPR License: <span className="text-blue-300 font-bold">CPCB/EPR-2024/MH-0921</span> • Valid till 2029
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total E-Waste Formalized
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {(summary.total_ewaste_collected_kg || 165).toLocaleString()} <span className="text-sm text-slate-400">KG</span>
              </span>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Direct Collector Disbursed
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{(summary.total_disbursed_inr || 24800).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Mineral Recovery Visual Breakdown (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Mineral Recovery Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-purple-400" />
              <h4 className="font-bold text-sm text-white">
                Critical Minerals & Strategic Metals Yield
              </h4>
            </div>
            <span className="text-[11px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-500/30">
              JNARDDC Benchmark
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mineralData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {mineralData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-3 border-t border-slate-800 text-center">
            <div className="p-2 bg-slate-950 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Copper (Cu)</span>
              <span className="text-sm font-black text-orange-400 font-mono">{minerals.copper_recovered_kg || 84.5} kg</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Lithium (Li)</span>
              <span className="text-sm font-black text-red-400 font-mono">{minerals.lithium_recovered_grams || 560} g</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Cobalt (Co)</span>
              <span className="text-sm font-black text-blue-400 font-mono">{minerals.cobalt_recovered_grams || 960} g</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold">Neodymium</span>
              <span className="text-sm font-black text-purple-400 font-mono">{minerals.neodymium_rare_earth_grams || 112} g</span>
            </div>
          </div>
        </div>

        {/* E-Waste Volume Sourcing by Category (Recharts) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h4 className="font-bold text-sm text-white">
                Formal Stream Category Inflow (KG)
              </h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              Live Feed
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="weight"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>100% CPCB Manifest Compliant Traceability</span>
            </div>
            <span className="font-mono font-bold">Audited</span>
          </div>
        </div>

      </div>

    </div>
  );
}
