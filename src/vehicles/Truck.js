import * as THREE from 'three';
import { TruckStateMachine, TruckState } from '../simulation/StateMachine.js';

/**
 * ==============================================================================
 * Truck Class (Indonesian Right-Hand Drive / Setir Kanan Model)
 * ==============================================================================
 *
 * Encapsulates an authentic container terminal truck entity with:
 * - INDONESIAN RIGHT-HAND DRIVE (RHD): Steering wheel & driver on the RIGHT
 * - Identification & Container metadata
 * - Dynamic Container Attachment / Detachment (`setHasContainer(boolean)`)
 * - State Machine lifecycle with alternating missions
 * - Waypoint navigation with starting offset
 * - 3D Selection Ring
 */
export class Truck {
  /**
   * @param {Object} options
   * @param {string} [options.id="TRK-001"]
   * @param {string} [options.containerNumber="MSKU-982341-2"]
   * @param {number} [options.containerColor=0x0284c7]
   * @param {number} [options.cabinColor=0xea580c]
   * @param {number} [options.speed=7.0]
   * @param {boolean} [options.hasContainer=true]
   * @param {'UNLOAD' | 'LOAD'} [options.mission='UNLOAD']
   */
  constructor(options = {}) {
    this.id = options.id || 'TRK-001';
    this.containerNumber = options.containerNumber || 'MSKU-982341-2';
    this.containerColor = options.containerColor || 0x0284c7;
    this.cabinColor = options.cabinColor || 0xea580c;
    this.baseSpeed = options.speed || 7.0;
    this.speed = this.baseSpeed;
    this.hasContainer = options.hasContainer !== undefined ? options.hasContainer : true;

    // Operational State Machine with Alternating Mission
    this.stateMachine = new TruckStateMachine(TruckState.ARRIVING, options.mission || 'UNLOAD');

    // Selection State
    this.isSelected = false;

    // Navigation & Waypoint State
    this.route = [];
    this.currentWaypointIndex = 0;
    this.loop = true;
    this.isMoving = false;
    this.arrivalThreshold = 0.8;

    // References to wheels and container mesh
    this.wheelAssemblies = [];
    this.wheelRadius = 0.5;
    this.containerMesh = null;

    // Root THREE.Group for the entire truck
    this.group = new THREE.Group();
    this.group.name = `truck_${this.id}`;
    this.group.userData = { truck: this };

    this._buildTruck();
  }

