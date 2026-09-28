import React, { useState, useEffect } from 'react';
import OfflineSimBanner from './components/OfflineSimBanner';
import CollectorApp from './components/collector/CollectorApp';
import RecyclerPortal from './components/recycler/RecyclerPortal';
import JuryImpactCalculator from './components/jury/JuryImpactCalculator';
import { offlineStorage } from './services/offlineStorage';
import { batchSyncLots, initWebSocket } from './services/api';
import { ttsService } from './services/tts';
import { Smartphone, Monitor } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentView, setCurrentView] = useState('collector');
  const [lang, setLang] = useState('hi');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newLotAlert, setNewLotAlert] = useState(null);
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      const online = offlineStorage.isOnline();
      setIsOnline(online);
      setIsSimulatedOffline(offlineStorage.isSimulatedOffline);
      updateQueueCount();
    };
    updateStatus();
    window.addEventListener('network-status-changed', updateStatus);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('network-status-changed', updateStatus);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const updateQueueCount = async () => {
    const queue = await offlineStorage.getOfflineQueue();
    setOfflineQueueCount(queue.length);
  };

  useEffect(() => {
    if (isOnline && offlineQueueCount > 0) handleManualSync();
  }, [isOnline]);

  useEffect(() => {
    const ws = initWebSocket((message) => {
      if (message.type === 'LOT_CREATED') setNewLotAlert(message.data);
      else if (message.type === 'LOT_VERIFIED') setNewLotAlert(message.data?.lot);
    });
    return () => ws.disconnect();
  }, []);

  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    offlineStorage.setSimulatedOffline(nextState);
    setIsOnline(!nextState);
    ttsService.playChime('click');
    if (nextState) {
      ttsService.speak(lang === 'mr' ? 'ऑफलाइन मोड सुरू झाला.' : 'ऑफलाइन मोड सक्रिय।', lang);
    } else {
      ttsService.speak(lang === 'mr' ? 'ऑनलाइन जोडले गेले.' : 'ऑनलाइन जुड़ गए।', lang);
    }
  };

  const handleManualSync = async () => {
    const queue = await offlineStorage.getOfflineQueue();
    if (queue.length === 0 || !isOnline) return;
    setIsSyncing(true);
    ttsService.playChime('click');
    try {
      const res = await batchSyncLots(queue);
      if (res.success) {
        await offlineStorage.clearOfflineQueue();
        setOfflineQueueCount(0);
        ttsService.playChime('success');
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
        ttsService.speak(
          lang === 'mr' ? `${res.count} लॉट सिंक झाले!` : `${res.count} लॉट सिंक हो गए!`,
          lang
        );
      }
    } catch (e) {
      console.error('Batch sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLotCreated = () => updateQueueCount();

  return (
    <div className="min-h-screen relative">
      {/* Ambient background mesh — always fixed behind glass layers */}
      <div className="ambient-bg" aria-hidden="true" />

      {/* Main app shell — sits above ambient layer */}
      <div className="relative z-10 min-h-screen flex flex-col selection:bg-emerald-500/60 selection:text-white">

        {/* Global Navigation Header */}
        <OfflineSimBanner
          isOnline={isOnline}
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulatedOffline={handleToggleSimulatedOffline}
          offlineQueueCount={offlineQueueCount}
          onManualSync={handleManualSync}
          isSyncing={isSyncing}
          currentView={currentView}
          onViewChange={setCurrentView}
          lang={lang}
          onLanguageChange={setLang}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col">
          {currentView === 'collector' && (
            <div className="flex-1 flex flex-col items-center py-5 px-3">
              {/* Phone frame toggle */}
              <div className="w-full max-w-md flex items-center justify-between px-1 mb-3">
                <span className="text-xs font-semibold text-slate-400 devanagari-caption">
                  {lang === 'mr' ? 'मोबाईल व्ह्यू' : 'मोबाइल व्यू'}
                </span>
                <button
                  type="button"
                  onClick={() => setPhoneFrameMode(p => !p)}
                  className="glass-pill text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 touch-press"
                >
                  {phoneFrameMode ? <Monitor size={12} /> : <Smartphone size={12} />}
                  <span>{phoneFrameMode ? 'Full Width' : 'Phone Frame'}</span>
                </button>
              </div>

              <div className={`w-full transition-all duration-300 ${
                phoneFrameMode
                  ? 'max-w-md rounded-[42px] p-1.5 shadow-2xl shadow-emerald-900/30 overflow-hidden'
                  : 'max-w-xl'
              }`}
                style={phoneFrameMode ? {
                  background: 'rgba(15,23,42,0.90)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(255,255,255,0.14)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.06)'
                } : {}}
              >
                {phoneFrameMode && (
                  <div className="w-24 h-5 mx-auto mb-1 rounded-b-xl flex items-center justify-center gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="w-8 h-1 rounded-full bg-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  </div>
                )}
                <CollectorApp lang={lang} isOnline={isOnline} onLotCreated={handleLotCreated} />
              </div>
            </div>
          )}

          {currentView === 'recycler' && (
            <RecyclerPortal onLotVerified={updateQueueCount} newLotAlert={newLotAlert} />
          )}

          {currentView === 'jury' && (
            <JuryImpactCalculator />
          )}
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-white/[0.07] py-3 px-4 text-center text-xs text-slate-500 mt-auto">
          <p>
            SIH Problem Statement ID 26229 •{' '}
            <span className="text-slate-400 font-semibold">Kabadiwala Connect</span> •{' '}
            Ministry of Mines & JNARDDC
          </p>
        </footer>
      </div>
    </div>
  );
}
