import * as THREE from 'three';
import { CameraStations } from './CameraStations.js';
import { FollowCamera } from './FollowCamera.js';

/**
 * ==============================================================================
 * CameraManager Engine (Prototype 07: Unified Camera Controller)
 * ==============================================================================
 *
 * Orchestrates all camera behaviors:
 * 1. Station Observation: Smoothly flies between fixed camera stations (Overview, Gate, CY, STS).
 * 2. Follow Mode: Dynamically tracks the moving container truck in real time.
 * 3. Free Orbit: Enables OrbitControls when positioned at the Overview station.
 */
export class CameraManager {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {Object} controls - Instance of OrbitControls
   */
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    // FollowCamera sub-controller
    this.followCamera = new FollowCamera(camera, controls);

    // Try restoring saved camera state from sessionStorage (preserves user angle across reloads/edits)
    const savedState = this.loadSavedState();

    if (savedState) {
      this.activeMode = savedState.mode || 'STATION';
      this.activeStationKey = savedState.stationKey || 'CUSTOM';

      this.camera.position.set(savedState.posX, savedState.posY, savedState.posZ);
      this.controls.target.set(savedState.targetX, savedState.targetY, savedState.targetZ);

      this.targetPosition = new THREE.Vector3().copy(this.camera.position);
      this.targetLookAt = new THREE.Vector3().copy(this.controls.target);
      this.currentLookAt = new THREE.Vector3().copy(this.controls.target);

      this.camera.lookAt(this.currentLookAt);
      this.controls.update();

      this.isTransitioning = false;
      this.controls.enabled = true;
    } else {
      // Default directly to Highway Road perspective
      const defStation = CameraStations.HIGHWAY;
      this.activeMode = 'STATION';
      this.activeStationKey = 'HIGHWAY';

      this.isTransitioning = false;
      this.targetPosition = new THREE.Vector3().copy(defStation.position);
      this.targetLookAt = new THREE.Vector3().copy(defStation.target);
      this.currentLookAt = new THREE.Vector3().copy(defStation.target);

      this.camera.position.copy(this.targetPosition);
      this.safeLookAt(this.currentLookAt);
      this.controls.target.copy(this.currentLookAt);
      this.controls.update();
      this.controls.enabled = true;
    }

    this.transitionSpeed = 3.5; // Flight speed multiplier

    // Throttle state saving
    this.saveTimer = null;
    this.setupStatePersistence();

    // WASD / QZ Panning, Zoom [ and ], & Quick Reset Key ('R')
    this.keys = {
      w: false, a: false, s: false, d: false,
      q: false, e: false, z: false,
      '[': false, ']': false,
      shift: false
    };
    this.panSpeed = 80.0; // Base speed of keyboard panning (units per second)
    this.setupKeyboardListeners();

