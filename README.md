# Kabadiwala Connect (कबाड़ी मित्र)
### SIH Problem Statement ID 26229: Bringing the Informal Collector into the Formal Recycling Chain
**Ministry of Mines & Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)**

---

## 🌟 Executive Summary
Over 90% of India's electronic waste is currently handled by the informal sector (Kabadiwalas), often processed through hazardous backyard acid leaching and open-air burning. This results in severe toxic contamination, loss of critical strategic minerals (Lithium, Cobalt, Neodymium, Gold), and unfair financial exploitation of informal collectors by middlemen.

**Kabadiwala Connect** provides a breakthrough full-stack solution featuring:
1. **Zero-Text Dependence & Low-Literacy Vernacular Accessibility**: Visual workflows with voice prompts in **Hindi (हिंदी)** and **Marathi (मराठी)** via SpeechSynthesis TTS.
2. **On-Device Edge ML Classification**: Client-side TensorFlow.js inference identifying 6 critical e-waste categories with instant hazard warnings.
3. **Emergency Chemical Safety Shields**: Proactive warnings preventing dangerous battery fires and lead-glass exposure.
4. **Robust Offline-First Architecture**: IndexedDB queue for offline lot creation, automatic background sync, and an interactive **"Simulate Offline Mode"** presentation toggle.
5. **CPCB / EPR Compliant Recycler Portal**: Real-time incoming radar, digital scale re-weighing with **>10% anomaly detection**, 4-digit OTP digital handover, and immutable **CPCB Form-6 Transfer Manifests**.
6. **Unit-Economics & Critical Mineral Sovereignty**: Direct **+72% income hike** for informal collectors and quantified recovery metrics for critical minerals.

---

## 📁 Monorepo Directory Architecture
```
EcoScrap/
├── backend/                  # Node.js + Express + WebSocket + Native SQLite Database
│   ├── db.js                 # Auto-seeding database layer (Node 24 DatabaseSync)
│   ├── server.js             # REST API & WebSocket event broadcaster
│   ├── ecoscarp.sqlite       # Embedded SQLite database
│   └── package.json
├── frontend/                 # React 19 + Tailwind CSS + Lucide Icons + Recharts
│   ├── src/
│   │   ├── components/
│   │   │   ├── collector/    # Zero-literacy mobile PWA (Camera, Dial, Valuation, Passbook)
│   │   │   ├── recycler/     # CPCB Recycler dashboard (Radar, Scale, Form-6 Manifest)
│   │   │   ├── jury/         # Hackathon Unit-Economics & Impact Calculator
│   │   │   ├── LanguageToggle.jsx
│   │   │   ├── OfflineSimBanner.jsx
│   │   │   └── SpeakerButton.jsx
│   │   ├── services/
│   │   │   ├── api.js        # REST & WebSocket client
│   │   │   ├── offlineStorage.js # IndexedDB & LocalStorage offline queue manager
│   │   │   └── tts.js        # Web Speech Synthesis & synthesized chimes
│   │   ├── App.jsx           # Master application orchestrator
│   │   └── index.css         # Glassmorphic UI & micro-interaction animations
│   ├── index.html            # Vernacular typography (Noto Sans Devanagari)
│   └── vite.config.js        # Tailwind v4 & backend proxy configuration
├── ml-pipeline/              # On-device Edge AI E-Waste Classifier Module
│   └── classifier.js         # 6-class neural inference wrapper with bounding boxes
├── collector-app/            # Module specification & documentation
├── recycler-portal/          # Module specification & documentation
└── package.json              # Monorepo orchestration scripts (concurrently)
```

---

## 🚀 Single Boot Command (Quickstart)

### 1. Install Dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Run Both Backend API and Frontend Simultaneously
```bash
npm run dev
```

- **Frontend App & Simulator**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000/api/health`
- **Live WebSocket Server**: `ws://localhost:5000/ws`

---

## 🧪 Live Presentation & Evaluation Guide

### 1. Testing Vernacular Zero-Literacy Flow (📱 कबाड़ी मित्र)
1. Navigate to the **"📱 कबाड़ी मित्र"** tab at the top.
2. Toggle between **Hindi (हिंदी)** and **Marathi (मराठी)** in the top right.
3. Tap on any **Speaker Button (🔊)** to hear clear, natural speech audio.
4. Click on **"फोटो खींचें / AI स्कैन"**:
   - Select a sample preset (e.g. **Lithium Battery Pack** or **Green PCB Motherboard**).
   - Observe edge AI bounding box reticle, confidence score, and voice announcement.
5. If a **Hazardous** item (Battery or CRT) is selected:
   - An animated **Emergency Red Shield** pops up with siren audio warning against open burning and acid leaching.
6. Use the **Tactile Weight Dial**:
   - Tap **+1kg**, **+5kg**, or **+10kg** to feel the tactile chimes and watch visual sack icons increase.
7. Review **Instant Valuation**:
   - Notice the bold currency amount (e.g., ₹1,100) and the **+72% higher net earnings** compared to informal middlemen.
8. Tap **"रीसायकलर को लॉट भेजें"** to register the lot.
9. Inspect the **"खाता (Passbook)"** tab:
   - View the 4-digit secret handover OTP generated for the collector.

### 2. Testing Offline Mode & Background Sync (⚡ Offline-First)
1. Click the **"Simulate Offline"** button in the top navigation bar.
2. The indicator turns amber: `Simulated: OFFLINE`. Voice audio confirms offline status.
3. Create a scrap lot while offline:
   - Notice the lot is instantly saved into local **IndexedDB**.
   - An **"Offline Draft"** badge appears with a sync queue counter (e.g., `⚡ 1 ड्राफ्ट`).
4. Click **"Simulate Offline"** again to toggle back to **Online**:
   - The system automatically triggers background synchronization!
   - Celebration chime and confetti trigger, and the lot appears in the CPCB Recycler feed.

### 3. Testing Recycler Verification Terminal (🏭 CPCB Recycler)
1. Switch to the **"🏭 CPCB Recycler"** tab.
2. View the **Real-Time Incoming E-Waste Radar** feed sorted by distance.
3. Click on any pending lot (e.g., `LOT-2026-M42`).
4. Re-Weighing Scale Simulation:
   - Enter a scale weight that diverges by >10% (e.g., change 8 kg to 10.5 kg).
   - Notice the automated **Anomaly Detection Flag** and recalibrated fair payout.
5. Enter the collector's 4-digit OTP code (found in their Passbook).
6. Click **"Verify Handover & Generate CPCB Form-6 Manifest"**:
   - Generates an official, printable **CPCB Form-6 Manifest** with QR code and blockchain verification hash.

### 4. Evaluating Unit-Economics & Strategic Minerals (⚖️ Jury Impact)
1. Switch to the **"⚖️ Jury Impact"** tab.
2. Drag the volume slider from 10 kg to 5,000 kg.
3. Inspect side-by-side unit economics:
   - Middleman Cut vs Platform Net Payout (+72% net income surge for the collector).
   - Ministry of Mines & JNARDDC strategic mineral yield: kg of pure Copper, grams of battery-grade Lithium, Cobalt, and rare-earth Neodymium recovered.
   - Toxic heavy metal leaching and CO2 emissions prevented.

---

## 🏛️ Regulatory & Policy Compliance
- **E-Waste (Management) Rules, 2022**: Rule 14(2) Form-6 compliant digital transfer records.
- **CPCB EPR Framework**: Direct integration with authorized EPR recycling facilities.
- **Ministry of Mines National Critical Minerals Mission**: Strategic recovery of Rare-Earth Elements (REE) and battery precursors.
