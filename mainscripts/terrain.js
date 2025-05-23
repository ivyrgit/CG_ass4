const terrainChunks = [];
const terrainChunkSize = 100;
//const terrainSegments = 5; //low poly ness
const chunkCount = 3;
//const noiseScale = 0.1;

const stripOffsets = [-terrainChunkSize, 0, terrainChunkSize]; // left,middle,right
const lastChunkZByStrip = {}

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



    // add trees and water
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
    const scale = getNoiseScale();
    return (
        Math.sin((x + z) * scale) * 2 +
        Math.cos((x - z) * scale * 0.8) * 1.5
    );
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


document.getElementById('noiseSlider').addEventListener('input', () => {
    terrainChunks.forEach(({ mesh, xOffset }) => {
        applyHeightMap(mesh.geometry, xOffset, mesh.position.z);

        spawnObjectsForChunk(mesh);
        addTreesToChunk(mesh, Math.floor(Math.random() * 4) + 2);
        addWaterToChunk(mesh);

    });
});
document.getElementById('terpolySlider').addEventListener('input', () => {
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



window.createTerrain = createTerrain;
window.updateTerrain = updateTerrain;
