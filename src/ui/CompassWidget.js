import * as THREE from 'three';

/**
 * ==============================================================================
 * CompassWidget (Arah Mata Angin HUD - Calibrated to User POV)
 * ==============================================================================
 *
 * Professional Rotating Heading Indicator (Compass Rose):
 * - Fixed top lubber index (▲) represents current camera POV heading.
 * - Rotating dial disc dynamically aligns cardinal points (U, T, S, B).
 * - Utara & Selatan tetap terkunci pada sumbu yang sudah benar.
 * - Timur & Barat disesuaikan (Timur di kanan Utara, Barat di kiri Utara).
 */

// Scene azimuth angle where True North (0°) is located:
export const NORTH_SCENE_ANGLE_DEG = 32.45;

export class CompassWidget {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {Object} cameraManager
   * @param {Object} controls
   */
  constructor(camera, cameraManager, controls) {
    this.camera = camera;
    this.cameraManager = cameraManager;
    this.controls = controls;

    this.dialEl = document.getElementById('compass-dial-ring');
    this.degValEl = document.getElementById('compass-deg-val');
    this.cardinalValEl = document.getElementById('compass-cardinal-val');
    this.compassCardEl = document.getElementById('compass-interactive-card');

    this.lastBearing = -999;
    this.setupListeners();
  }

  setupListeners() {
    // Click on Compass Dial directly to Align to True North
    if (this.compassCardEl) {
      this.compassCardEl.addEventListener('click', () => {
        this.alignToNorth();
      });
    }
  }

  /**
   * Calculates the current real-world geographic bearing of the camera.
   * @returns {{bearingDeg: number, dialRotationDeg: number, cardinal: string, cardinalFull: string}}
   */
  getCurrentBearing() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    // Direction on horizontal plane in Three.js coordinates
    const angleInSceneRad = Math.atan2(dir.x, dir.z);
    const angleInSceneDeg = (angleInSceneRad * 180.0) / Math.PI;

    // Real-world bearing:
    // Utara (0°) pada angleInSceneDeg = NORTH_SCENE_ANGLE_DEG (32.45°).
    // Timur (+90°) di sebelah kanan Utara, Barat (+270°) di sebelah kiri Utara.
    const bearingDeg = ((NORTH_SCENE_ANGLE_DEG - angleInSceneDeg) % 360.0 + 360.0) % 360.0;

    // Dial rotation angle so current heading is at 12 o'clock under lubber line:
    const dialRotationDeg = (-bearingDeg % 360.0 + 360.0) % 360.0;

    const { cardinal, cardinalFull } = this.getCardinalFromBearing(bearingDeg);

    return { bearingDeg, dialRotationDeg, cardinal, cardinalFull };
  }

  /**
   * Converts bearing degree [0, 360) into standard Indonesian + International cardinal names.
   */
  getCardinalFromBearing(deg) {
    if (deg >= 337.5 || deg < 22.5) return { cardinal: 'U', cardinalFull: 'Utara (North)' };
    if (deg >= 22.5 && deg < 67.5) return { cardinal: 'TL', cardinalFull: 'Timur Laut (NE)' };
    if (deg >= 67.5 && deg < 112.5) return { cardinal: 'T', cardinalFull: 'Timur (East)' };
    if (deg >= 112.5 && deg < 157.5) return { cardinal: 'TG', cardinalFull: 'Tenggara (SE)' };
    if (deg >= 157.5 && deg < 202.5) return { cardinal: 'S', cardinalFull: 'Selatan (South)' };
    if (deg >= 202.5 && deg < 247.5) return { cardinal: 'BD', cardinalFull: 'Barat Daya (SW)' };
    if (deg >= 247.5 && deg < 292.5) return { cardinal: 'B', cardinalFull: 'Barat (West)' };
    return { cardinal: 'BL', cardinalFull: 'Barat Laut (NW)' };
  }

  /**
   * Smoothly rotates the camera around the current OrbitControls target
   * so that the camera faces the desired real-world bearing.
   * @param {number} desiredBearingDeg - Target azimuth (0° = True North)
   */
  alignToHeading(desiredBearingDeg) {
    if (!this.controls || !this.cameraManager) return;

    const target = this.controls.target;
    const eye = this.camera.position;

    // Calculate horizontal distance and elevation from target
    const dx = eye.x - target.x;
    const dz = eye.z - target.z;
    const r = Math.max(Math.sqrt(dx * dx + dz * dz), 15.0);
    const y = Math.max(eye.y, 8.0);

    // sceneAngle = NORTH_SCENE_ANGLE_DEG - desiredBearingDeg
    const desiredSceneAngleDeg = NORTH_SCENE_ANGLE_DEG - desiredBearingDeg;
    const desiredSceneAngleRad = (desiredSceneAngleDeg * Math.PI) / 180.0;

    // View direction vector from eye to target must point in desiredSceneAngle:
    // dir = (sin(sceneAngle), cos(sceneAngle))
    // eye = target - dir * r
    const newEyeX = target.x - Math.sin(desiredSceneAngleRad) * r;
    const newEyeZ = target.z - Math.cos(desiredSceneAngleRad) * r;

    const newEyePos = new THREE.Vector3(newEyeX, y, newEyeZ);

    sessionStorage.removeItem('ttl_camera_state');
    this.cameraManager.transitionTo(newEyePos, target, 3.0);
  }

  /**
   * Aligns camera directly facing True North (000° U).
   */
  alignToNorth() {
    this.alignToHeading(0.0);
  }

  /**
   * Aligns camera directly facing True East (090° T).
   */
  alignToEast() {
    this.alignToHeading(90.0);
  }

  /**
   * Aligns camera directly facing True South (180° S).
   */
  alignToSouth() {
    this.alignToHeading(180.0);
  }

  /**
   * Aligns camera directly facing True West (270° B).
   */
  alignToWest() {
    this.alignToHeading(270.0);
  }

  /**
   * Updates rotating dial and digital HUD readouts each animation frame.
   */
  update() {
    const { bearingDeg, dialRotationDeg, cardinal, cardinalFull } = this.getCurrentBearing();

    // Avoid unnecessary DOM updates if change is under 0.15 deg
    if (Math.abs(bearingDeg - this.lastBearing) < 0.15) return;
    this.lastBearing = bearingDeg;

    // Rotate the Compass Rose Dial (Course-Up / Heading Indicator)
    if (this.dialEl) {
      this.dialEl.style.transform = `rotate(${dialRotationDeg.toFixed(1)}deg)`;
    }

    // Update Digital Readout
    if (this.degValEl) {
      this.degValEl.textContent = `${Math.round(bearingDeg).toString().padStart(3, '0')}°`;
    }

    if (this.cardinalValEl) {
      this.cardinalValEl.textContent = `${cardinal} · ${cardinalFull}`;
    }
  }
}
