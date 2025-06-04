const terrainChunks = [];
const terrainChunkSize = 100;
const chunkCount = 3;
noise.seed(Math.random());

const stripOffsets = [-terrainChunkSize, 0, terrainChunkSize]; // left, middle, right
const lastChunkZByStrip = {};

//hill setup
const hills = [];

function generateHills() {
    const count = getHillFrequency();
    hills.length = 0;
    for (let i = 0; i < count; i++) {
        hills.push({
            x: (Math.random() - 0.5) * 1000,
            z: (Math.random() - 0.5) * 1000,
            radius: 20 + Math.random() * 40,
            height: 15 + Math.random() * 10
        });
    }
}

generateHills();

function createTerrain(scene) {
    for (let xOffset of stripOffsets) {
        lastChunkZByStrip[xOffset] = 0;

        for (let i = 0; i < chunkCount; i++) {
            const zOffset = i * -terrainChunkSize;
            const chunk = createTerrainChunk(xOffset, zOffset);

            scene.add(chunk);
            terrainChunks.push({ mesh: chunk, xOffset });
            lastChunkZByStrip[xOffset] = zOffset;
        }
    }
}

function createTerrainChunk(xOffset, zOffset) {
    const terrainSegments = getTerrainSegments();
    const geometry = new THREE.PlaneGeometry(terrainChunkSize, terrainChunkSize, terrainSegments, terrainSegments);
    geometry.rotateX(-Math.PI / 2);
    applyHeightMap(geometry, xOffset, zOffset);

    const material = new THREE.MeshStandardMaterial({
        color: 0x44A682,
        flatShading: true,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(xOffset, -15, zOffset);
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    spawnObjectsForChunk(mesh);
    addTreesToChunk(mesh);
    addWaterToChunk(mesh);

    return mesh;
}

function applyHeightMap(geometry, xOffset, zOffset) {
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) + xOffset;
        const z = pos.getZ(i) + zOffset;
        const y = generateHeight(x, z);
        pos.setY(i, y);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
}

function generateHeight(x, z) {
    const baseScale = getNoiseScale();
    const offsetX = 9999;
    const offsetZ = 8888;

    let total = 0;
    let amplitude = 10;
    let frequency = 1;
    let persistence = 0.5;
    const octaves = 4;

    for (let i = 0; i < octaves; i++) {
        const nx = (x + offsetX) * baseScale * frequency;
        const nz = (z + offsetZ) * baseScale * frequency;
        total += noise.perlin2(nx, nz) * amplitude;

        amplitude *= persistence;
        frequency *= 2;
    }

    //hill contributions
    for (const hill of hills) {
        const dx = x - hill.x;
        const dz = z - hill.z;
        const distSq = dx * dx + dz * dz;
        const radiusSq = hill.radius * hill.radius;

        if (distSq < radiusSq) {
            const falloff = 1 - distSq / radiusSq; //linear falloff
            total += hill.height * Math.pow(falloff, 2); //radial bump
        }
    }

    return total;
}

function updateTerrain(camera) {
    const cameraZ = camera.position.z;

    for (let i = 0; i < terrainChunks.length; i++) {
        const chunk = terrainChunks[i];
        const mesh = chunk.mesh;
        const xOffset = chunk.xOffset;

        // if chunk is far behind the camera, recycle it forward
        if (cameraZ - mesh.position.z < -terrainChunkSize * 0.5) {
            const newZ = lastChunkZByStrip[xOffset] - terrainChunkSize;
            mesh.position.z = newZ;
            applyHeightMap(mesh.geometry, xOffset, newZ);

            lastChunkZByStrip[xOffset] = newZ;
            addTreesToChunk(mesh, Math.floor(Math.random() * 4) + 2);
            spawnObjectsForChunk(mesh);
        }
    }
}

function getNoiseScale() {
    const slider = document.getElementById('noiseSlider');
    return parseFloat(slider.value);
}
function getTerrainSegments() {
    const slider = document.getElementById('terpolySlider');
    return parseInt(slider.value);
}
function getHillFrequency() {
    const slider = document.getElementById('hillSlider');
    return parseInt(slider.value);
}


document.getElementById('noiseSlider').addEventListener('input', () => {
    generateHills();
    terrainChunks.forEach(({ mesh, xOffset }) => {
        applyHeightMap(mesh.geometry, xOffset, mesh.position.z);
        spawnObjectsForChunk(mesh);
        addTreesToChunk(mesh, Math.floor(Math.random() * 4) + 2);
        addWaterToChunk(mesh);
    });
});
document.getElementById('terpolySlider').addEventListener('input', () => {
    generateHills();
    const newSegments = getTerrainSegments();

    terrainChunks.forEach(({ mesh, xOffset }) => {
        const newGeometry = new THREE.PlaneGeometry(terrainChunkSize, terrainChunkSize, newSegments, newSegments);
        newGeometry.rotateX(-Math.PI / 2);
        applyHeightMap(newGeometry, xOffset, mesh.position.z);

        mesh.geometry.dispose();
        mesh.geometry = newGeometry;

        spawnObjectsForChunk(mesh);
        addTreesToChunk(mesh, Math.floor(Math.random() * 4) + 2);
        addWaterToChunk(mesh);
    });
});
document.getElementById('hillSlider').addEventListener('input', () => {
    generateHills();
    terrainChunks.forEach(({ mesh, xOffset }) => {
        applyHeightMap(mesh.geometry, xOffset, mesh.position.z);
        spawnObjectsForChunk(mesh);
        addTreesToChunk(mesh, Math.floor(Math.random() * 4) + 2);
        addWaterToChunk(mesh);
    });
});
document.getElementById('houseSlider').addEventListener('input', () => {
    terrainChunks.forEach(({ mesh }) => {
        spawnObjectsForChunk(mesh);
    });
});


window.createTerrain = createTerrain;
window.updateTerrain = updateTerrain;
