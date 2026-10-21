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

// 6. Route Waypoints for Mainland (Spanning across 4 segments)
const terminalWaypoints = [
  { x:  13.8, y: 0.81, z: -680 },
  { x:  13.8, y: 0.81, z: -400 },
  { x:  13.8, y: 0.81, z: -180 },
  { x:  13.8, y: 0.81, z:  -58 },
  { x: -13.8, y: 0.81, z:  -58 },
  { x: -13.8, y: 0.81, z: -180 },
  { x: -13.8, y: 0.81, z: -400 },
  { x: -13.8, y: 0.81, z: -680 }
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

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // Update fleet vehicles (empty during layout development)
  truckManager.update(deltaTime, null, null, null);

  // Update Camera Manager
  cameraManager.update(deltaTime);

  // Update Operational Information Dashboard
  const activeSelected = selectionManager.getSelected() || fleetTrucks[0] || null;
  infoPanel.update(activeSelected, cameraManager, null, null, fleetTrucks);

  // Render Scene
  renderer.render(scene, camera);
}

// Start animation loop
animate();
