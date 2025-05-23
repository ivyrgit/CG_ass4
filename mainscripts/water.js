function addWaterToChunk(chunk) {
    for (let i = chunk.children.length - 1; i >= 0; i--) {
        const child = chunk.children[i];
        if (child.isWater) {
            chunk.remove(child);
        }
    }

    const geometry = chunk.geometry;
    const pos = geometry.attributes.position;
    let minY = Infinity;

    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y < minY) minY = y;
    }

    if (Math.random() < 0.5) return;

    const threshold = 0.5;
    const crevicePoints = [];

    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (Math.abs(y - minY) <= threshold) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            crevicePoints.push(new THREE.Vector3(x, y, z));
        }
    }

    if (crevicePoints.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const v of crevicePoints) {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.z < minZ) minZ = v.z;
        if (v.z > maxZ) maxZ = v.z;
    }

    const width = maxX - minX;
    const depth = maxZ - minZ;
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const waterGeometry = new THREE.BoxGeometry(width, 1.5, depth);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x3B6FE1,
        transparent: true,
        //metalness: 1.0,
        roughness: 0.05,
        opacity: 0.5
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);

    const localWaterY = minY + 0.8;
    water.position.set(centerX, localWaterY, centerZ);

    water.isWater = true;
    chunk.add(water);
}




window.addWaterToChunk = addWaterToChunk;
