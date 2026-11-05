import * as THREE from 'three';
import { CameraStations } from './CameraStations.js';
import { FollowCamera } from './FollowCamera.js';

// Module-scoped reusable temporary vectors
const _camForward = new THREE.Vector3();
const _camForwardH = new THREE.Vector3();
const _camRightH = new THREE.Vector3();
const _camMovement = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

/**
 * ==============================================================================
 * CameraManager Engine (Pure First-Person POV Controller)
 * ==============================================================================
 *
 * Universal First-Person Camera System:
 * 1. Zero-Drift Look: Mouse drag rotates yaw (360°) and pitch (-83° to +83°)
 *    around the camera's eye axis. Camera position NEVER shifts during look-around.
 * 2. 3D Free Movement: WASD for horizontal forward/backward/strafe, Q/E for vertical altitude.
 * 3. Station Vantage: Smooth flight to predefined observation stations.
 * 4. Follow Mode: Dynamically tracks container truck when requested.
 */
export class CameraManager {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {Object} controls - Instance of OrbitControls (rotation disabled)
   */
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    // FollowCamera sub-controller
    this.followCamera = new FollowCamera(camera, controls);

    // First-Person Look Angles (Euler Yaw & Pitch)
    this.yaw = 0;   // Radians (0 to 2*PI, horizontal)
    this.pitch = 0; // Radians (-1.45 to +1.45, vertical look)
    this.isDraggingLook = false;
    this.lastLookPointer = { x: 0, y: 0 };

    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // Try restoring saved camera state from sessionStorage
    const savedState = this.loadSavedState();

    if (savedState) {
      this.activeMode = savedState.mode === 'FOLLOW' ? 'FOLLOW' : 'FPS';
      this.activeStationKey = savedState.stationKey || 'CUSTOM';

      this.camera.position.set(savedState.posX, savedState.posY, savedState.posZ);
      this.targetPosition.copy(this.camera.position);

      if (Number.isFinite(savedState.yaw)) {
        this.yaw = savedState.yaw;
        this.pitch = savedState.pitch || 0;
        this.updateCameraOrientation();
      } else {
        this.setOrientationFromTarget(new THREE.Vector3(savedState.targetX, savedState.targetY, savedState.targetZ));
      }

      this.isTransitioning = false;
    } else {
      // Default directly to Highway Road perspective
      const defStation = CameraStations.HIGHWAY;
      this.activeMode = 'FPS';
      this.activeStationKey = 'HIGHWAY';

      this.isTransitioning = false;
      this.camera.position.copy(defStation.position);
      this.targetPosition.copy(defStation.position);
      this.setOrientationFromTarget(defStation.target);
    }

    this.transitionSpeed = 3.5;

    // Movement keys
    this.keys = {
      w: false, a: false, s: false, d: false,
      q: false, e: false, z: false,
      '[': false, ']': false,
      shift: false,
      alt: false,
      ctrl: false
    };
    this.panSpeed = 80.0; // Base speed of flight/movement (m/s)

    this.saveTimer = null;
    this.setupKeyboardListeners();

