function animate() {
    requestAnimationFrame(animate);

    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(direction);
    right.crossVectors(direction, camera.up).normalize();

    if (moveState.forward) camera.position.addScaledVector(direction, moveSpeed);
    if (moveState.backward) camera.position.addScaledVector(direction, -moveSpeed);
    if (moveState.left) camera.position.addScaledVector(right, -moveSpeed);
    if (moveState.right) camera.position.addScaledVector(right, moveSpeed);
    if (moveState.up) camera.position.y += moveSpeed;
    if (moveState.down) camera.position.y -= moveSpeed;

    renderer.render(scene, camera);
}
