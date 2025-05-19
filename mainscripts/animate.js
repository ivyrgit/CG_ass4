function animate() {
    requestAnimationFrame(animate);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, 0.2); // Auto-move forward

    updateTerrain(camera);
    renderer.render(scene, camera);
}
