import * as THREE from 'three';
import { NORTH_SCENE_ANGLE_DEG } from '../ui/CompassWidget.js';

const _camForward = new THREE.Vector3();
const _camForwardH = new THREE.Vector3();
const _camRightH = new THREE.Vector3();
const _camMovement = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _zoomRaycaster = new THREE.Raycaster();
const _pointerNdc = new THREE.Vector2();
const _zoomPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.63);
const _zoomHit = new THREE.Vector3();
const _zoomDir = new THREE.Vector3();

const DEFAULT_CAMERA_VIEW = {
  position: new THREE.Vector3(-210, 440, 320),
  target: new THREE.Vector3(-50, 10, 1750)
};

function isTypingTarget(event) {
  const target = event?.target || document.activeElement;
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * ==============================================================================
 * CameraManager (Dual Mode: DRONE Map Navigator & POV Street Inspector)
 * ==============================================================================
 *
 * - Mode DRONE (default):
 *   - Drag Kiri  : Pan mendatar adaptif ketinggian
 *   - Drag Kanan : Orbit 360° mengelilingi titik fokus di depan kamera
 *   - Scroll     : Dolly zoom maju/mundur searah pandang
 *   - WASD + Q/E : Terbang bebas adaptif ketinggian (Shift 2.5x, Alt 0.2x)
 * - Mode POV:
 *   - Drag Kiri  : Menoleh 360° di tempat (zero-drift)
 *   - Scroll     : Maju/mundur horizontal di atas jalur
 *   - WASD + Q/E : Berjalan / naik-turun
 */
export class CameraManager {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    this.mode = 'DRONE'; // 'DRONE' | 'POV'
    this.yaw = 0;
    this.pitch = 0;

    this.dragButton = null; // null | 'PAN' | 'ORBIT' | 'LOOK'
    this.lastPointer = { x: 0, y: 0 };
    this.orbitPivot = new THREE.Vector3();
    this.orbitDistance = 120;

    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.transitionStartPos = new THREE.Vector3();
    this.transitionStartLook = new THREE.Vector3();
    this.transitionDuration = 0.75;
    this.transitionElapsed = 0;
    this.isTransitioning = false;

    this.onModeChange = null;
    this.onSelectSectorIndex = null;
    this.onStepSector = null;
    this.saveTimer = null;

    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      q: false,
      e: false,
      z: false,
      shift: false,
      alt: false,
      ctrl: false
    };

    const saved = this.loadSavedState();
    if (saved) {
      this.mode = saved.mode === 'POV' ? 'POV' : 'DRONE';
      this.camera.position.set(saved.posX, saved.posY, saved.posZ);
      this.targetPosition.copy(this.camera.position);
      if (Number.isFinite(saved.yaw) && Number.isFinite(saved.pitch)) {
        this.yaw = saved.yaw;
        this.pitch = Math.max(-1.46, Math.min(1.46, saved.pitch));
        this.updateCameraOrientation();
      } else {
        this.setOrientationFromTarget(DEFAULT_CAMERA_VIEW.target);
      }
    } else {
      this.camera.position.copy(DEFAULT_CAMERA_VIEW.position);
      this.targetPosition.copy(DEFAULT_CAMERA_VIEW.position);
      this.setOrientationFromTarget(DEFAULT_CAMERA_VIEW.target);
    }

    this.setupKeyboardListeners();
    this.clampCameraBounds();
  }

  getMode() {
    return this.mode;
  }

  setMode(nextMode) {
    const normalized = nextMode === 'POV' ? 'POV' : 'DRONE';
    if (this.mode === normalized) return;
    this.mode = normalized;
    this.dragButton = null;
    this.saveState();
    if (typeof this.onModeChange === 'function') {
      this.onModeChange(this.mode);
    }
  }

  toggleMode() {
    this.setMode(this.mode === 'DRONE' ? 'POV' : 'DRONE');
  }

  loadSavedState() {
    try {
      const raw = sessionStorage.getItem('ttl_camera_state_v2');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Number.isFinite(parsed.posX) &&
        Number.isFinite(parsed.posY) &&
        Number.isFinite(parsed.posZ) &&
        parsed.posY > -5 &&
        parsed.posY < 2300 &&
        parsed.posZ > -1400 &&
        parsed.posZ < 4000
      ) {
        const groundY = this.getGroundHeight(parsed.posX, parsed.posZ);
        if (parsed.posY < groundY + 0.5) parsed.posY = groundY + 0.5;
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return null;
  }

  saveState() {
    try {
      sessionStorage.setItem(
        'ttl_camera_state_v2',
        JSON.stringify({
          mode: this.mode,
          posX: this.camera.position.x,
          posY: this.camera.position.y,
          posZ: this.camera.position.z,
          yaw: this.yaw,
          pitch: this.pitch
        })
      );
    } catch {
      // ignore
    }
  }

  scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveState(), 100);
  }

  interruptTransition() {
    if (!this.isTransitioning) return;
    this.isTransitioning = false;
    this.setOrientationFromTarget(this.currentLookAt);
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (isTypingTarget(e)) return;

      const key = e.key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(this.keys, key)) {
        this.keys[key] = true;
        this.interruptTransition();
      }
      if (e.shiftKey || key === 'shift') this.keys.shift = true;
      if (e.altKey || key === 'alt') this.keys.alt = true;
      if (e.ctrlKey || key === 'control') this.keys.ctrl = true;

      if (!e.repeat && key === 'v') {
        this.toggleMode();
      }

      if (!e.repeat && (key === 'r' || key === 'escape')) {
        this.resetToOverview();
      }

      // Pintasan alur sektor: tombol 1-5 serta [ (mundur) / ] (maju)
      if (!e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (key >= '1' && key <= '5' && typeof this.onSelectSectorIndex === 'function') {
          this.onSelectSectorIndex(parseInt(key, 10) - 1);
        } else if (key === '[' && typeof this.onStepSector === 'function') {
          this.onStepSector(-1);
        } else if (key === ']' && typeof this.onStepSector === 'function') {
          this.onStepSector(1);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(this.keys, key)) {
        this.keys[key] = false;
      }
      if (!e.shiftKey) this.keys.shift = false;
      if (!e.altKey) this.keys.alt = false;
      if (!e.ctrlKey) this.keys.ctrl = false;
    });

    // Clear stuck keys when window loses focus
    window.addEventListener('blur', () => {
      Object.keys(this.keys).forEach((k) => {
        this.keys[k] = false;
      });
      this.dragButton = null;
    });
  }

  setupMouseListeners(canvasElement) {
    canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());

    canvasElement.addEventListener('pointerdown', (e) => {
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;

      if (this.mode === 'POV') {
        if (e.button === 0 || e.button === 2) {
          this.dragButton = 'LOOK';
        }
        return;
      }

      // DRONE mode: Left = Pan, Right/Middle (or Ctrl+Left) = Orbit
      if (e.button === 2 || e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        this.interruptTransition();
        this.dragButton = 'ORBIT';
        this._initOrbitPivot();
      } else if (e.button === 0) {
        this.dragButton = 'PAN';
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.dragButton) return;

      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      if (dx === 0 && dy === 0) return;

      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;
      this.interruptTransition();

      if (this.dragButton === 'LOOK') {
        const sensitivity = 0.0028;
        this.yaw -= dx * sensitivity;
        this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy * sensitivity));
        this.updateCameraOrientation();
        this.scheduleSave();
      } else if (this.dragButton === 'PAN') {
        const groundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
        const altitude = Math.max(4.0, this.camera.position.y - groundY);
        const panScale = Math.max(0.06, Math.min(2.6, altitude * 0.0022));

        _camForwardH.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
        _camRightH.set(-Math.cos(this.yaw), 0, Math.sin(this.yaw)).normalize();

        this.camera.position.addScaledVector(_camRightH, -dx * panScale);
        this.camera.position.addScaledVector(_camForwardH, dy * panScale);
        this.clampCameraBounds();
        this.updateCameraOrientation();
        this.scheduleSave();
      } else if (this.dragButton === 'ORBIT') {
        const orbitSens = 0.0045;
        this.yaw -= dx * orbitSens;
        this.pitch = Math.max(-1.46, Math.min(-0.04, this.pitch - dy * orbitSens));

        const cosP = Math.cos(this.pitch);
        _camForward.set(Math.sin(this.yaw) * cosP, Math.sin(this.pitch), Math.cos(this.yaw) * cosP);

        this.camera.position.copy(this.orbitPivot).addScaledVector(_camForward, -this.orbitDistance);
        this.clampCameraBounds();
        this.updateCameraOrientation();
        this.scheduleSave();
      }
    });

    window.addEventListener('pointerup', () => {
      this.dragButton = null;
    });

    canvasElement.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.interruptTransition();

        const groundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
        const altitude = Math.max(2.0, this.camera.position.y - groundY);
        const dirSign = -Math.sign(e.deltaY);

        if (this.mode === 'POV') {
          const step = dirSign * (e.shiftKey ? 14.0 : 5.5);
          _camForwardH.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
          this.camera.position.addScaledVector(_camForwardH, step);
        } else {
          // Cursor-anchored dolly zoom in DRONE mode
          _pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
          _pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
          _zoomRaycaster.setFromCamera(_pointerNdc, this.camera);

          const planeY = this.camera.position.z >= 2482 ? 3.2 : 1.63;
          _zoomPlane.constant = -planeY;

          const hit = _zoomRaycaster.ray.intersectPlane(_zoomPlane, _zoomHit);
          const distToHit = hit ? this.camera.position.distanceTo(_zoomHit) : 0;

          if (hit && distToHit > 0.5 && distToHit < 3500) {
            _zoomDir.subVectors(_zoomHit, this.camera.position).normalize();
            let dolly = dirSign * Math.min(240.0, Math.max(4.0, distToHit * 0.16));
            if (dirSign > 0 && distToHit > 5.0) {
              dolly = Math.min(dolly, distToHit - 4.0);
            } else if (dirSign > 0) {
              dolly = 0;
            }
            this.camera.position.addScaledVector(_zoomDir, dolly);
          } else {
            const dolly = dirSign * Math.min(220.0, Math.max(3.5, altitude * 0.16));
            const cosP = Math.cos(this.pitch);
            _camForward.set(Math.sin(this.yaw) * cosP, Math.sin(this.pitch), Math.cos(this.yaw) * cosP);
            this.camera.position.addScaledVector(_camForward, dolly);
          }
        }

        this.clampCameraBounds();
        this.updateCameraOrientation();
        this.scheduleSave();
      },
      { passive: false }
    );
  }

  _initOrbitPivot() {
    const cosP = Math.cos(this.pitch);
    _camForward.set(Math.sin(this.yaw) * cosP, Math.sin(this.pitch), Math.cos(this.yaw) * cosP);

    const groundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
    let dist = 140;

    if (_camForward.y < -0.06) {
      dist = (this.camera.position.y - groundY) / -_camForward.y;
      dist = Math.max(12, Math.min(850, dist));
    }

    this.orbitDistance = dist;
    this.orbitPivot.copy(this.camera.position).addScaledVector(_camForward, dist);
  }

  setOrientationFromTarget(target) {
    const dir = new THREE.Vector3().subVectors(target, this.camera.position);
    const horizLen = Math.hypot(dir.x, dir.z);
    if (horizLen > 0.001) {
      this.yaw = Math.atan2(dir.x, dir.z);
      this.pitch = Math.max(-1.46, Math.min(1.46, Math.atan2(dir.y, horizLen)));
    } else {
      this.yaw = 0;
      this.pitch = dir.y >= 0 ? 1.45 : -1.45;
    }
    this.updateCameraOrientation();
  }

  updateCameraOrientation() {
    const cosP = Math.cos(this.pitch);
    _camForward.set(Math.sin(this.yaw) * cosP, Math.sin(this.pitch), Math.cos(this.yaw) * cosP);

    _targetLook.copy(this.camera.position).addScaledVector(_camForward, 25.0);
    this.camera.lookAt(_targetLook);
    this.currentLookAt.copy(_targetLook);
    if (this.controls) {
      this.controls.target.copy(_targetLook);
    }
  }

  /**
   * Aligns camera azimuth to a real-world compass bearing (0° = True North).
   */
  setHeading(desiredBearingDeg) {
    this.interruptTransition();
    const desiredSceneAngleDeg = NORTH_SCENE_ANGLE_DEG - desiredBearingDeg;
    this.yaw = (desiredSceneAngleDeg * Math.PI) / 180.0;
    this.updateCameraOrientation();
    this.saveState();
  }

  transitionTo(eyePosition, lookAtTarget, durationSec = null) {
    this.transitionStartPos.copy(this.camera.position);

    const targetDist = Math.max(40, eyePosition.distanceTo(lookAtTarget));
    const cosP = Math.cos(this.pitch);
    _camForward.set(Math.sin(this.yaw) * cosP, Math.sin(this.pitch), Math.cos(this.yaw) * cosP);
    this.transitionStartLook.copy(this.camera.position).addScaledVector(_camForward, targetDist);
    this.currentLookAt.copy(this.transitionStartLook);

    this.targetPosition.copy(eyePosition);
    this.targetLookAt.copy(lookAtTarget);

    const travelDist = this.transitionStartPos.distanceTo(this.targetPosition);
    this.transitionDuration =
      durationSec !== null
        ? durationSec
        : Math.max(0.55, Math.min(0.95, 0.52 + travelDist * 0.00022));
    this.transitionElapsed = 0;
    this.isTransitioning = true;
  }

  resetToOverview() {
    sessionStorage.removeItem('ttl_camera_state_v2');
    this.transitionTo(DEFAULT_CAMERA_VIEW.position, DEFAULT_CAMERA_VIEW.target);
  }

  focusSector(sector) {
    if (!sector || !sector.cameraView) return;
    const { position, target } = sector.cameraView;
    this.transitionTo(
      new THREE.Vector3(position.x, position.y, position.z),
      new THREE.Vector3(target.x, target.y, target.z)
    );
  }

  focusCoordinate(x, z) {
    const groundY = this.getGroundHeight(x, z);
    const currentAlt = this.camera.position.y - groundY;
    const desiredAlt = Math.max(70, Math.min(320, currentAlt > 20 ? currentAlt : 160));

    const eyePos = new THREE.Vector3(x + desiredAlt * 0.25, groundY + desiredAlt, z - desiredAlt * 0.75);
    const lookTarget = new THREE.Vector3(x, groundY + 2.0, z);
    this.transitionTo(eyePos, lookTarget);
  }

  update(deltaTime) {
    const dt = Math.min(Math.max(deltaTime || 0, 0), 0.05);

    if (
      !Number.isFinite(this.camera.position.x) ||
      !Number.isFinite(this.camera.position.y) ||
      !Number.isFinite(this.camera.position.z)
    ) {
      this.camera.position.copy(DEFAULT_CAMERA_VIEW.position);
      this.targetPosition.copy(DEFAULT_CAMERA_VIEW.position);
      this.setOrientationFromTarget(DEFAULT_CAMERA_VIEW.target);
      this.isTransitioning = false;
      return;
    }

    if (this.isTransitioning) {
      const transitionDt = Math.min(Math.max(deltaTime || 0, 0), 0.1);
      this.transitionElapsed += transitionDt;
      const t = Math.min(1.0, this.transitionElapsed / this.transitionDuration);
      const easePos = 1.0 - Math.pow(1.0 - t, 3);
      const easeLook = 1.0 - Math.pow(1.0 - Math.min(1.0, t * 1.18), 3);

      this.camera.position.lerpVectors(this.transitionStartPos, this.targetPosition, easePos);
      this.currentLookAt.lerpVectors(this.transitionStartLook, this.targetLookAt, easeLook);

      this.clampCameraBounds();
      this.camera.lookAt(this.currentLookAt);

      if (t >= 1.0) {
        this.camera.position.copy(this.targetPosition);
        this.setOrientationFromTarget(this.targetLookAt);
        this.isTransitioning = false;
        this.saveState();
      }
      return;
    }

    this.handleWASD(dt);
  }

  handleWASD(dt) {
    if (this.isTransitioning) return;

    let moved = false;
    _camForwardH.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
    _camRightH.set(-Math.cos(this.yaw), 0, Math.sin(this.yaw)).normalize();

    const groundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
    const altitude = Math.max(1.0, this.camera.position.y - groundY);
    const baseSpeed = Math.min(480.0, Math.max(18.0, 16.0 + altitude * 0.55));

    let speedMultiplier = 1.0;
    if (this.keys.shift) speedMultiplier = 2.5;
    else if (this.keys.alt) speedMultiplier = 0.2;

    const step = baseSpeed * speedMultiplier * dt;
    _camMovement.set(0, 0, 0);

    if (this.keys.w) { _camMovement.addScaledVector(_camForwardH, step); moved = true; }
    if (this.keys.s) { _camMovement.addScaledVector(_camForwardH, -step); moved = true; }
    if (this.keys.a) { _camMovement.addScaledVector(_camRightH, -step); moved = true; }
    if (this.keys.d) { _camMovement.addScaledVector(_camRightH, step); moved = true; }
    if (this.keys.q) { _camMovement.y += step; moved = true; }
    if (this.keys.z || this.keys.e) { _camMovement.y -= step; moved = true; }

    if (moved) {
      this.camera.position.add(_camMovement);
      this.clampCameraBounds();
      this.updateCameraOrientation();
      this.scheduleSave();
    }
  }

  /**
   * Accurate world surface elevation calibrated to the shifted terminal geometry.
   */
  getGroundHeight(x, z) {
    // 1. Dermaga & Trestle Lepas Pantai (Z >= 2482)
    if (z >= 2482) {
      if (z >= 3430 && x >= -645 && x <= 270) return 3.2;
      if (Math.abs(x) <= 12) return 3.2;
      return 0.0;
    }

    // 2. Daratan Terminal Reklamasi (Pre-Gate, Buffer, HO, Main Gate, CY, Cuker: Z >= 570)
    if (z >= 570) {
      return 1.63;
    }

    // 3. Jembatan Laut Melengkung (World Z: -110 s/d +570, karena pos.z = -55)
    if (z >= -110 && z < 570) {
      const bridgeStartZ = -110;
      const bridgeLength = 680;
      const t = Math.max(0, Math.min(1, (z - bridgeStartZ) / bridgeLength));
      const sweepWidth = 4.8;
      const bridgeCenterLineX = Math.sin(t * Math.PI) * sweepWidth;

      const yBase = 0.82 + t * (1.62 - 0.82);
      const yArch = 6.8 * 4.0 * t * (1.0 - t);
      const deckHeight = yBase + yArch;

      const lateralDist = Math.abs(x - bridgeCenterLineX);
      if (lateralDist <= 10.0) return deckHeight;
      if (lateralDist < 22.0) {
        const u = (22.0 - lateralDist) / 12.0;
        const s = u * u * (3.0 - 2.0 * u);
        return THREE.MathUtils.lerp(0.0, deckHeight, s);
      }
      return 0.0;
    }

    // 4. Tol Romokalisari Elevated Flyover Ramp (World Z: -1163 s/d -847)
    if (z >= -1163 && z <= -847 && Math.abs(x) >= 3.8 && Math.abs(x) <= 12.2) {
      const t = (z - (-1163)) / 316.0;
      return 7.0 - t * (7.0 - 0.81);
    }

    // 5. Koridor Jalan Daratan Osowilangon (Z < -110)
    if (z < -110) {
      return 0.81;
    }

    return 0.0;
  }

  clampCameraBounds() {
    const camGroundY = this.getGroundHeight(this.camera.position.x, this.camera.position.z);
    const minCamY = camGroundY + 0.5;

    if (this.camera.position.y < minCamY) {
      this.camera.position.y = minCamY;
    }
    if (this.camera.position.y > 2200.0) {
      this.camera.position.y = 2200.0;
    }

    this.camera.position.x = Math.max(-1050.0, Math.min(650.0, this.camera.position.x));
    this.camera.position.z = Math.max(-1400.0, Math.min(3900.0, this.camera.position.z));
  }
}
