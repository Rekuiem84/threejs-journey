import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

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
		camera.lookAt(group.position);
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
 * Objects
 */
const cube = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
scene.add(cube);

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

const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

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
