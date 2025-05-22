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
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    loadModels();
}

function loadModels() {
    const loader = new THREE.PLYLoader();

    // load glider
    loader.load('models/wip_hangglider.ply', (geometry) => {
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x052F2D,
            flatShading: false,
            side: THREE.DoubleSide
        });

        gliderMesh = new THREE.Mesh(geometry, material);
        gliderMesh.position.set(0, -6, -20);
        gliderMesh.rotation.set(4.8, 0, 1.57);
        gliderMesh.scale.set(1, 1, 1);

        camera.add(gliderMesh);
        scene.add(camera);

        createBackgroundMountains();
    });

    // load tree
    loader.load('models/tree.ply', (geometry) => {
        geometry.computeVertexNormals();

        if (geometry.hasAttribute('color')) {
            geometry.getAttribute('color').normalized = true;

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                flatShading: true,
                side: THREE.DoubleSide
            });

            setTreeModel(geometry, material);
            console.log('Tree model loaded and passed to trees.js');
        } else {
            console.warn('Tree model missing vertex color attribute.');
        }
        createTerrain(scene); // only create terrain after tree model is ready

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

// controls
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

    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, 0, 'YXZ'));
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

function createBackgroundMountains() {
    const width = 100;
    const height = 30;
    const segments = 50;

    const mountainGeo = new THREE.PlaneGeometry(width, height, segments, 1);
    mountainGeo.rotateY(Math.PI);

    const pos = mountainGeo.attributes.position;
    for (let i = 0; i <= segments; i++) {
        const y = Math.sin(i * 0.5) * 5 + Math.random() * 3 + 10;
        pos.setY(i, y);
    }
    pos.needsUpdate = true;

    const mountainMat = new THREE.MeshBasicMaterial({
        color: 0x44A682,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
    });

    const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.set(0, -15, -250);
    mountainMesh.scale.set(10, 5, 1);

    camera.add(mountainMesh);
}

// Export key pieces
window.setScene = setScene;
window.setLight = setLight;
window.resizeScene = resizeScene;
window.moveState = moveState;
window.moveSpeed = moveSpeed;
