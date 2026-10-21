import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * ==============================================================================
 * Scene Setup (Mainland Highway Corridor)
 * ==============================================================================
 */
export function createScene(canvas) {
  // 1. Scene with clear sky background (No Fog)
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9daf8);
  scene.fog = null;

  // 2. Perspective Camera (Posisi di atas aspal jalan lajur masuk: Z = -320)
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1.5,
    3500
  );
  camera.position.set(13.8, 3.2, -320);
  camera.lookAt(13.8, 2.0, -180);

  // 3. WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Enable Shadows and Tone Mapping
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // 4. OrbitControls with surface protection constraints
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3.0; // Prevents dollying/zooming into or through ground
  controls.maxDistance = 1600;
  controls.minPolarAngle = 0.05; // Prevents gimbal lock when looking straight down
  controls.maxPolarAngle = Math.PI / 2 - 0.06; // Hard limit: strictly prevents orbiting below horizon
  controls.target.set(13.8, 2.0, -180);

  // 5. Responsive Resize Handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  return { scene, camera, renderer, controls };
}
