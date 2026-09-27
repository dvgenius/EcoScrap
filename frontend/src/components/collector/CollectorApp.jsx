import React, { useState, useEffect } from 'react';
import { Camera, Scale, Wallet, Sparkles, AlertTriangle, ShieldCheck, IndianRupee, RefreshCw, Zap } from 'lucide-react';
import ScrapCameraModal from './ScrapCameraModal';
import HazardAlertModal from './HazardAlertModal';
import WeightDial from './WeightDial';
import InstantValuationCard from './InstantValuationCard';
import CollectorPassbook from './CollectorPassbook';
import SpeakerButton from '../SpeakerButton';
import { ttsService } from '../../services/tts';
import { createLot, fetchCatalog, fetchLedger, fetchLots } from '../../services/api';
import { offlineStorage } from '../../services/offlineStorage';
import confetti from 'canvas-confetti';

export default function CollectorApp({ lang, isOnline, onLotCreated }) {
  const [activeTab, setActiveTab] = useState('sell'); // 'sell' | 'passbook'
  const [catalog, setCatalog] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [weight, setWeight] = useState(5.0);
  const [capturedImage, setCapturedImage] = useState(null);
  
  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Passbook data
  const [ledgerData, setLedgerData] = useState(null);
  const [pendingLots, setPendingLots] = useState([]);
  const [offlineDrafts, setOfflineDrafts] = useState([]);

  // Load catalog on mount (online or cached)
  useEffect(() => {
    loadCatalog();
    loadLedgerAndLots();
    loadOfflineDrafts();
  }, [isOnline]);

  const loadCatalog = async () => {
    try {
      if (isOnline) {
        const res = await fetchCatalog();
        if (res.success && res.data) {
          setCatalog(res.data);
          offlineStorage.cacheCatalog(res.data);
          if (!selectedMaterial) {
            setSelectedMaterial(res.data[0]);
          }
          return;
        }
      }
    } catch {
      // offline fallback
    }

    const cached = offlineStorage.getCachedCatalog();
    if (cached && cached.length > 0) {
      setCatalog(cached);
      if (!selectedMaterial) setSelectedMaterial(cached[0]);
    }
  };

  const loadLedgerAndLots = async () => {
    try {
      if (isOnline) {
        const [ledgerRes, lotsRes] = await Promise.all([
          fetchLedger('COL-NGP-108'),
          fetchLots('COL-NGP-108')
        ]);
        if (ledgerRes.success) setLedgerData(ledgerRes);
        if (lotsRes.success) {
          const pending = lotsRes.data.filter(l => l.status === 'SYNCED' || l.status === 'BID_ACCEPTED');
          setPendingLots(pending);
        }
      }
    } catch (e) {
      console.warn('Could not load ledger live', e);
    }
  };

  const loadOfflineDrafts = async () => {
    const drafts = await offlineStorage.getOfflineQueue();
    setOfflineDrafts(drafts);
  };

  // Handle classification result from AI Camera
  const handleClassificationComplete = (result) => {
    const matched = catalog.find(c => c.id === result.category_id) || result;
    setSelectedMaterial(matched);
    setCapturedImage(result.previewUrl);

    // If High Hazard (Battery or CRT), trigger bold animated safety shield
    if (result.hazard_level === 'HIGH_HAZARD') {
      setIsHazardModalOpen(true);
    }
  };

  // Submit Lot (Online or Offline Draft)
  const handleCreateLot = async () => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    ttsService.playChime('click');

    const calculatedQuoted = Math.round(weight * selectedMaterial.base_market_price_per_kg);

    const lotPayload = {
      collector_id: 'COL-NGP-108',
      category_id: selectedMaterial.id,
      est_weight_kg: weight,
      quoted_amount: calculatedQuoted,
      image_url: capturedImage || '',
      geo_lat: 21.1458,
      geo_lng: 79.0882
    };

    try {
      if (isOnline) {
        const res = await createLot(lotPayload);
        if (res.success) {
          ttsService.playChime('success');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          
          const successMsg = lang === 'mr'
            ? `लॉट यशस्वीरित्या पाठवला! तुमचा OTP आहे ${res.data.verification_otp.split('').join(' ')}.`
            : `लॉट सफलतापूर्वक भेज दिया गया! आपका OTP है ${res.data.verification_otp.split('').join(' ')}.`;
          ttsService.speak(successMsg, lang);

          setSuccessToast({
            title: lang === 'mr' ? 'लॉट यशस्वीरित्या पाठवला!' : 'लॉट सफलतापूर्वक दर्ज!',
            message: `OTP: ${res.data.verification_otp}`,
            otp: res.data.verification_otp,
            lotId: res.data.lot_id
          });

          loadLedgerAndLots();
          if (onLotCreated) onLotCreated(res.data);
        }
      } else {
        // Save into Offline Drafts Queue
        const offlineLot = await offlineStorage.saveOfflineDraftLot({
          ...lotPayload,
          category_name: selectedMaterial.category_name,
          vernacular_hi: selectedMaterial.vernacular_hi,
          vernacular_mr: selectedMaterial.vernacular_mr
        });

        ttsService.playChime('success');
        const offlineMsg = lang === 'mr'
          ? 'इंटरनेट नाही. लॉट फोनमध्ये सुरक्षित जतन केला आहे!'
          : 'इंटरनेट नहीं है। लॉट फोन में ड्राफ्ट के रूप में सुरक्षित सहेज लिया गया!';
        ttsService.speak(offlineMsg, lang);

        setSuccessToast({
          title: lang === 'mr' ? 'ऑफलाइन ड्राफ्ट जतन केला!' : 'ऑफलाइन ड्राफ्ट सुरक्षित!',
          message: lang === 'mr' ? 'इंटरनेट आल्यावर आपोआप सिंक होईल.' : 'इंटरनेट कनेक्ट होने पर अपने आप सिंक होगा.',
          isOffline: true
        });

        loadOfflineDrafts();
        if (onLotCreated) onLotCreated(offlineLot);
      }
    } catch (e) {
      console.error(e);
      alert('Error creating lot: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMaterialCard = (mat) => {
    setSelectedMaterial(mat);
    setCapturedImage(null);
    ttsService.playChime('click');

    const name = lang === 'mr' ? mat.vernacular_mr : mat.vernacular_hi;
    const msg = lang === 'mr'
      ? `${name}. बाजार भाव ${mat.base_market_price_per_kg} रुपये प्रति किलो.`
      : `${name}. बाज़ार भाव ${mat.base_market_price_per_kg} रुपये प्रति किलो.`;
    ttsService.speak(msg, lang);

    if (mat.hazard_level === 'HIGH_HAZARD') {
      setIsHazardModalOpen(true);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 shadow-2xl relative border-x border-slate-800">
      
      {/* Top Mobile App Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 border-b border-slate-800/80 sticky top-12 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/30 flex items-center justify-center font-black text-slate-950 text-xl">
              क
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-white tracking-tight">
                  {lang === 'mr' ? 'कबाड़ी मित्र' : 'कबाड़ी मित्र'}
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'mr' ? 'शून्य-अक्षर ई-कचरा विक्री' : 'आसान सचित्र ई-कचरा बिक्री'}
              </p>
            </div>
          </div>

          <SpeakerButton
            text={
              lang === 'mr'
                ? 'कबाड़ी मित्र ॲपमध्ये आपले स्वागत आहे. फोटो काढून किंवा खालील कचरा निवडून त्वरित योग्य भाव मिळवा.'
                : 'कबाड़ी मित्र ऐप में आपका स्वागत है। फोटो खींचकर या नीचे दिए स्क्रैप को चुनकर तुरंत पूरा भाव पाएं।'
            }
            lang={lang}
            size="md"
          />
        </div>

        {/* Tab Switcher: Sell vs Passbook */}
        <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('sell');
              ttsService.playChime('click');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all touch-press ${
              activeTab === 'sell'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera size={16} />
            <span>{lang === 'mr' ? 'कचरा विका (Sell)' : 'कचरा बेचें (Sell)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('passbook');
              loadLedgerAndLots();
              loadOfflineDrafts();
              ttsService.playChime('click');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all touch-press ${
              activeTab === 'passbook'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet size={16} />
            <span>{lang === 'mr' ? 'खाता (Passbook)' : 'खाता (Passbook)'}</span>
            {(pendingLots.length > 0 || offlineDrafts.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5 flex-1">
        {activeTab === 'sell' ? (
          <>
            {/* Step 1: Big Visual Scrap Camera Action Button */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-dashed border-emerald-500/60 rounded-3xl p-4 text-center shadow-lg relative overflow-hidden">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 mb-3 border-4 border-slate-900 transition-all touch-press"
                  aria-label="Open AI Scrap Camera"
                >
                  <Camera size={38} className="animate-pulse" />
                </button>

                <div className="flex items-center gap-1.5 justify-center">
                  <h2 className="text-base font-black text-white">
                    {lang === 'mr' ? 'फोटो काढा / AI स्कॅन' : 'फोटो खींचें / AI स्कैन'}
                  </h2>
                  <SpeakerButton
                    text={lang === 'mr' ? 'कचऱ्याचा फोटो काढण्यासाठी हिरव्या कॅमेऱ्यावर दाबा' : 'स्क्रैप का फोटो खींचने के लिए हरे कैमरे पर दबाएं'}
                    lang={lang}
                    size="sm"
                  />
                </div>

                <p className="text-[11px] text-emerald-300 font-medium mt-1">
                  {lang === 'mr' ? 'एआय आपोआप कचरा ओळखेल आणि खरा भाव सांगेल' : 'एआई अपने आप कचरा पहचानेगा और सही भाव बताएगा'}
                </p>

                {capturedImage && (
                  <div className="mt-3 flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs text-emerald-300">
                    <img src={capturedImage} alt="Captured" className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-bold">
                      {lang === 'mr' ? 'फोटो जोडला आहे' : 'फोटो संलग्न है'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Visual Material Categories Grid (Zero Text Dependence with Pictograms & Audio) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {lang === 'mr' ? 'किंवा कचऱ्याचा प्रकार निवडा:' : 'या कचरे का प्रकार चुनें:'}
                </span>
                <span className="text-[11px] text-slate-500 font-bold">
                  {catalog.length} {lang === 'mr' ? 'प्रकार' : 'श्रेणियां'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {catalog.map((mat) => {
                  const isSelected = selectedMaterial?.id === mat.id;
                  const isHazard = mat.hazard_level === 'HIGH_HAZARD';

                  return (
                    <div
                      key={mat.id}
                      onClick={() => handleSelectMaterialCard(mat)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer touch-press flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top bar in card: Hazard badge and speaker */}
                      <div className="flex items-center justify-between mb-2">
                        {isHazard ? (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40 animate-pulse">
                            <AlertTriangle size={11} />
                            <span>{lang === 'mr' ? 'धोका' : 'खतरा'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            {lang === 'mr' ? 'सुरक्षित' : 'सुरक्षित'}
                          </span>
                        )}

                        <SpeakerButton
                          text={
                            lang === 'mr'
                              ? `${mat.vernacular_mr}. भाव ${mat.base_market_price_per_kg} रुपये प्रति किलो.`
                              : `${mat.vernacular_hi}. भाव ${mat.base_market_price_per_kg} रुपये प्रति किलो.`
                          }
                          lang={lang}
                          size="sm"
                        />
                      </div>

                      {/* Vernacular Category Name */}
                      <h3 className="font-extrabold text-sm text-white leading-tight mb-2">
                        {lang === 'mr' ? mat.vernacular_mr : mat.vernacular_hi}
                      </h3>

                      {/* Price Pill */}
                      <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          ₹{mat.base_market_price_per_kg}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">/ kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Visual Weight Dial */}
            {selectedMaterial && (
              <WeightDial
                weight={weight}
                onChange={setWeight}
                lang={lang}
              />
            )}

            {/* Step 4: Instant Valuation & Final Sell Button */}
            {selectedMaterial && (
              <InstantValuationCard
                material={selectedMaterial}
                weight={weight}
                onConfirmLot={handleCreateLot}
                isSubmitting={isSubmitting}
                isOffline={!isOnline}
                lang={lang}
              />
            )}
          </>
        ) : (
          /* Passbook / Khata Tab */
          <CollectorPassbook
            ledgerData={ledgerData}
            pendingLots={pendingLots}
            offlineDrafts={offlineDrafts}
            lang={lang}
          />
        )}
      </div>

      {/* Camera AI Modal */}
      <ScrapCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onClassificationComplete={handleClassificationComplete}
        lang={lang}
      />

      {/* Emergency Hazard Safety Shield Modal */}
      <HazardAlertModal
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        material={selectedMaterial}
        lang={lang}
      />

      {/* Success Notification Toast with Handover Code */}
      {successToast && (
        <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 bg-slate-900 border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl shadow-emerald-500/40 animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-emerald-500 text-slate-950 font-black">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">
                  {successToast.title}
                </h4>
                {successToast.otp ? (
                  <div className="mt-1">
                    <span className="text-xs text-slate-300">
                      {lang === 'mr' ? 'रिसायकलरला हा कोड सांगा:' : 'रीसायकलर को यह कोड बताएं:'}
                    </span>
                    <div className="text-2xl font-black text-emerald-400 font-mono tracking-widest mt-0.5">
                      {successToast.otp}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 mt-0.5">
                    {successToast.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSuccessToast(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
