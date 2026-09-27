# Recycler Portal (CPCB / EPR Certified Handover Terminal)
### SIH Problem Statement ID 26229 – Ministry of Mines & JNARDDC

Official desktop dashboard for authorized e-waste recyclers complying with CPCB E-Waste (Management) Rules, 2022.

### Features
- **Real-Time Map & Radar Feed**: Incoming e-waste lots sorted by distance (km), hazard tags, and material categories.
- **EPR Certification Module**: Recycler CPCB credentials badge (`CPCB/EPR-2024/MH-0921`), ISO-17025 calibrated scale status.
- **Critical Mineral Recovery Analytics**: Recharts telemetry tracking recovered Copper (Cu), Lithium (Li), Cobalt (Co), and Rare-Earth Neodymium (Nd).
- **Lot Verification Terminal**:
  - Digital re-weighing terminal with tolerance monitoring.
  - **>10% Anomaly Detection**: Automatically flags weight discrepancies and recalculates fair pay.
  - **4-Digit Collector OTP Verification**: Prevents fraud and seals transaction.
  - **Payment Mode**: Instant Bank UPI or Direct Cash disbursement.
  - **CPCB Form-6 Manifest Generation**: Verifiable digital receipt with SHA-256 blockchain hash and QR code.

*Component Source: `frontend/src/components/recycler/*`*
