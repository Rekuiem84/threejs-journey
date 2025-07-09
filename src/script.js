import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/Addons.js";
// Cursor

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

/**
 * Objects
 */
const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
group.add(cube1);
cube1.scale.x = 3;
cube1.scale.y = 4;

const cube2 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "#00ff00" })
);
group.add(cube2);
cube2.scale.z = 3;
cube2.scale.x = 4;

const cube3 = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.MeshBasicMaterial({ color: "#0000ff" })
);
group.add(cube3);
cube3.scale.z = 4;
cube3.scale.y = 3;

group.rotation.reorder = "YXZ"; // Set rotation order to YXZ
group.rotation.y = Math.PI / 2; // Rotate around Y-axis

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

window.addEventListener("dblclick", () => {
	const fullscreenElement =
		document.fullscreenElement || document.webkitFullscreenElement;

	if (!fullscreenElement) {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen(); // For Safari
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen(); // For Safari
		}
	}
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(70, aspectRatio, 0.1, 1000);
// const camera = new THREE.OrthographicCamera(
// 	-aspectRatio,
// 	aspectRatio,
// 	1,
// 	-1,
// 	0.1,
// 	1000
// );
camera.position.z = 8;
// camera.position.set(3, 4, 5);
camera.lookAt(group.position);
scene.add(camera);

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

// Controls
const controls = new OrbitControls(camera, canvas);
// controls.enabled = false;
controls.enableDamping = true;
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

	// Camera movement
	// camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 8;
	// camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 8;
	// camera.position.y = cursor.y * 8;
	// camera.lookAt(group.position);

	// Update objects
	// group.rotation.y = elapsedTime * Math.PI * 0.5;
	// group.position.y = Math.sin(elapsedTime);

	// Update controls
	controls.update(); // Pour que le damping fonctionne, il faut update les controles à chaque frame

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();
