let scene, camera, renderer;
let gliderMesh;
let isPointerLocked = false;
let pitch = 0, yaw = 0;

let ambientLight;
let directionalLight;
let spotLight;
let stars;
let hemiLight;
let cameraLight;

let mountainMesh;


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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
        //scene.add(camera);

        createBackgroundMountains();
    });

    //load tree
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

    //load bushsmall
    loader.load('models/bushsmall.ply', (geometry) => {
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true });

    registerObjectType('bushsmall', geometry, material, {
        count: { min: 1, max: 3 },
        randomRotationY: true,
        baseScale: 0.7,
        scaleVariation: 0.3
        });
    });
    //load bushbig
    loader.load('models/bushbig.ply', (geometry) => {
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true });

    registerObjectType('bushbig', geometry, material, {
        count: { min: 1, max: 3 },
        randomRotationY: true,
        baseScale: 0.7,
        scaleVariation: 0.3
        });
    });
    //load treestump
    loader.load('models/treestump.ply', (geometry) => {
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true });

    registerObjectType('treestump', geometry, material, {
        count: { min: 1, max: 3 },
        randomRotationY: true,
        baseScale: 0.7,
        scaleVariation: 0.3
        });
    });
    //load mushroom
    loader.load('models/mushroom.ply', (geometry) => {
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true });

    registerObjectType('mushroom', geometry, material, {
        count: { min: 4, max: 8 },
        randomRotationZ: true,
        baseScale: 0.5,
        yOffset: -0.3,
        scaleVariation: 0.4
        });
    });
    //load grass
    loader.load('models/grass.ply', (geometry) => {
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x44A682,
            flatShading: true
        });

        registerObjectType('grass', geometry, material, {
            count: { min: 50, max: 150 },
            randomRotationY: true,
            baseScale: 0.3,
            scaleVariation: 0.3
        });
    });
    //load house
    loader.load('models/housereal.ply', (geometry) => {
    geometry.computeVertexNormals();

    if (geometry.hasAttribute('color')) {
        geometry.getAttribute('color').normalized = true;

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: true
        });

        registerObjectType('house', geometry, material, {
            count: () => parseInt(document.getElementById('houseSlider').value),
            randomRotationZ: true,
            baseScale: 0.5,
            yOffset: 1.5,
            scaleVariation: 0.4
        });

        console.log('House model loaded and registered.');
    } else {
        console.warn('House model missing vertex color attribute.');
    }
});




}

function setLight(mode = 'day') {
    // remove old lights and objects
    if (ambientLight) scene.remove(ambientLight);
    if (directionalLight) scene.remove(directionalLight);
    if (spotLight) scene.remove(spotLight);
    if (stars) scene.remove(stars);
    if (hemiLight) scene.remove(hemiLight);
    if (cameraLight) scene.remove(cameraLight);
    if (camera) scene.remove(camera);
    if (spotLight?.target) scene.remove(spotLight.target);

    ambientLight = null;
    directionalLight = null;
    spotLight = null;
    hemiLight = null;
    stars = null;
    cameraLight = null;

    scene.fog = null;

    switch (mode) {
        case 'day':
            scene.background = new THREE.Color(0x87ceeb);
            ambientLight = new THREE.AmbientLight(0x87cefa, 0.3);
            if (mountainMesh) {
                mountainMesh.material.color.set(0x44A682);
                mountainMesh.material.opacity = 0.7;  
            }
            hemiLight = new THREE.HemisphereLight(0xffccaa, 0x3355aa, 0.4);

            directionalLight = new THREE.DirectionalLight(0xffe57f, 0.5);
            directionalLight.position.set(100, 100, -500);
            directionalLight.castShadow = true;
            spotLight = new THREE.SpotLight(0xFEA816, 1, 300, Math.PI / 5, 0.5, 1.2);
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.set(2048, 2048);
            spotLight.shadow.bias = -0.001;
            spotLight.position.copy(camera.position).add(new THREE.Vector3(0, 2, 0)); 

            const target1 = new THREE.Object3D();
            scene.add(target1); // add to scene, not camera
            spotLight.target = target1;

            break;

        case 'sunset':
            scene.background = new THREE.Color(0x795B87);
            scene.fog = new THREE.Fog(0xff9966, 100, 300);

            spotLight = new THREE.SpotLight(0xDB1C1C, 3, 300, Math.PI / 5, 0.5, 1.2);
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.set(2048, 2048);
            spotLight.shadow.bias = -0.001;
            spotLight.position.copy(camera.position).add(new THREE.Vector3(0, 2, 0));

            const target = new THREE.Object3D();
            scene.add(target);
            spotLight.target = target;



            ambientLight = new THREE.AmbientLight(0x111122, 0.1);
            hemiLight = new THREE.HemisphereLight(0xffccaa, 0x3355aa, 0.4);

            directionalLight = new THREE.DirectionalLight(0x224488, 0.2);
            directionalLight.position.set(-50, 40, 50);
            directionalLight.castShadow = false;

            break;


        case 'night':
            scene.background = new THREE.Color(0x0b0d1a);
            scene.fog = new THREE.Fog(0x0b0d1a, 50, 300); 

            ambientLight = new THREE.AmbientLight(0x223366, 0.2);
            directionalLight = new THREE.DirectionalLight(0x444466, 0.5);
            directionalLight.position.set(0, 50, -50);
            directionalLight.castShadow = true;

            if (mountainMesh) {
                mountainMesh.material.color.set(0x010015);
                mountainMesh.material.opacity = 0.9;
            }

            addStars();
            break;
    }

    // add active lights
    if (ambientLight) scene.add(ambientLight);
    if (directionalLight) scene.add(directionalLight);
    if (spotLight) {
        scene.add(spotLight);
        scene.add(spotLight.target);
    }
    if (stars) scene.add(stars);
    if (hemiLight) scene.add(hemiLight);
    if (cameraLight) scene.add(cameraLight);
    if (camera) scene.add(camera);
}



//let stars;

function addStars() {
    const starCount = 1000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = Math.random() * 300 + 50;
        const z = -Math.random() * 1000 - 300; // push stars far back (behind fog)
        starPositions.push(x, y, z);
    }

    starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true,
        fog: false,            // prevent fog from affecting the stars
        depthTest: false       // always render on top
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    stars.renderOrder = -1;    // render before everything else

    scene.add(stars);
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

    mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.set(0, -15, -250);
    mountainMesh.scale.set(10, 5, 1);

    camera.add(mountainMesh);
}

window.setScene = setScene;
window.setLight = setLight;
window.resizeScene = resizeScene;
window.moveState = moveState;
window.moveSpeed = moveSpeed;
