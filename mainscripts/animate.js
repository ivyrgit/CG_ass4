function animate() {
    requestAnimationFrame(animate);

    // move camera forward
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, 0.2); // auto-move forward

    if (spotLight && spotLight.target) {
    // keep the spotlight above the camera
    spotLight.position.copy(camera.position).add(new THREE.Vector3(0, 2, 0));

    // keep target in front of the camera
    const targetOffset = new THREE.Vector3(0, 0, -10);
    targetOffset.applyQuaternion(camera.quaternion);
    spotLight.target.position.copy(camera.position).add(targetOffset);
    spotLight.target.updateMatrixWorld();
    }


    updateTerrain(camera);
    renderer.render(scene, camera);
}
