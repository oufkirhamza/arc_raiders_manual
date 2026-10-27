/**
 * Content transcribed from "ARC Raiders Master Cheat Sheet v3.4" (u/pRoDeeD, 24 Mar 2026).
 * Item references use dataset ids so the build can cross-check every number against the
 * community dataset (see src/lib/crosscheck.ts). Values are kept exactly as printed.
 */
import type { Qty } from "@/lib/types";

export const pdfMeta = {
  title: "ARC Raiders Master Cheat Sheet",
  version: "v3.4",
  date: "2026-03-24",
  author: "u/pRoDeeD",
  pages: [
    "Master sheet: how to read the cards, Recycling Value Index (ROI), Expedition Projects 1–3",
    "Recycling cheat sheet: workshop upgrade materials, items to keep for quests",
    "High-priority components and their best recycling donors",
    "Keycard guide: where to use every key, by map",
    "Attachments guide: recoil, accuracy, noise, recovery times, magazine sizes",
  ],
};

/** Expedition Projects as printed (phases 1–4 items, phase 5 "Load Stage" coin values). */
export const pdfExpeditions: {
  projectId: string;
  label: string;
  note?: string;
  phases: { phase: number; name: string; items: Qty[] }[];
  loadStage: Record<string, number>;
}[] = [
  {
    projectId: "expedition_project_s1",
    label: "Expedition Project 1",
    phases: [
      { phase: 1, name: "Foundation", items: [{ id: "metal_parts", qty: 150 }, { id: "rubber_parts", qty: 200 }, { id: "arc_alloy", qty: 80 }, { id: "steel_spring", qty: 15 }] },
      { phase: 2, name: "Core Systems", items: [{ id: "durable_cloth", qty: 35 }, { id: "wires", qty: 30 }, { id: "electrical_components", qty: 30 }, { id: "cooling_fan", qty: 5 }] },
      { phase: 3, name: "Framework", items: [{ id: "light_bulb", qty: 5 }, { id: "battery", qty: 30 }, { id: "sensors", qty: 20 }, { id: "exodus_modules", qty: 1 }] },
      { phase: 4, name: "Outfitting", items: [{ id: "humidifier", qty: 5 }, { id: "advanced_electrical_components", qty: 5 }, { id: "magnetic_accelerator", qty: 3 }, { id: "leaper_pulse_unit", qty: 3 }] },
    ],
    loadStage: { "Combat items": 200000, "Survival items": 100000, Provisions: 150000, Materials: 300000 },
  },
  {
    projectId: "expedition_project",
    label: "Expedition Project 2",
    phases: [
      { phase: 1, name: "Foundation", items: [{ id: "metal_parts", qty: 150 }, { id: "rubber_parts", qty: 200 }, { id: "arc_alloy", qty: 80 }, { id: "steel_spring", qty: 15 }] },
      { phase: 2, name: "Core Systems", items: [{ id: "durable_cloth", qty: 35 }, { id: "wires", qty: 25 }, { id: "electrical_components", qty: 20 }, { id: "cooling_coil", qty: 4 }] },
      { phase: 3, name: "Framework", items: [{ id: "light_bulb", qty: 4 }, { id: "battery", qty: 30 }, { id: "shredder_gyro", qty: 10 }, { id: "exodus_modules", qty: 1 }] },
      { phase: 4, name: "Outfitting", items: [{ id: "frequency_modulation_box", qty: 5 }, { id: "advanced_electrical_components", qty: 5 }, { id: "ion_sputter", qty: 3 }, { id: "leaper_pulse_unit", qty: 3 }] },
    ],
    loadStage: { "Combat items": 200000, "Survival items": 100000, Provisions: 150000, Materials: 300000 },
  },
  {
    projectId: "expedition_project_s3",
    label: "Expedition Project 3",
    note: "Printed as “Closes May 4th”.",
    phases: [
      { phase: 1, name: "Foundation", items: [{ id: "metal_parts", qty: 150 }, { id: "chemicals", qty: 100 }, { id: "arc_alloy", qty: 80 }, { id: "steel_spring", qty: 15 }] },
      { phase: 2, name: "Core Systems", items: [{ id: "durable_cloth", qty: 30 }, { id: "wires", qty: 25 }, { id: "electrical_components", qty: 20 }, { id: "industrial_charger", qty: 3 }] },
      { phase: 3, name: "Framework", items: [{ id: "coffee_pot", qty: 1 }, { id: "battery", qty: 35 }, { id: "firefly_burner", qty: 5 }, { id: "exodus_modules", qty: 1 }] },
      { phase: 4, name: "Outfitting", items: [{ id: "broken_guidance_system", qty: 1 }, { id: "advanced_electrical_components", qty: 5 }, { id: "breathtaking_snow_globe", qty: 3 }, { id: "bombardier_cell", qty: 2 }] },
    ],
    loadStage: { "Combat items": 200000, "Survival items": 100000, Provisions: 150000, Materials: 300000 },
  },
];

