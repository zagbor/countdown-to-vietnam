// ─── State Machine ────────────────────────────────────────────────────────
let state = 'idle';
let stateStart = Date.now();
let popStartTime = 0;

// ─── State helper ─────────────────────────────────────────────────────────
function setState(s) {
    state = s;
    stateStart = Date.now();
    if (s === 'pop') popStartTime = stateStart;
}

let W, H;
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let inflateT = 0;
let particles = [];

// ─── Procedural Forest Data ──────────────────────────────────────────────
let forest = [];
function initForest() {
    forest = [];
    let seed = 42;
    function rnd() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    }
    for (let i = 0; i < 15; i++) {
        forest.push({
            x: rnd() * W,
            y: H * (0.65 + rnd() * 0.3),
            size: 45 + rnd() * 70,
            angle: (rnd() - 0.5) * 0.25, // Just a small tilt, 0 is straight up
        });
    }
}

// ─── Resize ───────────────────────────────────────────────────────────────
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initForest();
}
window.addEventListener('resize', resize);
resize();

// ─── Image Loading ────────────────────────────────────────────────────────
const dwarfImg = new Image();
dwarfImg.src = 'dwarf.png';
let imgLoaded = false;
dwarfImg.onload = () => { imgLoaded = true; };

// ─── Recursive Tree Drawing ───────────────────────────────────────────────
function drawTree(x, y, len, angle, depth, springT) {
    if (depth > 7) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Trunk color: Grayish in winter, brownish in spring
    const r = Math.floor(40 + 40 * springT);
    const g = Math.floor(40 + 30 * springT);
    const b = Math.floor(45 + 10 * springT);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    // Depth 0 is the trunk
    ctx.lineWidth = depth === 0 ? len * 0.12 : (8 - depth) * 1.2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len); // Points UP in canvas space
    ctx.stroke();

    // Buds/Leaves (growing in spring)
    if (depth > 3 && springT > 0) {
        ctx.fillStyle = `rgba(${50 + 100 * springT}, ${120 + 80 * springT}, 50, ${springT})`;
        const leafSize = springT * (9 - depth) * 2.2;
        ctx.beginPath();
        ctx.arc(0, -len, leafSize, 0, Math.PI * 2);
        ctx.fill();
    }

    const nextLen = len * 0.78;
    // Recursive branches
    const branchAngle = 0.35 + Math.sin(depth + x) * 0.05;
    drawTree(0, -len, nextLen, branchAngle, depth + 1, springT);
    drawTree(0, -len, nextLen, -branchAngle, depth + 1, springT);

    ctx.restore();
}

// ─── Draw Background ─────────────────────────────────────────────────────
function drawBg() {
    const elapsedSincePop = (state === 'pop' || state === 'timer')
        ? (Date.now() - popStartTime) / 1000
        : 0;
    const springT = Math.min(elapsedSincePop / 4.0, 1);

    // Sky transition
    const skyH = Math.floor(10 + springT * 120);
    const skyS = Math.floor(10 + springT * 40);
    const skyL = Math.floor(5 + springT * 65);
    ctx.fillStyle = `hsl(${skyH}, ${skyS}%, ${skyL}%)`;
    ctx.fillRect(0, 0, W, H);

    // Rising Sun
    if (springT > 0) {
        ctx.save();
        ctx.globalAlpha = springT;
        ctx.fillStyle = '#fff4a3';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffea00';
        ctx.beginPath();
        ctx.arc(W * 0.85, H * 0.3 - (springT * 120), 30 + springT * 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Ground transition (smooth interpolation)
    const grR = Math.floor(26 + springT * 10);
    const grG = Math.floor(26 + springT * 33);
    const grB = Math.floor(28 - springT * 4);
    ctx.fillStyle = `rgb(${grR}, ${grG}, ${grB})`;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);

    // Render Forest
    forest.sort((a, b) => a.y - b.y).forEach(t => {
        drawTree(t.x, t.y, t.size, t.angle, 0, springT);
    });

    // Growing Grass
    if (springT > 0.1) {
        ctx.fillStyle = `rgba(100, 200, 50, ${springT * 0.8})`;
        for (let i = 0; i < W; i += 15) {
            const h = Math.abs(Math.sin(i * 0.82)) * 14 * springT;
            ctx.fillRect(i, H * 0.75 - h, 2, h);
        }
    }
}

// ─── Draw Realistic Dwarf Photo ──────────────────────────────────────────
function drawDwarf(cx, cy, scale) {
    if (!imgLoaded) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    const baseScale = Math.min(W * 0.45, H * 0.6);
    const imgW = baseScale;
    const imgH = imgW * (dwarfImg.height / dwarfImg.width);
    ctx.drawImage(dwarfImg, -imgW / 2, -imgH / 2, imgW, imgH);
    ctx.restore();
}

// ─── Particles ────────────────────────────────────────────────────────────
function spawnParticles(cx, cy) {
    const colors = ['#1a1a1b', '#f58220', '#d8a080', '#fff', '#333'];
    particles = [];
    for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 4;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 5,
            r: Math.random() * 8 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1, decay: Math.random() * 0.015 + 0.01,
            spin: (Math.random() - 0.5) * 0.2,
            angle: Math.random() * Math.PI * 2,
        });
    }
}

function updateDrawParticles() {
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.38; p.vx *= 0.97;
        p.angle += p.spin; p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.r / 2, -p.r / 2, p.r, p.r, p.r / 4);
        ctx.fill();
        ctx.restore();
    }
}

// ─── Countdown ────────────────────────────────────────────────────────────
function initCountdown() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 1, 28);
    if (now > target) target = new Date(now.getFullYear() + 1, 1, 28);
    function update() {
        const diff = target - new Date();
        if (diff <= 0) return;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('days').textContent = String(d).padStart(2, '0');
        document.getElementById('hours').textContent = String(h).padStart(2, '0');
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }
    setInterval(update, 1000);
    update();
}

// ─── Main Loop ────────────────────────────────────────────────────────────
function loop() {
    requestAnimationFrame(loop);
    const elapsed = (Date.now() - stateStart) / 1000;
    const t = Date.now() * 0.001;
    drawBg();
    const cx = W / 2;
    const cy = H / 2;

    if (state === 'idle') {
        const bob = Math.sin(t * 2.8) * 5;
        drawDwarf(cx, cy + bob, 1);
        if (elapsed >= 5) setState('inflate');
    }
    else if (state === 'inflate') {
        const bob = Math.sin(t * 2.8) * 5; // maintain bob
        inflateT = Math.min(elapsed / 3.5, 1);
        const scale = 1 + inflateT * 1.8;
        ctx.save();
        ctx.translate(cx, cy + bob);
        ctx.scale(1 + inflateT * 0.45, 1);
        ctx.translate(-cx, -(cy + bob));
        drawDwarf(cx, cy + bob, scale);
        ctx.restore();
        if (inflateT > 0.55) {
            ctx.fillStyle = `rgba(255,0,0,${(inflateT - 0.55) * 0.14})`;
            ctx.fillRect(0, 0, W, H);
        }
        if (elapsed >= 3.5) {
            spawnParticles(cx, cy);
            setState('pop');
        }
    }
    else if (state === 'pop') {
        if (elapsed < 0.12) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, W, H);
        }
        updateDrawParticles();
        if (elapsed >= 2.2) {
            setState('timer');
            document.getElementById('timer').classList.remove('hidden');
            initCountdown();
        }
    }
    else if (state === 'timer') {
        updateDrawParticles();
    }
}
setState('idle');
loop();
