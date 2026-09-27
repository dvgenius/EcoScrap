/**
 * API Client for Kabadiwala Connect
 * Handles REST endpoints and WebSocket live sync
 */

const API_BASE = '/api';

export async function fetchCatalog() {
  const res = await fetch(`${API_BASE}/catalog`);
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json();
}

export async function fetchPrices(pincode = '') {
  const url = pincode ? `${API_BASE}/prices?pincode=${pincode}` : `${API_BASE}/prices`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch price dataset');
  return res.json();
}

export async function fetchRecyclers() {
  const res = await fetch(`${API_BASE}/recyclers`);
  if (!res.ok) throw new Error('Failed to fetch authorized recyclers');
  return res.json();
}

export async function fetchLots(collectorId = '') {
  const url = collectorId ? `${API_BASE}/lots?collector_id=${collectorId}` : `${API_BASE}/lots`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch lots');
  return res.json();
}

export async function fetchLotById(lotId) {
  const res = await fetch(`${API_BASE}/lots/${lotId}`);
  if (!res.ok) throw new Error('Failed to fetch lot details');
  return res.json();
}

export async function createLot(lotData) {
  const res = await fetch(`${API_BASE}/lots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lotData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to register lot');
  }
  return res.json();
}

export async function batchSyncLots(lots) {
  const res = await fetch(`${API_BASE}/lots/batch-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lots })
  });
  if (!res.ok) throw new Error('Failed to batch sync lots');
  return res.json();
}

export async function verifyHandover(lotId, payload) {
  const res = await fetch(`${API_BASE}/lots/${lotId}/verify-handover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || 'Verification failed');
  }
  return data;
}

export async function fetchLedger(collectorId = 'COL-NGP-108') {
  const res = await fetch(`${API_BASE}/ledger/${collectorId}`);
  if (!res.ok) throw new Error('Failed to fetch collector ledger');
  return res.json();
}

export async function fetchImpactMetrics() {
  const res = await fetch(`${API_BASE}/impact-metrics`);
  if (!res.ok) throw new Error('Failed to fetch impact metrics');
  return res.json();
}

/**
 * WebSocket Connection with auto-reconnect
 */
export function initWebSocket(onMessage, onStatusChange) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  let socket = null;
  let reconnectTimer = null;
  let isIntentionallyClosed = false;

  function connect() {
    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        if (onStatusChange) onStatusChange(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (onMessage) onMessage(parsed);
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      socket.onclose = () => {
        if (onStatusChange) onStatusChange(false);
        if (!isIntentionallyClosed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        if (onStatusChange) onStatusChange(false);
      };
    } catch {
      if (onStatusChange) onStatusChange(false);
      reconnectTimer = setTimeout(connect, 3000);
    }
  }

  connect();

  return {
    disconnect: () => {
      isIntentionallyClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    }
  };
}
