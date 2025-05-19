let terrainChunks = [];
const terrainSize = 200;
const segments = 50;
let noiseSeed = 0;
const scrollThreshold = terrainSize / 2;

function createTerrain(scene) {
    for (let i = 0; i < 2; i++) {
        const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0x44A682,
            flatShading: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, -15, -i * terrainSize);

        terrainChunks.push({ mesh, seed: noiseSeed });
        generateHeightMap(geometry, noiseSeed);
        noiseSeed += terrainSize;

        scene.add(mesh);
    }
}


function generateHeightMap(geometry, seed, sharedEdge = null) {
    const position = geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getZ(i);
        const row = Math.floor(i / (segments + 1));
        const col = i % (segments + 1);

        const y = (row === 0 && sharedEdge) ? sharedEdge[col] : noise(x, z + seed);
        position.setY(i, y);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
}


function updateTerrain(camera) {
    const front = terrainChunks[0];
    const back = terrainChunks[1];

    if (camera.position.z < front.mesh.position.z - scrollThreshold) {
        const moved = terrainChunks.shift();
        moved.mesh.position.z = back.mesh.position.z - terrainSize;

        const pos = back.mesh.geometry.attributes.position;
        const sharedEdge = Array.from({ length: segments + 1 }, (_, i) =>
            pos.getY(pos.count - segments - 1 + i)
        );

        generateHeightMap(moved.mesh.geometry, noiseSeed, sharedEdge);
        noiseSeed += terrainSize;

        terrainChunks.push(moved);
    }
}


function noise(x, z) {
    return Math.sin((x + z + noiseSeed) * 0.04) * 2 +
           Math.cos((x - z + noiseSeed) * 0.02) * 1;
}


window.createTerrain = createTerrain;
window.updateTerrain = updateTerrain;
