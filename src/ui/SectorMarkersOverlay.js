import * as THREE from 'three';
import { OPERATIONAL_SECTORS } from '../terminal/SectorRegistry.js';

const _anchorVec = new THREE.Vector3();
const _projVec = new THREE.Vector3();

/**
 * ==============================================================================
 * SectorMarkersOverlay.js (Floating 3D Screen-Projected Pins untuk 5 Sektor)
 * ==============================================================================
 */
export class SectorMarkersOverlay {
  constructor({ camera, dataStore, onSelectSector }) {
    this.camera = camera;
    this.dataStore = dataStore;
    this.onSelectSector = onSelectSector;

    this.layerEl = document.getElementById('sector-markers-layer');
    this.enabled = true;
    this.activeSectorId = null;

    this.items = [];
    this._buildPins();
  }

  _buildPins() {
    if (!this.layerEl) return;
    this.layerEl.replaceChildren();

    OPERATIONAL_SECTORS.forEach((sector) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sector-3d-pin';
      btn.dataset.sectorId = sector.id;
      btn.style.setProperty('--sector-accent', sector.accentColor);

      const header = document.createElement('div');
      header.className = 'pin-head';

      const dot = document.createElement('span');
      dot.className = 'pin-dot';
      dot.style.backgroundColor = sector.accentColor;

      const title = document.createElement('span');
      title.className = 'pin-title';
      title.textContent = sector.shortLabel;

      header.appendChild(dot);
      header.appendChild(title);

      const stat = document.createElement('div');
      stat.className = 'pin-stat';
      stat.textContent = this.dataStore.getPinSummary(sector.id);

      const stem = document.createElement('span');
      stem.className = 'pin-stem';

      btn.appendChild(header);
      btn.appendChild(stat);
      btn.appendChild(stem);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof this.onSelectSector === 'function') {
          this.onSelectSector(sector.id);
        }
      });

      this.layerEl.appendChild(btn);

      this.items.push({
        sector,
        el: btn,
        statEl: stat,
        anchor: new THREE.Vector3(sector.pinAnchor.x, sector.pinAnchor.y, sector.pinAnchor.z),
        lastX: null,
        lastY: null,
        lastHidden: null,
        lastStat: ''
      });
    });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.layerEl) {
      this.layerEl.classList.toggle('is-hidden', !this.enabled);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setActiveSector(sectorId) {
    this.activeSectorId = sectorId || null;
    this.items.forEach(({ sector, el }) => {
      el.classList.toggle('is-active', sector.id === this.activeSectorId);
    });
  }

  update() {
    if (!this.enabled || !this.layerEl) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camPos = this.camera.position;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const dist = camPos.distanceTo(item.anchor);

      _anchorVec.copy(item.anchor);
      _projVec.copy(_anchorVec).project(this.camera);

      const sx = (_projVec.x * 0.5 + 0.5) * width;
      const sy = (-_projVec.y * 0.5 + 0.5) * height;

      const isBehind = _projVec.z > 1.0 || _projVec.z < -1.0;
      const isOffscreen = sx < -40 || sx > width + 40 || sy < -30 || sy > height + 40;
      const isTooClose = dist < 95.0;
      const hidden = isBehind || isOffscreen || isTooClose;

      if (hidden !== item.lastHidden) {
        item.lastHidden = hidden;
        item.el.style.opacity = hidden ? '0' : '1';
        item.el.style.pointerEvents = hidden ? 'none' : 'auto';
      }

      if (!hidden) {
        const rx = Math.round(sx);
        const ry = Math.round(sy);
        if (rx !== item.lastX || ry !== item.lastY) {
          item.lastX = rx;
          item.lastY = ry;
          item.el.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -100%)`;
        }

        const summary = this.dataStore.getPinSummary(item.sector.id);
        if (summary !== item.lastStat) {
          item.lastStat = summary;
          item.statEl.textContent = summary;
        }
      }
    }
  }
}