/** Workshop upgrade costs as printed (levels 2–3; Scrappy levels 2–5). */
export const pdfWorkshop: { stationId: string; levels: { level: number; items: Qty[] }[] }[] = [
  { stationId: "weapon_bench", levels: [
    { level: 2, items: [{ id: "mechanical_components", qty: 5 }, { id: "rusted_tools", qty: 3 }, { id: "wasp_driver", qty: 8 }] },
    { level: 3, items: [{ id: "rusted_gear", qty: 3 }, { id: "advanced_mechanical_components", qty: 5 }, { id: "sentinel_firing_core", qty: 4 }] },
  ] },
  { stationId: "explosives_bench", levels: [
    { level: 2, items: [{ id: "pop_trigger", qty: 5 }, { id: "crude_explosives", qty: 5 }, { id: "synthesized_fuel", qty: 3 }] },
    { level: 3, items: [{ id: "laboratory_reagents", qty: 3 }, { id: "explosive_compound", qty: 5 }, { id: "rocketeer_driver", qty: 3 }] },
  ] },
  { stationId: "equipment_bench", levels: [
    { level: 2, items: [{ id: "electrical_components", qty: 5 }, { id: "power_cable", qty: 3 }, { id: "hornet_driver", qty: 5 }] },
    { level: 3, items: [{ id: "industrial_battery", qty: 3 }, { id: "advanced_electrical_components", qty: 5 }, { id: "bastion_cell", qty: 6 }] },
  ] },
  { stationId: "refiner", levels: [
    { level: 2, items: [{ id: "fireball_burner", qty: 8 }, { id: "arc_motion_core", qty: 5 }, { id: "toaster", qty: 3 }] },
    { level: 3, items: [{ id: "motor", qty: 3 }, { id: "arc_circuitry", qty: 10 }, { id: "bombardier_cell", qty: 6 }] },
  ] },
  { stationId: "med_station", levels: [
    { level: 2, items: [{ id: "tick_pod", qty: 8 }, { id: "durable_cloth", qty: 5 }, { id: "cracked_bioscanner", qty: 2 }] },
    { level: 3, items: [{ id: "rusted_shut_medical_kit", qty: 3 }, { id: "antiseptic", qty: 8 }, { id: "surveyor_vault", qty: 5 }] },
  ] },
  { stationId: "utility_bench", levels: [
    { level: 2, items: [{ id: "snitch_scanner", qty: 6 }, { id: "electrical_components", qty: 5 }, { id: "damaged_heat_sink", qty: 2 }] },
    { level: 3, items: [{ id: "fried_motherboard", qty: 3 }, { id: "advanced_electrical_components", qty: 5 }, { id: "leaper_pulse_unit", qty: 4 }] },
  ] },
  { stationId: "scrappy", levels: [
    { level: 2, items: [{ id: "dog_collar", qty: 1 }] },
    { level: 3, items: [{ id: "lemon", qty: 3 }, { id: "apricot", qty: 3 }] },
    { level: 4, items: [{ id: "prickly_pear", qty: 6 }, { id: "olives", qty: 6 }, { id: "cat_bed", qty: 1 }] },
    { level: 5, items: [{ id: "mushroom", qty: 12 }, { id: "apricot", qty: 12 }, { id: "very_comfortable_pillow", qty: 3 }] },
  ] },
];

