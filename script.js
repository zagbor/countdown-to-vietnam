// import * as THREE from 'three';
// import { DragControls } from 'three/addons/controls/DragControls.js';

// --- Global Variables ---
let camera, scene, renderer;
let bagel, baguette;
let bagelHitbox, baguetteHitbox; // Invisible proxies for dragging
let controls;
let objects = []; // Objects that can be dragged (Hitboxes)
let isBingo = false;

init();
animate();

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // Light gray background
    // scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 4. Renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 5. Create Object s
    createBagel();
    createBaguette();

    // 6. Interaction (DragControls - Global in r128)
    // We drag the Hitboxes, not the visible meshes
    controls = new THREE.DragControls(objects, camera, renderer.domElement);

    controls.addEventListener('dragstart', function (event) {
        // Find corresponding visible object to highlight?
        // event.object is the hitbox.
        // We can store reference in hitbox.userData
        event.object.userData.visibleMesh.material.emissive.set(0xaaaaaa);
    });

    controls.addEventListener('dragend', function (event) {
        event.object.userData.visibleMesh.material.emissive.set(0x000000);
        checkWinCondition();
    });

    // 7. Event Listeners
    window.addEventListener('resize', onWindowResize);
}

function createBagel() {
    // 1. Visible Mesh
    const geometry = new THREE.TorusGeometry(1.5, 0.6, 16, 50);
    const material = new THREE.MeshStandardMaterial({
        color: 0xceb68a,
        roughness: 0.4,
    });

    bagel = new THREE.Mesh(geometry, material);
    bagel.position.set(-3, 0, 0);
    bagel.castShadow = true;
    bagel.receiveShadow = true;
    scene.add(bagel);

    // 2. Invisible Hitbox (Sphere for easier grabbing)
    const hitboxGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const hitboxMat = new THREE.MeshBasicMaterial({
        visible: false, // Invisible
        color: 0xff0000,
        transparent: true,
        opacity: 0.2
    });

    bagelHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    bagelHitbox.position.copy(bagel.position);
    bagelHitbox.userData.visibleMesh = bagel; // Link for emissive effect

    scene.add(bagelHitbox);
    objects.push(bagelHitbox); // Add hitbox to draggable objects
}

function createBaguette() {
    // 1. Visible Mesh
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 3, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0xeac78e,
        roughness: 0.6,
    });

    baguette = new THREE.Mesh(geometry, material);
    baguette.rotation.z = Math.PI / 4;
    baguette.position.set(3, 0, 0);
    baguette.castShadow = true;
    baguette.receiveShadow = true;
    scene.add(baguette);

    // 2. Invisible Hitbox
    const hitboxGeo = new THREE.CylinderGeometry(1, 1, 4, 8); // Slightly larger
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });

    baguetteHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    baguetteHitbox.position.copy(baguette.position);
    baguetteHitbox.rotation.z = Math.PI / 4; // Match initial rotation
    baguetteHitbox.userData.visibleMesh = baguette;

    scene.add(baguetteHitbox);
    objects.push(baguetteHitbox);
}

function checkWinCondition() {
    if (isBingo) return;

    // Simple distance check in 3D space
    // We want the baguette (center) to be close to bagel (center)
    const dist = bagel.position.distanceTo(baguette.position);

    // Threshold needs to be tweaked. 
    // Bagel hole is radius 1.5 (minus tube 0.6) ~ 0.9 radius.
    // Baguette radius 0.4.
    // If centers are close, it's "in".

    if (dist < 1.0) {
        triggerBingo();
    }
}

function triggerBingo() {
    isBingo = true;

    // Disable controls
    controls.deactivate();

    // Align them perfectly specific animation?
    // For now, snapping baguette to center
    baguette.position.copy(bagel.position);
    baguette.rotation.set(0, 0, Math.PI / 2); // Rotate to fit nicely through? Or stand up?
    // Let's make it go "through" - perpendicular
    baguette.rotation.set(Math.PI / 2, 0, 0);

    // Show UI
    const ui = document.getElementById('ui-overlay');
    ui.classList.remove('hidden');
    ui.style.opacity = 1;

    // Start countdown
    initCountdown();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (!isBingo) {
        const time = Date.now() * 0.001;

        // --- Balloon Physics (Inertia + Floating) ---

        // 1. Lerp visible mesh to hitbox (Inertia)
        // Lerp factor 0.05 = very heavy/inert
        bagel.position.lerp(bagelHitbox.position, 0.05);
        baguette.position.lerp(baguetteHitbox.position, 0.05);

        // 2. Floating Effect (Idle Motion)
        // We add offset to the *Visible* mesh relative to hitbox? 
        // Or we move the hitbox itself if not being dragged? 
        // DragControls locks hitbox position.
        // Let's add the wave to the visible position AFTER lerp.

        // Gentle rotation
        bagel.rotation.x = Math.sin(time * 0.5) * 0.1;
        bagel.rotation.y = Math.cos(time * 0.3) * 0.1;

        baguette.rotation.x = Math.sin(time * 0.4) * 0.1;
        baguette.rotation.y = Math.cos(time * 0.6) * 0.1 + (isBingo ? 0 : 0); // Keep base rotation logic?
        // Baguette needs to keep its Z rotation constant mostly? z=PI/4
        // Let's just animate local rotations or small deviations.
        baguette.rotation.z = (Math.PI / 4) + Math.sin(time * 0.2) * 0.05;

        // Bobbing (Y-axis) - Note: this fights the lerp a bit if we modify .position directly.
        // Better to add a small offset to the target? No, lerp will smooth it out.
        // Let's just rely on the rotation and "lag" for the balloon feel.
        // A true balloon floats up. Maybe we can add a "buoyancy" force to the hitbox? 
        // No, DragControls overrides position.

        // So just the Lag (Lerp) + Rotation gives a good "heavy floating" feel.

    } else {
        // Spin the winning combo?
        bagel.rotation.z += 0.01;

        // Baguette follows bagel
        baguette.position.copy(bagel.position);
        baguette.rotation.y += 0.02;
        baguette.rotation.x = Math.PI / 2; // Keep it inserted
    }

    renderer.render(scene, camera);
}

// --- Countdown Logic (Same as before) ---
function initCountdown() {
    function getTargetDates() {
        const now = new Date();
        let year = now.getFullYear();
        let target = new Date(year, 1, 28);
        if (now > target) { target = new Date(year + 1, 1, 28); }
        return target;
    }

    const targetDate = getTargetDates();

    function update() {
        const now = new Date();
        const diff = targetDate - now;
        if (diff <= 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = d.toString().padStart(2, '0');
        document.getElementById('hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
    }
    setInterval(update, 1000);
    update();
}
