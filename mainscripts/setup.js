let scene, camera, renderer;
let ambientLight, cameraLight;
let gliderMesh;
let isPointerLocked = false;
let pitch = 0, yaw = 0;

// movement tracking
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
};
const moveSpeed = 0.2;

function togglePointerLock() {
    if (!isPointerLocked) {
        renderer.domElement.requestPointerLock();
    } else {
        document.exitPointerLock();
    }
}

// bind v key
document.addEventListener('keydown', function (event) {
    if (event.key.toLowerCase() === 'v') {
        togglePointerLock();
    }
});

// track locking
document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
    console.log(isPointerLocked ? 'cursorlocked' : 'cursorunlocked');
});

// mouse movement controls
document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked) return;

    const sensitivity = 0.002;
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // clamp pitch

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(quat);
});

function setScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x82D9F3);

    const ratio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 1000);
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new THREE.PLYLoader();
    loader.load('models/wip_hangglider.ply', function (geometry) {
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

    // test plane for the terrain stuff
    const testBox = new THREE.Mesh(
        new THREE.BoxGeometry(100, 10, 100),
        new THREE.MeshBasicMaterial({ color: 0x44A682 })
    );
    testBox.position.y = -15;
    scene.add(testBox);
}

function setLight() {
    cameraLight = new THREE.PointLight(0xffffff, 0.8);
    cameraLight.castShadow = true;
    camera.add(cameraLight);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(cameraLight);
    scene.add(ambientLight);
}

function resizeScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// keyboard movement
window.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'w': moveState.forward = true; break;
        case 's': moveState.backward = true; break;
        case 'a': moveState.left = true; break;
        case 'd': moveState.right = true; break;
        case ' ': moveState.up = true; break;
        case 'shift': moveState.down = true; break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key.toLowerCase()) {
        case 'w': moveState.forward = false; break;
        case 's': moveState.backward = false; break;
        case 'a': moveState.left = false; break;
        case 'd': moveState.right = false; break;
        case ' ': moveState.up = false; break;
        case 'shift': moveState.down = false; break;
    }
});


