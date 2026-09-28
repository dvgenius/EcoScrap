import React, { useState, useEffect } from 'react';
import { Camera, Scale, Wallet, AlertTriangle, ShieldCheck, IndianRupee, Send } from 'lucide-react';
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

/* Category icon map */
const CAT_ICONS = {
  1: '🖥️', 2: '🔋', 3: '📺', 4: '🔌', 5: '💽', 6: '♻️'
};

export default function CollectorApp({ lang, isOnline, onLotCreated }) {
  const [activeTab, setActiveTab] = useState('sell');
  const [catalog, setCatalog] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [weight, setWeight] = useState(5.0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [pendingLots, setPendingLots] = useState([]);
  const [offlineDrafts, setOfflineDrafts] = useState([]);

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
          if (!selectedMaterial) setSelectedMaterial(res.data[0]);
          return;
        }
      }
    } catch {}
    const cached = offlineStorage.getCachedCatalog();
    if (cached?.length > 0) {
      setCatalog(cached);
      if (!selectedMaterial) setSelectedMaterial(cached[0]);
    }
  };

  const loadLedgerAndLots = async () => {
    try {
      if (isOnline) {
        const [ledgerRes, lotsRes] = await Promise.all([
          fetchLedger('COL-NGP-108'), fetchLots('COL-NGP-108')
        ]);
        if (ledgerRes.success) setLedgerData(ledgerRes);
        if (lotsRes.success) setPendingLots(lotsRes.data.filter(l => ['SYNCED','BID_ACCEPTED'].includes(l.status)));
      }
    } catch {}
  };

  const loadOfflineDrafts = async () => {
    const drafts = await offlineStorage.getOfflineQueue();
    setOfflineDrafts(drafts);
  };

  const handleClassificationComplete = (result) => {
    const matched = catalog.find(c => c.id === result.category_id) || result;
    setSelectedMaterial(matched);
    setCapturedImage(result.previewUrl);
    if (result.hazard_level === 'HIGH_HAZARD') setIsHazardModalOpen(true);
  };

  const handleCreateLot = async () => {
    if (!selectedMaterial) return;
    setIsSubmitting(true);
    ttsService.playChime('click');
    const quoted = Math.round(weight * selectedMaterial.base_market_price_per_kg);
    const payload = {
      collector_id: 'COL-NGP-108', category_id: selectedMaterial.id,
      est_weight_kg: weight, quoted_amount: quoted,
      image_url: capturedImage || '', geo_lat: 21.1458, geo_lng: 79.0882
    };
    try {
      if (isOnline) {
        const res = await createLot(payload);
        if (res.success) {
          ttsService.playChime('success');
          confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } });
          const otp = res.data.verification_otp;
          ttsService.speak(
            lang === 'mr'
              ? `लॉट यशस्वी! OTP: ${otp.split('').join(' ')}`
              : `लॉट सफल! OTP: ${otp.split('').join(' ')}`, lang);
          setSuccessToast({ title: lang === 'mr' ? 'लॉट यशस्वी!' : 'लॉट दर्ज!', otp, lotId: res.data.lot_id });
          loadLedgerAndLots();
          if (onLotCreated) onLotCreated(res.data);
        }
      } else {
        const draft = await offlineStorage.saveOfflineDraftLot({ ...payload,
          category_name: selectedMaterial.category_name,
          vernacular_hi: selectedMaterial.vernacular_hi,
          vernacular_mr: selectedMaterial.vernacular_mr,
        });
        ttsService.playChime('success');
        ttsService.speak(lang === 'mr' ? 'ऑफलाइन जतन!' : 'ऑफलाइन सहेजा!', lang);
        setSuccessToast({
          title: lang === 'mr' ? 'ऑफलाइन जतन!' : 'ऑफलाइन ड्राफ्ट!',
          message: lang === 'mr' ? 'नंतर आपोआप सिंक होईल.' : 'इंटरनेट पर अपने आप सिंक होगा।',
          isOffline: true
        });
        loadOfflineDrafts();
        if (onLotCreated) onLotCreated(draft);
      }
    } catch (e) { alert('Error: ' + e.message); }
    finally { setIsSubmitting(false); }
  };

  const handleSelectMaterialCard = (mat) => {
    setSelectedMaterial(mat);
    setCapturedImage(null);
    ttsService.playChime('click');
    const name = lang === 'mr' ? mat.vernacular_mr : mat.vernacular_hi;
    ttsService.speak(
      lang === 'mr'
        ? `${name}. भाव ${mat.base_market_price_per_kg} रुपये प्रति किलो.`
        : `${name}. भाव ${mat.base_market_price_per_kg} रुपये प्रति किलो.`, lang);
    if (mat.hazard_level === 'HIGH_HAZARD') setIsHazardModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-24 relative overflow-hidden"
      style={{ color: '#f1f5f9' }}>

      {/* ── App top bar ── */}
      <div className="sticky top-0 z-20 px-4 pt-3 pb-2.5" style={{
        background: 'rgba(6,13,28,0.80)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* App Icon */}
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.40)',
              }}>
              क
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-white devanagari-safe">
                  {lang === 'mr' ? 'कबाडी मित्र' : 'कबाड़ी मित्र'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: isOnline ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
                    border: isOnline ? '1px solid rgba(16,185,129,0.40)' : '1px solid rgba(245,158,11,0.40)',
                    color: isOnline ? '#6ee7b7' : '#fcd34d',
                  }}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 devanagari-caption">
                {lang === 'mr' ? 'ई-कचरा मोफत विका' : 'ई-कचरा सही भाव पर बेचें'}
              </p>
            </div>
          </div>
          <SpeakerButton
            text={lang === 'mr'
              ? 'कबाडी मित्रमध्ये स्वागत आहे. खाली कचऱ्याचा प्रकार निवडा.'
              : 'कबाड़ी मित्र में आपका स्वागत है। नीचे से कचरे का प्रकार चुनें।'}
            lang={lang} size="md" />
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 p-1 rounded-2xl" style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { id: 'sell', icon: Camera, labelHi: '📷 कचरा बेचें', labelMr: '📷 कचरा विका' },
            { id: 'passbook', icon: Wallet, labelHi: '💰 खाता / Passbook', labelMr: '💰 खाता / Passbook' },
          ].map(({ id, icon: Icon, labelHi, labelMr }) => (
            <button key={id} type="button"
              onClick={() => { setActiveTab(id); ttsService.playChime('click');
                if (id === 'passbook') { loadLedgerAndLots(); loadOfflineDrafts(); }}}
              className="py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all touch-press devanagari-safe"
              style={activeTab === id ? {
                background: 'rgba(16,185,129,0.22)',
                border: '1px solid rgba(16,185,129,0.50)',
                color: '#34d399',
                boxShadow: '0 0 14px rgba(16,185,129,0.18)',
              } : {
                color: '#94a3b8', border: '1px solid transparent',
              }}
            >
              <Icon size={15} />
              <span>{lang === 'mr' ? labelMr : labelHi}</span>
              {id === 'passbook' && (pendingLots.length > 0 || offlineDrafts.length > 0) && (
                <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-4 flex-1">
        {activeTab === 'sell' ? (
          <>
            {/* Camera CTA */}
            <div className="rounded-3xl p-5 text-center relative overflow-hidden" style={{
              background: 'rgba(5,46,22,0.30)',
              backdropFilter: 'blur(16px)',
              border: '1.5px dashed rgba(16,185,129,0.50)',
              boxShadow: '0 0 30px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              {/* Ambient glow orb */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                <div className="w-32 h-32 rounded-full animate-orb" style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
                }} />
              </div>

              <button type="button" onClick={() => setIsCameraOpen(true)}
                className="relative w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3 touch-press"
                style={{
                  background: 'linear-gradient(135deg, #059669, #0891b2)',
                  boxShadow: '0 8px 28px rgba(16,185,129,0.45), 0 0 0 3px rgba(16,185,129,0.15)',
                  border: '2px solid rgba(255,255,255,0.20)',
                }}
              >
                <Camera size={36} className="text-white" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </span>
              </button>

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-sm font-black text-white devanagari-safe">
                  {lang === 'mr' ? 'फोटो काढा / AI स्कॅन' : 'फोटो खींचें / AI स्कैन'}
                </h2>
                <SpeakerButton
                  text={lang === 'mr'
                    ? 'हिरव्या कॅमेऱ्यावर दाबा आणि एआय कचरा ओळखेल.'
                    : 'हरे कैमरे पर दबाएं। एआई कचरा पहचानेगा।'}
                  lang={lang} size="sm" />
              </div>
              <p className="text-[11px] mt-1 devanagari-caption" style={{ color: '#6ee7b7' }}>
                {lang === 'mr' ? 'एआय आपोआप ओळखेल व भाव सांगेल' : 'एआई भाव बताएगा — तुरंत, सटीक'}
              </p>
              {capturedImage && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#a7f3d0' }}>
                  <img src={capturedImage} alt="" className="w-4 h-4 rounded-full object-cover" />
                  {lang === 'mr' ? 'फोटो जोडला' : 'फोटो जुड़ा'}
                </div>
              )}
            </div>

            {/* Material Cards Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'mr' ? 'प्रकार निवडा:' : 'या कचरे का प्रकार चुनें:'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">{catalog.length} categories</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {catalog.map((mat) => {
                  const isSelected = selectedMaterial?.id === mat.id;
                  const isHazard = mat.hazard_level === 'HIGH_HAZARD';
                  return (
                    <div key={mat.id} onClick={() => handleSelectMaterialCard(mat)}
                      className="glass-card rounded-2xl p-3.5 cursor-pointer relative overflow-hidden"
                      style={isSelected ? {
                        background: 'rgba(5,46,22,0.55)',
                        border: '1.5px solid rgba(16,185,129,0.70)',
                        boxShadow: '0 0 22px rgba(16,185,129,0.22), 0 0 0 2px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
                      } : {}}
                    >
                      {/* Subtle inner shimmer on select */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-px"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.60), transparent)' }} />
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{CAT_ICONS[mat.id] || '♻️'}</span>
                          {isHazard ? (
                            <span className="glass-pill flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ color: '#fca5a5', border: '1px solid rgba(244,63,94,0.45)' }}>
                              <AlertTriangle size={10} />
                              <span>{lang === 'mr' ? 'धोका' : 'खतरा'}</span>
                            </span>
                          ) : (
                            <span className="glass-pill text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.30)' }}>
                              {lang === 'mr' ? 'सुरक्षित' : 'Safe'}
                            </span>
                          )}
                        </div>
                        <SpeakerButton
                          text={lang === 'mr'
                            ? `${mat.vernacular_mr}. भाव ${mat.base_market_price_per_kg} रुपये किलो.`
                            : `${mat.vernacular_hi}. भाव ${mat.base_market_price_per_kg} रुपये किलो.`}
                          lang={lang} size="sm" />
                      </div>

                      <h3 className="font-extrabold text-sm text-white leading-tight mb-2.5 devanagari-safe">
                        {lang === 'mr' ? mat.vernacular_mr : mat.vernacular_hi}
                      </h3>

                      <div className="flex items-baseline justify-between pt-2"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <span className="text-xl font-black font-mono"
                          style={{ color: isHazard ? '#fca5a5' : '#34d399' }}>
                          ₹{mat.base_market_price_per_kg}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">/ kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weight Dial */}
            {selectedMaterial && <WeightDial weight={weight} onChange={setWeight} lang={lang} />}

            {/* Valuation + Submit */}
            {selectedMaterial && (
              <InstantValuationCard
                material={selectedMaterial} weight={weight}
                onConfirmLot={handleCreateLot}
                isSubmitting={isSubmitting} isOffline={!isOnline} lang={lang} />
            )}
          </>
        ) : (
          <CollectorPassbook
            ledgerData={ledgerData} pendingLots={pendingLots}
            offlineDrafts={offlineDrafts} lang={lang} />
        )}
      </div>

      {/* Camera Modal */}
      <ScrapCameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)}
        onClassificationComplete={handleClassificationComplete} lang={lang} />

      {/* Hazard Modal */}
      <HazardAlertModal isOpen={isHazardModalOpen} onClose={() => setIsHazardModalOpen(false)}
        material={selectedMaterial} lang={lang} />

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-5 inset-x-3 max-w-sm mx-auto z-50 rounded-3xl p-4"
          style={{
            background: 'rgba(5,30,20,0.92)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(16,185,129,0.60)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.55), 0 0 30px rgba(16,185,129,0.20)',
          }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.50)' }}>
                <ShieldCheck size={24} style={{ color: '#34d399' }} />
              </div>
              <div>
                <h4 className="font-black text-sm text-white devanagari-safe">{successToast.title}</h4>
                {successToast.otp ? (
                  <>
                    <p className="text-[11px] text-slate-300 mt-0.5 devanagari-caption">
                      {lang === 'mr' ? 'रिसायकलरला हा कोड सांगा:' : 'रीसायकलर को यह कोड बताएं:'}
                    </p>
                    <div className="text-3xl font-black tracking-widest font-mono mt-1"
                      style={{ color: '#fcd34d', textShadow: '0 0 12px rgba(245,158,11,0.50)' }}>
                      {successToast.otp}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-300 mt-0.5 devanagari-caption">{successToast.message}</p>
                )}
              </div>
            </div>
            <button onClick={() => setSuccessToast(null)}
              className="text-[11px] font-black px-2 py-1 rounded-lg flex-shrink-0 touch-press"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)' }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
