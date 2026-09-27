/**
 * Backend Database Layer - Native Embedded SQLite (Node.js 24 DatabaseSync)
 * SIH Problem Statement ID 26229: Kabadiwala Connect
 * Ministry of Mines & JNARDDC E-Waste Formalization Chain
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'ecoscarp.sqlite');

let db = null;

export function getDb() {
  if (db) return db;

  try {
    db = new DatabaseSync(dbPath);
    console.log('✅ Connected to SQLite via Node.js native DatabaseSync at', dbPath);
    initTables(db);
    seedInitialData(db);
    return db;
  } catch (err) {
    console.error('Failed to initialize SQLite database:', err);
    throw err;
  }
}

function initTables(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS material_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      vernacular_hi TEXT NOT NULL,
      vernacular_mr TEXT NOT NULL,
      hazard_level TEXT NOT NULL,
      hazard_voice_prompt_hi TEXT NOT NULL,
      hazard_voice_prompt_mr TEXT NOT NULL,
      base_market_price_per_kg REAL NOT NULL,
      critical_minerals TEXT DEFAULT '',
      typical_recovery_rate TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS price_dataset (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      city_pincode TEXT NOT NULL,
      city_name TEXT NOT NULL,
      buying_rate_min REAL NOT NULL,
      buying_rate_max REAL NOT NULL,
      date_updated TEXT NOT NULL,
      trend TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS authorized_recyclers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_name TEXT NOT NULL,
      cpcb_epr_id TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      service_radius_km REAL NOT NULL,
      accepted_categories TEXT NOT NULL,
      base_rating REAL DEFAULT 4.8
    );

    CREATE TABLE IF NOT EXISTS material_lots (
      lot_id TEXT PRIMARY KEY,
      collector_id TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      est_weight_kg REAL NOT NULL,
      verified_weight_kg REAL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'SYNCED',
      quoted_amount REAL NOT NULL,
      final_amount REAL,
      geo_lat REAL NOT NULL,
      geo_lng REAL NOT NULL,
      verification_otp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      handover_at TEXT
    );

    CREATE TABLE IF NOT EXISTS earnings_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id TEXT NOT NULL,
      collector_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
}

function seedInitialData(database) {
  try {
    const row = database.prepare('SELECT count(*) as count FROM material_catalog').get();
    if (row && row.count > 0) {
      return; // Already populated
    }
  } catch {
    // Continue seeding
  }

  console.log('🌱 Seeding initial Indian e-waste formal market dataset...');

  // 1. Seed Material Catalog
  const insertMaterial = database.prepare(`
    INSERT INTO material_catalog (
      id, category_name, vernacular_hi, vernacular_mr, hazard_level,
      hazard_voice_prompt_hi, hazard_voice_prompt_mr, base_market_price_per_kg,
      critical_minerals, typical_recovery_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const materials = [
    [
      1,
      "High-Grade PCB / Motherboard",
      "उच्च श्रेणी पीसीबी / मदरबोर्ड",
      "हाय-ग्रेड पीसीबी / मदरबोर्ड",
      "SAFE",
      "मदरबोर्ड सुरक्षित है। इसमें सोना, तांबा और चांदी जैसी कीमती धातुएं होती हैं।",
      "मदरबोर्ड हाताळण्यास सुरक्षित आहे. यात सोने, तांबे आणि मौल्यवान धातू असतात.",
      220.0,
      "Gold (Au), Copper (Cu), Palladium (Pd)",
      "0.28g Au, 140g Cu per kg"
    ],
    [
      2,
      "Lithium-Ion Battery Packs",
      "लिथियम-आयन बैटरी पैक",
      "लिथियम-आयन बॅटरी पॅक",
      "HIGH_HAZARD",
      "सावधान! बैटरी को कभी न जलाएं और न ही तोड़ें! इससे जहरीला एसिड और आग लग सकती है!",
      "सावधान! बॅटरी कधीही जाळू नका किंवा फोडू नका! विषारी वायू आणि आगीचा मोठा धोका!",
      110.0,
      "Lithium (Li), Cobalt (Co), Nickel (Ni)",
      "70g Li, 120g Co per kg"
    ],
    [
      3,
      "CRT Monitor / Glass Yoke",
      "सीआरटी मॉनिटर / ग्लास योक",
      "सीआरटी मॉनिटर / ग्लास योक",
      "HIGH_HAZARD",
      "खतरा! सीआरटी शीशे में जहरीला सीसा और फास्फोरस होता है। इसे बच्चों और पानी से दूर रखें!",
      "धोका! सीआरटी काचेमध्ये विषारी शिसे असते. उघड्यावर फोडल्यास फुफ्फुसांचे नुकसान!",
      18.0,
      "Lead (Pb), Copper Yoke (Cu)",
      "1.2kg Pb, 450g Cu per unit"
    ],
    [
      4,
      "Copper Cables & Wiring",
      "तांबे के तार और केबल",
      "तांब्याची वायर आणि केबल्स",
      "SAFE",
      "तांबे की तार को आग में न जलाएं। छीलकर बेचने पर पूरा और सही भाव मिलता है।",
      "तांब्याची वायर आगीत जाळू नका. प्लास्टिक न जाळता थेट पुनर्चक्रण केंद्राला द्या.",
      380.0,
      "Refined Copper (Cu), PVC",
      "680g Pure Cu per kg"
    ],
    [
      5,
      "Hard Drives & Neodymium Motors",
      "हार्ड डिस्क और नियोडिमियम चुंबक",
      "हार्ड ड्राईव्ह आणि निओडिमियम मॅग्नेट",
      "SAFE",
      "हार्ड डिस्क से नियोडिमियम रेयर-अर्थ चुंबक निकलता है। इसका भाव बहुत अधिक है।",
      "हार्ड ड्राईव्हमधून दुर्मिळ निओडिमियम चुंबक निघते. खाण मंत्रालयासाठी अतिमहत्त्वाचे.",
      140.0,
      "Neodymium (Nd), Dysprosium (Dy), Aluminum",
      "14g Nd, 290g Al per unit"
    ],
    [
      6,
      "Mixed E-Plastics",
      "मिश्रित ई-कचरा प्लास्टिक",
      "मिश्र ई-कचरा प्लॅस्टिक",
      "SAFE",
      "इलेक्ट्रॉनिक प्लास्टिक को सादे कचरे में न फेंके। इसे रीसायकलर को दें।",
      "ई-प्लॅस्टिक कचरा वेगळा ठेवा. अधिकृत रिसायकलिंगसाठी पाठवा.",
      25.0,
      "Flame Retardant ABS, Polycarbonate",
      "95% Recycled Pellets"
    ]
  ];

  for (const m of materials) {
    insertMaterial.run(...m);
  }

  // 2. Seed Regional Prices
  const insertPrice = database.prepare(`
    INSERT INTO price_dataset (category_id, city_pincode, city_name, buying_rate_min, buying_rate_max, date_updated, trend)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const prices = [
    [1, "440001", "Nagpur (JNARDDC Zone)", 215.0, 235.0, "2026-09-27", "UP"],
    [2, "440001", "Nagpur (JNARDDC Zone)", 105.0, 118.0, "2026-09-27", "UP"],
    [3, "440001", "Nagpur (JNARDDC Zone)", 16.0, 20.0, "2026-09-27", "STABLE"],
    [4, "440001", "Nagpur (JNARDDC Zone)", 370.0, 395.0, "2026-09-27", "UP"],
    [5, "440001", "Nagpur (JNARDDC Zone)", 135.0, 148.0, "2026-09-27", "UP"],
    [6, "440001", "Nagpur (JNARDDC Zone)", 22.0, 28.0, "2026-09-27", "STABLE"],

    [1, "400001", "Mumbai Metropolitan", 225.0, 245.0, "2026-09-27", "UP"],
    [2, "400001", "Mumbai Metropolitan", 112.0, 125.0, "2026-09-27", "UP"],
    [4, "400001", "Mumbai Metropolitan", 385.0, 410.0, "2026-09-27", "UP"],

    [1, "411001", "Pune Smart City", 218.0, 238.0, "2026-09-27", "UP"],
    [2, "411001", "Pune Smart City", 108.0, 120.0, "2026-09-27", "STABLE"],
    [4, "411001", "Pune Smart City", 375.0, 398.0, "2026-09-27", "UP"]
  ];

  for (const p of prices) {
    insertPrice.run(...p);
  }

  // 3. Seed Authorized Recyclers
  const insertRecycler = database.prepare(`
    INSERT INTO authorized_recyclers (id, facility_name, cpcb_epr_id, phone, lat, lng, service_radius_km, accepted_categories, base_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const recyclers = [
    [
      1,
      "JNARDDC Advanced Metallurgical Center",
      "CPCB/EPR-2024/MH-0921",
      "+91 712 2365821",
      21.1458,
      79.0882,
      45.0,
      JSON.stringify([1, 2, 3, 4, 5, 6]),
      4.95
    ],
    [
      2,
      "EcoMetals Formal Green Smelter Pvt Ltd",
      "CPCB/EPR-2024/MH-1104",
      "+91 98220 54321",
      21.1215,
      79.0512,
      35.0,
      JSON.stringify([1, 2, 4, 5]),
      4.85
    ],
    [
      3,
      "Vidarbha Clean Tech E-Waste Park",
      "CPCB/EPR-2025/MH-0477",
      "+91 94221 88990",
      21.1780,
      79.1120,
      30.0,
      JSON.stringify([2, 3, 6]),
      4.78
    ]
  ];

  for (const r of recyclers) {
    insertRecycler.run(...r);
  }

  // 4. Seed Material Lots
  const insertLot = database.prepare(`
    INSERT INTO material_lots (
      lot_id, collector_id, category_id, est_weight_kg, verified_weight_kg,
      image_url, status, quoted_amount, final_amount, geo_lat, geo_lng,
      verification_otp, created_at, handover_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleLots = [
    [
      "LOT-2026-X89",
      "COL-MUM-402",
      1,
      5.0,
      5.2,
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      "HANDOVER_VERIFIED",
      1100.0,
      1144.0,
      21.1462,
      79.0885,
      "4821",
      "2026-09-26T10:15:00Z",
      "2026-09-26T14:30:00Z"
    ],
    [
      "LOT-2026-M42",
      "COL-NGP-108",
      2,
      8.0,
      null,
      "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=600&q=80",
      "SYNCED",
      880.0,
      null,
      21.1420,
      79.0850,
      "7394",
      "2026-09-27T08:20:00Z",
      null
    ],
    [
      "LOT-2026-C19",
      "COL-NGP-108",
      4,
      12.0,
      null,
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
      "BID_ACCEPTED",
      4560.0,
      null,
      21.1510,
      79.0910,
      "1256",
      "2026-09-27T09:45:00Z",
      null
    ]
  ];

  for (const l of sampleLots) {
    insertLot.run(...l);
  }

  // 5. Seed Earnings Ledger
  const insertLedger = database.prepare(`
    INSERT INTO earnings_ledger (lot_id, collector_id, amount, payment_mode, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const ledgerEntries = [
    ["LOT-2026-X89", "COL-MUM-402", 1144.0, "UPI", "SETTLED", "2026-09-26T14:31:00Z"],
    ["LOT-2026-C19", "COL-NGP-108", 4560.0, "CASH", "PENDING", "2026-09-27T09:45:00Z"]
  ];

  for (const le of ledgerEntries) {
    insertLedger.run(...le);
  }

  console.log('✅ SQLite database initialized and seeded successfully.');
}