/** "Keep for Quests" — 20 items the sheet recommends holding on to (printed quantities). */
export const pdfKeepForQuests: Qty[] = [
  { id: "magnetron", qty: 1 }, { id: "power_rod", qty: 1 }, { id: "rocketeer_driver", qty: 1 },
  { id: "leaper_pulse_unit", qty: 1 }, { id: "hornet_driver", qty: 2 }, { id: "surveyor_vault", qty: 1 },
  { id: "wasp_driver", qty: 2 }, { id: "antiseptic", qty: 2 }, { id: "water_pump", qty: 1 },
  { id: "flow_controller", qty: 1 }, { id: "syringe", qty: 1 }, { id: "snitch_scanner", qty: 2 },
  { id: "fertilizer", qty: 1 }, { id: "durable_cloth", qty: 1 }, { id: "great_mullein", qty: 1 },
  { id: "battery", qty: 3 }, { id: "arc_alloy", qty: 3 }, { id: "wires", qty: 11 },
  { id: "fireball_burner", qty: 1 }, { id: "burletta_i", qty: 1 },
];

/**
 * "High-Priority Components → Best Donors". `yield` is the printed "+N" (how many of the
 * component one donor recycles into); `best` marks the sheet's star ("best choice").
 */
export const pdfDonors: {
  componentId: string;
  group: "Essentials" | "High-tier" | "Core";
  donors: { id: string; yield: number; best?: boolean }[];
}[] = [
  { componentId: "rubber_parts", group: "Essentials", donors: [{ id: "arc_flex_rubber", yield: 16 }, { id: "rubber_pad", yield: 18 }] },
  { componentId: "plastic_parts", group: "Essentials", donors: [{ id: "ruined_riot_shield", yield: 10 }, { id: "arc_synthetic_resin", yield: 14 }] },
  { componentId: "chemicals", group: "Essentials", donors: [{ id: "cooling_coil", yield: 6 }, { id: "arc_coolant", yield: 16 }] },
  { componentId: "fabric", group: "Essentials", donors: [
    { id: "tattered_arc_lining", yield: 12 }, { id: "ruined_parachute", yield: 10, best: true }, { id: "torn_blanket", yield: 12, best: true },
    { id: "tattered_clothes", yield: 11 }, { id: "arc_thermo_lining", yield: 16, best: true }, { id: "spring_cushion", yield: 28, best: true },
  ] },
  { componentId: "metal_parts", group: "Essentials", donors: [
    { id: "ice_cream_scooper", yield: 7 }, { id: "garlic_press", yield: 12 }, { id: "frying_pan", yield: 8 },
    { id: "candle_holder", yield: 8 }, { id: "bicycle_pump", yield: 10 }, { id: "arc_performance_steel", yield: 7 },
  ] },
  { componentId: "advanced_mechanical_components", group: "High-tier", donors: [
    { id: "flow_controller", yield: 1 }, { id: "leaper_pulse_unit", yield: 2 }, { id: "microscope", yield: 1 }, { id: "mini_centrifuge", yield: 2, best: true },
  ] },
  { componentId: "advanced_electrical_components", group: "High-tier", donors: [
    { id: "spectrometer", yield: 1, best: true }, { id: "frequency_modulation_box", yield: 1, best: true }, { id: "telemetry_transceiver", yield: 1, best: true },
  ] },
  { componentId: "steel_spring", group: "Core", donors: [
    { id: "rusted_tools", yield: 1 }, { id: "spring_cushion", yield: 2, best: true }, { id: "cooling_coil", yield: 2 }, { id: "ruined_accordion", yield: 3, best: true },
  ] },
  { componentId: "magnet", group: "Core", donors: [
    { id: "exodus_modules", yield: 2 }, { id: "microscope", yield: 3, best: true }, { id: "ripped_safety_vest", yield: 1, best: true }, { id: "industrial_magnet", yield: 2 },
  ] },
  { componentId: "electrical_components", group: "Core", donors: [
    { id: "rotary_encoder", yield: 2 }, { id: "fried_motherboard", yield: 2, best: true }, { id: "signal_amplifier", yield: 2 }, { id: "hornet_driver", yield: 2, best: true },
  ] },
  { componentId: "mechanical_components", group: "Core", donors: [
    { id: "rusted_gear", yield: 2, best: true }, { id: "shredder_gyro", yield: 3, best: true }, { id: "turbo_pump", yield: 1 }, { id: "sentinel_firing_core", yield: 2 },
  ] },
  { componentId: "battery", group: "Core", donors: [
    { id: "broken_flashlight", yield: 2 }, { id: "geiger_counter", yield: 3 }, { id: "cracked_bioscanner", yield: 5, best: true },
    { id: "broken_taser", yield: 2 }, { id: "power_bank", yield: 2 }, { id: "portable_tv", yield: 2 },
  ] },
  { componentId: "wires", group: "Core", donors: [
    { id: "broken_handheld_radio", yield: 2 }, { id: "power_cable", yield: 4, best: true }, { id: "projector", yield: 2 }, { id: "portable_tv", yield: 6, best: true },
  ] },
];

