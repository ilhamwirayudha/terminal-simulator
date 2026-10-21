import * as THREE from 'three';

/**
 * ==============================================================================
 * Lighting Setup (Mainland Highway Corridor)
 * ==============================================================================
 */
export function setupLights(scene) {
  // 1. Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.92);
  ambientLight.name = 'ambientLight';
  scene.add(ambientLight);

  // 2. Hemisphere Light
  const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xe2e8f0, 0.88);
  hemiLight.position.set(0, 80, 0);
  hemiLight.name = 'hemisphereLight';
  scene.add(hemiLight);

  // 3. Sun Directional Light
  const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.85);
  sunLight.position.set(120, 180, -140);
  sunLight.castShadow = true;
  sunLight.name = 'sunLight';

  // 2048x2048 PCF Soft Shadows
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 450;

  const d = 160;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;

  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.02;

  scene.add(sunLight);

  return { ambientLight, hemiLight, sunLight };
}
