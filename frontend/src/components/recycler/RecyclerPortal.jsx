import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Radio, Filter, AlertTriangle, CheckCircle2, Clock, Search, RefreshCw, ChevronRight, Eye } from 'lucide-react';
import VerificationTerminal from './VerificationTerminal';
import DigitalReceiptModal from './DigitalReceiptModal';
import RecoveryAnalytics from './RecoveryAnalytics';
import { fetchLots, fetchImpactMetrics } from '../../services/api';

export default function RecyclerPortal({ onLotVerified, newLotAlert }) {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllLots();
    loadImpact();
  }, []);

  // Update whenever an incoming lot is broadcasted
  useEffect(() => {
    if (newLotAlert) {
      loadAllLots();
      loadImpact();
    }
  }, [newLotAlert]);

  const loadAllLots = async () => {
    setIsLoading(true);
    try {
      const res = await fetchLots();
      if (res.success && res.data) {
        setLots(res.data);
        if (!selectedLot && res.data.length > 0) {
          setSelectedLot(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Error loading lots', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadImpact = async () => {
    try {
      const res = await fetchImpactMetrics();
      if (res.success) {
        setImpactMetrics(res);
      }
    } catch (e) {
      console.error('Error loading impact metrics', e);
    }
  };

  const handleHandoverSuccess = (receipt, updatedLot) => {
    setReceiptModalData(receipt);
    setIsReceiptOpen(true);
    setSelectedLot(updatedLot);
    loadAllLots();
    loadImpact();
    if (onLotVerified) onLotVerified(updatedLot);
  };

  // Filter lots
  const filteredLots = lots.filter((l) => {
    if (filterCategory === 'PENDING') return l.status !== 'HANDOVER_VERIFIED';
    if (filterCategory === 'VERIFIED') return l.status === 'HANDOVER_VERIFIED';
    if (filterCategory === 'HAZARD') return l.hazard_level === 'HIGH_HAZARD';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      
      {/* Top Recovery Analytics & CPCB Badge */}
      <RecoveryAnalytics impactMetrics={impactMetrics} />

      {/* Main Grid: Left is Radar & Lot Feed, Right is Verification Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Radar Feed */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Feed Header & Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Real-Time Incoming E-Waste Radar
                </h3>
                <p className="text-[11px] text-slate-400">
                  Nagpur JNARDDC Radius (45 km) • {lots.length} Total Lots
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Filter buttons */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterCategory === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('PENDING')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterCategory === 'PENDING' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('HAZARD')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterCategory === 'HAZARD' ? 'bg-red-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Hazardous
                </button>
              </div>

              <button
                type="button"
                onClick={loadAllLots}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Refresh feed"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Interactive Radar Simulation & Lot List */}
          <div className="space-y-3">
            {filteredLots.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                No scrap lots match the current filter.
              </div>
            ) : (
              filteredLots.map((lot, idx) => {
                const isSelected = selectedLot?.lot_id === lot.lot_id;
                const isVerified = lot.status === 'HANDOVER_VERIFIED';
                const isHazard = lot.hazard_level === 'HIGH_HAZARD';
                const simulatedDistance = (1.2 + (idx * 0.8)).toFixed(1);

                return (
                  <div
                    key={lot.lot_id}
                    onClick={() => setSelectedLot(lot)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer touch-press flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30'
                        : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 relative">
                        {lot.image_url ? (
                          <img src={lot.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                            E-Waste
                          </div>
                        )}
                        {isHazard && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-900 animate-ping"></div>
                        )}
                      </div>

                      {/* Lot Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {lot.lot_id}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <MapPin size={11} className="text-blue-400" />
                            {simulatedDistance} km
                          </span>
                          {isHazard && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-500/40">
                              HIGH HAZARD
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-white mt-0.5">
                          {lot.category_name}
                        </h4>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Est: <span className="font-bold text-slate-200">{lot.est_weight_kg} kg</span> •
                          Quoted: <span className="font-bold text-emerald-400">₹{lot.quoted_amount}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Action */}
                    <div className="text-right flex flex-col items-end gap-1">
                      {isVerified ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1 animate-pulse">
                          <Clock size={13} />
                          <span>Ready for Scale</span>
                        </span>
                      )}

                      <span className="text-[11px] text-blue-400 font-bold flex items-center gap-0.5 mt-1">
                        <span>Terminal</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Verification Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <VerificationTerminal
            activeLot={selectedLot}
            onHandoverSuccess={handleHandoverSuccess}
          />
        </div>

      </div>

      {/* CPCB Form-6 Manifest Modal */}
      <DigitalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receiptModalData}
      />

    </div>
  );
}
