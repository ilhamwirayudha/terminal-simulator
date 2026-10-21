import * as THREE from 'three';

/**
 * ==============================================================================
 * ReachStacker Class (Container Yard Mobile Handling Equipment - TTL)
 * ==============================================================================
 *
 * Represents an articulated Reach Stacker container handling crane:
 * 1. Industrial Safety-Yellow Chassis, Counterweight, Operator Cabin, and 4 Wheels.
 * 2. Articulated Hydraulic Telescopic Boom Arm that pitches up/down.
 * 3. Top Spreader with Twistlocks.
 * 4. Animated UNLOAD sequence (removes container from truck and places on yard stack).
 * 5. Animated LOAD sequence (picks container from stack and mounts on truck).
 */
export class ReachStacker {
  /**
   * @param {Object} [options]
   * @param {number} [options.x=4.5]
   * @param {number} [options.y=1.25]
   * @param {number} [options.z=0]
   */
  constructor(options = {}) {
    this.initialPos = {
      x: options.x !== undefined ? options.x : 4.5,
      y: options.y !== undefined ? options.y : 1.25,
      z: options.z !== undefined ? options.z : 0
    };

    this.group = new THREE.Group();
    this.group.name = 'reach_stacker';
    this.group.position.set(this.initialPos.x, this.initialPos.y, this.initialPos.z);
    this.group.rotation.y = -Math.PI / 2; // Faces toward the road (X-)

    // Operational Animation State
    this.state = 'IDLE'; // 'IDLE' | 'UNLOADING' | 'LOADING'
    this.animTimer = 0;
    this.animDuration = 5.5;
    this.targetTruck = null;
    this.onCompleteCallback = null;

    this._buildMesh();
  }

