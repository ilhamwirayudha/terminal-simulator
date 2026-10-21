import * as THREE from 'three';

/**
 * ==============================================================================
 * Gate Class (Prototype 04: Terminal Gate & Barrier System)
 * ==============================================================================
 *
 * Represents an automated terminal inspection and access control gate.
 *
 * Components:
 * - Structural overhead gantry portal (Steel pillars + Top beam + "GATE 01" sign)
 * - Security / Inspection booth with tinted windows
 * - Animated barrier arm with alternating red-and-white safety stripes
 * - Dynamic LED traffic signal light (Red = Stop / Closed, Green = Go / Clear)
 *
 * State Machine:
 * CLOSED -> OPENING -> OPEN -> CLOSING -> CLOSED
 */
export class Gate {
  /**
   * @param {Object} options
   * @param {string} [options.name="GATE 01"] - Gate display name.
   * @param {number} [options.roadWidth=8.0] - Width of the road spanning the gate.
   */
  constructor(options = {}) {
    this.name = options.name || 'GATE 01';
    this.roadWidth = options.roadWidth || 8.0;

    // Gate States: 'CLOSED', 'OPENING', 'OPEN', 'CLOSING'
    this.state = 'CLOSED';

    // Barrier arm angle tracking (in radians)
    // 0 = Horizontal (Closed), -Math.PI * 0.48 = Vertical (Open)
    this.currentArmAngle = 0;
    this.targetArmAngle = 0;
    this.openArmAngle = -Math.PI * 0.48; // ~86 degrees upright
    this.closedArmAngle = 0;
    this.armSpeed = 2.5; // Radians per second

    // Root THREE.Group for the entire gate assembly
    this.group = new THREE.Group();
    this.group.name = `gate_${this.name.toLowerCase().replace(' ', '_')}`;

    this._buildGate();
  }

