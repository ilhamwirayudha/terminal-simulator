import * as THREE from 'three';

/**
 * ==============================================================================
 * Reusable Asset: Hamparan Lautan Biru Teluk Lamong (createOcean - Optimized)
 * ==============================================================================
 * Arsitektur ringan berbasis ShaderMaterial khusus laut + Lookup Texture (LUT):
 * - Tekstur jarak garis pantai TTL 128x128 (64 KB) dibake sekali saat init,
 *   menggantikan evaluasi 6 SDF box per piksel.
 * - Normal map gelombang periodik 128x128 (64 KB) dengan early skip di jarak jauh
 *   (> 2800m) maupun piksel cakrawala.
 * - Tanpa shadow-map lookup (receiveShadow = false) dan tanpa overhead PBR penuh,
 *   sambil tetap menyertakan logdepthbuf, ACESFilmicToneMapping, & colorspace.
 */

let cachedWaveTexture = null;
let cachedCoastLutTexture = null;

const LUT_X_MIN = -1460;
const LUT_X_MAX = 1150;
const LUT_Z_MIN = -2020;
const LUT_Z_MAX = 3260;

const LAND_BOXES = [
  { cx: 0.0, cz: -682.5, hx: 60.0, hz: 572.5 },     // Koridor daratan Osowilangun
  { cx: -3.5, cz: 672.5, hx: 178.5, hz: 102.5 },    // Utilitas + Head Office
  { cx: 80.5, cz: 986.5, hx: 104.5, hz: 211.5 },    // Waiting CY & Waiting Cuker
  { cx: 0.0, cz: 1825.0, hx: 32.0, hz: 657.0 },     // Koridor Main Gate & Pasca Gate
  { cx: -357.5, cz: 2157.0, hx: 336.5, hz: 339.0 }, // Container Yard Utama
  { cx: 203.0, cz: 2267.0, hx: 182.0, hz: 227.0 }   // Terminal Curah Kering
];

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getCoastLutTexture() {
  if (cachedCoastLutTexture) return cachedCoastLutTexture;

  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const spanX = LUT_X_MAX - LUT_X_MIN;
  const spanZ = LUT_Z_MAX - LUT_Z_MIN;

  for (let iy = 0; iy < size; iy++) {
    const v = iy / (size - 1);
    const wz = LUT_Z_MIN + v * spanZ;
    for (let ix = 0; ix < size; ix++) {
      const u = ix / (size - 1);
      const wx = LUT_X_MIN + u * spanX;

      let minD = 1e6;
      for (let b = 0; b < LAND_BOXES.length; b++) {
        const box = LAND_BOXES[b];
        const dx = Math.abs(wx - box.cx) - box.hx;
        const dz = Math.abs(wz - box.cz) - box.hz;
        const outD = Math.hypot(Math.max(dx, 0), Math.max(dz, 0));
        const inD = Math.min(Math.max(dx, dz), 0);
        const d = outD + inD;
        if (d < minD) minD = d;
      }
      const dCoast = Math.max(0, minD);
      const tShallow = smoothstep(0.0, 140.0, dCoast);
      const tDeep = smoothstep(100.0, 720.0, dCoast);

      const idx = (iy * size + ix) * 4;
      data[idx] = Math.round(tShallow * 255);
      data[idx + 1] = Math.round(tDeep * 255);
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;

  cachedCoastLutTexture = tex;
  return tex;
}

function getWaveNormalTexture() {
  if (cachedWaveTexture) return cachedWaveTexture;

  const size = 128;
  const heights = new Float32Array(size * size);
  const twoPi = Math.PI * 2;

  const components = [
    { kx: 2, ky: 1, amp: 0.36, phase: 0.4 },
    { kx: -1, ky: 3, amp: 0.28, phase: 1.7 },
    { kx: 4, ky: -2, amp: 0.18, phase: 2.5 },
    { kx: 3, ky: 5, amp: 0.12, phase: 0.9 },
    { kx: -6, ky: 4, amp: 0.08, phase: 4.1 },
    { kx: 7, ky: -5, amp: 0.055, phase: 3.3 }
  ];

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      let h = 0;
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        h += c.amp * Math.sin(twoPi * (c.kx * u + c.ky * v) + c.phase);
      }
      heights[y * size + x] = h;
    }
  }

  const data = new Uint8Array(size * size * 4);
  const strength = 2.4;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const dX = (heights[y * size + xNext] - heights[y * size + xPrev]) * strength;
      const dY = (heights[yNext * size + x] - heights[yPrev * size + x]) * strength;

      const nx = -dX;
      const ny = -dY;
      const nz = 1.0;
      const invLen = 1.0 / Math.hypot(nx, ny, nz);

      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * invLen * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * invLen * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * invLen * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;

  cachedWaveTexture = tex;
  return tex;
}

