import * as THREE from 'three';
import './style.css';
import { createScene } from './world/scene.js';
import { setupLights } from './world/lights.js';
import { createEnvironment } from './world/environment.js';
import { createOcean } from './assets/nature/createOcean.js';
import { createHighwaySignage } from './world/Signage.js';
import { createAreaJalan } from './terminal/jalan/index.js';
import { createBufferArea } from './terminal/bufferArea/index.js';
import { createKantorArea } from './terminal/kantor/index.js';
import { createContainerYardArea } from './terminal/containerYard/index.js';
import { createCurahKeringArea } from './terminal/curahKering/index.js';
import { createDermagaArea } from './terminal/dermaga/index.js';
import {
  OPERATIONAL_SECTORS,
  resolveOperationalSector
} from './terminal/SectorRegistry.js';
import { CameraManager } from './camera/CameraManager.js';
import { SelectionManager } from './simulation/SelectionManager.js';
import { SimClock } from './simulation/SimClock.js';
import { SectorDataStore } from './simulation/SectorDataStore.js';
import { InformationPanel } from './ui/InformationPanel.js';
import { NavigationHUD } from './ui/NavigationHUD.js';
import { SectorMarkersOverlay } from './ui/SectorMarkersOverlay.js';
import { CompassWidget } from './ui/CompassWidget.js';
import { simToGps, gpsToSim, formatGps } from './world/GeoProjection.js';

/**
 * ==============================================================================
 * MAIN APPLICATION ENTRY POINT (Terminal Teluk Lamong 3D Simulator)
 * ==============================================================================
 */

const canvas = document.querySelector('#webgl-canvas');

// 1. Initialize 3D Scene, Camera, Renderer, and Lights
const { scene, camera, renderer, controls } = createScene(canvas);
setupLights(scene);

// 2. Build 3D World Environment & Terminal Facilities
const oceanGroup = createOcean({ skyColor: 0xb9daf8 });
scene.add(oceanGroup);

const mainlandEnvGroup = createEnvironment(scene);
mainlandEnvGroup.position.z = -55.0;

createAreaJalan(scene);
createBufferArea(scene);
createKantorArea(scene);
createContainerYardArea(scene);
createCurahKeringArea(scene);
createDermagaArea(scene);

const signageGroup = createHighwaySignage(scene);
signageGroup.position.z = -55.0;

// 3. Initialize Core Controllers & Data Store
const cameraManager = new CameraManager(camera, controls);
cameraManager.setupMouseListeners(canvas);
window.cameraManager = cameraManager;

const simClock = new SimClock();
const sectorDataStore = new SectorDataStore();
window.sectorDataStore = sectorDataStore;

const selectionManager = new SelectionManager(canvas, camera, scene);
const infoPanel = new InformationPanel(sectorDataStore);
const compassWidget = new CompassWidget(camera, cameraManager, controls);

const sectorMarkers = new SectorMarkersOverlay({
  camera,
  dataStore: sectorDataStore,
  onSelectSector: (sectorId) => {
    selectionManager.selectSector(sectorId, { source: 'pin' });
  }
});

const navHud = new NavigationHUD({
  camera,
  cameraManager,
  simClock,
  onSelectSector: (sectorId) => {
    selectionManager.selectSector(sectorId, { source: 'hud' });
  },
  onTogglePins: () => {
    const next = !sectorMarkers.isEnabled();
    sectorMarkers.setEnabled(next);
    return next;
  }
});

// 4. Unified Sector Selection & Sequential Stepping (1..5, [, ])
function stepSector(delta) {
  const active = selectionManager.getSelectedSector();
  let nextIdx = 0;
  if (active) {
    const curIdx = OPERATIONAL_SECTORS.findIndex((s) => s.id === active.id);
    nextIdx = (curIdx + delta + OPERATIONAL_SECTORS.length) % OPERATIONAL_SECTORS.length;
  } else if (delta < 0) {
    nextIdx = OPERATIONAL_SECTORS.length - 1;
  }
  selectionManager.selectSector(OPERATIONAL_SECTORS[nextIdx].id, { source: 'step' });
}

selectionManager.onSelectionChange = (sector, meta = {}) => {
  const sectorId = sector ? sector.id : null;
  infoPanel.render(sector);
  navHud.setActiveSector(sectorId);
  sectorMarkers.setActiveSector(sectorId);

  if (sector && !(meta.source === '3d' && meta.wasAlreadySelected)) {
    cameraManager.focusSector(sector);
  }
};

infoPanel.onFocusRequest = (sector) => {
  if (sector) cameraManager.focusSector(sector);
};

infoPanel.onCloseRequest = () => {
  selectionManager.deselect({ source: 'panel' });
};

infoPanel.onStepRequest = (delta) => stepSector(delta);

cameraManager.onSelectSectorIndex = (idx) => {
  const targetSector = OPERATIONAL_SECTORS[idx];
  if (targetSector) {
    selectionManager.selectSector(targetSector.id, { source: 'hotkey' });
  }
};

