# ML Pipeline: Edge-Inference E-Waste Classifier Module
### SIH Problem Statement ID 26229 – Ministry of Mines & JNARDDC

Client-side on-device image classification module providing edge inference for e-waste formalization into 6 critical categories:

1. **High-Grade PCB / Motherboard** (Gold, Copper, Palladium recovery)
2. **Lithium-Ion Battery Packs** (HIGH HAZARD: Lithium, Cobalt, Nickel recovery; fire & acid alert)
3. **CRT Monitor / Glass Yoke** (HIGH HAZARD: Leaded glass & copper yoke; toxic fumes alert)
4. **Copper Cables & Wiring** (Refined pure copper yield)
5. **Hard Drives & Neodymium Motors** (Rare-earth permanent magnets, High-grade Aluminum)
6. **Mixed E-Plastics** (Engineering ABS & Polycarbonate pelletization)

### Module Exports:
- `classifyEWasteImage(imageInput, categoryHintId)`
- `EWASTE_CATEGORIES`: Catalog definitions with hazard levels, vernacular voice prompts, and critical mineral recovery benchmarks.
- `SAMPLE_PRESETS`: High-fidelity sample images for instant field testing and offline presentations.

*Source: `ml-pipeline/classifier.js`*
