import { OPERATIONAL_SECTORS, getSectorById } from '../terminal/SectorRegistry.js';

const MAP_VIEWPORTS = {
  OPS: { zMin: 700, zMax: 3640, xMin: -740, xMax: 260, labels: ['PRE-GATE', 'MAIN GATE · CY', 'DERMAGA'] },
  FULL: { zMin: -1250, zMax: 3700, xMin: -770, xMax: 430, labels: ['DARAT', 'PRE-GATE · CY', 'DERMAGA'] }
};

// Landmark konteks non-sektor (digambar sangat samar agar orientasi mudah)
const CONTEXT_LANDMARKS = [
  { xMin: -182, xMax: -13.3, zMin: 598, zMax: 775 }, // Head Office
  { xMin: 13.3, xMax: 175, zMin: 570, zMax: 775 },   // Utilitas
  { xMin: 21.4, xMax: 363.2, zMin: 2117.6, zMax: 2482.1 }, // Curah Kering
  { xMin: 16.0, xMax: 265.5, zMin: 3430, zMax: 3516 } // Pier Cuker
];

/**
 * ==============================================================================
 * NavigationHUD.js (Bar Sektor, Jam LIVE/SIM, Pin 3D & Mini-Map OPS/FULL)
 * ==============================================================================
 */
export class NavigationHUD {
  constructor({ camera, cameraManager, simClock, onSelectSector, onTogglePins }) {
    this.camera = camera;
    this.cameraManager = cameraManager;
    this.simClock = simClock;
    this.onSelectSector = onSelectSector;
    this.onTogglePins = onTogglePins;

    this.activeSectorId = null;
    this.lastClockText = '';
    this.lastMinimapDraw = 0;
    this.minimapMode = 'OPS'; // 'OPS' | 'FULL'

    // Sector tabs
    this.tabsContainer = document.getElementById('sector-tabs-container');
    this.sectorButtons = new Map();

    // Clock UI
    this.btnModeLive = document.getElementById('btn-clock-live');
    this.btnModeSim = document.getElementById('btn-clock-sim');
    this.clockDot = document.getElementById('clock-live-dot');
    this.clockTimeEl = document.getElementById('clock-time-val');
    this.clockShiftEl = document.getElementById('clock-shift-val');
    this.simControlsEl = document.getElementById('sim-clock-controls');
    this.btnSimPlay = document.getElementById('btn-sim-play');
    this.btnSimSync = document.getElementById('btn-sim-sync');
    this.speedButtons = document.querySelectorAll('.btn-sim-speed');

    // Camera Mode & Pin Toggle UI
    this.btnCamDrone = document.getElementById('btn-cam-drone');
    this.btnCamPov = document.getElementById('btn-cam-pov');
    this.btnCamReset = document.getElementById('btn-reset-camera');
    this.btnTogglePins = document.getElementById('btn-toggle-pins');

    // Mini-Map
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.minimapTooltip = document.getElementById('minimap-tooltip');
    this.minimapAxisEl = document.getElementById('minimap-axis-labels');
    this.btnMapOps = document.getElementById('btn-minimap-ops');
    this.btnMapFull = document.getElementById('btn-minimap-full');
    this.minimapSectorRects = [];

    this._renderSectorTabs();
    this._setupClockControls();
    this._setupCameraControls();
    this._setupMinimap();

    this.syncClockUI(this.simClock.getSnapshot());
    this.syncCameraModeUI(this.cameraManager.getMode());
    this.syncMinimapModeUI();
  }

  _renderSectorTabs() {
    if (!this.tabsContainer) return;
    this.tabsContainer.replaceChildren();

    OPERATIONAL_SECTORS.forEach((sector, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sector-tab-btn';
      btn.dataset.sectorId = sector.id;
      btn.style.setProperty('--sector-accent', sector.accentColor);
      btn.title = `[${idx + 1}] ${sector.fullName} — Klik untuk arahkan kamera & baca data`;

      const dot = document.createElement('span');
      dot.className = 'sector-tab-dot';
      dot.style.backgroundColor = sector.accentColor;

      const label = document.createElement('span');
      label.textContent = sector.shortLabel;

      btn.appendChild(dot);
      btn.appendChild(label);

      btn.addEventListener('click', () => {
        if (typeof this.onSelectSector === 'function') {
          this.onSelectSector(sector.id);
        }
      });

      this.tabsContainer.appendChild(btn);
      this.sectorButtons.set(sector.id, btn);
    });
  }