export function createOcean({
  yLevel = 0.0,
  radius = 11500,
  centerZ = 1200,
  skyColor = 0xb9daf8,
  shallowColor = 0x1e80bc,
  midColor = 0x1360a3,
  deepColor = 0x0b4886
} = {}) {
  const oceanGroup = new THREE.Group();
  oceanGroup.name = 'asset_blue_ocean';

  const waveTexture = getWaveNormalTexture();
  const coastLutTexture = getCoastLutTexture();

  // Selaraskan energi cahaya dengan src/world/lights.js (ambient 0.92 + hemi 0.88 + sun 1.85)
  const hemiSky = new THREE.Color(0xbae6fd);
  const ambientColor = new THREE.Color(0xffffff);
  const diffuseFactor = (1.0 - 0.14) / Math.PI;
  const indirectLight = new THREE.Color(
    (ambientColor.r * 0.92 + hemiSky.r * 0.88) * diffuseFactor,
    (ambientColor.g * 0.92 + hemiSky.g * 0.88) * diffuseFactor,
    (ambientColor.b * 0.92 + hemiSky.b * 0.88) * diffuseFactor
  );
  const sunLightColor = new THREE.Color(0xfff8e7).multiplyScalar(1.85 * diffuseFactor);
  const sunDir = new THREE.Vector3(120, 180, -140).normalize();

  const uniforms = {
    uTime: { value: 0.0 },
    uWaveMap: { value: waveTexture },
    uCoastLut: { value: coastLutTexture },
    uLutMin: { value: new THREE.Vector2(LUT_X_MIN, LUT_Z_MIN) },
    uLutInvSpan: { value: new THREE.Vector2(1.0 / (LUT_X_MAX - LUT_X_MIN), 1.0 / (LUT_Z_MAX - LUT_Z_MIN)) },
    uShallowColor: { value: new THREE.Color(shallowColor) },
    uMidColor: { value: new THREE.Color(midColor) },
    uDeepColor: { value: new THREE.Color(deepColor) },
    uSkyColor: { value: new THREE.Color(skyColor) },
    uIndirectLight: { value: indirectLight },
    uSunColor: { value: sunLightColor },
    uSunDir: { value: sunDir },
    uOceanCenter: { value: new THREE.Vector2(0.0, centerZ) },
    uOceanRadius: { value: radius }
  };

  const oceanMat = new THREE.ShaderMaterial({
    uniforms,
    toneMapped: true,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vWorldPos;

      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform float uTime;
      uniform sampler2D uWaveMap;
      uniform sampler2D uCoastLut;
      uniform vec2 uLutMin;
      uniform vec2 uLutInvSpan;
      uniform vec3 uShallowColor;
      uniform vec3 uMidColor;
      uniform vec3 uDeepColor;
      uniform vec3 uSkyColor;
      uniform vec3 uIndirectLight;
      uniform vec3 uSunColor;
      uniform vec3 uSunDir;
      uniform vec2 uOceanCenter;
      uniform float uOceanRadius;
      varying vec3 vWorldPos;

      void main() {
        #include <logdepthbuf_fragment>

        vec3 toCam = cameraPosition - vWorldPos;
        float camDist = length(toCam);
        float oceanRadial = length(vWorldPos.xz - uOceanCenter);
        float edgeFade = smoothstep(uOceanRadius * 0.46, uOceanRadius * 0.94, oceanRadial);
        float camHorizonFade = smoothstep(4800.0, 11800.0, camDist);
        float horizonBlend = max(edgeFade, camHorizonFade);

        // Early exit untuk piksel cakrawala: hemat sampling LUT & gelombang
        if (horizonBlend >= 0.996) {
          gl_FragColor = vec4(uSkyColor, 1.0);
          #include <colorspace_fragment>
          return;
        }

        // Gradasi biru pesisir -> laut dalam dari LUT 128x128
        vec2 lutUv = clamp((vWorldPos.xz - uLutMin) * uLutInvSpan, 0.0, 1.0);
        vec2 depthSample = texture2D(uCoastLut, lutUv).rg;
        vec3 baseOcean = mix(uShallowColor, uMidColor, depthSample.r);
        baseOcean = mix(baseOcean, uDeepColor, depthSample.g);

        // Gelombang normal hanya disampling dalam radius 2800m dari kamera
        vec3 worldN = vec3(0.0, 1.0, 0.0);
        float waveFade = smoothstep(2800.0, 300.0, camDist);
        if (waveFade > 0.01) {
          vec2 uvA = vWorldPos.xz * 0.014 + vec2(uTime * 0.012, uTime * 0.007);
          vec2 rawUvB = vWorldPos.xz * 0.0063;
          vec2 uvB = vec2(rawUvB.x * 0.80 - rawUvB.y * 0.60, rawUvB.x * 0.60 + rawUvB.y * 0.80)
                   - vec2(uTime * 0.005, uTime * 0.009);
          vec2 nA = texture2D(uWaveMap, uvA).xy * 2.0 - 1.0;
          vec2 nB = texture2D(uWaveMap, uvB).xy * 2.0 - 1.0;
          vec2 waveSlope = (nA * 0.55 + nB * 0.45) * (0.16 * waveFade);
          worldN = normalize(vec3(waveSlope.x, 1.0, waveSlope.y));
        }

        vec3 viewDir = toCam / max(camDist, 0.001);
        float ndl = max(dot(worldN, uSunDir), 0.0);
        vec3 litOcean = baseOcean * (uIndirectLight + uSunColor * ndl);

        if (waveFade > 0.01) {
          vec3 halfVec = normalize(uSunDir + viewDir);
          float spec = pow(max(dot(worldN, halfVec), 0.0), 88.0) * 0.24 * waveFade;
          litOcean += uSunColor * spec;
        }

        float fresnel = pow(1.0 - clamp(dot(worldN, viewDir), 0.0, 1.0), 4.0);
        vec3 outgoingLight = mix(litOcean, uSkyColor * 0.85, fresnel * 0.36);

        gl_FragColor = vec4(outgoingLight, 1.0);
        #include <tonemapping_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uSkyColor, horizonBlend);
        #include <colorspace_fragment>
      }
    `
  });
  oceanMat.name = 'mat_ttl_blue_ocean';

  const oceanGeo = new THREE.CircleGeometry(radius, 64);
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.set(0, yLevel, centerZ);
  oceanMesh.receiveShadow = false;
  oceanMesh.castShadow = false;
  oceanMesh.name = 'ttl_blue_ocean_surface';
  oceanGroup.add(oceanMesh);

  oceanGroup.userData.update = (elapsedTime) => {
    uniforms.uTime.value = elapsedTime;
  };

  return oceanGroup;
}
