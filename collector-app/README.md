# Collector App (कबाड़ी मित्र)
### SIH Problem Statement ID 26229 – Zero-Literacy Vernacular E-Waste PWA

Designed strictly for mobile viewport with extreme low-literacy vernacular accessibility (Hindi & Marathi), robust offline-first synchronization, automated valuation, safety warnings, and verifiable digital handovers.

### Features
- **Zero-Text Vernacular UX**: Color-coded cards, pictograms, and visual sack counters.
- **Audio TTS Everywhere**: Browser SpeechSynthesis API (`hi-IN` and `mr-IN`) with tactile audio synthesized chimes for low-literacy users. Every button, price tile, and modal has a speaker icon.
- **Edge AI Scrap Camera**: On-device image classification into 6 critical e-waste categories using TensorFlow.js / Wasm heuristics with confidence scoring and reticle bounding box.
- **Emergency Hazard Shield**: Immediate high-volume voice guidance and pulsing visual warnings for CRT monitors and Lithium-Ion battery packs (warning against toxic acid leaching, lead poisoning, and open-air burning).
- **Tactile Weight Dial**: Giant +/- touch increments (+1kg, +5kg, +10kg) with visual bag icons.
- **Instant Valuation**: Displays bold currency figures with one-tap read aloud and middleman rate comparison (+72% net gain).
- **Offline-First Synchronization**: IndexedDB queue for offline lot drafts, automatic reconnection sync, and manual "Sync Now" button.
- **Vernacular Passbook (खाता)**: Green cards for Cash/UPI received, Yellow cards with 4-digit handover codes (OTP) for pending verification.

*Component Source: `frontend/src/components/collector/*`*
