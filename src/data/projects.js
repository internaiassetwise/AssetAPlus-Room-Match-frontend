// src/data/projects.js — Zone → project (condo) hierarchy.
//
// Curated list of AssetWise properties, grouped by zone. Used by the admin
// room form's cascading dropdown: select a zone → see only its projects.
// Update this list when new properties are added.

export const ZONE_PROJECTS = {
  'ลาดพร้าว': [
    'Atmoz Ladprao 71',
    'Atmoz Palacio Ladprao-Wanghin',
    'Atmoz Ladprao 15',
  ],
  'รัชดา-ห้วยขวาง': [
    'Atmoz Ratchada-Huaikwang',
  ],
  'ศรีสมาน': [
    'Atmoz Portrait Srisaman',
  ],
  'อ่อนนุช': [
    'Atmoz Oasis Onnut',
  ],
  'เกษตร': [
    'Modiz Vault Kaset – Sripatum',
    'Kave Seed Kaset',
  ],
  'แจ้งวัฒนะ': [
    'Atmoz Chaengwattana',
  ],
  'ศาลายา': [
    'Kave Mutant Salaya',
    'Kave Pop Salaya',
  ],
  'นครปฐม': [
    'Kave Genesis Nakorn Pathom',
  ],
}

/** All zones in display order. */
export const ZONE_NAMES = Object.keys(ZONE_PROJECTS)

/**
 * Get the project list for a zone name. Returns [] for unknown zones
 * (the form falls back to free-text input in that case).
 */
export function projectsForZone(zoneName) {
  return ZONE_PROJECTS[zoneName] || []
}
