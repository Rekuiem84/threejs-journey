import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import { RGBELoader } from "three/examples/jsm/Addons.js";

// Debug
const gui = new GUI({
	width: 400,
	title: "Debug UI",
});
gui.hide();
const debugObject = {};

window.addEventListener("keydown", (event) => {
	if (event.key === "h") {
		gui.show(gui._hidden); // Toggle visibility of the GUI
	}
	if (event.key === "r") {
		// Reset the camera position and rotation
		camera.position.set(0, 0, 8);
		camera.rotation.set(0, 0, 0);
		camera.lookAt(plane);
		controls.update(); // Update controls to reflect the new camera position
	}
});

// Controls
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5; // Normalize to [-0.5, 0.5]
	cursor.y = -(event.clientY / sizes.height - 0.5); // Inverser l'axe Y
	// console.log(`Cursor position: x=${cursor.x}, y=${cursor.y}`);
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Image et texture
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () => {
	console.log("Loading started");
};
loadingManager.onLoad = () => {
	console.log("Loading loaded");
};
loadingManager.onProgress = () => {
	console.log("Loading progress");
};
loadingManager.onError = () => {
	console.log("Loading error");
};

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load("./textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("./textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
	"./textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("./textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("./textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load(
	"./textures/door/metalness.jpg"
);
const doorRoughnessTexture = textureLoader.load(
	"./textures/door/roughness.jpg"
);
const matcapTexture = textureLoader.load("./textures/matcaps/8.png");
const gradientTexture = textureLoader.load("./textures/gradients/5.jpg");

doorColorTexture.colorSpace = THREE.SRGBColorSpace;
matcapTexture.colorSpace = THREE.SRGBColorSpace;

// MeshBasicMaterial
// const material = new THREE.MeshBasicMaterial();

// MeshNormalMaterial
// const material = new THREE.MeshNormalMaterial();
// material.flatShading = true;

// MeshMatcapMaterial
// Permet d'avoir une texture en fonction de l'oriantation de l'objet
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// MeshDepthMaterial
// const material = new THREE.MeshDepthMaterial();

// MeshLambertMaterial
// const material = new THREE.MeshLambertMaterial();

// MeshPhongMaterial
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 200;
// material.specular = new THREE.Color("#00ffff");

// MeshToonMaterial
// const material = new THREE.MeshToonMaterial();
// material.gradientMap = gradientTexture;
// gradientTexture.minFilter = THREE.NearestFilter;
// gradientTexture.magFilter = THREE.NearestFilter;
// //Because we use nearest filter, we can disable mipmapping
// gradientTexture.generateMipmaps = false;

// MeshStandardMaterial
// const material = new THREE.MeshStandardMaterial();
// material.metalness = 1;
// material.roughness = 1;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(2, 2);

// MeshPhysicalMaterial
const material = new THREE.MeshPhysicalMaterial();
material.metalness = 0;
material.roughness = 0.2;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(2, 2);

// // Clearcoat
// material.clearcoat = 1;
// material.clearcoatRoughness = 0;

// gui.add(material, "clearcoat").min(0).max(1).step(0.0001);
// gui.add(material, "clearcoatRoughness").min(0).max(1).step(0.0001);

// // Sheen
// material.sheen = 1;
// material.sheenRoughness = 0.25;
// material.sheenColor.set(1, 1, 1);

// gui.add(material, "sheen").min(0).max(1).step(0.0001);
// gui.add(material, "sheenRoughness").min(0).max(1).step(0.0001);
// gui.addColor(material, "sheenColor");

// // Iridescence
// material.iridescence = 1;
// material.iridescenceIOR = 1;
// material.iridescenceThicknessRange = [100, 900];

// gui.add(material, "iridescence").min(0).max(1).step(0.0001);
// gui.add(material, "iridescenceIOR").min(1).max(2.333).step(0.0001);
// gui.add(material.iridescenceThicknessRange, "0").min(1).max(1000).step(1);
// gui.add(material.iridescenceThicknessRange, "1").min(1).max(1000).step(1);

// gui.add(material, "metalness").min(0).max(1).step(0.0001);
// gui.add(material, "roughness").min(0).max(1).step(0.0001);

// Iridescence
material.transmission = 1;
material.ior = 1.4;
material.thickness = 0.64;

gui.add(material, "transmission").min(0).max(1).step(0.0001);
gui.add(material, "ior").min(1).max(10).step(0.0001);
gui.add(material, "thickness").min(0).max(1).step(0.0001);

gui.add(material, "metalness").min(0).max(1).step(0.0001);
gui.add(material, "roughness").min(0).max(1).step(0.0001);

// material.map = doorColorTexture;
material.transparent = true;
// material.alphaMap = doorAlphaTexture;
material.side = THREE.DoubleSide;

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
sphere.position.set(-3, 0, 0);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 100, 100), material);
plane.position.set(0, 0, 0);

const torus = new THREE.Mesh(
	new THREE.TorusGeometry(1, 0.25, 64, 128),
	material
);
torus.position.set(3, 0, 0);
scene.add(sphere, plane, torus);

/**
 * Light
 */
// const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight("#ffffff", 50);
// pointLight.position.set(2, 3, 4);
// scene.add(pointLight);

/**
 * Environment map
 */
const rgbeLoader = new RGBELoader();
rgbeLoader.load("./textures/environmentMap/2k.hdr", (environmentMap) => {
	environmentMap.mapping = THREE.EquirectangularReflectionMapping;

	scene.background = environmentMap;
	scene.environment = environmentMap;
});

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

let aspectRatio = sizes.width / sizes.height;

window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	aspectRatio = sizes.width / sizes.height;

	camera.aspect = aspectRatio;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(70, aspectRatio, 0.1, 1000);
camera.position.z = 6;
camera.lookAt(0, 0, 0);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
// controls.enabled = false;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

const clock = new THREE.Clock();

// Animation loop
const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Rotate objects
	sphere.rotation.y = elapsedTime * 0.2;
	plane.rotation.y = elapsedTime * 0.2;
	torus.rotation.y = elapsedTime * 0.2;

	sphere.rotation.x = elapsedTime * -0.2;
	plane.rotation.x = elapsedTime * -0.2;
	torus.rotation.x = elapsedTime * -0.2;

	// Update controls
	controls.update(); // Pour que le damping fonctionne, il faut update les controles à chaque frame

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();
