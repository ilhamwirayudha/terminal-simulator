/**
 * ==============================================================================
 * SectorDataStore.js (Sumber Data Aktivitas & Kesiapan Alat 5 Sektor)
 * ==============================================================================
 *
 * Menyimpan state operasional real-time (atau standby sebelum simulasi aktif)
 * sesuai batas kapasitas alat resmi Terminal Teluk Lamong:
 * - STS (Ship-to-Shore / CC): max 10 (semua dapat dialokasikan ke petikemas)
 * - ASC (Automated Stacking Crane): max 20
 * - RTG (Rubber Tyred Gantry): max 2
 * - RS (Reach Stacker): max 5
 * - EH (Empty Handler): max 2
 */

export const EQUIPMENT_LIMITS = {
  STS: 10,
  ASC: 20,
  RTG: 2,
  RS: 5,
  EH: 2
};

function createInitialState() {
  return {
    PRE_GATE: {
      portalsTotal: 3, // Hanya 3 lajur petikemas berportal WIM (jalur umum/cuker tanpa portal tidak dihitung)
      portalsReady: 3,
      activeChecking: 0,
      passedToMainGate: 0,
      divertedToWaiting: 0,
      lastEvent: 'Menunggu kedatangan truk eksternal (TBS)'
    },
    WAITING_CY: {
      slotCapacity: 66,
      waitingTrucks: 0,
      resolvedExited: 0,
      bufferContainersHandled: 0,
      equipment: {
        rsActive: 0,
        rsReady: EQUIPMENT_LIMITS.RS,
        ehActive: 0,
        ehReady: EQUIPMENT_LIMITS.EH
      }
    },
    MAIN_GATE: {
      activeInGate: 0,
      activeOutGate: 0,
      completedIn: 0,
      completedOut: 0,
      avgDwellSec: 0,
      lastTruck: null // { truckId, containerNo, direction: 'IN'|'OUT', lane, jobOrder, block, timeStr }
    },
    CONTAINER_YARD: {
      activeExternalJobs: 0, // Receiving / Delivery
      activeInternalJobs: 0, // Load / Discharge (CY <-> Dermaga)
      completedBoxes: 0,
      yorPercent: 0,
      equipment: {
        ascActive: 0,
        ascReady: EQUIPMENT_LIMITS.ASC,
        rtgActive: 0,
        rtgReady: EQUIPMENT_LIMITS.RTG,
        rsActive: 0,
        rsReady: EQUIPMENT_LIMITS.RS,
        ehActive: 0,
        ehReady: EQUIPMENT_LIMITS.EH
      }
    },
    DERMAGA: {
      pierLengthM: 656,
      borPercent: 0, // Berth Occupancy Ratio (%)
      borDomPercent: 0,
      borIntPercent: 0,
      stsAllocated: 0,
      stsReady: EQUIPMENT_LIMITS.STS,
      stsMax: EQUIPMENT_LIMITS.STS,
      totalDischarged: 0,
      totalLoaded: 0,
      vessels: [] // { id, name, berthSide: 'INT'|'DOM', lengthM, allocatedSts, dischargeDone, dischargeTotal, loadDone, loadTotal }
    }
  };
}

export class SectorDataStore {
  constructor() {
    this.state = createInitialState();
    this.listeners = new Set();
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  _notify() {
    this.listeners.forEach((cb) => cb(this.state));
  }

  getSectorData(sectorId) {
    return this.state[sectorId] || null;
  }

  getState() {
    return this.state;
  }

  /**
   * Returns a 1-line concise readout for the 3D floating sector pin.
   */
  getPinSummary(sectorId) {
    const d = this.state[sectorId];
    if (!d) return '';

    switch (sectorId) {
      case 'PRE_GATE':
        return `${d.activeChecking} cek · ${d.portalsReady}/${d.portalsTotal} Portal`;
      case 'WAITING_CY':
        return `${d.waitingTrucks}/${d.slotCapacity} antre · ${d.resolvedExited} selesai`;
      case 'MAIN_GATE':
        return `In ${d.completedIn} · Out ${d.completedOut}`;
      case 'CONTAINER_YARD': {
        const jobs = d.activeExternalJobs + d.activeInternalJobs;
        return `${jobs} job · ASC ${d.equipment.ascReady}/${EQUIPMENT_LIMITS.ASC}`;
      }
      case 'DERMAGA':
        return `BOR ${d.borPercent.toFixed(0)}% · STS ${d.stsAllocated}/${d.stsMax}`;
      default:
        return '';
    }
  }

  reset() {
    this.state = createInitialState();
    this._notify();
  }
}
