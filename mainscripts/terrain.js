const terrainChunks = [];
const terrainChunkSize = 100;
const terrainSegments = 5; //low poly ness
const chunkCount = 3;
const noiseScale = 0.1;

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
    addTreesToChunk(mesh);
    addWaterToChunk(mesh);
    spawnObjectsForChunk(mesh);


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
    return (
        Math.sin((x + z) * noiseScale) * 2 +
        Math.cos((x - z) * noiseScale * 0.8) * 1.5
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

window.createTerrain = createTerrain;
window.updateTerrain = updateTerrain;
