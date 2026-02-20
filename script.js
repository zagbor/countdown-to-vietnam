// ─── Melancholy Scene ───────────────────────────────────────────────────
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

let W, H;
const wind = { x: 1.2, y: 0.15 }; // Gentle wind blowing right
const snowflakes = [];
const SNOW_COUNT = 160;

// ── Resize ───────────────────────────────────────────────────────────────
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initSnow();
}
window.addEventListener('resize', resize);

// ── Snowflake ─────────────────────────────────────────────────────────────
function initSnow() {
    snowflakes.length = 0;
    for (let i = 0; i < SNOW_COUNT; i++) {
        snowflakes.push(newFlake(true));
    }
}

function newFlake(randomY) {
    const r = Math.random() * 2.5 + 0.5;
    return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : -r * 2,
        r,
        speed: r * 0.4 + Math.random() * 0.5,
        drift: (Math.random() - 0.3) * 0.4,  // slight horizontal variance per flake
        opacity: Math.random() * 0.5 + 0.3,
        swing: Math.random() * Math.PI * 2,
    };
}

function updateSnow() {
    const t = Date.now() * 0.001;
    for (const f of snowflakes) {
        f.swing += 0.01;
        f.x += wind.x + f.drift + Math.sin(f.swing) * 0.3;
        f.y += f.speed + wind.y;
        if (f.y > H + 10 || f.x > W + 40) {
            Object.assign(f, newFlake(false));
            f.x = f.x > W + 40 ? -10 : f.x; // re-enter from left if blew off right
        }
    }
}

function drawSnow() {
    ctx.save();
    for (const f of snowflakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 240, ${f.opacity})`;
        ctx.fill();
    }
    ctx.restore();
}

// ── Background ────────────────────────────────────────────────────────────
function drawBackground() {
    // Night sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#06090f');
    sky.addColorStop(0.6, '#0d1520');
    sky.addColorStop(1, '#1a1208');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
}

// ── Lantern ───────────────────────────────────────────────────────────────
function drawLantern(cx, cy) {
    const t = Date.now() * 0.002;
    const flicker = 0.85 + Math.sin(t * 3.7) * 0.08 + Math.sin(t * 11) * 0.04;

    // Halo glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.55);
    glow.addColorStop(0, `rgba(255, 210, 120, ${0.18 * flicker})`);
    glow.addColorStop(0.3, `rgba(255, 170,  60, ${0.08 * flicker})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Post
    const postX = cx - 6;
    const postH = H * 0.40;
    const postTop = cy - postH;
    ctx.save();
    ctx.strokeStyle = '#3a3328';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, postTop + 20);
    ctx.stroke();

    // Arm
    ctx.beginPath();
    ctx.moveTo(cx, postTop + 20);
    ctx.bezierCurveTo(cx, postTop - 10, cx + 40, postTop - 20, cx + 40, postTop - 30);
    ctx.stroke();
    ctx.restore();

    // Lantern body
    const lx = cx + 40;
    const ly = postTop - 55;
    ctx.save();
    ctx.shadowColor = `rgba(255, 210, 100, ${0.9 * flicker})`;
    ctx.shadowBlur = 20 * flicker;
    ctx.fillStyle = `rgba(255, 215, 120, ${0.95 * flicker})`;
    ctx.beginPath();
    ctx.roundRect(lx - 10, ly - 15, 20, 30, 3);
    ctx.fill();

    // Glass glow inside
    const innerGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 20);
    innerGlow.addColorStop(0, `rgba(255, 240, 180, ${0.6 * flicker})`);
    innerGlow.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(lx, ly, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ── Ground / Puddle Reflection ────────────────────────────────────────────
function drawGround(lightCX, lightCY) {
    const groundY = H * 0.72;
    // Wet ground gradient
    const ground = ctx.createLinearGradient(0, groundY, 0, H);
    ground.addColorStop(0, 'rgba(15, 18, 25, 0.9)');
    ground.addColorStop(1, '#0a0c10');
    ctx.fillStyle = ground;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Reflection (faint blob)
    const t = Date.now() * 0.001;
    const refX = lightCX + 40;
    const refY = groundY + 10;
    const ref = ctx.createRadialGradient(refX, refY, 0, refX, refY + 8, 60);
    ref.addColorStop(0, `rgba(255, 200, 80, ${0.12 + Math.sin(t * 2) * 0.02})`);
    ref.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ref;
    ctx.fillRect(0, groundY, W, H - groundY);
}

// ── Figure ────────────────────────────────────────────────────────────────
function drawFigure(fx, fy) {
    const t = Date.now() * 0.001;

    // Wind coat flap (varies with time)
    const coatFlap = Math.sin(t * 1.8) * 0.12 + 0.1; // always positive: coat blows right

    ctx.save();
    ctx.translate(fx, fy);
    ctx.fillStyle = 'rgba(20, 20, 22, 0.95)';
    ctx.strokeStyle = 'rgba(35, 35, 40, 0.5)';
    ctx.lineWidth = 1;

    // ── Head
    ctx.beginPath();
    ctx.ellipse(0, -95, 14, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Body / coat (static core)
    ctx.beginPath();
    ctx.moveTo(-22, -80);
    ctx.bezierCurveTo(-28, -40, -25, 0, -20, 30);  // left side
    ctx.lineTo(20, 30);
    ctx.bezierCurveTo(25, 0, 28, -40, 22, -80); // right side
    ctx.closePath();
    ctx.fill();

    // ── Coat left flap (blowing in wind)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-20, -60);
    ctx.bezierCurveTo(
        -20 - coatFlap * 80, -20,
        -20 - coatFlap * 100, 15,
        -16, 30
    );
    ctx.bezierCurveTo(-10, 10, -14, -10, -20, -60);
    ctx.closePath();
    ctx.fillStyle = 'rgba(25, 25, 30, 0.9)';
    ctx.fill();
    ctx.restore();

    // ── Coat bottom hem flap
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-20, 28);
    ctx.bezierCurveTo(
        -20 - coatFlap * 60, 45,
        0 + coatFlap * 20, 55,
        20, 30
    );
    ctx.bezierCurveTo(10, 38, -5, 35, -20, 28);
    ctx.closePath();
    ctx.fillStyle = 'rgba(22, 22, 26, 0.9)';
    ctx.fill();
    ctx.restore();

    // ── Legs
    ctx.beginPath();
    ctx.fillStyle = 'rgba(18, 18, 22, 0.95)';
    ctx.moveTo(-14, 30);
    ctx.lineTo(-10, 70);
    ctx.lineTo(-2, 70);
    ctx.lineTo(0, 30);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(14, 30);
    ctx.lineTo(10, 70);
    ctx.lineTo(2, 70);
    ctx.lineTo(0, 30);
    ctx.fill();

    ctx.restore();
}

// ── Main Render ───────────────────────────────────────────────────────────
function render() {
    requestAnimationFrame(render);

    drawBackground();

    // Layout in thirds: lantern left-center, figure center-right
    const lanternX = W * 0.38;
    const lanternY = H * 0.72;

    const figureX = W * 0.50;
    const figureY = H * 0.72 - 35; // stand on ground line

    drawGround(lanternX, lanternY);
    drawLantern(lanternX, lanternY);
    drawFigure(figureX, figureY);
    updateSnow();
    drawSnow();
}

// ── Countdown ─────────────────────────────────────────────────────────────
function initCountdown() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 1, 28); // Feb 28
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

// ── Boot ──────────────────────────────────────────────────────────────────
resize();
render();
initCountdown();