cameraManager.onStepSector = (delta) => stepSector(delta);

// 5. Collapsible HUD Panels
function setupPanelToggle(btnId, panelId) {
  const btn = document.querySelector(btnId);
  const panel = document.querySelector(panelId);
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isCollapsed = panel.classList.toggle('is-collapsed');
    const icon = btn.querySelector('.toggle-icon');
    if (icon) {
      icon.textContent = isCollapsed ? '+' : '−';
    }
  });
}

setupPanelToggle('#btn-collapse-gps', '#panel-gps');
setupPanelToggle('#btn-collapse-minimap', '#panel-minimap');
setupPanelToggle('#btn-collapse-controls', '#panel-controls');

// 6. Realtime GPS Telemetry & Teleport Controller
const elGpsLat = document.getElementById('gps-lat-val');
const elGpsLon = document.getElementById('gps-lon-val');
const elGpsSim = document.getElementById('gps-sim-val');
const elGpsZone = document.getElementById('gps-zone-val');
const btnCopyGps = document.getElementById('btn-copy-gps');
const inputTeleport = document.getElementById('input-teleport-gps');
const btnTeleport = document.getElementById('btn-teleport-gps');
const elTeleportFeedback = document.getElementById('gps-teleport-feedback');

let lastGpsLat = null;
let lastGpsLon = null;
let lastGpsUpdate = 0;

function updateGpsTelemetry() {
  const now = performance.now();
  if (now - lastGpsUpdate < 80) return;
  lastGpsUpdate = now;

  const posX = camera.position.x;
  const posY = camera.position.y;
  const posZ = camera.position.z;

  const { lat, lon, latStr, lonStr } = simToGps(posX, posZ);
  lastGpsLat = lat;
  lastGpsLon = lon;

  if (elGpsLat) elGpsLat.textContent = latStr;
  if (elGpsLon) elGpsLon.textContent = lonStr;
  if (elGpsSim) {
    elGpsSim.textContent = `X:${posX.toFixed(0)}m | Z:${posZ.toFixed(0)}m | Alt:${posY.toFixed(0)}m`;
  }
  if (elGpsZone) {
    const activeSector = resolveOperationalSector(posX, posZ);
    if (activeSector) {
      elGpsZone.textContent = activeSector.name;
      elGpsZone.style.borderColor = activeSector.accentColor;
      elGpsZone.style.color = '#f8fafc';
    } else {
      elGpsZone.textContent = 'Area Lingkungan';
      elGpsZone.style.borderColor = 'rgba(148, 163, 184, 0.35)';
      elGpsZone.style.color = '#94a3b8';
    }
  }
}

if (btnCopyGps) {
  btnCopyGps.addEventListener('click', async () => {
    if (lastGpsLat === null || lastGpsLon === null) return;
    const gpsStr = formatGps(lastGpsLat, lastGpsLon);
    try {
      await navigator.clipboard.writeText(gpsStr);
      btnCopyGps.textContent = 'Tersalin';
      setTimeout(() => {
        btnCopyGps.textContent = 'Salin';
      }, 1500);
    } catch {
      btnCopyGps.textContent = 'Gagal';
    }
  });
}

function handleTeleport() {
  if (!inputTeleport) return;
  const raw = inputTeleport.value.trim();
  if (!raw) return;

  const parts = raw
    .split(/[\s,]+/)
    .map((p) => parseFloat(p.trim()))
    .filter((p) => !Number.isNaN(p));

  if (parts.length < 2) {
    if (elTeleportFeedback) {
      elTeleportFeedback.className = 'teleport-feedback error';
      elTeleportFeedback.textContent = 'Format salah. Contoh: -7.20417, 112.66889';
    }
    return;
  }

  const [lat, lon] = parts;
  if (lat < -10 || lat > -5 || lon < 110 || lon > 115) {
    if (elTeleportFeedback) {
      elTeleportFeedback.className = 'teleport-feedback error';
      elTeleportFeedback.textContent = 'Koordinat di luar area Surabaya / TTL';
    }
    return;
  }

  const { x, z } = gpsToSim(lat, lon);
  cameraManager.focusCoordinate(x, z);

  if (elTeleportFeedback) {
    elTeleportFeedback.className = 'teleport-feedback success';
    elTeleportFeedback.textContent = `Menuju (${x.toFixed(1)}m, ${z.toFixed(1)}m)`;
    setTimeout(() => {
      elTeleportFeedback.textContent = '';
    }, 3000);
  }
}

btnTeleport?.addEventListener('click', handleTeleport);
inputTeleport?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleTeleport();
});

// 7. Animation Loop
const clock = new THREE.Clock();
let oceanElapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  const realDelta = clock.getDelta();
  oceanElapsed += Math.min(realDelta, 0.1);
  simClock.update(realDelta);

  oceanGroup.userData.update?.(oceanElapsed);
  cameraManager.update(realDelta);
  updateGpsTelemetry();
  compassWidget.update();
  navHud.update();
  sectorMarkers.update();

  renderer.render(scene, camera);
}

animate();
