/**
 * ==============================================================================
 * SimClock.js (Pemisah Mode Jam Operasional LIVE vs Mode Simulasi SIM)
 * ==============================================================================
 *
 * - Mode 'LIVE' (default): Mengikuti waktu asli perangkat (Date.now() / WIB) 1:1.
 * - Mode 'SIM' (sementara untuk pengembangan simulasi): Menyediakan kontrol
 *   Play/Pause, percepatan waktu (1x..30x), dan tombol sinkron ke waktu asli.
 */

const SHIFT_RANGES = [
  { name: 'S1', label: 'Shift 1', startHour: 8, endHour: 16 },
  { name: 'S2', label: 'Shift 2', startHour: 16, endHour: 24 },
  { name: 'S3', label: 'Shift 3', startHour: 0, endHour: 8 }
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function getPortShift(hour) {
  for (const s of SHIFT_RANGES) {
    if (hour >= s.startHour && hour < s.endHour) {
      return s;
    }
  }
  return SHIFT_RANGES[2];
}

export class SimClock {
  constructor() {
    this.mode = 'LIVE'; // 'LIVE' | 'SIM'
    this.isPlaying = true;
    this.speedMultiplier = 1;
    this.simTimeMs = Date.now();
    this.listeners = new Set();
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  _notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((cb) => cb(snapshot));
  }

  setMode(mode) {
    const next = mode === 'SIM' ? 'SIM' : 'LIVE';
    if (this.mode === next) return;

    this.mode = next;
    if (next === 'SIM') {
      // Mulai dari waktu asli saat beralih ke mode simulasi
      this.simTimeMs = Date.now();
      this.isPlaying = true;
    }
    this._notify();
  }

  toggleMode() {
    this.setMode(this.mode === 'LIVE' ? 'SIM' : 'LIVE');
  }

  setPlaying(playing) {
    if (this.mode !== 'SIM') return;
    this.isPlaying = Boolean(playing);
    this._notify();
  }

  togglePlay() {
    if (this.mode !== 'SIM') return;
    this.isPlaying = !this.isPlaying;
    this._notify();
  }

  setSpeed(multiplier) {
    if (!Number.isFinite(multiplier) || multiplier <= 0) return;
    this.speedMultiplier = multiplier;
    if (this.mode !== 'SIM') {
      this.mode = 'SIM';
      this.simTimeMs = Date.now();
    }
    this._notify();
  }

  syncToLive() {
    this.simTimeMs = Date.now();
    this._notify();
  }

  /**
   * Advances simulation clock and returns deltaTime to drive simulation systems.
   * @param {number} realDeltaTime - Seconds since previous frame
   * @returns {number} Effective delta time in seconds
   */
  update(realDeltaTime) {
    const clampedDelta = Math.min(Math.max(realDeltaTime || 0, 0), 0.1);

    if (this.mode === 'LIVE') {
      this.simTimeMs = Date.now();
      return clampedDelta;
    }

    if (!this.isPlaying) {
      return 0;
    }

    const simDelta = clampedDelta * this.speedMultiplier;
    this.simTimeMs += simDelta * 1000;
    return simDelta;
  }

  getDate() {
    return new Date(this.mode === 'LIVE' ? Date.now() : this.simTimeMs);
  }

  getSnapshot() {
    const date = this.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const shift = getPortShift(hours);

    const timeStr = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    const dateStr = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return {
      mode: this.mode,
      isPlaying: this.mode === 'LIVE' ? true : this.isPlaying,
      speedMultiplier: this.mode === 'LIVE' ? 1 : this.speedMultiplier,
      timeStr,
      dateStr,
      shiftCode: shift.name,
      shiftLabel: shift.label,
      timestampMs: date.getTime()
    };
  }
}
