import * as THREE from 'three';
import { createMedianTree } from '../../assets/nature/createMedianTree.js';

/**
 * ==============================================================================
 * Sub-Area: Jalur Aspal Pejalan Kaki (Supir) Sisi Tenggara Menuju Shelter
 * Menyatu Langsung Tanpa Batas / Kanstin Pemisah dengan Waiting Area
 * Dilengkapi Zona Lansekap Rumput & Pohon Peneduh Pembatas Jalan Pre-Gate
 * Warna Aspal Disamakan 100% dengan Aspal CY (0x2e3338)
 * ==============================================================================
 */
export function createDriverWalkwaySubArea() {
  const walkwayGroup = new THREE.Group();
  walkwayGroup.name = 'subarea_driver_walkway_shelter';

  const yBase = 1.568; // Level aspal mulus serasi dengan CY & WA

  // ----------------------------------------------------------------------------
  // Shared PBR Materials
  // ----------------------------------------------------------------------------
  // Warna aspal disamakan dengan Container Yard (CY)
  const asphaltSurfaceMat = new THREE.MeshStandardMaterial({
    color: 0x2e3338, // Aspal industri gelap serasi 100% dengan CY
    roughness: 0.92,
    metalness: 0.08,
    name: 'mat_driver_cy_matched_asphalt'
  });

  const grassBufferMat = new THREE.MeshStandardMaterial({
    color: 0x3d612e, // Rumput lanskap hijau segar pemisah jalan tol & trotoar
    roughness: 0.92,
    metalness: 0.02,
    name: 'mat_driver_walkway_grass'
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Beton kanstin abu-abu
    roughness: 0.75,
    metalness: 0.15
  });

  const yellowSafetyMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Kuning keselamatan marka trotoar
    roughness: 0.4,
    metalness: 0.1
  });

  const whiteLineMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.1
  });

  const steelDarkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.75
  });

  const lightGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: 0xffedd5,
    emissiveIntensity: 1.2,
    roughness: 0.2
  });

  const pelindoBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Pelindo Blue
    roughness: 0.4,
    metalness: 0.2
  });

  const benchWoodMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412, // Kayu sintetis bangku taman
    roughness: 0.7
  });

  // ----------------------------------------------------------------------------
  // 1. ZONA LANSEKAP RUMPUT HIJAU & POHON PEMBATAS JALAN PRE-GATE (X: 16.9m s/d 22.5m)
  // Membatasi jalan tol pre-gate dari area pejalan kaki agar pejalan kaki aman & teduh
  // ----------------------------------------------------------------------------
  const grassBufferShape = new THREE.Shape();
  // +Y shape = -Z world
  // Dari Z = 775 (taper jalan X=13.3m ke 16.9m di Z=805)
  grassBufferShape.moveTo(13.3, -775.0);
  grassBufferShape.lineTo(22.5, -775.0);
  grassBufferShape.lineTo(22.5, -995.0);
  grassBufferShape.lineTo(16.9, -995.0);
  grassBufferShape.lineTo(16.9, -805.0);
  grassBufferShape.lineTo(13.3, -775.0);
  grassBufferShape.closePath();

  const grassBufferGeo = new THREE.ShapeGeometry(grassBufferShape);
  const grassBufferMesh = new THREE.Mesh(grassBufferGeo, grassBufferMat);
  grassBufferMesh.rotation.x = -Math.PI / 2;
  grassBufferMesh.position.set(0, yBase - 0.012, 0);
  grassBufferMesh.receiveShadow = true;
  walkwayGroup.add(grassBufferMesh);

  // Kanstin pembatas taman di X = 22.5 (pembatas antara rumput hijau dan aspal pejalan kaki)
  const walkwayLen = 995.0 - 775.0; // 220m
  const walkwayMidZ = (775.0 + 995.0) / 2;

  const bufferCurbGeo = new THREE.BoxGeometry(0.30, 0.18, walkwayLen);
  const bufferCurb = new THREE.Mesh(bufferCurbGeo, curbMat);
  bufferCurb.position.set(22.5, yBase + 0.09, walkwayMidZ);
  bufferCurb.castShadow = true;
  bufferCurb.receiveShadow = true;
  walkwayGroup.add(bufferCurb);

  // Barisan pohon rindang peneduh & semak hias di pulau taman buffer (X = 19.5m)
  const shrubGeo = new THREE.SphereGeometry(1.1, 8, 6);
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x2d4f24, roughness: 0.95 });

  for (let z = 782.0; z <= 990.0; z += 18.0) {
    // Pohon peneduh
    const tree = createMedianTree({
      scale: 0.95 + Math.sin(z * 0.2) * 0.15,
      rotationY: (z * 0.7) % (Math.PI * 2)
    });
    tree.position.set(19.5, yBase - 0.01, z);
    walkwayGroup.add(tree);

    // Semak perdu hias di bawah pohon
    const shrub1 = new THREE.Mesh(shrubGeo, shrubMat);
    shrub1.scale.set(1.1, 0.6, 1.1);
    shrub1.position.set(18.8, yBase + 0.35, z + 2.2);
    walkwayGroup.add(shrub1);

    const shrub2 = new THREE.Mesh(shrubGeo, shrubMat);
    shrub2.scale.set(0.9, 0.5, 0.9);
    shrub2.position.set(20.2, yBase + 0.3, z - 2.0);
    walkwayGroup.add(shrub2);
  }

  // ----------------------------------------------------------------------------
  // 2. AREA PEJALAN KAKI DIPERLUAS KE ARAH BARAT LAUT (+X: 22.5m s/d 33.5m)
  // Lebar 11.0 meter! Menyatu mulus tanpa ada batas jalan / kanstin dengan Waiting Area
  // ----------------------------------------------------------------------------
  const apronShape = new THREE.Shape();
  apronShape.moveTo(22.5, -775.0);
  apronShape.lineTo(33.5, -775.0);
  apronShape.lineTo(33.5, -995.0);
  apronShape.lineTo(22.5, -995.0);
  apronShape.closePath();

  const apronGeo = new THREE.ShapeGeometry(apronShape);
  const apronMesh = new THREE.Mesh(apronGeo, asphaltSurfaceMat);
  apronMesh.rotation.x = -Math.PI / 2;
  apronMesh.position.set(0, yBase, 0);
  apronMesh.receiveShadow = true;
  walkwayGroup.add(apronMesh);

  // ----------------------------------------------------------------------------
  // 3. MARKA KESELAMATAN KORIDOR PEJALAN KAKI DI ATAS ASPAL TERBUKA
  // ----------------------------------------------------------------------------
  // Garis batas keselamatan kuning luar (di samping kanstin taman X = 22.7)
  const outerLineGeo = new THREE.PlaneGeometry(0.18, walkwayLen);
  const outerLine = new THREE.Mesh(outerLineGeo, yellowSafetyMat);
  outerLine.rotation.x = -Math.PI / 2;
  outerLine.position.set(22.7, yBase + 0.006, walkwayMidZ);
  walkwayGroup.add(outerLine);

  // Garis batas keselamatan kuning koridor pejalan kaki di X = 27.5
  const innerLineGeo = new THREE.PlaneGeometry(0.18, walkwayLen);
  const innerLine = new THREE.Mesh(innerLineGeo, yellowSafetyMat);
  innerLine.rotation.x = -Math.PI / 2;
  innerLine.position.set(27.5, yBase + 0.006, walkwayMidZ);
  walkwayGroup.add(innerLine);

  // Garis putus-putus putih pemandu tengah jalur pejalan kaki (X = 25.1)
  for (let z = 776.0; z < 994.0; z += 6.0) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 2.5), whiteLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(25.1, yBase + 0.006, z + 1.25);
    walkwayGroup.add(dash);
  }

  // ----------------------------------------------------------------------------
  // 4. Piktogram Stensil Pejalan Kaki (Walking Figure Icon & Panah Arah Shelter)
  // Digambar langsung di atas aspal setiap ~30 meter di sepanjang koridor (X = 25.1)
  // ----------------------------------------------------------------------------
  const createPedestrianStencil = (x, z) => {
    const stencilGroup = new THREE.Group();
    stencilGroup.position.set(x, yBase + 0.008, z);

    // Kepala (lingkaran putih)
    const head = new THREE.Mesh(new THREE.CircleGeometry(0.22, 14), whiteLineMat);
    head.rotation.x = -Math.PI / 2;
    head.position.set(0, 0, -0.70);
    stencilGroup.add(head);

    // Badan / Torso (persegi panjang putih)
    const torso = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.70), whiteLineMat);
    torso.rotation.x = -Math.PI / 2;
    torso.position.set(0, 0, -0.18);
    stencilGroup.add(torso);

    // Kaki melangkah (Dua garis miring)
    const leg1 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.60), whiteLineMat);
    leg1.rotation.x = -Math.PI / 2;
    leg1.rotation.z = Math.PI * 0.18;
    leg1.position.set(-0.18, 0, 0.38);
    stencilGroup.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.60), whiteLineMat);
    leg2.rotation.x = -Math.PI / 2;
    leg2.rotation.z = -Math.PI * 0.22;
    leg2.position.set(0.18, 0, 0.42);
    stencilGroup.add(leg2);

    // Panah kuning pengarah menuju Shelter (-Z)
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.50);
    arrowShape.lineTo(0.24, 0.18);
    arrowShape.lineTo(0.09, 0.18);
    arrowShape.lineTo(0.09, -0.35);
    arrowShape.lineTo(-0.09, -0.35);
    arrowShape.lineTo(-0.09, 0.18);
    arrowShape.lineTo(-0.24, 0.18);
    arrowShape.closePath();

    const arrowMesh = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), yellowSafetyMat);
    arrowMesh.rotation.x = -Math.PI / 2;
    arrowMesh.rotation.z = Math.PI; // Menunjuk ke arah selatan (-Z / Shelter)
    arrowMesh.position.set(0, 0, 1.35);
    stencilGroup.add(arrowMesh);

    return stencilGroup;
  };

  [788.0, 830.0, 870.0, 910.0, 950.0, 985.0].forEach((z) => {
    walkwayGroup.add(createPedestrianStencil(25.1, z));
  });

  // ----------------------------------------------------------------------------
  // 5. Tiang Lampu Penerangan Pejalan Kaki (PJU Trotoar Modern LED)
  // Ditempatkan di tepi kanstin taman (X = 22.7m) setiap 25 meter
  // ----------------------------------------------------------------------------
  const createWalkwayLightPole = (z) => {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(22.7, yBase, z);

    // Tiang utama silinder ramping (tinggi 4.2m)
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.10, 4.2, 10);
    const pole = new THREE.Mesh(poleGeo, steelDarkMat);
    pole.position.y = 2.1;
    pole.castShadow = true;
    poleGroup.add(pole);

    // Lengan horizontal menjorok ke atas trotoar (+X)
    const armGeo = new THREE.BoxGeometry(0.95, 0.08, 0.08);
    const arm = new THREE.Mesh(armGeo, steelDarkMat);
    arm.position.set(0.45, 4.15, 0);
    poleGroup.add(arm);

    // Kap lampu LED luminer tipis modern
    const fixtureGeo = new THREE.BoxGeometry(0.45, 0.08, 0.22);
    const fixture = new THREE.Mesh(fixtureGeo, steelDarkMat);
    fixture.position.set(0.85, 4.12, 0);
    poleGroup.add(fixture);

    // Lensa pemancar cahaya bercahaya (emissive lens)
    const lensGeo = new THREE.PlaneGeometry(0.40, 0.18);
    const lens = new THREE.Mesh(lensGeo, lightGlowMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0.85, 4.07, 0);
    poleGroup.add(lens);

    return poleGroup;
  };

  for (let z = 765.0; z <= 990.0; z += 25.0) {
    walkwayGroup.add(createWalkwayLightPole(z));
  }

  // ----------------------------------------------------------------------------
  // 6. Rambu Penunjuk Arah Berdiri (Totem Wayfinding Signs)
  // "🚶 JALUR SUPIR ➔ SHELTER & REST AREA"
  // ----------------------------------------------------------------------------
  const createWayfindingSign = (x, z) => {
    const signGroup = new THREE.Group();
    signGroup.position.set(x, yBase, z);

    // Dua tiang penyangga pipa baja
    [-0.55, 0.55].forEach((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), steelDarkMat);
      p.position.set(px, 1.25, 0);
      p.castShadow = true;
      signGroup.add(p);
    });

    // Papan rambu biru Pelindo
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 0.06), pelindoBlueMat);
    board.position.set(0, 2.05, 0);
    signGroup.add(board);

    // Plat muka dengan ikon & panah arah
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.68), faceMat);
    face.position.set(0, 2.05, 0.035);
    signGroup.add(face);

    // Ikon tanda panah putih tebal
    const signArrow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.02), whiteLineMat);
    signArrow.position.set(0, 1.95, 0.045);
    signGroup.add(signArrow);

    const signSymbol = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.02), yellowSafetyMat);
    signSymbol.position.set(0, 2.22, 0.045);
    signGroup.add(signSymbol);

    return signGroup;
  };

  walkwayGroup.add(createWayfindingSign(22.7, 985.0));
  walkwayGroup.add(createWayfindingSign(22.7, 890.0));
  walkwayGroup.add(createWayfindingSign(22.7, 810.0));

  // ----------------------------------------------------------------------------
  // 7. KONEKSI & PELATARAN SHELTER PENGEMUDI DI AREA A (Z: 750m s/d 775m)
  // Menghubungkan langsung trotoar ke depan pintu masuk Gedung Shelter
  // Gedung Shelter berada di Z: 748 - 769, X: 18.7 - 43.3
  // ----------------------------------------------------------------------------
  const shelterPlazaShape = new THREE.Shape();
  // +Y shape = -Z world
  shelterPlazaShape.moveTo(13.3, -775.0);
  shelterPlazaShape.lineTo(33.5, -775.0);
  shelterPlazaShape.lineTo(33.5, -750.0);
  shelterPlazaShape.lineTo(13.3, -750.0);
  shelterPlazaShape.closePath();

  const shelterPlazaGeo = new THREE.ShapeGeometry(shelterPlazaShape);
  const shelterPlazaMesh = new THREE.Mesh(shelterPlazaGeo, asphaltSurfaceMat);
  shelterPlazaMesh.rotation.x = -Math.PI / 2;
  shelterPlazaMesh.position.set(0, yBase + 0.002, 0);
  shelterPlazaMesh.receiveShadow = true;
  walkwayGroup.add(shelterPlazaMesh);

  // Garis tepi kuning berlanjut sampai ke teras shelter
  const plazaEdgeLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 25.0), yellowSafetyMat);
  plazaEdgeLine.rotation.x = -Math.PI / 2;
  plazaEdgeLine.position.set(22.7, yBase + 0.006, (750.0 + 775.0) / 2);
  walkwayGroup.add(plazaEdgeLine);

  // Kanopi Teras Depan Pintu Masuk Shelter Pengemudi
  const porchCanopyGroup = new THREE.Group();
  porchCanopyGroup.position.set(24.5, yBase, 755.0);

  // 4 Tiang Baja Kanopi
  [[-2.0, -2.5], [2.0, -2.5], [-2.0, 2.5], [2.0, 2.5]].forEach(([px, pz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.4, 0.18), steelDarkMat);
    col.position.set(px, 1.7, pz);
    col.castShadow = true;
    porchCanopyGroup.add(col);
  });

  // Atap kanopi teras biru Pelindo
  const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.25, 5.8), pelindoBlueMat);
  canopyRoof.position.set(0, 3.4, 0);
  canopyRoof.castShadow = true;
  porchCanopyGroup.add(canopyRoof);

  // Lis putih kanopi
  const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(4.75, 0.12, 5.95), whiteLineMat);
  canopyTrim.position.set(0, 3.48, 0);
  porchCanopyGroup.add(canopyTrim);

  // Lampu plafon kanopi teras
  const canopyLight = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12), lightGlowMat);
  canopyLight.position.set(0, 3.25, 0);
  porchCanopyGroup.add(canopyLight);

  walkwayGroup.add(porchCanopyGroup);

  // ----------------------------------------------------------------------------
  // 8. Bangku Istirahat Pengemudi (Rest Area Benches) & Papan Nama Shelter
  // ----------------------------------------------------------------------------
  const createBench = (x, z, rotY = 0) => {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(x, yBase, z);
    benchGroup.rotation.y = rotY;

    // Dudukan kayu
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.55), benchWoodMat);
    seat.position.set(0, 0.45, 0);
    seat.castShadow = true;
    benchGroup.add(seat);

    // Sandaran punggung
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.06), benchWoodMat);
    back.position.set(0, 0.72, -0.24);
    back.castShadow = true;
    benchGroup.add(back);

    // Kaki besi hitam
    [-0.75, 0.75].forEach((kx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.50), steelDarkMat);
      leg.position.set(kx, 0.225, 0);
      leg.castShadow = true;
      benchGroup.add(leg);
    });

    return benchGroup;
  };

  // 3 deret bangku di pelataran teras shelter
  walkwayGroup.add(createBench(20.5, 755.0, Math.PI / 2));
  walkwayGroup.add(createBench(20.5, 758.0, Math.PI / 2));
  walkwayGroup.add(createBench(20.5, 761.0, Math.PI / 2));

  // Papan Nama Fasilitas Utama: "SHELTER & RUANG ISTIRAHAT PENGEMUDI"
  const shelterSignboard = new THREE.Group();
  shelterSignboard.position.set(24.5, yBase + 3.8, 755.0);

  const signBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 0.12), pelindoBlueMat);
  shelterSignboard.add(signBase);

  const signTextFace = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.45), new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3
  }));
  signTextFace.position.set(0, 0, 0.065);
  shelterSignboard.add(signTextFace);

  const signTitleStripe = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.02), yellowSafetyMat);
  signTitleStripe.position.set(0, 0.12, 0.075);
  shelterSignboard.add(signTitleStripe);

  const signSubtitleStripe = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.02), whiteLineMat);
  signSubtitleStripe.position.set(0, -0.10, 0.075);
  shelterSignboard.add(signSubtitleStripe);

  walkwayGroup.add(shelterSignboard);

  return walkwayGroup;
}
