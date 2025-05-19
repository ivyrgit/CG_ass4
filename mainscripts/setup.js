// setup.js

let scene, camera, renderer;
let ambientLight, cameraLight;
let gliderMesh;
let isPointerLocked = false;
let pitch = 0, yaw = 0;

const moveSpeed = 0.2;
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
};

function setScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x82D9F3);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0, 10); // Start closer for testing

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createTerrain(scene);
    loadGliderModel();
}

function loadGliderModel() {
    const loader = new THREE.PLYLoader();
    loader.load('models/wip_hangglider.ply', (geometry) => {
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            flatShading: false,
            side: THREE.DoubleSide
        });

        gliderMesh = new THREE.Mesh(geometry, material);
        gliderMesh.position.set(0, -6, -20);
        gliderMesh.rotation.set(4.8, 0, 1.57);
        gliderMesh.scale.set(1, 1, 1);

        camera.add(gliderMesh);
        scene.add(camera);
    });
}

function setLight() {
    cameraLight = new THREE.PointLight(0xffffff, 0.8);
    cameraLight.castShadow = true;
    camera.add(cameraLight);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    scene.add(cameraLight);
}

function resizeScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// controls--
function togglePointerLock() {
    isPointerLocked
        ? document.exitPointerLock()
        : renderer.domElement.requestPointerLock();
}

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'v') togglePointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked) return;

    const sensitivity = 0.002;
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(quat);
});

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in moveState) moveState[key] = true;
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in moveState) moveState[key] = false;
});

window.setScene = setScene;
window.setLight = setLight;
window.resizeScene = resizeScene;
window.moveState = moveState;
window.moveSpeed = moveSpeed;
