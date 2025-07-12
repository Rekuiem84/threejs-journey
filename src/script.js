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
		camera.lookAt(0, 0, 0);
		controls.update(); // Update controls to reflect the new camera position
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

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/13.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Fonts
 */
const fontsLoader = new FontLoader();
fontsLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
	const textGeometry = new TextGeometry("Hello World", {
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
	textGeometry.center(); // Center the text geometry

	const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
	const text = new THREE.Mesh(textGeometry, textMaterial);

	const numberOfMatcaps = 18;

	console.time("Torus Creation");
	const torusGeometry = new THREE.TorusGeometry(0.2, 0.1, 16, 100);

	for (let i = 0; i < 300; i++) {
		const randomX = (Math.random() - 0.5) * 10;
		const randomY = (Math.random() - 0.5) * 10;
		const randomZ = (Math.random() - 0.5) * 10;

		// Si les textures étaient toutes identiques, on pourrait les charger avant la boucle
		const matcapTexture = textureLoader.load(
			`/textures/matcaps/${(i % numberOfMatcaps) + 1}.png`
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

		scene.add(torus);
	}
	console.timeEnd("Torus Creation");

	scene.add(text);
});

/**
 * Objects
 */
const cube = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
// scene.add(cube);

const cubeTweaks = gui.addFolder("Cube 1");

debugObject.cubeColor = "#ff0000";
cubeTweaks
	.addColor(debugObject, "cubeColor")
	.name("Cube Color")
	.onChange(() => {
		cube.material.color.set(debugObject.cubeColor);
	});

cubeTweaks.add(cube.position, "x").min(-5).max(5).step(0.01).name("X Position");
cubeTweaks.add(cube.position, "y").min(-5).max(5).step(0.01).name("Y Position");
cubeTweaks.add(cube.position, "z").min(-5).max(5).step(0.01).name("Z Position");
cubeTweaks.add(cube, "visible").name("Show");

cubeTweaks.add(cube.material, "wireframe").name("Wireframe cube");

debugObject.subdivisions = 2;

cubeTweaks
	.add(debugObject, "subdivisions")
	.min(1)
	.max(10)
	.step(1)
	.name("Subdivisions")
	.onFinishChange(() => {
		// Permet d'update une fois que l'utilisateur a fini de changer la valeur plutôt qu'en temps réel
		cube.geometry.dispose(); // Destroy the old geometry to free memory
		cube.geometry = new THREE.BoxGeometry(
			1,
			1,
			1,
			debugObject.subdivisions,
			debugObject.subdivisions,
			debugObject.subdivisions
		);
	});

debugObject.spin = () => {
	gsap.to(cube.rotation, { y: cube.rotation.y + Math.PI * 2 });
};

cubeTweaks.add(debugObject, "spin").name("Spin Group");

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
camera.position.z = 4;
camera.lookAt(cube.position);
scene.add(camera);

/**
 * Controls
 */
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
