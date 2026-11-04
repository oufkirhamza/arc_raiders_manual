import type { MapPin } from "@/lib/types";

/**
 * Where each key is used, as fractions (0–1) of the site's map image.
 *
 * Read from the keycard page of the v3.4 cheat sheet: pins were detected by colour, matched to key
 * cards by their colour and number, and carried onto the site's map images by correlating the two
 * renders. `image` selects a level on multi-image maps (Stella Montis: 1 = lower).
 * The editor can correct these from the back office; those changes are stored as item edits.
 */
export const keyLocations: Record<string, MapPin[]> = {
  buried_city_town_hall_key: [
    { map: "buried-city", x: 0.5316, y: 0.5063, label: "Town Hall" },
  ],
  buried_city_hospital_key: [
    { map: "buried-city", x: 0.4941, y: 0.2865, label: "Hospital" },
  ],
  buried_city_residential_master_key: [
    { map: "buried-city", x: 0.2846, y: 0.6199, label: "Grandioso Apartments" },
    { map: "buried-city", x: 0.5968, y: 0.6597, label: "Red Tower" },
  ],
  buried_city_jkv_employee_access_card: [
    { map: "buried-city", x: 0.5703, y: 0.4047, label: "Research" },
  ],
  blue_gate_confiscation_room_key: [
    { map: "the-blue-gate", x: 0.4999, y: 0.4004, label: "Below Reinforced Reception" },
  ],
  blue_gate_communication_tower_key: [
    { map: "the-blue-gate", x: 0.6926, y: 0.3491, label: "Communication Tower" },
  ],
  blue_gate_village_key: [
    { map: "the-blue-gate", x: 0.3517, y: 0.3293, label: "Village" },
  ],
  blue_gate_cellar_key: [
    { map: "the-blue-gate", x: 0.3053, y: 0.4386, label: "Trapper's Glade" },
  ],
  spaceport_container_storage_key: [
    { map: "the-spaceport", x: 0.5738, y: 0.5416, label: "Container Storage" },
  ],
  spaceport_warehouse_key: [
    { map: "the-spaceport", x: 0.4443, y: 0.3, label: "Shipping Warehouse" },
  ],
  spaceport_control_tower_key: [
    { map: "the-spaceport", x: 0.4866, y: 0.5217, label: "Control Tower A6" },
  ],
  spaceport_trench_tower_key: [
    { map: "the-spaceport", x: 0.5315, y: 0.2848, label: "South Trench Tower" },
  ],
  dam_control_tower_key: [
    { map: "dam-battlegrounds", x: 0.5371, y: 0.5079, label: "Control Tower" },
  ],
  dam_testing_annex_key: [
    { map: "dam-battlegrounds", x: 0.6, y: 0.6172, label: "Testing Annex" },
  ],
  dam_staff_room_key: [
    { map: "dam-battlegrounds", x: 0.5226, y: 0.5371, label: "Staff Room" },
  ],
  dam_surveillance_key: [
    { map: "dam-battlegrounds", x: 0.396, y: 0.4822, label: "Water Treatment Control" },
  ],
  power_rod: [
    { map: "dam-battlegrounds", x: 0.6436, y: 0.3485, label: "Power Rod door" },
  ],
  stella_montis_medical_storage_key: [
    { map: "stella-montis", image: 1, x: 0.1033, y: 0.5189, label: "Medical Research" },
  ],
  stella_montis_archives_key: [
    { map: "stella-montis", image: 1, x: 0.8912, y: 0.4281, label: "Storage Room" },
  ],
  stella_montis_assembly_admin_key: [
    { map: "stella-montis", image: 1, x: 0.3624, y: 0.2785, label: "Assembly" },
  ],
  stella_montis_security_checkpoint_key: [
    { map: "stella-montis", image: 1, x: 0.664, y: 0.3211, label: "Security Bridge" },
  ],
};
