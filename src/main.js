import * as THREE from 'three';
import './style.css';
import { createScene } from './world/scene.js';
import { setupLights } from './world/lights.js';
import { createEnvironment } from './world/environment.js';
import { createRoadNetwork } from './world/Road.js';
import { createHighwaySignage } from './world/Signage.js';
import { createBridgeAndOffice } from './world/BridgeAndOffice.js';
import { TruckManager } from './vehicles/TruckManager.js';
import { CameraManager } from './camera/CameraManager.js';
import { SelectionManager } from './simulation/SelectionManager.js';
import { InformationPanel } from './ui/InformationPanel.js';
import { simToGps, gpsToSim, formatGps } from './world/GeoProjection.js';

/**
 * ==============================================================================
 * MAIN APPLICATION ENTRY POINT (Terminal Teluk Lamong - Step 1A: Mainland to Bridge Start)
 * ==============================================================================
 *
 * Focusing purely on constructing and perfecting the Mainland access corridor:
 * - "mainland to bridge" access highway with Indonesian Left-Hand Traffic (LHT)
 * - "security checkpoint" post (median inspection booth, canopy, barrier arm)
 * - Aquaculture fish ponds (tambak), earthen dykes, and mangrove vegetation
 * - Bridge abutment & coastline transition to sea water
 */

// 1. Find DOM elements for UI overlay
const canvas = document.querySelector('#webgl-canvas');
const btnFollowToggle = document.querySelector('#btn-follow-toggle');
const btnFollowText = document.querySelector('#btn-follow-text');
const cameraStatusBadge = document.querySelector('#camera-status-badge');
const chipButtons = document.querySelectorAll('.chip-truck');

// 2. Initialize the 3D Scene, Camera, WebGLRenderer, and OrbitControls
const { scene, camera, renderer, controls } = createScene(canvas);

// 3. Set up daylight lighting
setupLights(scene);

// 4. Create the Mainland Environment
createEnvironment(scene);

// 5. Create the Mainland Road Network
createRoadNetwork(scene);

// 6. Create Highway Entry/Exit Signage
createHighwaySignage(scene);

// 7. Create Sea Causeway Bridge & Administrative Office Complex
createBridgeAndOffice(scene);

// 6. Route Waypoints for Mainland Corridor (Osowilangon Z = -1080 to Bridge Abutment Z = -58)
const terminalWaypoints = [
  { x:  13.8, y: 0.81, z: -1080 },
  { x:  13.8, y: 0.81, z:  -775 },
  { x:  13.8, y: 0.81, z:  -400 },
  { x:  13.8, y: 0.81, z:  -180 },
  { x:  13.8, y: 0.81, z:   -58 },
  { x: -13.8, y: 0.81, z:   -58 },
  { x: -13.8, y: 0.81, z:  -180 },
  { x: -13.8, y: 0.81, z:  -400 },
  { x: -13.8, y: 0.81, z:  -775 },
  { x: -13.8, y: 0.81, z: -1080 }
];

// 7. Instantiate TruckManager (Fleet empty for layout development)
const truckManager = new TruckManager(scene, terminalWaypoints);
const fleetTrucks = truckManager.getTrucks();

// 8. Initialize Raycaster SelectionManager
const selectionManager = new SelectionManager(canvas, camera);
fleetTrucks.forEach((t) => selectionManager.registerSelectable(t));

// 9. Initialize Unified CameraManager
const cameraManager = new CameraManager(camera, controls);
window.cameraManager = cameraManager;

// 10. Initialize Operational InformationPanel Dashboard
const infoPanel = new InformationPanel();

function updateCameraUI() {
  const isFollowing = cameraManager.getMode() === 'FOLLOW';

  if (cameraStatusBadge) {
    if (isFollowing) {
      const activeSelected = selectionManager.getSelected() || fleetTrucks[0];
      if (activeSelected) {
        if (btnFollowText) btnFollowText.textContent = 'Stop Following';
        btnFollowToggle?.classList.add('active');
        cameraStatusBadge.textContent = `● FOLLOWING ${activeSelected.id}`;
        cameraStatusBadge.className = 'camera-badge badge-following';
      }
    } else {
      if (btnFollowText) btnFollowText.textContent = 'Follow Truck';
      btnFollowToggle?.classList.remove('active');
      cameraStatusBadge.textContent = cameraManager.getBadgeText();
      cameraStatusBadge.className = 'camera-badge badge-overview';
    }
  }
}

// Dedicated Reset Camera Position Button
const btnResetCamera = document.getElementById('btn-reset-camera');
if (btnResetCamera) {
  btnResetCamera.addEventListener('click', () => {
    sessionStorage.removeItem('ttl_camera_state');
    cameraManager.setStation('OVERVIEW');
    updateCameraUI();
  });
}

