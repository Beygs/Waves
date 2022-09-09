import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import seaVertexShader from "./shaders/water/vertex.glsl?raw";
import seaFragmentShader from "./shaders/water/fragment.glsl?raw";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(4, 4, 512, 512);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: seaVertexShader,
  fragmentShader: seaFragmentShader,
  uniforms: {
    uTime: {
      value: 0,
    },
    uBigWavesElevation: {
      value: 0.2,
    },
    uBigWavesFrequency: {
      value: new THREE.Vector2(4, 1.5),
    },
    uBigWavesSpeed: {
      value: 0.75,
    },
    uSmallWavesElevation: {
      value: 0.15,
    },
    uSmallWavesFrequency: {
      value: 3,
    },
    uSmallWavesSpeed: {
      value: 0.2,
    },
    uSmallWavesIterations: {
      value: 4,
    },
    uDepthColor: {
      value: new THREE.Color(0x186691),
    },
    uSurfaceColor: {
      value: new THREE.Color(0x9bd8ff),
    },
    uColorOffset: {
      value: 0.08,
    },
    uColorMultiplier: {
      value: 5,
    },
  },
  transparent: true,
});

const colorsFolder = gui.addFolder("Colors");
colorsFolder
  .addColor(waterMaterial.uniforms.uDepthColor, "value")
  .name("Depth Color");
colorsFolder
  .addColor(waterMaterial.uniforms.uSurfaceColor, "value")
  .name("Surface Color");
colorsFolder
  .add(waterMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Offset");
colorsFolder
  .add(waterMaterial.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("Multiplier");

const smallWavesFolder = gui.addFolder("Small Waves");
smallWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Elevation");
smallWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(20)
  .step(0.01)
  .name("Frequency");
smallWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.01)
  .name("Speed");
smallWavesFolder
  .add(waterMaterial.uniforms.uSmallWavesIterations, "value")
  .min(0)
  .max(5)
  .step(1)
  .name("Iterations");

const bigWavesFolder = gui.addFolder("Big Waves");
bigWavesFolder
  .add(waterMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Elevation");
bigWavesFolder
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(20)
  .step(0.01)
  .name("Frequency X");
bigWavesFolder
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(20)
  .step(0.01)
  .name("Frequency Y");
bigWavesFolder
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("Speed");

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x111122);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  water.material.uniforms.uTime.value = elapsedTime;
  
  camera.position.x = Math.sin(elapsedTime * 0.2);
  camera.position.z = Math.cos(elapsedTime * 0.2);
  camera.position.y = Math.pow(1.0 + Math.cos(elapsedTime * 0.3) * 0.3, 2);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
