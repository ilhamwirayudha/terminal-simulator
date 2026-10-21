import * as THREE from 'three';

/**
 * ==============================================================================
 * SelectionManager (Raycaster Selection & Deselection Toggle)
 * ==============================================================================
 *
 * Uses Three.js Raycaster to detect clicks and hovers over 3D interactive entities.
 *
 * Features:
 * - Distinguishes quick clicks from camera orbit drag gestures.
 * - Clicking a truck selects it; clicking it again or clicking empty ground deselects it.
 * - Updates hover cursor feedback (`pointer` vs `default`).
 * - Manages active selected truck state and fires `onSelectionChange` callbacks.
 */
export class SelectionManager {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {THREE.PerspectiveCamera} camera
   */
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.selectables = []; // List of registered Truck instances
    this.selectedTruck = null;
    this.hoveredTruck = null;

    this.onSelectionChange = null;

    // Gesture tracking to distinguish clicks from camera drags
    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerDownTime = 0;

    this._initEvents();
  }

  /**
   * Registers a truck for interactive raycasting selection.
   * @param {Object} truck - Instance of Truck
   */
  registerSelectable(truck) {
    if (truck && !this.selectables.includes(truck)) {
      this.selectables.push(truck);
    }
  }

  /**
   * Attaches pointer event listeners to the canvas.
   * @private
   */
  _initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos.x = e.clientX;
      this.pointerDownPos.y = e.clientY;
      this.pointerDownTime = performance.now();
    });

    this.canvas.addEventListener('pointermove', (e) => {
      // Convert screen pixels to Normalized Device Coordinates (NDC) [-1 to +1]
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this._checkHover();
    });

    this.canvas.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      const elapsed = performance.now() - this.pointerDownTime;

      // Only treat as a click if mouse barely moved (< 6px) and released quickly (< 400ms)
      if (dist < 6 && elapsed < 400) {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this._handleClick();
      }
    });
  }

  /**
   * Performs raycasting to update hover state and cursor style.
   * @private
   */
  _checkHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hit = this._raycastSelectables();

    if (hit) {
      const truck = hit.object.userData.truck;
      if (truck) {
        this.canvas.style.cursor = 'pointer';
        this.hoveredTruck = truck;
        return;
      }
    }

    this.canvas.style.cursor = 'default';
    this.hoveredTruck = null;
  }

  /**
   * Performs raycasting on pointer click to select or deselect truck.
   * @private
   */
  _handleClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hit = this._raycastSelectables();

    if (hit && hit.object.userData.truck) {
      const clickedTruck = hit.object.userData.truck;
      // If clicking the currently selected truck, toggle unclick / deselect!
      if (this.selectedTruck === clickedTruck) {
        this.deselect();
      } else {
        this.select(clickedTruck);
      }
    } else {
      // Clicked outside on ground / empty space -> unclick / deselect!
      if (this.selectedTruck) {
        this.deselect();
      }
    }
  }

  /**
   * Raycasts against all registered selectable truck groups.
   * @private
   * @returns {THREE.Intersection | null}
   */
  _raycastSelectables() {
    const meshesToTest = [];

    this.selectables.forEach((truck) => {
      const meshGroup = truck.getMesh();
      if (meshGroup) {
        meshGroup.traverse((child) => {
          if (child.isMesh && !child.userData.isHelper) {
            meshesToTest.push(child);
          }
        });
      }
    });

    const intersections = this.raycaster.intersectObjects(meshesToTest, false);
    return intersections.length > 0 ? intersections[0] : null;
  }

  /**
   * Selects a truck, applies visual indicator, and fires change callback.
   * @param {Object} truck
   */
  select(truck) {
    if (this.selectedTruck === truck) return;

    if (this.selectedTruck) {
      this.selectedTruck.setSelected(false);
    }

    this.selectedTruck = truck;

    if (this.selectedTruck) {
      this.selectedTruck.setSelected(true);
    }

    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(this.selectedTruck);
    }
  }

  /**
   * Deselects current truck.
   */
  deselect() {
    this.select(null);
  }

  /**
   * Returns currently selected truck instance.
   * @returns {Object | null}
   */
  getSelected() {
    return this.selectedTruck;
  }
}