// Quick Camera Station Switcher Buttons
document.querySelectorAll('.btn-station').forEach((btn) => {
  btn.addEventListener('click', () => {
    const station = btn.getAttribute('data-station');
    if (station && cameraManager) {
      sessionStorage.removeItem('ttl_camera_state');
      cameraManager.setStation(station);
      updateCameraUI();
    }
  });
});

// Immediately sync UI with restored/current camera state
updateCameraUI();

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

setupPanelToggle('#btn-collapse-header', '#panel-header');
setupPanelToggle('#btn-collapse-dashboard', '#panel-dashboard');
setupPanelToggle('#btn-collapse-controls', '#panel-controls');
setupPanelToggle('#btn-collapse-gps', '#panel-gps');

// ----------------------------------------------------------------------------
// Realtime GPS Telemetry & Teleport Controller
// ----------------------------------------------------------------------------
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

function getZoneName(z) {
  if (z <= -1020) return 'Akses Osowilangon';
  if (z <= -792)  return 'Flyover Tol Romokalisari';
  if (z <= -680)  return 'Merge Tol & Darat';
  if (z <= -230)  return 'Koridor Utama 3 Lajur';
  if (z <= -140)  return 'Pos Keamanan TTL';
  if (z <= -55)   return 'Gardu PLN & Abutmen';
  if (z < 700)    return 'Causeway 1 (Jembatan)';
  return 'Pulau 1 Kompleks TTL';
}

function updateGpsTelemetry() {
  const now = performance.now();
  if (now - lastGpsUpdate < 80) return; // Throttled to ~12fps for performance
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
    elGpsSim.textContent = `X: ${posX.toFixed(1)}m | Z: ${posZ.toFixed(1)}m | Alt: ${posY.toFixed(1)}m`;
  }
  if (elGpsZone) {
    elGpsZone.textContent = getZoneName(posZ);
  }
}

// Copy Real GPS Coordinates to Clipboard
if (btnCopyGps) {
  btnCopyGps.addEventListener('click', async () => {
    if (lastGpsLat !== null && lastGpsLon !== null) {
      const gpsStr = formatGps(lastGpsLat, lastGpsLon);
      try {
        await navigator.clipboard.writeText(gpsStr);
        btnCopyGps.textContent = '✅ Koordinat Tersalin!';
        setTimeout(() => {
          btnCopyGps.textContent = '📋 Salin Koordinat GPS';
        }, 1600);
      } catch (err) {
        btnCopyGps.textContent = gpsStr;
      }
    }
  });
}

// Teleport Camera to Given Real-World GPS Coordinates
function handleTeleport() {
  if (!inputTeleport) return;
  const raw = inputTeleport.value.trim();
  if (!raw) return;

  const parts = raw.split(/[\s,]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
  if (parts.length < 2) {
    if (elTeleportFeedback) {
      elTeleportFeedback.className = 'teleport-feedback error';
      elTeleportFeedback.textContent = '❌ Format salah. Contoh: -7.21512, 112.65411';
    }
    return;
  }

  const lat = parts[0];
  const lon = parts[1];

  if (lat < -10 || lat > -5 || lon < 110 || lon > 115) {
    if (elTeleportFeedback) {
      elTeleportFeedback.className = 'teleport-feedback error';
      elTeleportFeedback.textContent = '❌ Di luar area Surabaya/TTL (-7.2°, 112.6°)';
    }
    return;
  }

  const { x, z } = gpsToSim(lat, lon);
  const groundY = cameraManager.getGroundHeight(x, z);
  const targetY = Math.max(groundY + 1.2, 1.8);
  const camY = Math.max(targetY + 18.0, 22.0);

  sessionStorage.removeItem('ttl_camera_state');
  cameraManager.transitionTo(
    new THREE.Vector3(x + 14.0, camY, z - 32.0),
    new THREE.Vector3(x, targetY, z),
    1.2
  );

  if (elTeleportFeedback) {
    elTeleportFeedback.className = 'teleport-feedback success';
    elTeleportFeedback.textContent = `➔ Teleport ke (${x.toFixed(1)}m, ${z.toFixed(1)}m)`;
    setTimeout(() => {
      elTeleportFeedback.textContent = '';
    }, 3200);
  }
}

if (btnTeleport) {
  btnTeleport.addEventListener('click', handleTeleport);
}
if (inputTeleport) {
  inputTeleport.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleTeleport();
  });
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // Update fleet vehicles (empty during layout development)
  truckManager.update(deltaTime, null, null, null);

  // Update Camera Manager
  cameraManager.update(deltaTime);

  // Update Realtime GPS Coordinates & Telemetry
  updateGpsTelemetry();

  // Update Operational Information Dashboard
  const activeSelected = selectionManager.getSelected() || fleetTrucks[0] || null;
  infoPanel.update(activeSelected, cameraManager, null, null, fleetTrucks);

  // Render Scene
  renderer.render(scene, camera);
}

// Start animation loop
animate();
