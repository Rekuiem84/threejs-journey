import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";

/**
 * Debug
 */
const gui = new GUI({
	width: 400,
	title: "Debug UI",
});
// gui.hide();
const debugObject = {};

window.addEventListener("keydown", (event) => {
	if (event.key === "h") {
		gui.show(gui._hidden); // Toggle visibility of the debug menu
	} else if (event.key === "r") {
		// Reset the camera position and rotation
		camera.position.set(0, 0, 6);
		camera.rotation.set(0, 0, 0);
		camera.lookAt(0, 0, 0);
		controls.update();
	}
});

/**
 * Canvas
 */
const canvas = document.querySelector("canvas.webgl");

/**
 * Scene
 */
const scene = new THREE.Scene();

debugObject.torusCount = 200;
let torusMeshes = [];

const updateTorus = () => {
	// Remove existing torus
	torusMeshes.forEach((torus) => {
		scene.remove(torus);
	});
	torusMeshes = [];

	const numberOfMatcaps = 18;
	const torusGeometry = new THREE.TorusGeometry(0.2, 0.1, 16, 100);
	const textureLoader = new THREE.TextureLoader();

	for (let i = 0; i < debugObject.torusCount; i++) {
		const randomX = (Math.random() - 0.5) * 10;
		const randomY = (Math.random() - 0.5) * 10;
		const randomZ = (Math.random() - 0.5) * 10;

		const matcapTexture = textureLoader.load(
			`./textures/matcaps/${(i % numberOfMatcaps) + 1}.png`
		);
		matcapTexture.colorSpace = THREE.SRGBColorSpace;

		const torusMaterial = new THREE.MeshMatcapMaterial({
			matcap: matcapTexture,
		});
		const torus = new THREE.Mesh(torusGeometry, torusMaterial);

		torus.position.set(randomX, randomY, randomZ);
		torus.rotation.x = Math.random() * Math.PI;
		torus.rotation.y = Math.random() * Math.PI;

		const scale = Math.random() + 0.5;
		torus.scale.set(scale, scale, scale);

		torusMeshes.push(torus);
		scene.add(torus);
	}
};

const torusTweaks = gui.addFolder("Torus");
torusTweaks
	.add(debugObject, "torusCount")
	.min(0)
	.max(2000)
	.step(1)
	.name("Number of Torus")
	.onFinishChange(updateTorus);
torusTweaks.close();

// Initial torus creation
updateTorus();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("./textures/matcaps/13.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Fonts
 */
const fontsLoader = new FontLoader();

debugObject.text = "Hello World";
let textMesh = null;

const updateText = (font) => {
	if (textMesh) {
		scene.remove(textMesh);
		textMesh.geometry.dispose();
	}
	const textGeometry = new TextGeometry(debugObject.text, {
		font: font,
		size: 1,
		depth: 0.25,
		curveSegments: 5,
		bevelEnabled: true,
		bevelThickness: 0.03,
		bevelSize: 0.02,
		bevelOffset: 0,
		bevelSegments: 3,
	});
	textGeometry.center();
	const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
	textMesh = new THREE.Mesh(textGeometry, textMaterial);
	scene.add(textMesh);
};

let loadedFont = null;
fontsLoader.load("./fonts/helvetiker_regular.typeface.json", (font) => {
	loadedFont = font;
	updateText(font);
});

const textTweaks = gui.addFolder("Text");
textTweaks
	.add(debugObject, "text")
	.name("Text String")
	.onFinishChange(() => {
		if (loadedFont) updateText(loadedFont);
	});

textTweaks.close();
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

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
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

/**
 * Animation loop
 */
const tick = () => {
	// Update controls
	controls.update(); // Pour que le damping fonctionne, il faut update les controles à chaque frame

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();