/** "Uncategorized high priority components" on page 3. */
export const pdfHighPriority = ["processor", "voltage_converter", "explosive_compound", "oil", "duct_tape", "sensors"];

/** Keycard guide: which keys belong to which map (page 4). Map labels read from the sheet's map renders. */
export const pdfKeysByMap: { map: string; keys: string[]; pois: string[]; extra?: string }[] = [
  {
    map: "buried-city",
    keys: ["buried_city_town_hall_key", "buried_city_hospital_key", "buried_city_residential_master_key", "buried_city_jkv_employee_access_card"],
    pois: ["Gas Station", "Su Durante Warehouses", "Market Ruins", "Dunes End", "Library", "Parking Garage", "Galleria", "Marano Station", "Outskirts", "Warehouse", "Research", "Marano Park", "Buried Properties", "Town Hall", "Corso Da Vinci", "Maintenance Depot", "Grandioso Apartments", "Santa Maria Houses", "Piazza Arbusto", "Abandoned Highway Camp", "Main Street", "Red Tower", "Plaza Rosa", "Church Ruins"],
  },
  {
    map: "the-blue-gate",
    keys: ["blue_gate_confiscation_room_key", "blue_gate_communication_tower_key", "blue_gate_village_key", "blue_gate_cellar_key", "patrol_car_key"],
    pois: ["Village", "Barren Clearing", "Raider's Refuge", "Trapper's Glade", "Adorned Wreckage", "Data Vault", "Reinforced Reception", "Headhouse", "Warehouse Complex", "Gate Control Room", "Checkpoint", "Abandoned Housing Project", "Ridgeline", "Maintenance Bunker", "Broken Earth", "Highway Collapse", "Olive Grove", "Ruined Homestead"],
    extra: "Patrol Car Keys open the patrol cars marked across the map.",
  },
  {
    map: "the-spaceport",
    keys: ["spaceport_container_storage_key", "spaceport_warehouse_key", "spaceport_control_tower_key", "spaceport_trench_tower_key"],
    pois: ["Fuel Depot", "West Hangar", "East Hangar Tower", "Jiangsu Warehouse", "Shipping Warehouse", "South Trench Tower", "The Trench", "Arrival Building", "Little Hangar", "Water Towers", "Fuel Control", "Launch Towers", "Rocket Assembly", "Departure Building", "East Plains Warehouse", "Fuel Processing", "Fuel Lines", "Control Tower A6", "Container Storage", "Vehicle Maintenance", "Communications Tower", "Maintenance Hangar", "Fuel Storage", "Staff Parking", "Security Checkpoint", "Service Buildings", "Electrical Substation"],
  },
  {
    map: "dam-battlegrounds",
    keys: ["dam_control_tower_key", "dam_testing_annex_key", "dam_staff_room_key", "dam_surveillance_key"],
    pois: ["Pattern House", "Raider Outpost East", "Power Generation Complex", "East Broken Bridge", "Pipeline Tower", "Red Lakes Balcony", "Testing Annex", "Electrical Tower"],
    extra: "The sheet also marks a Power Rod–activated door on this map (the Power Rod is consumed like a key).",
  },
  {
    map: "stella-montis",
    keys: ["stella_montis_medical_storage_key", "stella_montis_archives_key", "stella_montis_assembly_admin_key", "stella_montis_security_checkpoint_key"],
    pois: ["Assembly Workshops", "Assembly Line", "Assembly", "Central Corridor", "Loading Bay", "Cargo Dock A", "Medical Research", "Viewing Deck"],
  },
];

/** Attachments guide (page 5). Percentages are relative changes to the stat named in `stat`. */
export interface AttachmentStat {
  stat: string;
  explainer: string;
  reducedBy?: string;
  mostEffective?: string[];
  rows: { id?: string; name: string; value: string; seconds?: string }[];
  baseline?: string;
  caveat?: string;
}

