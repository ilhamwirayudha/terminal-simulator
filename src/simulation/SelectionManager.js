import * as THREE from 'three';
import {
  OPERATIONAL_SECTORS,
  getSectorById,
  resolveOperationalSector
} from '../terminal/SectorRegistry.js';

const _landPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.65);
const _pierPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -3.22);
const _planeHit = new THREE.Vector3();

/**
 * ==============================================================================
 * SelectionManager (3D Sector Raycaster & Perimeter Highlight Controller)
 * ==============================================================================
 *
 * Memungkinkan user mengklik langsung salah satu dari 5 sektor operasional di
 * kanvas 3D untuk menyorot batas area, mengarahkan kamera, dan membaca aktivitas.
 */
export class SelectionManager {
  constructor(canvas, camera, scene) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.hitboxMeshes = [];
    this.sectorVisuals = new Map(); // sectorId -> Array<{ lineMat, fillMat }>

    this.selectedSectorId = null;
    this.hoveredSectorId = null;
    this.onSelectionChange = null;

    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerDownButton = -1;
    this.pointerDownTime = 0;

    this._buildSectorVolumes();
    this._initEvents();
  }

  _buildSectorVolumes() {
    const group = new THREE.Group();
    group.name = 'sector_selection_volumes';

    const hitboxMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
      side: THREE.FrontSide
    });

    OPERATIONAL_SECTORS.forEach((sector) => {
      const visuals = [];

      sector.bounds.forEach((b) => {
        const widthX = b.xMax - b.xMin;
        const lengthZ = b.zMax - b.zMin;
        const cx = (b.xMin + b.xMax) * 0.5;
        const cz = (b.zMin + b.zMax) * 0.5;
        const yBase = b.yBase ?? 1.65;
        const height = b.height ?? 18.0;

        // 1. Lightweight invisible raycast hitbox covering buildings/cranes/ground
        const boxGeo = new THREE.BoxGeometry(widthX, height, lengthZ);
        const hitbox = new THREE.Mesh(boxGeo, hitboxMat);
        hitbox.position.set(cx, yBase + height * 0.5, cz);
        hitbox.userData.sectorId = sector.id;
        hitbox.raycast = THREE.Mesh.prototype.raycast;
        group.add(hitbox);
        this.hitboxMeshes.push(hitbox);

        // 2. Crisp ground perimeter outline
        const yLine = yBase + 0.18;
        const pts = [
          new THREE.Vector3(b.xMin, yLine, b.zMin),
          new THREE.Vector3(b.xMax, yLine, b.zMin),
          new THREE.Vector3(b.xMax, yLine, b.zMax),
          new THREE.Vector3(b.xMin, yLine, b.zMax)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(sector.accentColor),
          transparent: true,
          opacity: 0.16,
          depthWrite: false
        });
        const outline = new THREE.LineLoop(lineGeo, lineMat);
        outline.renderOrder = 10;
        group.add(outline);

        // 3. Subtle translucent area highlight fill
        const fillGeo = new THREE.PlaneGeometry(widthX, lengthZ);
        const fillMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(sector.accentColor),
          transparent: true,
          opacity: 0.0,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const fill = new THREE.Mesh(fillGeo, fillMat);
        fill.rotation.x = -Math.PI / 2;
        fill.position.set(cx, yBase + 0.12, cz);
        fill.renderOrder = 9;
        group.add(fill);

        visuals.push({ lineMat, fillMat });
      });

      this.sectorVisuals.set(sector.id, visuals);
    });

    if (this.scene) {
      this.scene.add(group);
    }
  }

  _initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos.x = e.clientX;
      this.pointerDownPos.y = e.clientY;
      this.pointerDownButton = e.button;
      this.pointerDownTime = performance.now();
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.buttons !== 0) return;
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this._updateHover();
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (this.pointerDownButton !== 0) return;

      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      const elapsed = performance.now() - this.pointerDownTime;

      if (dist < 6 && elapsed < 350) {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        const sectorId = this._raycastSectorId();

        if (sectorId) {
          this.selectSector(sectorId, { source: '3d' });
        } else if (this.selectedSectorId) {
          this.deselect({ source: '3d' });
        }
      }
    });
  }

  _raycastSectorId() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hits = this.raycaster.intersectObjects(this.hitboxMeshes, false);
    if (hits.length > 0 && hits[0].object?.userData?.sectorId) {
      return hits[0].object.userData.sectorId;
    }

    // Fallback when camera is inside a tall hitbox volume: check ground plane intersection
    if (this.raycaster.ray.intersectPlane(_pierPlane, _planeHit)) {
      const pierSector = resolveOperationalSector(_planeHit.x, _planeHit.z);
      if (pierSector && _planeHit.z >= 3400) return pierSector.id;
    }
    if (this.raycaster.ray.intersectPlane(_landPlane, _planeHit)) {
      const landSector = resolveOperationalSector(_planeHit.x, _planeHit.z);
      if (landSector && _planeHit.z < 3400) return landSector.id;
    }

    return null;
  }

  _updateHover() {
    const hoveredId = this._raycastSectorId();
    if (hoveredId === this.hoveredSectorId) return;

    this.hoveredSectorId = hoveredId;
    this.canvas.style.cursor = hoveredId ? 'pointer' : 'grab';
    this._refreshVisualStates();
  }

  _refreshVisualStates() {
    this.sectorVisuals.forEach((visuals, sectorId) => {
      const isSelected = sectorId === this.selectedSectorId;
      const isHovered = sectorId === this.hoveredSectorId;

      const lineOpacity = isSelected ? 0.95 : isHovered ? 0.65 : 0.16;
      const fillOpacity = isSelected ? 0.12 : isHovered ? 0.05 : 0.0;

      visuals.forEach(({ lineMat, fillMat }) => {
        lineMat.opacity = lineOpacity;
        fillMat.opacity = fillOpacity;
      });
    });
  }

  selectSector(sectorId, meta = { source: 'ui' }) {
    const sector = getSectorById(sectorId);
    if (!sector) return;

    const wasAlreadySelected = this.selectedSectorId === sector.id;
    this.selectedSectorId = sector.id;
    this._refreshVisualStates();

    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(sector, { ...meta, wasAlreadySelected });
    }
  }

  deselect(meta = { source: 'ui' }) {
    if (!this.selectedSectorId) return;
    this.selectedSectorId = null;
    this._refreshVisualStates();

    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(null, meta);
    }
  }

  getSelectedSector() {
    return getSectorById(this.selectedSectorId);
  }
}