  /**
   * Builds the 3D gate structure using Three.js primitive geometries.
   * @private
   */
  _buildGate() {
    // Materials
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate structural steel
      roughness: 0.6,
      metalness: 0.5
    });

    const boothMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark booth paneling
      roughness: 0.7,
      metalness: 0.2
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark tinted security glass
      roughness: 0.1,
      metalness: 0.9
    });

    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Deep industrial blue sign background
      roughness: 0.4
    });

    const redStripeMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Safety Red
      roughness: 0.5
    });

    const whiteStripeMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Safety White
      roughness: 0.5
    });

    // Dynamic Traffic Light Materials
    this.redLightMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });

    this.greenLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.1, // Dim when closed
      roughness: 0.2
    });

    this.offLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x000000,
      roughness: 0.8
    });

    const halfSpan = (this.roadWidth / 2) + 1.2; // 5.2 units from center

    // --------------------------------------------------------------------------
    // 1. STEEL GANTRY PORTAL (Left & Right Pillars + Overhead Beam)
    // --------------------------------------------------------------------------
    const pillarHeight = 6.0;
    const pillarGeo = new THREE.BoxGeometry(0.8, pillarHeight, 0.8);

    // Left Pillar (West side)
    const leftPillar = new THREE.Mesh(pillarGeo, steelMaterial);
    leftPillar.position.set(-halfSpan, pillarHeight / 2, 0);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    this.group.add(leftPillar);

    // Right Pillar (East side, near booth)
    const rightPillar = new THREE.Mesh(pillarGeo, steelMaterial);
    rightPillar.position.set(halfSpan, pillarHeight / 2, 0);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    this.group.add(rightPillar);

    // Overhead Portal Beam
    const beamWidth = (halfSpan * 2) + 1.6;
    const beamGeo = new THREE.BoxGeometry(beamWidth, 0.8, 1.0);
    const overheadBeam = new THREE.Mesh(beamGeo, steelMaterial);
    overheadBeam.position.set(0, pillarHeight + 0.4, 0);
    overheadBeam.castShadow = true;
    overheadBeam.receiveShadow = true;
    this.group.add(overheadBeam);

    // "GATE 01" Identification Plaque
    const signGeo = new THREE.BoxGeometry(4.0, 0.5, 0.1);
    const sign = new THREE.Mesh(signGeo, signMaterial);
    sign.position.set(0, pillarHeight + 0.4, -0.56);
    this.group.add(sign);

    // --------------------------------------------------------------------------
    // 2. SECURITY / INSPECTION BOOTH
    // --------------------------------------------------------------------------
    const boothGeo = new THREE.BoxGeometry(2.8, 3.2, 3.2);
    const booth = new THREE.Mesh(boothGeo, boothMaterial);
    booth.position.set(halfSpan + 2.0, 1.6, 0);
    booth.castShadow = true;
    booth.receiveShadow = true;
    this.group.add(booth);

    // Booth Window
    const boothWindowGeo = new THREE.BoxGeometry(0.1, 1.2, 2.0);
    const boothWindow = new THREE.Mesh(boothWindowGeo, glassMaterial);
    boothWindow.position.set(halfSpan + 0.55, 1.8, 0);
    this.group.add(boothWindow);

    // --------------------------------------------------------------------------
    // 3. TRAFFIC SIGNAL LIGHT
    // --------------------------------------------------------------------------
    const housingGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    const signalHousing = new THREE.Mesh(housingGeo, steelMaterial);
    signalHousing.position.set(halfSpan - 0.55, 3.8, -0.5);
    this.group.add(signalHousing);

    // Red Bulb (Top)
    const bulbGeo = new THREE.SphereGeometry(0.1, 16, 16);
    this.redBulb = new THREE.Mesh(bulbGeo, this.redLightMaterial);
    this.redBulb.position.set(halfSpan - 0.55, 4.05, -0.66);
    this.group.add(this.redBulb);

    // Green Bulb (Bottom)
    this.greenBulb = new THREE.Mesh(bulbGeo, this.offLightMaterial);
    this.greenBulb.position.set(halfSpan - 0.55, 3.55, -0.66);
    this.group.add(this.greenBulb);

    // --------------------------------------------------------------------------
    // 4. ANIMATED BARRIER ARM WITH SAFETY STRIPES
    // --------------------------------------------------------------------------
    // Pivot mechanism post
    const postGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
    const barrierPost = new THREE.Mesh(postGeo, steelMaterial);
    barrierPost.position.set(halfSpan - 0.6, 0.6, -0.4);
    barrierPost.castShadow = true;
    this.group.add(barrierPost);

    // Barrier Arm Pivot Group (Rotates along Z axis to open/close)
    this.barrierPivot = new THREE.Group();
    this.barrierPivot.position.set(halfSpan - 0.6, 1.1, -0.4);

    const armLength = this.roadWidth + 0.5; // 8.5 units long
    const segmentCount = 7;
    const segmentLength = armLength / segmentCount;
    const armThickness = 0.16;

    for (let i = 0; i < segmentCount; i++) {
      const mat = (i % 2 === 0) ? redStripeMaterial : whiteStripeMaterial;
      const segGeo = new THREE.BoxGeometry(segmentLength, armThickness, armThickness);
      const segMesh = new THREE.Mesh(segGeo, mat);
      // Offset mesh so the pivot point is at the hinge end
      segMesh.position.set(-(i * segmentLength + segmentLength / 2), 0, 0);
      segMesh.castShadow = true;
      this.barrierPivot.add(segMesh);
    }

    this.group.add(this.barrierPivot);
  }

  /**
   * Commands the gate to open (raises barrier arm and sets traffic light to green).
   */
  open() {
    if (this.state === 'OPEN' || this.state === 'OPENING') return;
    this.state = 'OPENING';
    this.targetArmAngle = this.openArmAngle;

    // Update traffic signal: Red OFF, Green ON
    this.redBulb.material = this.offLightMaterial;
    this.greenBulb.material = this.greenLightMaterial;
    this.greenBulb.material.emissiveIntensity = 1.0;
  }

  /**
   * Commands the gate to close (lowers barrier arm and sets traffic light to red).
   */
  close() {
    if (this.state === 'CLOSED' || this.state === 'CLOSING') return;
    this.state = 'CLOSING';
    this.targetArmAngle = this.closedArmAngle;

    // Update traffic signal: Red ON, Green OFF
    this.redBulb.material = this.redLightMaterial;
    this.greenBulb.material = this.offLightMaterial;
  }

  /**
   * Returns true if the barrier arm is fully raised and cleared for truck passage.
   * @returns {boolean}
   */
  isClear() {
    return this.state === 'OPEN';
  }

  /**
   * Updates barrier arm rotation smoothly over time.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (this.state === 'OPENING') {
      this.currentArmAngle -= this.armSpeed * deltaTime;
      if (this.currentArmAngle <= this.targetArmAngle) {
        this.currentArmAngle = this.targetArmAngle;
        this.state = 'OPEN';
      }
    } else if (this.state === 'CLOSING') {
      this.currentArmAngle += this.armSpeed * deltaTime;
      if (this.currentArmAngle >= this.targetArmAngle) {
        this.currentArmAngle = this.targetArmAngle;
        this.state = 'CLOSED';
      }
    }

    this.barrierPivot.rotation.z = this.currentArmAngle;
  }

  /**
   * Sets world position of the gate.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  /**
   * Returns the underlying THREE.Group for adding to the scene.
   * @returns {THREE.Group}
   */
  getMesh() {
    return this.group;
  }
}