  setActiveSector(sectorId) {
    this.activeSectorId = sectorId || null;
    this.sectorButtons.forEach((btn, id) => {
      btn.classList.toggle('active', id === this.activeSectorId);
    });
    this._drawMinimap(true);
  }

  _setupClockControls() {
    this.btnModeLive?.addEventListener('click', () => this.simClock.setMode('LIVE'));
    this.btnModeSim?.addEventListener('click', () => this.simClock.setMode('SIM'));
    this.btnSimPlay?.addEventListener('click', () => this.simClock.togglePlay());
    this.btnSimSync?.addEventListener('click', () => this.simClock.syncToLive());

    this.speedButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mult = parseFloat(btn.dataset.speed);
        if (Number.isFinite(mult)) {
          this.simClock.setSpeed(mult);
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      const tag = (e.target || document.activeElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space' && this.simClock.mode === 'SIM' && !e.repeat) {
        e.preventDefault();
        this.simClock.togglePlay();
      }
    });

    this.simClock.onChange((snapshot) => this.syncClockUI(snapshot));
  }

  syncClockUI(snapshot) {
    const isLive = snapshot.mode === 'LIVE';
    this.btnModeLive?.classList.toggle('active', isLive);
    this.btnModeSim?.classList.toggle('active', !isLive);

    if (this.clockDot) {
      this.clockDot.classList.toggle('is-live', isLive);
      this.clockDot.classList.toggle('is-paused', !isLive && !snapshot.isPlaying);
    }

    if (this.simControlsEl) {
      this.simControlsEl.classList.toggle('is-hidden', isLive);
    }

    if (this.btnSimPlay) {
      this.btnSimPlay.innerHTML = snapshot.isPlaying
        ? '<svg viewBox="0 0 12 12" width="10" height="10"><rect x="2" y="1.5" width="2.8" height="9" fill="currentColor"/><rect x="7.2" y="1.5" width="2.8" height="9" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 12 12" width="10" height="10"><polygon points="2.5,1.5 10.5,6 2.5,10.5" fill="currentColor"/></svg>';
      this.btnSimPlay.title = snapshot.isPlaying ? 'Jeda Simulasi (Space)' : 'Lanjutkan Simulasi (Space)';
    }

    this.speedButtons.forEach((btn) => {
      const mult = parseFloat(btn.dataset.speed);
      btn.classList.toggle('active', !isLive && mult === snapshot.speedMultiplier);
    });

    this._renderClockReadout(snapshot);
  }

  _renderClockReadout(snapshot) {
    const key = `${snapshot.timeStr}|${snapshot.shiftCode}|${snapshot.mode}`;
    if (key === this.lastClockText) return;
    this.lastClockText = key;

    if (this.clockTimeEl) {
      this.clockTimeEl.textContent = snapshot.timeStr;
    }
    if (this.clockShiftEl) {
      this.clockShiftEl.textContent = snapshot.shiftCode;
      this.clockShiftEl.title = `${snapshot.shiftLabel} (${snapshot.dateStr})`;
    }
  }

  _setupCameraControls() {
    this.btnCamDrone?.addEventListener('click', () => this.cameraManager.setMode('DRONE'));
    this.btnCamPov?.addEventListener('click', () => this.cameraManager.setMode('POV'));
    this.btnCamReset?.addEventListener('click', () => this.cameraManager.resetToOverview());

    if (this.btnTogglePins) {
      this.btnTogglePins.addEventListener('click', () => {
        if (typeof this.onTogglePins === 'function') {
          const next = this.onTogglePins();
          this.btnTogglePins.classList.toggle('active', next);
        }
      });
    }

    this.cameraManager.onModeChange = (mode) => this.syncCameraModeUI(mode);
  }

  syncCameraModeUI(mode) {
    this.btnCamDrone?.classList.toggle('active', mode === 'DRONE');
    this.btnCamPov?.classList.toggle('active', mode === 'POV');
  }

  syncMinimapModeUI() {
    this.btnMapOps?.classList.toggle('active', this.minimapMode === 'OPS');
    this.btnMapFull?.classList.toggle('active', this.minimapMode === 'FULL');

    if (this.minimapAxisEl) {
      const labels = MAP_VIEWPORTS[this.minimapMode].labels;
      const spans = this.minimapAxisEl.querySelectorAll('span');
      labels.forEach((txt, i) => {
        if (spans[i]) spans[i].textContent = txt;
      });
    }
  }

  _findMinimapSectorAt(mx, my) {
    const pad = 4;
    for (let i = 0; i < this.minimapSectorRects.length; i++) {
      const item = this.minimapSectorRects[i];
      if (
        mx >= item.x - pad &&
        mx <= item.x + item.w + pad &&
        my >= item.y - pad &&
        my <= item.y + item.h + pad
      ) {
        return item.sectorId;
      }
    }
    return null;
  }

  _setupMinimap() {
    this.btnMapOps?.addEventListener('click', () => {
      this.minimapMode = 'OPS';
      this.syncMinimapModeUI();
      this._drawMinimap(true);
    });
    this.btnMapFull?.addEventListener('click', () => {
      this.minimapMode = 'FULL';
      this.syncMinimapModeUI();
      this._drawMinimap(true);
    });

    if (!this.minimapCanvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = this.minimapCanvas.clientWidth || 236;
      const cssH = this.minimapCanvas.clientHeight || 82;
      this.minimapCanvas.width = Math.round(cssW * dpr);
      this.minimapCanvas.height = Math.round(cssH * dpr);
      this.minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._drawMinimap(true);
    };

    resize();
    window.addEventListener('resize', resize);

    this.minimapCanvas.addEventListener('mousemove', (e) => {
      const rect = this.minimapCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const vp = MAP_VIEWPORTS[this.minimapMode];
      const hitId = this._findMinimapSectorAt(mx, my);

      if (this.minimapTooltip) {
        this.minimapTooltip.classList.remove('is-hidden');
        if (hitId) {
          const sec = getSectorById(hitId);
          this.minimapTooltip.textContent = sec ? `${sec.shortLabel} — Klik untuk fokus` : '';
        } else {
          const wz = vp.zMin + (mx / rect.width) * (vp.zMax - vp.zMin);
          const wx = vp.xMax - (my / rect.height) * (vp.xMax - vp.xMin);
          this.minimapTooltip.textContent = `X:${wx.toFixed(0)}m · Z:${wz.toFixed(0)}m`;
        }
      }
      this.minimapCanvas.style.cursor = hitId ? 'pointer' : 'crosshair';
    });

    this.minimapCanvas.addEventListener('mouseleave', () => {
      if (this.minimapTooltip) {
        this.minimapTooltip.classList.add('is-hidden');
      }
    });

    this.minimapCanvas.addEventListener('click', (e) => {
      const rect = this.minimapCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hitId = this._findMinimapSectorAt(mx, my);
      if (hitId) {
        if (typeof this.onSelectSector === 'function') {
          this.onSelectSector(hitId);
        }
        return;
      }

      const vp = MAP_VIEWPORTS[this.minimapMode];
      const wz = vp.zMin + (mx / rect.width) * (vp.zMax - vp.zMin);
      const wx = vp.xMax - (my / rect.height) * (vp.xMax - vp.xMin);
      this.cameraManager.focusCoordinate(wx, wz);
    });
  }

  _worldToMap(wx, wz, width, height) {
    const vp = MAP_VIEWPORTS[this.minimapMode];
    const px = ((wz - vp.zMin) / (vp.zMax - vp.zMin)) * width;
    const py = ((vp.xMax - wx) / (vp.xMax - vp.xMin)) * height;
    return { px, py };
  }

  _drawMinimap(force = false) {
    if (!this.minimapCtx || !this.minimapCanvas) return;
    const now = performance.now();
    if (!force && now - this.lastMinimapDraw < 50) return;
    this.lastMinimapDraw = now;

    const ctx = this.minimapCtx;
    const width = this.minimapCanvas.clientWidth || 236;
    const height = this.minimapCanvas.clientHeight || 82;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#07111e';
    ctx.fillRect(0, 0, width, height);

    // Main road/corridor spine + subtle terminal axis
    const startZ = this.minimapMode === 'OPS' ? 700 : -1130;
    const pStart = this._worldToMap(0, startZ, width, height);
    const pTrestleEnd = this._worldToMap(0, 3436, width, height);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pStart.px, pStart.py);
    ctx.lineTo(pTrestleEnd.px, pTrestleEnd.py);
    ctx.stroke();

    // Non-sector context landmarks (faint)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    CONTEXT_LANDMARKS.forEach((lm) => {
      const tl = this._worldToMap(lm.xMax, lm.zMin, width, height);
      const br = this._worldToMap(lm.xMin, lm.zMax, width, height);
      if (br.px < 0 || tl.px > width) return;
      ctx.fillRect(tl.px, tl.py, Math.max(2, br.px - tl.px), Math.max(2, br.py - tl.py));
    });

    // Five Operational Sectors
    this.minimapSectorRects = [];
    OPERATIONAL_SECTORS.forEach((sector) => {
      const isActive = sector.id === this.activeSectorId;

      sector.bounds.forEach((b) => {
        const tl = this._worldToMap(b.xMax, b.zMin, width, height);
        const br = this._worldToMap(b.xMin, b.zMax, width, height);
        const rawW = br.px - tl.px;
        const rawH = br.py - tl.py;
        const drawW = Math.max(7, rawW);
        const drawH = Math.max(7, rawH);
        const drawX = tl.px - (drawW - rawW) * 0.5;
        const drawY = tl.py - (drawH - rawH) * 0.5;

        this.minimapSectorRects.push({
          sectorId: sector.id,
          x: drawX,
          y: drawY,
          w: drawW,
          h: drawH
        });

        ctx.fillStyle = isActive ? `${sector.accentColor}66` : `${sector.accentColor}30`;
        ctx.strokeStyle = isActive ? '#ffffff' : sector.accentColor;
        ctx.lineWidth = isActive ? 1.5 : 1.0;
        ctx.fillRect(drawX, drawY, drawW, drawH);
        ctx.strokeRect(drawX, drawY, drawW, drawH);
      });
    });

    // Live Camera Beacon & View Cone
    const camPos = this.camera.position;
    const camPt = this._worldToMap(camPos.x, camPos.z, width, height);
    const clampedX = Math.max(4, Math.min(width - 4, camPt.px));
    const clampedY = Math.max(4, Math.min(height - 4, camPt.py));

    const yaw = this.cameraManager.yaw;
    const dirX = Math.cos(yaw);
    const dirY = -Math.sin(yaw);
    const angle = Math.atan2(dirY, dirX);
    const coneSpread = 0.42;
    const coneLen = 16;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.beginPath();
    ctx.moveTo(clampedX, clampedY);
    ctx.lineTo(
      clampedX + Math.cos(angle - coneSpread) * coneLen,
      clampedY + Math.sin(angle - coneSpread) * coneLen
    );
    ctx.lineTo(
      clampedX + Math.cos(angle + coneSpread) * coneLen,
      clampedY + Math.sin(angle + coneSpread) * coneLen
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(clampedX, clampedY, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  update() {
    const snapshot = this.simClock.getSnapshot();
    this._renderClockReadout(snapshot);
    this._drawMinimap(false);
  }
}