  /**
   * Constructs all sub-meshes and adds them to the parent Group.
   * @private
   */
  _buildTruck() {
    // Shared Materials
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.3
    });

    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: this.cabinColor,
      roughness: 0.5,
      metalness: 0.2
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });

    const containerMaterial = new THREE.MeshStandardMaterial({
      color: this.containerColor,
      roughness: 0.6,
      metalness: 0.2
    });

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8
    });

    const interiorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8
    });

    const steeringMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.4
    });

    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    const tagMesh = (mesh) => {
      mesh.userData = { truck: this };
      return mesh;
    };

    // 1. Chassis
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.4, 9.0);
    const chassis = tagMesh(new THREE.Mesh(chassisGeo, chassisMaterial));
    chassis.position.set(0, 0.9, 0.5);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.group.add(chassis);

    // 2. Cabin
    const cabinGeo = new THREE.BoxGeometry(2.4, 2.2, 2.3);
    const cabin = tagMesh(new THREE.Mesh(cabinGeo, cabinMaterial));
    cabin.position.set(0, 2.2, 3.6);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.group.add(cabin);

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(2.2, 0.9, 0.1);
    const windshield = tagMesh(new THREE.Mesh(windshieldGeo, glassMaterial));
    windshield.position.set(0, 2.5, 4.76);
    windshield.castShadow = true;
    this.group.add(windshield);

    // Side Windows
    const sideWindowGeo = new THREE.BoxGeometry(0.08, 0.7, 1.2);
    const sideWindowLeft = tagMesh(new THREE.Mesh(sideWindowGeo, glassMaterial));
    sideWindowLeft.position.set(-1.21, 2.45, 3.7);
    this.group.add(sideWindowLeft);

    const sideWindowRight = tagMesh(new THREE.Mesh(sideWindowGeo, glassMaterial));
    sideWindowRight.position.set(1.21, 2.45, 3.7);
    this.group.add(sideWindowRight);

    // --------------------------------------------------------------------------
    // INDONESIAN RIGHT-HAND DRIVE (RHD): Steering Wheel & Driver Seat on RIGHT
    // --------------------------------------------------------------------------
    // Driver Seat on the RIGHT side (x = +0.55)
    const driverSeatGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const driverSeat = tagMesh(new THREE.Mesh(driverSeatGeo, interiorMaterial));
    driverSeat.position.set(0.55, 1.9, 3.7);
    this.group.add(driverSeat);

    // Steering Wheel on the RIGHT side (x = +0.55, z = 4.3)
    const steeringGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16);
    const steeringWheel = tagMesh(new THREE.Mesh(steeringGeo, steeringMaterial));
    steeringWheel.rotation.x = Math.PI / 4;
    steeringWheel.position.set(0.55, 2.35, 4.3);
    this.group.add(steeringWheel);

    // Passenger Seat on the LEFT side (x = -0.55)
    const passSeatGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const passSeat = tagMesh(new THREE.Mesh(passSeatGeo, interiorMaterial));
    passSeat.position.set(-0.55, 1.9, 3.7);
    this.group.add(passSeat);

    // Front Bumper
    const bumperGeo = new THREE.BoxGeometry(2.5, 0.4, 0.3);
    const bumper = tagMesh(new THREE.Mesh(bumperGeo, chassisMaterial));
    bumper.position.set(0, 0.5, 4.85);
    bumper.castShadow = true;
    this.group.add(bumper);

    // Headlights
    const headlightGeo = new THREE.BoxGeometry(0.35, 0.2, 0.1);
    const headlightLeft = tagMesh(new THREE.Mesh(headlightGeo, lightMaterial));
    headlightLeft.position.set(-0.85, 0.55, 4.96);
    this.group.add(headlightLeft);

    const headlightRight = tagMesh(new THREE.Mesh(headlightGeo, lightMaterial));
    headlightRight.position.set(0.85, 0.55, 4.96);
    this.group.add(headlightRight);

    // 3. Container (Cargo Box on Chassis Bed)
    const containerGeo = new THREE.BoxGeometry(2.4, 2.5, 6.0);
    this.containerMesh = tagMesh(new THREE.Mesh(containerGeo, containerMaterial));
    this.containerMesh.position.set(0, 2.35, -1.1);
    this.containerMesh.castShadow = true;
    this.containerMesh.receiveShadow = true;
    this.containerMesh.visible = this.hasContainer;
    this.group.add(this.containerMesh);

    // 4. Wheels
    const wheelThickness = 0.35;
    const wheelGeo = new THREE.CylinderGeometry(this.wheelRadius, this.wheelRadius, wheelThickness, 24);
    const rimGeo = new THREE.CylinderGeometry(this.wheelRadius * 0.55, this.wheelRadius * 0.55, wheelThickness + 0.02, 16);

    const wheelPositions = [
      { name: 'Front Left', x: -1.2, y: 0.5, z: 3.3 },
      { name: 'Front Right', x: 1.2, y: 0.5, z: 3.3 },
      { name: 'Rear Left', x: -1.2, y: 0.5, z: -2.8 },
      { name: 'Rear Right', x: 1.2, y: 0.5, z: -2.8 },
    ];

    wheelPositions.forEach((pos) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.name = `wheel_${pos.name.toLowerCase().replace(' ', '_')}`;
      wheelAssembly.userData = { truck: this };

      const tire = tagMesh(new THREE.Mesh(wheelGeo, wheelMaterial));
      tire.castShadow = true;
      wheelAssembly.add(tire);

      const rim = tagMesh(new THREE.Mesh(rimGeo, rimMaterial));
      wheelAssembly.add(rim);

      wheelAssembly.rotation.z = Math.PI / 2;
      wheelAssembly.position.set(pos.x, pos.y, pos.z);
      this.group.add(wheelAssembly);
      this.wheelAssemblies.push(wheelAssembly);
    });

    // 5. 3D Selection Ring (Pulsing Cyan Indicator on Ground)
    const ringGeo = new THREE.RingGeometry(2.4, 2.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.selectionRing = new THREE.Mesh(ringGeo, ringMat);
    this.selectionRing.rotation.x = -Math.PI / 2;
    this.selectionRing.position.set(0, 0.05, 0.5);
    this.selectionRing.visible = false;
    this.group.add(this.selectionRing);
  }

  setRoute(waypoints) {
    this.route = waypoints || [];
    this.currentWaypointIndex = 0;
    if (this.route.length > 0) {
      const startPt = this.route[0];
      this.group.position.set(startPt.x, startPt.y, startPt.z);
      if (this.route.length > 1) {
        const nextPt = this.route[1];
        this.group.lookAt(nextPt.x, nextPt.y, nextPt.z);
      }
    }
  }

  setStartingOffset(waypointIndex) {
    if (!this.route || this.route.length === 0) return;
    this.currentWaypointIndex = waypointIndex % this.route.length;
    const currentPt = this.route[this.currentWaypointIndex];
    this.group.position.set(currentPt.x, currentPt.y, currentPt.z);
    const nextIdx = (this.currentWaypointIndex + 1) % this.route.length;
    const nextPt = this.route[nextIdx];
    this.group.lookAt(nextPt.x, nextPt.y, nextPt.z);
  }

  setHasContainer(visible) {
    this.hasContainer = visible;
    if (this.containerMesh) {
      this.containerMesh.visible = visible;
    }
  }

  setSelected(selected) {
    this.isSelected = selected;
    if (this.selectionRing) {
      this.selectionRing.visible = selected;
    }
  }

  update(deltaTime, inGate = null, outGate = null, reachStacker = null) {
    if (this.isSelected && this.selectionRing) {
      const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.006);
      this.selectionRing.material.opacity = pulse;
    }

    if (!this.route || this.route.length === 0) return;

    this.stateMachine.update(deltaTime, this, inGate, outGate, reachStacker);

    if (this.isMoving && this.speed > 0) {
      const targetWaypoint = this.route[this.currentWaypointIndex];
      const targetPos = new THREE.Vector3(targetWaypoint.x, targetWaypoint.y, targetWaypoint.z);
      const currentPos = this.group.position;
      const distance = currentPos.distanceTo(targetPos);

      if (distance < this.arrivalThreshold) {
        this.currentWaypointIndex++;
        if (this.currentWaypointIndex >= this.route.length) {
          if (this.loop) {
            this.currentWaypointIndex = 0;
          } else {
            this.isMoving = false;
            return;
          }
        }
      }

      const moveDirection = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
      const moveDistance = this.speed * deltaTime;
      this.group.position.addScaledVector(moveDirection, moveDistance);

      if (moveDirection.lengthSq() > 0.0001) {
        const targetRotationY = Math.atan2(moveDirection.x, moveDirection.z);
        let currentRotationY = this.group.rotation.y;
        let deltaRotation = targetRotationY - currentRotationY;
        while (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
        while (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;
        this.group.rotation.y += deltaRotation * Math.min(1.0, 10.0 * deltaTime);
      }

      const angularDistance = moveDistance / this.wheelRadius;
      this.wheelAssemblies.forEach((wheel) => {
        wheel.children.forEach((mesh) => {
          mesh.rotation.y -= angularDistance;
        });
      });
    }
  }

  getPosition() {
    return this.group.position;
  }

  getMesh() {
    return this.group;
  }
}
