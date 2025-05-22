let treeGeometry = null;
let treeMaterial = null;
let isTreeModelReady = false;

function setTreeModel(geometry, material) {
    treeGeometry = geometry;
    treeMaterial = material;
    isTreeModelReady = true;
}

function addTreesToChunk(chunk) {
    if (!isTreeModelReady) return;

    // update raycasting stuffs
    chunk.updateMatrixWorld(true);

    // Remove previous trees
    for (let i = chunk.children.length - 1; i >= 0; i--) {
        const child = chunk.children[i];
        if (child.isTree) {
            chunk.remove(child);
        }
    }

    const treesPerChunk = Math.floor(Math.random() * 4) + 2;
    const chunkSize = 50;

    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);

    for (let i = 0; i < treesPerChunk; i++) {
        const localX = (Math.random() - 0.5) * chunkSize;
        const localZ = (Math.random() - 0.5) * chunkSize;
        const worldX = chunk.position.x + localX;
        const worldZ = chunk.position.z + localZ;

        const rayOrigin = new THREE.Vector3(worldX, 100, worldZ);
        raycaster.set(rayOrigin, down);

        const intersects = raycaster.intersectObject(chunk, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const hitPoint = hit.point;

            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            const yLocal = hitPoint.y - chunk.position.y;

            tree.rotation.x = -Math.PI / 2;

            tree.position.set(localX, yLocal - 0.1, localZ);
            const scale = 1 + (Math.random() - 0.5) * 0.2;
            tree.scale.set(scale, scale, scale);
            tree.rotation.z = Math.random() * Math.PI * 2;

            tree.castShadow = false;
            tree.receiveShadow = false;
            tree.isTree = true;

            chunk.add(tree);
        }
    }
}



// Export globally
window.setTreeModel = setTreeModel;
window.addTreesToChunk = addTreesToChunk;
