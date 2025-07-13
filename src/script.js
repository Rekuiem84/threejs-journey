import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

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
		camera.lookAt(group.position);
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

const textureLoader = new THREE.TextureLoader(loadingManager);
const colorTexture = textureLoader.load("./textures/minecraft.png");
const alphaTexture = textureLoader.load("./textures/door/alpha.jpg");
const heightTexture = textureLoader.load("./textures/door/height.jpg");
const normalTexture = textureLoader.load("./textures/door/normal.jpg");
const ambientOcclusionTexture = textureLoader.load(
	"./textures/door/ambientOcclusion.jpg"
);
const metalnessTexture = textureLoader.load("./textures/door/metalness.jpg");
const roughnessTexture = textureLoader.load("./textures/door/roughness.jpg");

colorTexture.colorSpace = THREE.SRGBColorSpace;
colorTexture.generateMipmaps = false;
colorTexture.minFilter = THREE.NearestFilter; // Set the minification filter to nearest
colorTexture.magFilter = THREE.NearestFilter; // Set the magnification filter to nearest

// colorTexture.center.set(0.5, 0.5); // Center the texture vertically
// colorTexture.rotation = Math.PI / 4; // Rotate the texture by 45 degrees

/**
 * Objects
 */
const group = new THREE.Group();
scene.add(group);

debugObject.cube1Color = "#ff0000";
// debugObject.cube2Color = "#00ff00";
// debugObject.cube3Color = "#0000ff";

const cube1 = new THREE.Mesh(
	new THREE.BoxGeometry(
		1,
		1,
		1,
		debugObject.subdivisions,
		debugObject.subdivisions,
		debugObject.subdivisions
	), // Using subdivisions for the geometry
	new THREE.MeshBasicMaterial({ map: colorTexture })
);
group.add(cube1);
// cube1.scale.x = 3;
// cube1.scale.y = 4;

// const cube2 = new THREE.Mesh(
// 	new THREE.BoxGeometry(1, 1, 1),
// 	new THREE.MeshBasicMaterial({ color: debugObject.cube2Color })
// );
// group.add(cube2);
// cube2.scale.z = 3;
// cube2.scale.x = 4;

// const cube3 = new THREE.Mesh(
// 	new THREE.BoxGeometry(1, 1, 1),
// 	new THREE.MeshBasicMaterial({ color: debugObject.cube3Color })
// );
// group.add(cube3);
// cube3.scale.z = 4;
// cube3.scale.y = 3;

group.rotation.reorder = "YXZ"; // Set rotation order to YXZ
group.rotation.y = 2 * Math.PI; // Rotate around Y-axis

const groupTweaks = gui.addFolder("Global");
const cube1Tweaks = gui.addFolder("Cube 1");
const otherTweaks = gui.addFolder("Other Tweaks");

groupTweaks
	.add(group.position, "x")
	.min(-5)
	.max(5)
	.step(0.01)
	.name("X Position");
groupTweaks
	.add(group.position, "y")
	.min(-5)
	.max(5)
	.step(0.01)
	.name("Y Position");
groupTweaks
	.add(group.position, "z")
	.min(-5)
	.max(5)
	.step(0.01)
	.name("Z Position");
groupTweaks.add(group, "visible").name("Show");

cube1Tweaks.add(cube1.material, "wireframe").name("Wireframe cube1");
// otherTweaks.add(cube2.material, "wireframe").name("Wireframe cube2");
// otherTweaks.add(cube3.material, "wireframe").name("Wireframe cube3");

// La couleur subit un traitement dans THREE avec les shaders, etc, donc on peut pas directement utiliser le .color
// cube1Tweaks
// 	.addColor(debugObject, "cube1Color")
// 	.name("Cube1 Color")
// 	.onChange(() => {
// 		cube1.material.color.set(debugObject.cube1Color);
// 	});
// otherTweaks
// 	.addColor(debugObject, "cube2Color")
// 	.name("Cube2 Color")
// 	.onChange(() => {
// 		cube2.material.color.set(debugObject.cube2Color);
// 	});
// otherTweaks
// 	.addColor(debugObject, "cube3Color")
// 	.name("Cube3 Color")
// 	.onChange(() => {
// 		cube3.material.color.set(debugObject.cube3Color);
// 	});

debugObject.spin = () => {
	gsap.to(group.rotation, { y: group.rotation.y + Math.PI * 2 });
};
groupTweaks.add(debugObject, "spin").name("Spin Group");

debugObject.subdivisions = 2;
cube1Tweaks
	.add(debugObject, "subdivisions")
	.min(1)
	.max(10)
	.step(1)
	.name("Subdivisions")
	.onFinishChange(() => {
		// Permet d'update une fois que l'utilisateur a fini de changer la valeur plutôt qu'en temps réel
		cube1.geometry.dispose(); // Destroy the old geometry to free memory
		cube1.geometry = new THREE.BoxGeometry(
			1,
			1,
			1,
			debugObject.subdivisions,
			debugObject.subdivisions,
			debugObject.subdivisions
		);
	});

const geometry = new THREE.BufferGeometry();
const count = 50;
// Each vertex has 3 components (x, y, z) and we have 3 vertices per triangle
const positionsArray = new Float32Array(count * 3 * 3);

for (let i = 0; i < count * 3 * 3; i++) {
	positionsArray[i] = (Math.random() - 0.5) * 4;
}

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
geometry.setAttribute("position", positionsAttribute);

const material = new THREE.MeshBasicMaterial({
	color: "#ffffff",
	wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

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

// window.addEventListener("dblclick", () => {
// 	const fullscreenElement =
// 		document.fullscreenElement || document.webkitFullscreenElement;

// 	if (!fullscreenElement) {
// 		if (canvas.requestFullscreen) {
// 			canvas.requestFullscreen();
// 		} else if (canvas.webkitRequestFullscreen) {
// 			canvas.webkitRequestFullscreen(); // For Safari
// 		}
// 	} else {
// 		if (document.exitFullscreen) {
// 			document.exitFullscreen();
// 		} else if (document.webkitExitFullscreen) {
// 			document.webkitExitFullscreen(); // For Safari
// 		}
// 	}
// });

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
camera.position.z = 4;
// camera.position.set(3, 4, 5);
camera.lookAt(group.position);
scene.add(camera);

const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

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
