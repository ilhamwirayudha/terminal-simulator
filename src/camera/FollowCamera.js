import * as THREE from 'three';

/**
 * ==============================================================================
 * FollowCamera Controller (Prototype 06: Follow Camera System)
 * ==============================================================================
 *
 * Provides smooth third-person vehicle observation without physically parenting
 * the camera to the truck group.
 *
 * Features:
 * - Calculates world coordinates based on truck position & heading angle.
 * - Applies smooth exponential position interpolation (`Vector3.lerp`).
 * - Applies smooth look-at target interpolation for organic camera panning.
 * - Coordinates cleanly with `OrbitControls` (disabling during follow, synchronizing
 *   orbit target when returning to overview).
 */
export class FollowCamera {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {Object} controls - Instance of OrbitControls
   */
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    this.targetTruck = null;
    this.isFollowing = false;

    // Local offset relative to the truck (Behind: Z = -22, Elevated: Y = 12)
    // In truck local space, front is +Z, so -Z is behind the truck
    this.localOffset = new THREE.Vector3(0, 12, -22);

    // Current interpolated look-at vector
    this.currentLookAt = new THREE.Vector3();

    // Damping responsiveness
    this.followSpeed = 4.5;
    this.lookSpeed = 6.0;
  }

  /**
   * Starts following a specified truck.
   * @param {Object} truck - Instance of Truck
   */
  startFollow(truck) {
    if (!truck) return;
    this.targetTruck = truck;
    this.isFollowing = true;

    // Disable OrbitControls mouse interactions while actively tracking
    this.controls.enabled = false;

    // Initialize look-at point to the truck's current position
    const pos = truck.getPosition();
    this.currentLookAt.set(pos.x, pos.y + 2.5, pos.z);
  }

  /**
   * Stops following and re-enables free OrbitControls inspection.
   */
  stopFollow() {
    this.isFollowing = false;
    this.targetTruck = null;

    // Re-enable OrbitControls and synchronize its orbit center target
    this.controls.enabled = true;
    this.controls.target.copy(this.currentLookAt);
  }

  /**
   * Toggles between Follow Mode and Overview Mode.
   * @param {Object} truck
   * @returns {boolean} New follow state
   */
  toggleFollow(truck) {
    if (this.isFollowing) {
      this.stopFollow();
    } else {
      this.startFollow(truck);
    }
    return this.isFollowing;
  }

  /**
   * Checks if follow mode is currently active.
   * @returns {boolean}
   */
  isFollowingTarget() {
    return this.isFollowing;
  }

  /**
   * Updates camera position and orientation each frame using delta time.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (!this.isFollowing || !this.targetTruck) return;

    const truckPos = this.targetTruck.getPosition();
    const truckRotY = this.targetTruck.group.rotation.y;

    // 1. Calculate desired world position for camera behind the truck
    const rotatedOffset = this.localOffset.clone();
    rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), truckRotY);

    const desiredCamPos = truckPos.clone().add(rotatedOffset);

    // 2. Smoothly interpolate (lerp) camera position
    const lerpFactor = Math.min(this.followSpeed * deltaTime, 1.0);
    this.camera.position.lerp(desiredCamPos, lerpFactor);

    // 3. Smoothly interpolate look-at target (aimed slightly above cabin center)
    const desiredLookAt = truckPos.clone().add(new THREE.Vector3(0, 2.2, 0));
    const lookLerpFactor = Math.min(this.lookSpeed * deltaTime, 1.0);
    this.currentLookAt.lerp(desiredLookAt, lookLerpFactor);

    // 4. Orient camera toward look-at target
    this.camera.lookAt(this.currentLookAt);
  }
}
