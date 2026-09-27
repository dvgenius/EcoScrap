/**
 * Offline-First IndexedDB and LocalStorage Service
 * Handles offline lot queueing, caching of catalog & price datasets,
 * and seamless background synchronization.
 */

const DB_NAME = 'KabadiwalaConnectOfflineDB';
const DB_VERSION = 1;
const STORE_OFFLINE_LOTS = 'offline_lots';
const STORE_CACHE = 'platform_cache';

class OfflineStorageManager {
  constructor() {
    this.db = null;
    this.isSimulatedOffline = false;
    this.initPromise = this.initIndexedDB();

    // Listen to real browser network changes
    if (typeof window !== 'undefined') {
      const storedSim = localStorage.getItem('SIMULATE_OFFLINE_MODE');
      this.isSimulatedOffline = storedSim === 'true';

      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  async initIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    return new Promise((resolve) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_OFFLINE_LOTS)) {
          db.createObjectStore(STORE_OFFLINE_LOTS, { keyPath: 'lot_id' });
        }
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          db.createObjectStore(STORE_CACHE, { keyPath: 'cache_key' });
        }
      };

      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      req.onerror = () => {
        console.warn('IndexedDB unavailable, falling back to LocalStorage');
        resolve(null);
      };
    });
  }

  setSimulatedOffline(isOffline) {
    this.isSimulatedOffline = isOffline;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('SIMULATE_OFFLINE_MODE', String(isOffline));
    }
    // Dispatch custom event for reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('network-status-changed', {
        detail: { isOnline: this.isOnline() }
      }));
    }
  }

  isOnline() {
    if (this.isSimulatedOffline) return false;
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  handleNetworkChange(online) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('network-status-changed', {
        detail: { isOnline: this.isOnline() }
      }));
    }
  }

  /**
   * Save a draft lot into offline store
   */
  async saveOfflineDraftLot(lot) {
    const draftLot = {
      ...lot,
      lot_id: lot.lot_id || `OFFLINE-${Date.now().toString(36).toUpperCase()}`,
      status: 'OFFLINE_DRAFT',
      created_at: lot.created_at || new Date().toISOString(),
      is_offline: true
    };

    try {
      await this.initPromise;
      if (this.db) {
        return new Promise((resolve, reject) => {
          const tx = this.db.transaction(STORE_OFFLINE_LOTS, 'readwrite');
          const store = tx.objectStore(STORE_OFFLINE_LOTS);
          const req = store.put(draftLot);
          req.onsuccess = () => resolve(draftLot);
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // Fallback to localStorage
    }

    // LocalStorage fallback
    const queue = this.getLocalStorageQueue();
    queue.push(draftLot);
    localStorage.setItem(STORE_OFFLINE_LOTS, JSON.stringify(queue));
    return draftLot;
  }

  /**
   * Get all queued offline draft lots
   */
  async getOfflineQueue() {
    try {
      await this.initPromise;
      if (this.db) {
        return new Promise((resolve) => {
          const tx = this.db.transaction(STORE_OFFLINE_LOTS, 'readonly');
          const store = tx.objectStore(STORE_OFFLINE_LOTS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.getLocalStorageQueue());
        });
      }
    } catch {
      // Fallback
    }
    return this.getLocalStorageQueue();
  }

  /**
   * Remove a synced lot from offline queue
   */
  async removeOfflineLot(lotId) {
    try {
      await this.initPromise;
      if (this.db) {
        const tx = this.db.transaction(STORE_OFFLINE_LOTS, 'readwrite');
        tx.objectStore(STORE_OFFLINE_LOTS).delete(lotId);
      }
    } catch {
      // ignore
    }
    const queue = this.getLocalStorageQueue().filter(l => l.lot_id !== lotId);
    localStorage.setItem(STORE_OFFLINE_LOTS, JSON.stringify(queue));
  }

  async clearOfflineQueue() {
    try {
      await this.initPromise;
      if (this.db) {
        const tx = this.db.transaction(STORE_OFFLINE_LOTS, 'readwrite');
        tx.objectStore(STORE_OFFLINE_LOTS).clear();
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(STORE_OFFLINE_LOTS);
  }

  getLocalStorageQueue() {
    try {
      const data = localStorage.getItem(STORE_OFFLINE_LOTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Cache catalog data in offline storage
   */
  async cacheCatalog(catalogData) {
    try {
      localStorage.setItem('CACHED_CATALOG', JSON.stringify(catalogData));
    } catch (e) {
      console.warn('Could not cache catalog in localStorage', e);
    }
  }

  getCachedCatalog() {
    try {
      const data = localStorage.getItem('CACHED_CATALOG');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Cache price trends dataset
   */
  async cachePriceDataset(priceData) {
    try {
      localStorage.setItem('CACHED_PRICES', JSON.stringify(priceData));
    } catch (e) {
      console.warn('Could not cache prices', e);
    }
  }

  getCachedPrices() {
    try {
      const data = localStorage.getItem('CACHED_PRICES');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}

export const offlineStorage = new OfflineStorageManager();
