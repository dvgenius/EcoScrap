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
  const [currentView, setCurrentView] = useState('collector'); // 'collector' | 'recycler' | 'jury'
  const [lang, setLang] = useState('hi'); // 'hi' | 'mr'
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newLotAlert, setNewLotAlert] = useState(null);
  const [phoneFrameMode, setPhoneFrameMode] = useState(true); // Toggle mobile simulator frame

  // Initialize network and offline status
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

  // Auto-sync when transitioning from offline to online
  useEffect(() => {
    if (isOnline && offlineQueueCount > 0) {
      handleManualSync();
    }
  }, [isOnline]);

  // Connect WebSocket for real-time live synchronization
  useEffect(() => {
    const ws = initWebSocket((message) => {
      console.log('Live WS Event:', message);
      if (message.type === 'LOT_CREATED') {
        setNewLotAlert(message.data);
      } else if (message.type === 'LOT_VERIFIED') {
        setNewLotAlert(message.data.lot);
      }
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
      ttsService.speak(
        lang === 'mr' ? 'ऑफलाइन मोड सुरू झाला. सर्व लॉट फोनमध्ये जतन होतील.' : 'ऑफलाइन मोड सक्रिय. सभी लॉट फोन में सुरक्षित रहेंगे.',
        lang
      );
    } else {
      ttsService.speak(
        lang === 'mr' ? 'ऑनलाइन मोड जोडला गेला. बॅकग्राउंड सिंक सुरू.' : 'ऑनलाइन मोड जुड़ गया. बैकग्राउंड सिंक शुरू.',
        lang
      );
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

        const syncMsg = lang === 'mr'
          ? `${res.count} ऑफलाइन लॉट यशस्वीरित्या सर्व्हरवर सिंक झाले!`
          : `${res.count} ऑफलाइन लॉट सफलतापूर्वक सर्वर पर सिंक हो गए!`;
        ttsService.speak(syncMsg, lang);
      }
    } catch (e) {
      console.error('Batch sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLotCreated = () => {
    updateQueueCount();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Global Presentation Navigation & Offline Simulator Header */}
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

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-start">
        {currentView === 'collector' && (
          <div className="flex-1 flex flex-col items-center justify-start py-4 px-2">
            
            {/* Phone Frame Toggle for Presentation Clarity */}
            <div className="w-full max-w-md flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400">
                {lang === 'mr' ? 'मोबाईल डिस्प्ले व्ह्यू' : 'मोबाइल स्क्रीन सिमुलेटर'}
              </span>
              <button
                type="button"
                onClick={() => setPhoneFrameMode(!phoneFrameMode)}
                className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg"
              >
                {phoneFrameMode ? <Monitor size={12} /> : <Smartphone size={12} />}
                <span>{phoneFrameMode ? 'Full Width' : 'Phone Frame'}</span>
              </button>
            </div>

            {/* Mobile Viewport Container */}
            <div
              className={`w-full transition-all duration-300 ${
                phoneFrameMode
                  ? 'max-w-md rounded-[40px] border-4 border-slate-800 shadow-2xl shadow-emerald-500/10 overflow-hidden bg-slate-950 relative'
                  : 'max-w-xl'
              }`}
            >
              {phoneFrameMode && (
                /* Top Speaker Notch */
                <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto mb-1 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
                </div>
              )}

              <CollectorApp
                lang={lang}
                isOnline={isOnline}
                onLotCreated={handleLotCreated}
              />
            </div>
          </div>
        )}

        {currentView === 'recycler' && (
          <RecyclerPortal
            onLotVerified={() => updateQueueCount()}
            newLotAlert={newLotAlert}
          />
        )}

        {currentView === 'jury' && (
          <JuryImpactCalculator />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-3 px-4 text-center text-xs text-slate-500">
        <p>
          SIH Problem Statement ID 26229: <span className="text-slate-400 font-medium">Kabadiwala Connect – Informal E-Waste Formalization Chain</span> •
          Ministry of Mines & JNARDDC
        </p>
      </footer>

    </div>
  );
}