    // Initial boundary enforcement to ensure camera is above ground
    this.clampCameraBounds();
  }

  loadSavedState() {
    try {
      const data = sessionStorage.getItem('ttl_camera_state');
      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed &&
          Number.isFinite(parsed.posX) &&
          Number.isFinite(parsed.posY) &&
          Number.isFinite(parsed.posZ) &&
          Number.isFinite(parsed.targetX) &&
          Number.isFinite(parsed.targetY) &&
          Number.isFinite(parsed.targetZ) &&
          parsed.posY > 0.5 &&
          parsed.posY < 1500 &&
          parsed.posZ > -1200 &&
          parsed.posZ < 2000
        ) {
          // Verify loaded state is strictly above world surface
          const groundY = this.getGroundHeight(parsed.posX, parsed.posZ);
          const minPosY = Math.max(1.5, groundY + 1.2);
          if (parsed.posY < minPosY) {
            parsed.posY = minPosY;
          }
          const targetGroundY = this.getGroundHeight(parsed.targetX, parsed.targetZ);
          const minTargetY = targetGroundY + 0.8;
          if (parsed.targetY < minTargetY) {
            parsed.targetY = minTargetY;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load saved camera state:', e);
    }
    return null;
  }

  saveState() {
    try {
      const state = {
        mode: this.activeMode,
        stationKey: this.activeStationKey,
        posX: this.camera.position.x,
        posY: this.camera.position.y,
        posZ: this.camera.position.z,
        targetX: this.controls.target.x,
        targetY: this.controls.target.y,
        targetZ: this.controls.target.z
      };
      sessionStorage.setItem('ttl_camera_state', JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }

  setupStatePersistence() {
    this.controls.addEventListener('change', () => {
      if (!this.isTransitioning && this.activeMode !== 'FOLLOW') {
        this.clampCameraBounds();
        this.currentLookAt.copy(this.controls.target);
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveState(), 80);
      }
    });
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (this.keys.hasOwnProperty(key)) {
        this.keys[key] = true;
      }
      if (e.shiftKey || key === 'shift') {
        this.keys.shift = true;
      }
      // Press 'R' or 'Escape' to instantly reset camera position
      if (key === 'r' || key === 'escape') {
        sessionStorage.removeItem('ttl_camera_state');
        this.setStation('OVERVIEW');
      }

      // Single-tap zoom nudge for [ (Zoom In) and ] (Zoom Out)
      if (!e.repeat && (key === '[' || key === ']')) {
        const speedMultiplier = (e.shiftKey || this.keys.shift) ? 2.5 : 1.0;
        this.zoomCamera(key === '[' ? -1 : 1, 0.08 * speedMultiplier);
      }
    });
    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (this.keys.hasOwnProperty(key)) {
        this.keys[key] = false;
      }
      if (!e.shiftKey || key === 'shift') {
        this.keys.shift = false;
      }
    });
  }

  safeLookAt(target) {
    if (
      Math.abs(this.camera.position.x - target.x) < 0.01 &&
      Math.abs(this.camera.position.z - target.z) < 0.01
    ) {
      this.camera.position.z += 0.5;
    }
    this.camera.lookAt(target);
  }

  setStation(stationKey) {
    const station = CameraStations[stationKey];
    if (!station) return;

    // Exit follow mode if active
    if (this.activeMode === 'FOLLOW') {
      this.followCamera.stopFollow();
    }

    this.activeMode = 'STATION';
    this.activeStationKey = stationKey;
    this.isTransitioning = true;
    this.controls.enabled = false;

    // Safety recovery if camera position was corrupt
    if (
      !Number.isFinite(this.camera.position.x) ||
      !Number.isFinite(this.camera.position.y) ||
      !Number.isFinite(this.camera.position.z)
    ) {
      this.camera.position.copy(station.position);
      this.currentLookAt.copy(station.target);
    }

    this.targetPosition.copy(station.position);
    this.targetLookAt.copy(station.target);
  }

  /**
   * Engages third-person follow tracking on the specified truck.
   * @param {Object} truck
   */
  followTruck(truck) {
    this.activeMode = 'FOLLOW';
    this.isTransitioning = false;
    this.followCamera.startFollow(truck);
  }

  /**
   * Toggles between Follow Mode and Overview Station.
   * @param {Object} truck
   * @returns {boolean} True if now following, false otherwise
   */
  toggleFollow(truck) {
    if (this.activeMode === 'FOLLOW') {
      this.setStation('HIGHWAY');
      return false;
    } else {
      this.followTruck(truck);
      return true;
    }
  }

  /**
   * Returns active camera mode string.
   * @returns {'STATION' | 'FOLLOW'}
   */
  getMode() {
    return this.activeMode;
  }

  /**
   * Returns active station key if in Station mode.
   * @returns {string}
   */
  getActiveStationKey() {
    return this.activeStationKey;
  }

  /**
   * Returns human-readable badge text for the HUD.
   * @returns {string}
   */
  getBadgeText() {
    if (this.activeMode === 'FOLLOW') {
      return '● FOLLOWING TRK-001';
    }
    return '● FREE CAMERA VIEW';
  }

  /**
   * Updates camera position, interpolation, and controls each frame.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // 0. Self-healing NaN check
    if (
      !Number.isFinite(this.camera.position.x) ||
      !Number.isFinite(this.camera.position.y) ||
      !Number.isFinite(this.camera.position.z) ||
      !Number.isFinite(this.controls.target.x) ||
      !Number.isFinite(this.controls.target.y) ||
      !Number.isFinite(this.controls.target.z)
    ) {
      console.warn('Recovering camera from NaN state');
      sessionStorage.removeItem('ttl_camera_state');
      this.camera.position.set(0, 115, -185.2);
      this.controls.target.set(0, 0, -186.0);
      this.targetPosition.set(0, 115, -185.2);
      this.targetLookAt.set(0, 0, -186.0);
      this.currentLookAt.set(0, 0, -186.0);
      this.camera.up.set(0, 1, 0);
      this.safeLookAt(this.currentLookAt);
      this.controls.update();
      this.isTransitioning = false;
      this.controls.enabled = true;
      return;
    }

    if (this.activeMode === 'FOLLOW') {
      this.followCamera.update(deltaTime);
      return;
    }

    if (this.isTransitioning) {
      const posLerp = Math.min(this.transitionSpeed * deltaTime, 1.0);
      const lookLerp = Math.min(this.transitionSpeed * 1.5 * deltaTime, 1.0);

      // Smoothly interpolate position and look-at target
      this.camera.position.lerp(this.targetPosition, posLerp);
      this.currentLookAt.lerp(this.targetLookAt, lookLerp);

      // Ensure intermediate transition positions do not dip below ground
      this.clampCameraBounds();

      this.safeLookAt(this.currentLookAt);
      this.controls.target.copy(this.currentLookAt);

      // Check for arrival at destination station
      const posDist = this.camera.position.distanceTo(this.targetPosition);
      const lookDist = this.currentLookAt.distanceTo(this.targetLookAt);

      if (posDist < 0.15 && lookDist < 0.15) {
        this.camera.position.copy(this.targetPosition);
        this.currentLookAt.copy(this.targetLookAt);
        this.clampCameraBounds();
        this.safeLookAt(this.currentLookAt);
        this.controls.target.copy(this.currentLookAt);

        this.isTransitioning = false;
        this.controls.enabled = true;
        this.saveState();
      }
    } else {
      // Handle WASD panning
      this.handleWASD(deltaTime);

      // In static station mode, update controls if Orbit is allowed
      if (this.controls.enabled) {
        this.controls.update();
      }

      this.clampCameraBounds();
    }
  }

  /**
   * Moves the camera horizontally using WASD, vertically using Q/Z, and speeds up with Shift.
   */
  handleWASD(deltaTime) {
    if (!this.controls.enabled || this.isTransitioning || this.activeMode === 'FOLLOW') return;

    let moved = false;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; // Keep horizontal direction
    if (forward.lengthSq() > 0.001) {
      forward.normalize();
    } else {
      forward.set(0, 0, -1);
    }

    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    // Speed multiplier: 3x when Shift is held
    const speedMultiplier = this.keys.shift ? 3.0 : 1.0;
    const deltaStr = this.panSpeed * speedMultiplier * deltaTime;
    const movement = new THREE.Vector3();

    // Horizontal WASD
    if (this.keys.w) { movement.addScaledVector(forward, deltaStr); moved = true; }
    if (this.keys.s) { movement.addScaledVector(forward, -deltaStr); moved = true; }
    if (this.keys.a) { movement.addScaledVector(right, -deltaStr); moved = true; }
    if (this.keys.d) { movement.addScaledVector(right, deltaStr); moved = true; }

    // Vertical Q (Up / Naik) & Z/E (Down / Turun)
    if (this.keys.q) { movement.y += deltaStr; moved = true; }
    if (this.keys.z || this.keys.e) { movement.y -= deltaStr; moved = true; }

    if (moved) {
      this.camera.position.add(movement);
      this.controls.target.add(movement);

      this.clampCameraBounds();

      this.currentLookAt.copy(this.controls.target);
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.saveState(), 80);
    }

    // Keyboard Zoom with [ (Zoom In) and ] (Zoom Out)
    const zoomSpeed = 2.2 * speedMultiplier;
    if (this.keys['[']) {
      this.zoomCamera(-1, zoomSpeed * deltaTime);
    }
    if (this.keys[']']) {
      this.zoomCamera(1, zoomSpeed * deltaTime);
    }
  }

  /**
   * Zooms camera in (direction < 0) or out (direction > 0) relative to current target/heading.
   * @param {number} direction - (-1 for Zoom In / Dekat, +1 for Zoom Out / Jauh)
   * @param {number} factor - Proportional zoom ratio
   */
  zoomCamera(direction, factor) {
    if (!this.controls.enabled || this.isTransitioning) return;

    if (this.activeMode === 'FOLLOW') {
      const scale = direction < 0 ? Math.max(0.4, 1.0 - factor) : Math.min(2.5, 1.0 + factor);
      this.followCamera.localOffset.multiplyScalar(scale);
      const len = this.followCamera.localOffset.length();
      if (len < 6.0) this.followCamera.localOffset.setLength(6.0);
      if (len > 70.0) this.followCamera.localOffset.setLength(70.0);
      return;
    }

    const target = this.controls.target;
    const offset = new THREE.Vector3().subVectors(this.camera.position, target);
    let dist = offset.length();
    if (dist < 0.001) {
      offset.set(0, 10, 20);
      dist = offset.length();
    }

    const minD = this.controls.minDistance || 3.0;
    const maxD = this.controls.maxDistance || 1600.0;
    const clampedFactor = Math.min(Math.max(factor, 0.001), 0.5);

    let newDist;
    if (direction < 0) {
      // Zoom IN: camera moves closer to target
      newDist = Math.max(minD, dist * (1.0 - clampedFactor));
    } else {
      // Zoom OUT: camera moves further from target
      newDist = Math.min(maxD, dist * (1.0 + clampedFactor));
    }

    offset.setLength(newDist);
    this.camera.position.copy(target).add(offset);
    this.clampCameraBounds();
    this.controls.update();
    this.currentLookAt.copy(this.controls.target);

    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveState(), 80);
  }

  /**
   * Calculates the exact world surface height (ground, road, bridge, sea) at coordinate (x, z).
   * @param {number} x
   * @param {number} z
   * @returns {number} Surface elevation in world units (meters)
   */
  getGroundHeight(x, z) {
    // 1. South Mangrove Reserve Island (Z in [1415, 1735], X in [-165, -42])
    if (z >= 1415 && z <= 1735 && x >= -165 && x <= -42) {
      return 1.62;
    }

    // 2. Southeast Logistics Warehouse & Staging Yard (Z in [1755, 1885], X in [-52, 25])
    if (z >= 1755 && z <= 1885 && x >= -52 && x <= 25) {
      return 1.63;
    }

    // 3. Inter-Island Causeway & Toll Plaza Corridor (Z in [1080, 1865])
    if (z > 1080 && z <= 1865) {
      // Toll plaza lens bulge (Z in [1295, 1545]) has width up to ~36m
      const maxW = (z >= 1295 && z <= 1545) ? 36.0 : 25.0;
      if (Math.abs(x) <= maxW) {
        return 1.63;
      }
      return 0.0; // Open sea water / mudflats outside causeway revetment
    }

    // 4. Beyond Corridor (Z > 1865)
    if (z > 1865) {
      return 1.63; // Terminal platform
    }

    // 4. Pulau 1 Complex (Z in [615, 1080])
    // Mainland island elevation is Y = 1.62m, road corridor and yards are 1.63m - 1.64m
    if (z >= 615) {
      return 1.63;
    }

    // 5. Curved Sea Causeway Bridge (Z in [-55, 615])
    if (z >= -55 && z < 615) {
      const bridgeStartZ = -55;
      const bridgeLength = 670;
      const t = Math.max(0, Math.min(1, (z - bridgeStartZ) / bridgeLength));
      const sweepWidth = 4.8;
      const bridgeCenterLineX = Math.sin(t * Math.PI) * sweepWidth;

      // Parabolic arch deck elevation matching BridgeAndOffice.js:
      const y_base = 0.82 + t * (1.62 - 0.82);
      const y_arch = 6.8 * 4.0 * t * (1.0 - t);
      const deckHeight = y_base + y_arch;

      // Solid bridge deck is 16m wide (half-width 8m). With parapets and conveyors, width is ~24m.
      const lateralDist = Math.abs(x - bridgeCenterLineX);
      if (lateralDist <= 12.0) {
        return deckHeight;
      } else if (lateralDist < 26.0) {
        // Aerodynamic smooth Hermite cushion to prevent clipping under bridge edges
        const u = (26.0 - lateralDist) / 14.0;
        const s = u * u * (3.0 - 2.0 * u);
        return THREE.MathUtils.lerp(0.0, deckHeight, s);
      }
      // Outside the bridge is open sea water
      return 0.0;
    }

    // 6. Mainland Access Highway Corridor (Z < -55)
    // Highway road surface is at Y = 0.81m, terrain base is at 0.80m
    if (z < -55) {
      return 0.81;
    }

    // Open sea water level
    return 0.0;
  }

  /**
   * Enforces hard boundaries on camera position and OrbitControls target:
   * - Never dips beneath ground, bridge deck, or water surface
   * - Keeps target above ground so OrbitControls can never orbit beneath surface
   * - Limits maximum vertical ceiling to prevent losing the world
   * - Constrains lateral boundaries within world perimeter
   */
  clampCameraBounds() {
    // 1. Constrain OrbitControls Target
    // If the target is buried underground, OrbitControls will orbit beneath the surface!
    const targetGroundY = this.getGroundHeight(this.controls.target.x, this.controls.target.z);
    const minTargetY = targetGroundY + 0.8; // Target stays at least 0.8m above surface
    if (this.controls.target.y < minTargetY) {
      this.controls.target.y = minTargetY;
    }

    // 2. Constrain Camera Eye Position
    const camGroundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
    // Clearance: At least 1.5m absolute floor anywhere in world, and at least groundY + 1.2m
    const minCamY = Math.max(1.5, camGroundY + 1.2);

    if (this.camera.position.y < minCamY) {
      this.camera.position.y = minCamY;
      // Re-orient camera view to target after vertical adjustment
      this.safeLookAt(this.controls.target);
    }

    // 3. Ceiling altitude limit (prevent camera from flying into deep space)
    if (this.camera.position.y > 500.0) {
      this.camera.position.y = 500.0;
    }

    // 4. World lateral perimeter bounds (X in [-360, +280], Z in [-850, +2400])
    this.camera.position.x = Math.max(-360.0, Math.min(280.0, this.camera.position.x));
    this.camera.position.z = Math.max(-850.0, Math.min(2400.0, this.camera.position.z));
    this.controls.target.x = Math.max(-320.0, Math.min(240.0, this.controls.target.x));
    this.controls.target.z = Math.max(-800.0, Math.min(2200.0, this.controls.target.z));
  }
}
