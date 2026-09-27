# Backend: Express REST API & WebSocket Live Sync Server
### SIH Problem Statement ID 26229 – Ministry of Mines & JNARDDC

Robust embedded backend architecture for e-waste formalization.

### Tech Stack:
- **Runtime**: Node.js v24 (ES Modules)
- **Database**: Embedded SQLite (`node:sqlite` DatabaseSync) with zero external compilation dependencies.
- **Protocol**: Express REST API + WebSocket Server (`/ws`) for instant real-time sync across Collector and Recycler terminals.

### Tables & Seed Data:
1. `material_catalog`: 6 core categories with hazard voice prompts in Hindi & Marathi and base market prices.
2. `price_dataset`: City-specific price trends for Nagpur (JNARDDC Zone), Mumbai, and Pune.
3. `authorized_recyclers`: CPCB/MPCB certified facilities with EPR authorization IDs.
4. `material_lots`: Lot lifecycle (`OFFLINE_DRAFT` -> `SYNCED` -> `BID_ACCEPTED` -> `HANDOVER_VERIFIED`).
5. `earnings_ledger`: Settled UPI/Cash payouts with timestamps.

### Endpoints:
- `GET /api/health`: Health status
- `GET /api/catalog`: Material categories and hazard prompts
- `GET /api/prices`: Regional price datasets & trends
- `GET /api/recyclers`: CPCB authorized recyclers
- `GET /api/lots`: Incoming lots feed
- `POST /api/lots`: Register new lot
- `POST /api/lots/batch-sync`: Bulk sync offline drafts
- `POST /api/lots/:id/verify-handover`: Recycler re-weighing, anomaly detection, OTP verification, and CPCB Form-6 manifest creation
- `GET /api/ledger/:collector_id`: Passbook ledger records
- `GET /api/impact-metrics`: Live national mineral yield & economic indicators
