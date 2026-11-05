import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * ==============================================================================
 * Scene Setup (Mainland Highway Corridor - Pure First-Person POV)
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
    0.05, // 5cm near plane: prevents surface clipping
    6500
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

  // 4. OrbitControls kept solely for target synchronization (Mouse rotation disabled for Pure First-Person POV)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false; // Disabled: Camera rotates on its own eye axis (Pure First-Person Look)
  controls.enablePan = false;    // Disabled: WASD handles 3D translation
  controls.enableZoom = false;   // Disabled: CameraManager handles FOV zoom
  controls.enableDamping = false;
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
