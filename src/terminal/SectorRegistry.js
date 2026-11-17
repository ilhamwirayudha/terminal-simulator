/**
 * ==============================================================================
 * SectorRegistry.js (Single Source of Truth: 5 Sektor Operasional Petikemas)
 * ==============================================================================
 *
 * Hanya area dengan aktivitas & data operasional petikemas yang terdaftar sebagai
 * sektor: Pre-Gate, Waiting CY (+ TR 2/4/5), Main Gate, Container Yard, & Dermaga.
 */

export const OPERATIONAL_SECTORS = [
  {
    id: 'PRE_GATE',
    code: '01',
    name: 'Pre-Gate',
    fullName: 'Pre-Gate (3 Jalur Portal WIM)',
    shortLabel: 'Pre-Gate',
    accentColor: '#38bdf8',
    bounds: [
      { xMin: 1.0, xMax: 16.9, zMin: 932.0, zMax: 978.0, yBase: 1.65, height: 14.0 }
    ],
    pinAnchor: { x: 9.0, y: 15.0, z: 945.0 },
    cameraView: {
      position: { x: 42.0, y: 24.0, z: 902.0 },
      target: { x: 8.5, y: 4.5, z: 955.0 }
    },
    statusLabel: 'TBS & WIM'
  },
  {
    id: 'WAITING_CY',
    code: '02',
    name: 'Waiting CY',
    fullName: 'Waiting CY & Blok Buffer TR (2, 4, 5)',
    shortLabel: 'Waiting CY',
    accentColor: '#22c55e',
    bounds: [
      // Waiting Area A/B (66 slot) + CY Blok TR 2 & TR 4
      { xMin: 17.0, xMax: 185.0, zMin: 775.0, zMax: 1034.4, yBase: 1.62, height: 16.0 },
      // CY Blok TR 5 (area parkir dump truck Cuker di X >= 88 dikecualikan)
      { xMin: 20.0, xMax: 86.0, zMin: 1034.4, zMax: 1145.0, yBase: 1.62, height: 14.0 }
    ],
    pinAnchor: { x: 95.0, y: 34.0, z: 1030.0 },
    cameraView: {
      position: { x: -42.0, y: 122.0, z: 735.0 },
      target: { x: 70.0, y: 3.0, z: 965.0 }
    },
    statusLabel: 'BUFFER & ANTREAN'
  },
  {
    id: 'MAIN_GATE',
    code: '03',
    name: 'Main Gate',
    fullName: 'Main Gate Petikemas',
    shortLabel: 'Main Gate',
    accentColor: '#f59e0b',
    bounds: [
      { xMin: -25.5, xMax: 25.5, zMin: 1555.0, zMax: 1665.0, yBase: 1.65, height: 16.0 }
    ],
    pinAnchor: { x: 0.0, y: 18.0, z: 1613.0 },
    cameraView: {
      position: { x: 48.0, y: 34.0, z: 1515.0 },
      target: { x: 0.0, y: 5.5, z: 1613.0 }
    },
    statusLabel: 'GATE IN / OUT'
  },
  {
    id: 'CONTAINER_YARD',
    code: '04',
    name: 'Container Yard',
    fullName: 'Container Yard Utama (CY)',
    shortLabel: 'CY Utama',
    accentColor: '#3b82f6',
    bounds: [
      { xMin: -676.1, xMax: -21.4, zMin: 1836.3, zMax: 2478.4, yBase: 1.65, height: 30.0 }
    ],
    pinAnchor: { x: -290.0, y: 32.0, z: 2180.0 },
    cameraView: {
      position: { x: 90.0, y: 245.0, z: 1755.0 },
      target: { x: -320.0, y: 8.0, z: 2180.0 }
    },
    statusLabel: 'STACKING & R/D'
  },
  {
    id: 'DERMAGA',
    code: '05',
    name: 'Dermaga',
    fullName: 'Dermaga Petikemas (Berth)',
    shortLabel: 'Dermaga',
    accentColor: '#ef4444',
    bounds: [
      { xMin: -640.0, xMax: 16.0, zMin: 3436.0, zMax: 3516.0, yBase: 3.22, height: 55.0 }
    ],
    pinAnchor: { x: -310.0, y: 46.0, z: 3476.0 },
    cameraView: {
      position: { x: 80.0, y: 155.0, z: 3245.0 },
      target: { x: -310.0, y: 16.0, z: 3476.0 }
    },
    statusLabel: 'BERTH & STS (MAX 10)'
  }
];

const SECTOR_BY_ID = new Map(OPERATIONAL_SECTORS.map((sector) => [sector.id, sector]));

export function getSectorById(id) {
  return SECTOR_BY_ID.get(id) || null;
}

export function isPointInSector(sector, x, z) {
  if (!sector || !Array.isArray(sector.bounds)) return false;
  return sector.bounds.some(
    (b) => x >= b.xMin && x <= b.xMax && z >= b.zMin && z <= b.zMax
  );
}

export function resolveOperationalSector(x, z) {
  for (let i = 0; i < OPERATIONAL_SECTORS.length; i++) {
    if (isPointInSector(OPERATIONAL_SECTORS[i], x, z)) {
      return OPERATIONAL_SECTORS[i];
    }
  }
  return null;
}
