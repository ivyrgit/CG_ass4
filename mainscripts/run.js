console.log("Starting run.js...");

setScene();
setLight();
document.querySelectorAll('input[name="lighting"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        const mode = event.target.value;
        setLight(mode);
    });
});

animate();
window.addEventListener('resize', resizeScene);