  /**
   * Builds the Reach Stacker chassis, cabin, boom, spreader, and held container.
   * @private
   */
  _buildMesh() {
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Safety Yellow
      roughness: 0.5,
      metalness: 0.3
    });

    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8
    });

    const containerMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Maersk Blue
      roughness: 0.6,
      metalness: 0.2
    });

    // 1. Chassis
    const chassisGeo = new THREE.BoxGeometry(4.0, 1.8, 8.0);
    const chassis = new THREE.Mesh(chassisGeo, yellowMat);
    chassis.position.set(0, 1.6, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.group.add(chassis);

    // Rear Counterweight
    const counterweightGeo = new THREE.BoxGeometry(4.2, 2.2, 2.5);
    const counterweight = new THREE.Mesh(counterweightGeo, darkSteelMat);
    counterweight.position.set(0, 2.0, -3.2);
    counterweight.castShadow = true;
    this.group.add(counterweight);

    // Operator Cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 2.0, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, yellowMat);
    cabin.position.set(1.1, 3.2, -0.5);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Cabin Windows
    const cabinGlassGeo = new THREE.BoxGeometry(1.65, 1.2, 1.8);
    const cabinGlass = new THREE.Mesh(cabinGlassGeo, glassMat);
    cabinGlass.position.set(1.1, 3.5, -0.45);
    this.group.add(cabinGlass);

    // 2. Wheels
    const wheelRadius = 0.9;
    const wheelWidth = 0.6;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.5, wheelRadius * 0.5, wheelWidth + 0.02, 16);

    const wheelOffsets = [
      { x: -2.1, y: 0.9, z:  2.5 },
      { x:  2.1, y: 0.9, z:  2.5 },
      { x: -2.1, y: 0.9, z: -2.5 },
      { x:  2.1, y: 0.9, z: -2.5 }
    ];

    wheelOffsets.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);
      wheelGroup.rotation.z = Math.PI / 2;

      const tire = new THREE.Mesh(wheelGeo, rubberMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rim);

      this.group.add(wheelGroup);
    });

    // 3. Boom & Pivot
    const mastBaseGeo = new THREE.BoxGeometry(2.4, 2.5, 1.8);
    const mastBase = new THREE.Mesh(mastBaseGeo, darkSteelMat);
    mastBase.position.set(0, 3.2, -2.5);
    mastBase.castShadow = true;
    this.group.add(mastBase);

    this.boomPivot = new THREE.Group();
    this.boomPivot.position.set(0, 4.2, -2.5);
    this.group.add(this.boomPivot);

    const boomGeo = new THREE.BoxGeometry(1.6, 1.4, 11.0);
    const boomMesh = new THREE.Mesh(boomGeo, yellowMat);
    boomMesh.position.set(0, 0, 5.0);
    boomMesh.castShadow = true;
    this.boomPivot.add(boomMesh);

    // 4. Spreader
    this.spreaderGroup = new THREE.Group();
    this.spreaderGroup.position.set(0, -0.6, 10.5);
    this.boomPivot.add(this.spreaderGroup);

    const spreaderBeamGeo = new THREE.BoxGeometry(2.6, 0.4, 6.2);
    const spreaderBeam = new THREE.Mesh(spreaderBeamGeo, darkSteelMat);
    spreaderBeam.castShadow = true;
    this.spreaderGroup.add(spreaderBeam);

    const pinGeo = new THREE.BoxGeometry(0.3, 0.5, 0.3);
    const pinPositions = [
      { x: -1.1, z: -2.9 },
      { x:  1.1, z: -2.9 },
      { x: -1.1, z:  2.9 },
      { x:  1.1, z:  2.9 }
    ];
    pinPositions.forEach((p) => {
      const pin = new THREE.Mesh(pinGeo, yellowMat);
      pin.position.set(p.x, -0.3, p.z);
      this.spreaderGroup.add(pin);
    });

    // 5. Container on Spreader
    const contGeo = new THREE.BoxGeometry(2.4, 2.5, 6.0);
    this.heldContainer = new THREE.Mesh(contGeo, containerMat);
    this.heldContainer.position.set(0, -1.45, 0);
    this.heldContainer.castShadow = true;
    this.heldContainer.receiveShadow = true;
    this.heldContainer.visible = false;
    this.spreaderGroup.add(this.heldContainer);

    this.boomPivot.rotation.x = -0.15;
  }

  startUnload(truck, onComplete) {
    this.state = 'UNLOADING';
    this.animTimer = 0;
    this.targetTruck = truck;
    this.onCompleteCallback = onComplete;
    this.heldContainer.visible = false;
  }

  startLoad(truck, onComplete) {
    this.state = 'LOADING';
    this.animTimer = 0;
    this.targetTruck = truck;
    this.onCompleteCallback = onComplete;
    this.heldContainer.visible = true;
  }

  isBusy() {
    return this.state !== 'IDLE';
  }

  update(deltaTime) {
    if (this.state === 'IDLE') {
      this.boomPivot.rotation.x = THREE.MathUtils.lerp(this.boomPivot.rotation.x, -0.15, 0.1);
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, -Math.PI / 2, 0.1);
      return;
    }

    this.animTimer += deltaTime;
    const progress = Math.min(this.animTimer / this.animDuration, 1.0);

    if (this.state === 'UNLOADING') {
      if (progress < 0.25) {
        const t = progress / 0.25;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(-0.15, -0.32, t);
        this.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 2 + 0.1, t);
      } else if (progress < 0.30) {
        if (this.targetTruck && this.targetTruck.hasContainer) {
          this.targetTruck.setHasContainer(false);
          this.heldContainer.visible = true;
        }
      } else if (progress < 0.70) {
        const t = (progress - 0.30) / 0.40;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(-0.32, 0.25, t);
        this.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2 + 0.1, -Math.PI / 2 - 0.5, t);
      } else if (progress < 0.85) {
        const t = (progress - 0.70) / 0.15;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(0.25, -0.05, t);
        if (progress > 0.80) {
          this.heldContainer.visible = false;
        }
      } else {
        const t = (progress - 0.85) / 0.15;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(-0.05, -0.15, t);
        this.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2 - 0.5, -Math.PI / 2, t);
      }

      if (progress >= 1.0) {
        this.state = 'IDLE';
        if (typeof this.onCompleteCallback === 'function') {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }
    } else if (this.state === 'LOADING') {
      if (progress < 0.25) {
        const t = progress / 0.25;
        this.heldContainer.visible = true;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(-0.05, 0.25, t);
        this.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2 - 0.5, -Math.PI / 2, t);
      } else if (progress < 0.65) {
        const t = (progress - 0.25) / 0.40;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(0.25, -0.32, t);
        this.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 2 + 0.1, t);
      } else if (progress < 0.75) {
        if (this.targetTruck && !this.targetTruck.hasContainer) {
          this.targetTruck.setHasContainer(true);
          this.heldContainer.visible = false;
        }
      } else {
        const t = (progress - 0.75) / 0.25;
        this.boomPivot.rotation.x = THREE.MathUtils.lerp(-0.32, -0.15, t);
        this.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2 + 0.1, -Math.PI / 2, t);
      }

      if (progress >= 1.0) {
        this.state = 'IDLE';
        if (typeof this.onCompleteCallback === 'function') {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }
    }
  }

  getMesh() {
    return this.group;
  }
}