export const pdfAttachments: AttachmentStat[] = [
  {
    stat: "Horizontal recoil",
    explainer: "Side-to-side kick while firing.",
    reducedBy: "Muzzle Brake, Angled Grip",
    mostEffective: ["kettle", "stitcher", "bobcat"],
    rows: [
      { name: "No grip", value: "0%" },
      { id: "angled_grip_i", name: "Angled Grip I", value: "−20%" },
      { id: "angled_grip_ii", name: "Angled Grip II", value: "−30%" },
      { id: "angled_grip_iii", name: "Angled Grip III", value: "−40%" },
      { id: "horizontal_grip", name: "Horizontal Grip", value: "−30%" },
    ],
  },
  {
    stat: "Vertical recoil",
    explainer: "How far the gun climbs while firing.",
    reducedBy: "Muzzle Brake, Vertical Grip",
    mostEffective: ["kettle", "stitcher", "bobcat"],
    rows: [
      { name: "No grip", value: "0%" },
      { id: "vertical_grip_i", name: "Vertical Grip I", value: "−20%" },
      { id: "vertical_grip_ii", name: "Vertical Grip II", value: "−30%" },
      { id: "vertical_grip_iii", name: "Vertical Grip III", value: "−40%" },
      { id: "horizontal_grip", name: "Horizontal Grip", value: "−30%" },
    ],
  },
  {
    stat: "Bullet velocity",
    explainer: "Shoot further, with less travel time and less damage drop-off at range.",
    reducedBy: "— (increased by Extended Barrel)",
    mostEffective: ["ferro", "anvil", "osprey", "renegade"],
    rows: [
      { name: "No barrel", value: "0%" },
      { name: "Extended Barrel", value: "+25%" },
    ],
    caveat: "The sheet prints a single Extended Barrel; the dataset lists Extended Barrel I–III, so the tier this value belongs to is unconfirmed.",
  },
  {
    stat: "Noise reduction",
    explainer: "Suppresses gunshot noise and how audible/traceable your shots are.",
    reducedBy: "Silencer",
    rows: [
      { name: "No silencer", value: "0%" },
      { id: "silencer_i", name: "Silencer I", value: "20%" },
      { id: "silencer_ii", name: "Silencer II", value: "40%" },
      { id: "silencer_iii", name: "Silencer III", value: "60%" },
    ],
  },
  {
    stat: "Max-shot dispersion",
    explainer: "Lowers the maximum spread your gun can reach during sustained fire. Per-shot dispersion (extra spread added each shot) is also reduced by compensators.",
    reducedBy: "Compensator",
    rows: [
      { name: "No compensator", value: "0%" },
      { id: "compensator_i", name: "Compensator I", value: "−15%" },
      { id: "compensator_ii", name: "Compensator II", value: "−20%" },
      { id: "compensator_iii", name: "Compensator III", value: "−25%" },
    ],
  },
  {
    stat: "Dispersion recovery time",
    explainer: "How long it takes for the crosshair to shrink back to default.",
    reducedBy: "Stock",
    baseline: "1.33 s with no stock",
    rows: [
      { name: "No stock", value: "0", seconds: "1.33 s" },
      { id: "stable_stock_i", name: "Stable Stock I", value: "−0.13 s" },
      { id: "stable_stock_ii", name: "Stable Stock II", value: "−0.25 s" },
      { id: "stable_stock_iii", name: "Stable Stock III", value: "−0.38 s" },
    ],
  },
  {
    stat: "Recoil recovery time",
    explainer: "How long it takes for your aim to settle back after recoil.",
    reducedBy: "Stock",
    baseline: "2.05 s with no stock",
    rows: [
      { name: "No stock", value: "0%", seconds: "2.05 s" },
      { id: "stable_stock_i", name: "Stable Stock I", value: "−20%", seconds: "−0.16 s" },
      { id: "stable_stock_ii", name: "Stable Stock II", value: "−35%", seconds: "−0.27 s" },
      { id: "stable_stock_iii", name: "Stable Stock III", value: "−50%", seconds: "−0.36 s" },
      { id: "lightweight_stock", name: "Lightweight Stock", value: "+50%", seconds: "−0.35 s (printed)" },
    ],
    caveat: "The printed percentages and seconds do not line up (e.g. −20% of 2.05 s would be −0.41 s), and the Lightweight Stock shows +50% next to −0.35 s. The author notes frame-by-frame timings have a margin of error — treat these as directional.",
  },
  {
    stat: "Equip / unequip time",
    explainer: "How long it takes to swap to or away from the weapon.",
    baseline: "2.05 s printed baseline",
    rows: [
      { name: "No stock", value: "0%" },
      { id: "stable_stock_iii", name: "Stable Stock III", value: "+20%", seconds: "+0.25 s" },
      { id: "padded_stock", name: "Padded Stock", value: "+20%", seconds: "+0.25 s" },
      { id: "lightweight_stock", name: "Lightweight Stock", value: "−30%", seconds: "−0.35 s" },
    ],
  },
];

