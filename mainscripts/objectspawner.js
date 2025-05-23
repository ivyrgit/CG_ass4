const objectTypes = {};

function registerObjectType(id, geometry, material, options = {}) {
    objectTypes[id] = {
        geometry,
        material,
        options,
        ready: true
    };
}

function spawnObjectsForChunk(chunk) {
    chunk.updateMatrixWorld(true);

    const chunkSize = 50;
    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);

    // clear previously spawned objects
    for (let i = chunk.children.length - 1; i >= 0; i--) {
        const child = chunk.children[i];
        if (child.userData && child.userData.spawnedObject) {
            chunk.remove(child);
        }
    }

    // get terrain meshes
    const terrainMeshes = [];
    chunk.traverse(child => {
        if (child.isMesh && child.geometry && child.name !== "Water") {
            terrainMeshes.push(child);
        }
    });

    if (terrainMeshes.length === 0) {
        console.warn("No terrain meshes found in chunk for raycasting.");
        return;
    }

    for (const id in objectTypes) {
        const type = objectTypes[id];
        if (!type.ready) continue;
        if (type.options.spawnChance && Math.random() > type.options.spawnChance) continue;

        const count = type.options.count
            ? getRandomInt(type.options.count.min, type.options.count.max)
            : 3;

        for (let i = 0; i < count; i++) {
            // edge-biased position
            const edgeBias = 0.7;
            const edgeRange = chunkSize / 2;
            const localX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * edgeBias + (1 - edgeBias)) * edgeRange;
            const localZ = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * edgeBias + (1 - edgeBias)) * edgeRange;

            const worldX = chunk.position.x + localX;
            const worldZ = chunk.position.z + localZ;

            const rayOrigin = new THREE.Vector3(worldX, 100, worldZ);
            raycaster.set(rayOrigin, down);
            const intersects = raycaster.intersectObjects(terrainMeshes, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                const hitPoint = hit.point;
                const yLocal = hitPoint.y - chunk.position.y;

                const mesh = new THREE.Mesh(type.geometry, type.material);
                // inset into ground
                const yOffset = type.options.yOffset !== undefined ? type.options.yOffset : 0.05;
                mesh.position.set(localX, yLocal + yOffset, localZ);

                mesh.rotation.x = -Math.PI / 2; // global x rotation

                if (type.options.randomRotationZ) {
                    mesh.rotation.z = Math.random() * Math.PI * 2;
                }

                const scale = type.options.baseScale || 1;
                const scaleVar = type.options.scaleVariation || 0.1;
                const finalScale = scale + (Math.random() - 0.5) * scaleVar;
                mesh.scale.set(finalScale, finalScale, finalScale);

                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.userData.spawnedObject = true;

                chunk.add(mesh);
            } else {
                console.log(`No terrain intersection at (${worldX.toFixed(2)}, ${worldZ.toFixed(2)})`);
            }
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.registerObjectType = registerObjectType;
window.spawnObjectsForChunk = spawnObjectsForChunk;