    // Initial boundary enforcement
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
          parsed.posY > -5.0 &&
          parsed.posY < 1800 &&
          parsed.posZ > -1200 &&
          parsed.posZ < 3900
        ) {
          const groundY = this.getGroundHeight(parsed.posX, parsed.posZ);
          const minPosY = groundY + 0.35;
          if (parsed.posY < minPosY) {
            parsed.posY = minPosY;
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
        yaw: this.yaw,
        pitch: this.pitch,
        targetX: this.currentLookAt.x,
        targetY: this.currentLookAt.y,
        targetZ: this.currentLookAt.z
      };
      sessionStorage.setItem('ttl_camera_state', JSON.stringify(state));
    } catch (e) {
      // ignore
    }
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
      if (e.altKey || key === 'alt') {
        this.keys.alt = true;
      }
      if (e.ctrlKey || key === 'control') {
        this.keys.ctrl = true;
      }

      // Press 'R' or 'Escape' to reset camera to OVERVIEW station
      if (key === 'r' || key === 'escape') {
        sessionStorage.removeItem('ttl_camera_state');
        this.setStation('OVERVIEW');
      }

      // Single-tap zoom nudge for [ (Zoom In) and ] (Zoom Out)
      if (!e.repeat && (key === '[' || key === ']')) {
        const step = (e.shiftKey || this.keys.shift) ? 6 : 2.5;
        this.camera.fov = Math.max(15, Math.min(65, this.camera.fov + (key === '[' ? -step : step)));
        this.camera.updateProjectionMatrix();
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
      if (!e.altKey || key === 'alt') {
        this.keys.alt = false;
      }
      if (!e.ctrlKey || key === 'control') {
        this.keys.ctrl = false;
      }
    });
  }

  /**
   * Sets up drag and wheel event listeners on canvas for Pure First-Person Look.
   * @param {HTMLCanvasElement} canvasElement
   */
  setupFPSMouseListeners(canvasElement) {
    canvasElement.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && this.activeMode !== 'FOLLOW') {
        this.isDraggingLook = true;
        this.lastLookPointer.x = e.clientX;
        this.lastLookPointer.y = e.clientY;
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDraggingLook && this.activeMode !== 'FOLLOW') {
        const dx = e.clientX - this.lastLookPointer.x;
        const dy = e.clientY - this.lastLookPointer.y;
        this.lastLookPointer.x = e.clientX;
        this.lastLookPointer.y = e.clientY;

        const sensitivity = 0.0028;
        this.yaw -= dx * sensitivity;
        this.pitch -= dy * sensitivity;

        // Clamp vertical pitch: -83° (feet/ground) to +83° (sky)
        const maxPitch = 1.45;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        this.updateCameraOrientation();

        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveState(), 80);
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDraggingLook = false;
    });

    // Optical FOV zoom with mouse scroll wheel
    canvasElement.addEventListener(
      'wheel',
      (e) => {
        if (this.activeMode !== 'FOLLOW') {
          e.preventDefault();
          const fovDelta = e.deltaY * 0.035;
          this.camera.fov = Math.max(15, Math.min(65, this.camera.fov + fovDelta));
          this.camera.updateProjectionMatrix();
        }
      },
      { passive: false }
    );
  }

  /**
   * Calculates yaw and pitch from camera position looking at target.
   * @param {THREE.Vector3} target
   */
  setOrientationFromTarget(target) {
    const dir = new THREE.Vector3().subVectors(target, this.camera.position);
    const horizLen = Math.hypot(dir.x, dir.z);
    if (horizLen > 0.001) {
      this.yaw = Math.atan2(dir.x, dir.z);
      this.pitch = Math.atan2(dir.y, horizLen);
    } else {
      this.yaw = 0;
      this.pitch = dir.y >= 0 ? 1.45 : -1.45;
    }
    this.updateCameraOrientation();
  }

  /**
   * Updates camera viewing orientation from yaw & pitch Euler angles.
   * CRITICAL: this.camera.position is NEVER modified here! (Zero-drift look)
   */
  updateCameraOrientation() {
    const cosP = Math.cos(this.pitch);
    const dirX = Math.sin(this.yaw) * cosP;
    const dirY = Math.sin(this.pitch);
    const dirZ = Math.cos(this.yaw) * cosP;

    _camForward.set(dirX, dirY, dirZ);

    _targetLook.copy(this.camera.position).addScaledVector(_camForward, 20.0);
    this.camera.lookAt(_targetLook);
    this.currentLookAt.copy(_targetLook);
    this.controls.target.copy(_targetLook);
  }

  /**
   * Sets heading directly to real-world bearing (0° = True North).
   * @param {number} desiredBearingDeg
   */
  setHeading(desiredBearingDeg) {
    // In TTL projection: North direction corresponds to scene angle 148°
    const desiredSceneAngleDeg = 148.0 - desiredBearingDeg;
    this.yaw = (desiredSceneAngleDeg * Math.PI) / 180.0;
    this.updateCameraOrientation();
    this.saveState();
  }

  /**
   * Smoothly transitions camera to a station vantage point.
   * @param {string} stationKey
   */
  setStation(stationKey) {
    const station = CameraStations[stationKey];
    if (!station) return;

    if (this.activeMode === 'FOLLOW') {
      this.followCamera.stopFollow();
    }

    this.activeMode = 'FPS';
    this.activeStationKey = stationKey;
    this.isTransitioning = true;

    this.targetPosition.copy(station.position);
    this.targetLookAt.copy(station.target);
    this.transitionSpeed = 3.5;
  }

  /**
   * Smoothly transitions the camera to an arbitrary eye position and target lookAt.
   * @param {THREE.Vector3} eyePosition
   * @param {THREE.Vector3} lookAtTarget
   * @param {number} [speed=3.5]
   */
  transitionTo(eyePosition, lookAtTarget, speed = 3.5) {
    if (this.activeMode === 'FOLLOW') {
      this.followCamera.stopFollow();
    }

    this.activeMode = 'FPS';
    this.activeStationKey = 'CUSTOM';
    this.isTransitioning = true;

    this.targetPosition.copy(eyePosition);
    this.targetLookAt.copy(lookAtTarget);
    this.transitionSpeed = speed;
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
   * Toggles between Follow Mode and Highway Station.
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

  getMode() {
    return this.activeMode;
  }

  getActiveStationKey() {
    return this.activeStationKey;
  }

  /**
   * Updates camera position, interpolation, and flight each frame.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // 0. Self-healing NaN check
    if (
      !Number.isFinite(this.camera.position.x) ||
      !Number.isFinite(this.camera.position.y) ||
      !Number.isFinite(this.camera.position.z)
    ) {
      console.warn('Recovering camera from NaN state');
      sessionStorage.removeItem('ttl_camera_state');
      this.camera.position.set(13.8, 3.2, -320);
      this.targetPosition.set(13.8, 3.2, -320);
      this.setOrientationFromTarget(new THREE.Vector3(13.8, 2.0, -180));
      this.isTransitioning = false;
      return;
    }

    if (this.activeMode === 'FOLLOW') {
      this.followCamera.update(deltaTime);
      return;
    }

    if (this.isTransitioning) {
      const posLerp = Math.min(this.transitionSpeed * deltaTime, 1.0);
      const lookLerp = Math.min(this.transitionSpeed * 1.5 * deltaTime, 1.0);

      this.camera.position.lerp(this.targetPosition, posLerp);
      this.currentLookAt.lerp(this.targetLookAt, lookLerp);

      this.clampCameraBounds();
      this.camera.lookAt(this.currentLookAt);

      const posDist = this.camera.position.distanceTo(this.targetPosition);
      const lookDist = this.currentLookAt.distanceTo(this.targetLookAt);

      if (posDist < 0.15 && lookDist < 0.15) {
        this.camera.position.copy(this.targetPosition);
        this.setOrientationFromTarget(this.targetLookAt);
        this.isTransitioning = false;
        this.saveState();
      }
    } else {
      // Handle 3D free-flight movement
      this.handleWASD(deltaTime);
    }
  }

  /**
   * Moves camera in 3D:
   * - W/S: Forward/Backward along horizontal view heading
   * - A/D: Strafe Left/Right
   * - Q/E: Climb Up / Descend Down
   * - Shift: Sprint (3x speed)
   * - Alt/Ctrl: Precision slow alignment (0.15x speed)
   */
  handleWASD(deltaTime) {
    if (this.isTransitioning || this.activeMode === 'FOLLOW') return;

    let moved = false;
    _camForwardH.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
    _camRightH.set(-Math.cos(this.yaw), 0, Math.sin(this.yaw)).normalize();

    let speedMultiplier = 1.0;
    if (this.keys.shift) {
      speedMultiplier = 3.0;
    } else if (this.keys.alt || this.keys.ctrl) {
      speedMultiplier = 0.15;
    }
    const deltaStr = this.panSpeed * speedMultiplier * deltaTime;
    _camMovement.set(0, 0, 0);

    // Horizontal WASD
    if (this.keys.w) { _camMovement.addScaledVector(_camForwardH, deltaStr); moved = true; }
    if (this.keys.s) { _camMovement.addScaledVector(_camForwardH, -deltaStr); moved = true; }
    if (this.keys.a) { _camMovement.addScaledVector(_camRightH, -deltaStr); moved = true; }
    if (this.keys.d) { _camMovement.addScaledVector(_camRightH, deltaStr); moved = true; }

    // Vertical Q (Up / Naik) & Z/E (Down / Turun)
    if (this.keys.q) { _camMovement.y += deltaStr; moved = true; }
    if (this.keys.z || this.keys.e) { _camMovement.y -= deltaStr; moved = true; }

    if (moved) {
      this.camera.position.add(_camMovement);
      this.clampCameraBounds();
      this.updateCameraOrientation();

      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.saveState(), 80);
    }
  }

  /**
   * Calculates world surface height at coordinate (x, z).
   * @param {number} x
   * @param {number} z
   * @returns {number} Surface elevation in world units (meters)
   */
  getGroundHeight(x, z) {
    // 1. South Mangrove Reserve Island
    if (z >= 1415 && z <= 1735 && x >= -165 && x <= -42) {
      return 1.62;
    }

    // 2. Southeast Logistics Warehouse & Staging Yard
    if (z >= 1755 && z <= 1885 && x >= -52 && x <= 25) {
      return 1.63;
    }

    // 3. Inter-Island Causeway & Toll Plaza Corridor
    if (z > 1080 && z <= 1865) {
      const maxW = (z >= 1295 && z <= 1545) ? 36.0 : 25.0;
      if (Math.abs(x) <= maxW) {
        return 1.63;
      }
      return 0.0;
    }

    // 4. Trestle & Dermaga Lepas Pantai (Z >= 2482)
    if (z >= 2482) {
      return 3.2;
    }

    // 4b. Beyond Corridor (CY & Curah Kering)
    if (z > 1865) {
      return 1.63;
    }

    // 5. Pulau 1 Complex
    if (z >= 615) {
      return 1.63;
    }

    // 6. Curved Sea Causeway Bridge
    if (z >= -55 && z < 615) {
      const bridgeStartZ = -55;
      const bridgeLength = 670;
      const t = Math.max(0, Math.min(1, (z - bridgeStartZ) / bridgeLength));
      const sweepWidth = 4.8;
      const bridgeCenterLineX = Math.sin(t * Math.PI) * sweepWidth;

      const y_base = 0.82 + t * (1.62 - 0.82);
      const y_arch = 6.8 * 4.0 * t * (1.0 - t);
      const deckHeight = y_base + y_arch;

      const lateralDist = Math.abs(x - bridgeCenterLineX);
      if (lateralDist <= 12.0) {
        return deckHeight;
      } else if (lateralDist < 26.0) {
        const u = (26.0 - lateralDist) / 14.0;
        const s = u * u * (3.0 - 2.0 * u);
        return THREE.MathUtils.lerp(0.0, deckHeight, s);
      }
      return 0.0;
    }

    // 7. Tol Romokalisari Elevated Flyover Descent Deck
    if (z >= -1108 && z <= -792 && Math.abs(x) >= 3.8 && Math.abs(x) <= 12.2) {
      const t = (z - (-1108)) / 316.0;
      return 7.0 - t * (7.0 - 0.81);
    }

    // 8. Mainland Access Highway Corridor
    if (z < -55) {
      return 0.81;
    }

    return 0.0;
  }

  /**
   * Enforces safety boundaries on camera eye position:
   * - Never dips beneath ground/asphalt slab (safe 0.35m clearance above road/curb)
   * - Limits maximum ceiling altitude
   * - Constrains lateral boundaries
   */
  clampCameraBounds() {
    const camGroundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
    const minCamY = camGroundY + 0.35;

    if (this.camera.position.y < minCamY) {
      this.camera.position.y = minCamY;
    }

    if (this.camera.position.y > 900.0) {
      this.camera.position.y = 900.0;
    }

    this.camera.position.x = Math.max(-1050.0, Math.min(650.0, this.camera.position.x));
    this.camera.position.z = Math.max(-1350.0, Math.min(3900.0, this.camera.position.z));
  }
}