/** Magazine sizes per weapon family: [no mag, Extended I, II, III]. */
export const pdfMagazines: { ammo: "Light" | "Medium" | "Shotgun"; family: string; sizes: [number, number, number, number] }[] = [
  { ammo: "Light", family: "stitcher", sizes: [20, 25, 30, 35] },
  { ammo: "Light", family: "kettle", sizes: [20, 25, 30, 35] },
  { ammo: "Light", family: "hairpin", sizes: [8, 13, 18, 23] },
  { ammo: "Light", family: "burletta", sizes: [12, 17, 22, 27] },
  { ammo: "Light", family: "bobcat", sizes: [20, 25, 30, 35] },
  { ammo: "Medium", family: "arpeggio", sizes: [24, 28, 32, 36] },
  { ammo: "Medium", family: "venator", sizes: [10, 14, 18, 22] },
  { ammo: "Medium", family: "renegade", sizes: [8, 12, 16, 20] },
  { ammo: "Medium", family: "osprey", sizes: [8, 12, 16, 20] },
  { ammo: "Medium", family: "tempest", sizes: [25, 29, 33, 37] },
  { ammo: "Shotgun", family: "il_toro", sizes: [5, 7, 9, 11] },
  { ammo: "Shotgun", family: "vulcano", sizes: [6, 8, 10, 12] },
];

/** Sample sell/recycle values printed on the sheet, used to cross-check dataset values. */
export const pdfValues: Record<string, { sell: number; roi: number; stack?: number }> = {
  metal_parts: { sell: 75, roi: -25, stack: 50 },
  rubber_parts: { sell: 50, roi: -25, stack: 50 },
  durable_cloth: { sell: 640, roi: -53, stack: 10 },
  wires: { sell: 200, roi: -50, stack: 15 },
  light_bulb: { sell: 2000, roi: -25, stack: 3 },
  battery: { sell: 250, roi: -40, stack: 15 },
  humidifier: { sell: 1000, roi: 0, stack: 3 },
  advanced_electrical_components: { sell: 1750, roi: -52 },
  arc_alloy: { sell: 200, roi: -25, stack: 15 },
  steel_spring: { sell: 300, roi: -25, stack: 15 },
  electrical_components: { sell: 640, roi: -48, stack: 10 },
  cooling_fan: { sell: 2000, roi: -18, stack: 3 },
  sensors: { sell: 500, roi: -45, stack: 3 },
  exodus_modules: { sell: 2750, roi: -42, stack: 3 },
  magnetic_accelerator: { sell: 5500, roi: -50, stack: 3 },
  leaper_pulse_unit: { sell: 3000, roi: -22, stack: 3 },
  cooling_coil: { sell: 1000, roi: -10, stack: 3 },
  shredder_gyro: { sell: 3000, roi: -16, stack: 3 },
  ion_sputter: { sell: 6000, roi: -21, stack: 3 },
  frequency_modulation_box: { sell: 3000, roi: -25, stack: 3 },
  wasp_driver: { sell: 640, roi: 63, stack: 3 },
  mechanical_components: { sell: 640, roi: -49 },
  rusted_tools: { sell: 1000, roi: -10, stack: 3 },
  synthesized_fuel: { sell: 700, roi: -50, stack: 5 },
  magnetron: { sell: 6000, roi: -3, stack: 3 },
  fertilizer: { sell: 1000, roi: -80, stack: 5 },
  processor: { sell: 500, roi: -48, stack: 5 },
  voltage_converter: { sell: 500, roi: -50, stack: 5 },
  explosive_compound: { sell: 1000, roi: -46, stack: 5 },
  oil: { sell: 300, roi: -50, stack: 15 },
  duct_tape: { sell: 300, roi: -50, stack: 15 },
  bombardier_cell: { sell: 3000, roi: -22, stack: 3 },
};
