// ─── State Machine ────────────────────────────────────────────────────────
// States: 'idle' → 'inflate' → 'pop' → 'timer'
let state = 'idle';
let stateStart = Date.now();

let W, H;
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

// Inflate progress 0→1
let inflateT = 0;
// Pop particles
let particles = [];
// Wobble bob offset
let bobOffset = 0;

// ─── Resize ───────────────────────────────────────────────────────────────
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ─── Transition helper ────────────────────────────────────────────────────
function setState(s) {
    state = s;
    stateStart = Date.now();
}

// ─── Background ───────────────────────────────────────────────────────────
function drawBg() {
    const g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    g.addColorStop(0, '#2a1a5e');
    g.addColorStop(0.5, '#1a0a2e');
    g.addColorStop(1, '#0d0616');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Festive dots / stars
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 60; i++) {
        const sx = Math.abs(Math.sin(i * 347.3) * W);
        const sy = Math.abs(Math.cos(i * 193.7) * H);
        const sr = Math.abs(Math.sin(i * 71.1)) * 1.2 + 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ─── Draw Dwarf ───────────────────────────────────────────────────────────
// scale: 1 = normal, >1 = inflated
function drawDwarf(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // ── Dark Jacket (leather, slightly open)
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.moveTo(-48, -55);
    ctx.bezierCurveTo(-62, -10, -65, 50, -50, 100);
    ctx.bezierCurveTo(-25, 118, 25, 118, 50, 100);
    ctx.bezierCurveTo(65, 50, 62, -10, 48, -55);
    ctx.closePath();
    ctx.fill();

    // Jacket lapels (open, showing dark tee under)
    // Left lapel
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(0, -60); ctx.lineTo(-20, -55); ctx.lineTo(-30, -10); ctx.lineTo(0, 5);
    ctx.closePath(); ctx.fill();
    // Right lapel
    ctx.beginPath();
    ctx.moveTo(0, -60); ctx.lineTo(20, -55); ctx.lineTo(30, -10); ctx.lineTo(0, 5);
    ctx.closePath(); ctx.fill();

    // Inner dark tee
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-18, -55); ctx.lineTo(18, -55); ctx.lineTo(22, 10); ctx.lineTo(-22, 10);
    ctx.closePath(); ctx.fill();

    // Jacket stitch/zip line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(0, 95); ctx.stroke();
    ctx.setLineDash([]);

    // ── Shoulders (stocky — jacket collar)
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(-50, -42, 20, 10, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(50, -42, 20, 10, 0.3, 0, Math.PI * 2); ctx.fill();

    // ── Arms (very stocky)
    ctx.fillStyle = '#1c1c1c';
    // left arm — slightly raised, crossed/pouty
    ctx.beginPath(); ctx.ellipse(-60, 10, 14, 38, -0.35, 0, Math.PI * 2); ctx.fill();
    // right arm — drooped, casual
    ctx.beginPath(); ctx.ellipse(60, 18, 14, 35, 0.25, 0, Math.PI * 2); ctx.fill();

    // ── Hands
    ctx.fillStyle = '#d4956a';
    ctx.beginPath(); ctx.arc(-66, 44, 12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(66, 50, 12, 0, Math.PI * 2); ctx.fill();

    // ── Cigarette (right hand — classic grumpy pose)
    ctx.strokeStyle = '#f5f5dc';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(66, 50); ctx.lineTo(86, 42); ctx.stroke();
    // Ash / ember tip
    ctx.fillStyle = '#ff6600';
    ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(87, 41, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Smoke wisps
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(87, 38);
    ctx.bezierCurveTo(82, 28, 92, 18, 87, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(90, 37);
    ctx.bezierCurveTo(96, 27, 88, 17, 94, 7);
    ctx.stroke();

    // ── Jeans (dark blue denim)
    ctx.fillStyle = '#253650';
    ctx.beginPath(); ctx.roundRect(-30, 90, 24, 50, [0, 0, 5, 5]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(6, 90, 24, 50, [0, 0, 5, 5]); ctx.fill();
    // Denim seam
    ctx.strokeStyle = '#1a2840';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-18, 90); ctx.lineTo(-18, 138); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, 90); ctx.lineTo(18, 138); ctx.stroke();

    // ── Sneakers (white/grey — modern)
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.ellipse(-18, 138, 22, 12, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, 138, 22, 12, 0.05, 0, Math.PI * 2); ctx.fill();
    // Sole
    ctx.fillStyle = '#ccc';
    ctx.beginPath(); ctx.ellipse(-18, 143, 22, 6, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, 143, 22, 6, 0.05, 0, Math.PI * 2); ctx.fill();
    // Laces
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-30 + i * 6, 133 + i * 1.5); ctx.lineTo(-6 + i * 2, 134 + i * 1.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6 + i * 6, 133 + i * 1.5); ctx.lineTo(30 + i * 2, 134 + i * 1.5); ctx.stroke();
    }

    // ── Neck (short, thick)
    ctx.fillStyle = '#d4956a';
    ctx.beginPath(); ctx.roundRect(-12, -85, 24, 22, 4); ctx.fill();

    // ── Head (large, round — prominent jawline)
    ctx.fillStyle = '#d4956a';
    ctx.beginPath();
    ctx.ellipse(0, -118, 38, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    // Jaw/chin block — wide square jaw
    ctx.beginPath();
    ctx.moveTo(-32, -110); ctx.bezierCurveTo(-36, -88, -24, -80, 0, -78);
    ctx.bezierCurveTo(24, -80, 36, -88, 32, -110);
    ctx.closePath(); ctx.fill();

    // ── Dark short hair (messy, slightly unkempt)
    ctx.fillStyle = '#2a1a0e';
    ctx.beginPath();
    ctx.ellipse(0, -132, 40, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Hair tufts
    ctx.beginPath();
    ctx.moveTo(-38, -128);
    ctx.bezierCurveTo(-45, -148, -28, -158, -20, -144);
    ctx.bezierCurveTo(-12, -158, -2, -162, 0, -148);
    ctx.bezierCurveTo(4, -162, 16, -158, 22, -146);
    ctx.bezierCurveTo(30, -158, 44, -148, 38, -128);
    ctx.closePath(); ctx.fill();
    // Small sideburns
    ctx.beginPath(); ctx.ellipse(-36, -107, 8, 12, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(36, -107, 8, 12, 0.2, 0, Math.PI * 2); ctx.fill();

    // ── Face (skin re-cover over hair)
    ctx.fillStyle = '#d4956a';
    ctx.beginPath();
    ctx.ellipse(0, -115, 31, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5-o'clock shadow
    ctx.fillStyle = 'rgba(80,50,30,0.22)';
    ctx.beginPath(); ctx.ellipse(0, -97, 26, 15, 0, 0, Math.PI); ctx.fill();
    // Stubble dots effect
    ctx.fillStyle = 'rgba(80,50,30,0.18)';
    for (let i = 0; i < 18; i++) {
        const sx = (Math.sin(i * 73.1) * 0.8) * 24;
        const sy = -100 + Math.cos(i * 47.3) * 12;
        ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    // ── Eyes — scowling, heavy-lidded
    // Whites
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-13, -119, 9, 6, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -119, 9, 6, -0.1, 0, Math.PI * 2); ctx.fill();
    // Irises (brown)
    ctx.fillStyle = '#6b3a1f';
    ctx.beginPath(); ctx.arc(-13, -119, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -119, 4.5, 0, Math.PI * 2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.arc(-13, -119, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -119, 2.2, 0, Math.PI * 2); ctx.fill();
    // Heavy upper lids (scowling)
    ctx.fillStyle = '#b87650';
    ctx.beginPath(); ctx.ellipse(-13, -122, 10, 4.5, 0.1, 0, Math.PI, true); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -122, 10, 4.5, -0.1, 0, Math.PI, true); ctx.fill();

    // ── Eyebrows (furrowed aggressively together)
    ctx.strokeStyle = '#2a1a0e';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    // Left brow — angled down toward nose
    ctx.beginPath(); ctx.moveTo(-24, -130); ctx.lineTo(-4, -126); ctx.stroke();
    // Right brow — angled down toward nose
    ctx.beginPath(); ctx.moveTo(24, -130); ctx.lineTo(4, -126); ctx.stroke();
    // Frown crease between brows
    ctx.strokeStyle = 'rgba(150,80,40,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-3, -126); ctx.lineTo(0, -120); ctx.lineTo(3, -126); ctx.stroke();

    // ── Nose (bulbous, prominent — distinctive)
    ctx.fillStyle = '#c07f55';
    ctx.beginPath(); ctx.ellipse(0, -109, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a86840';
    ctx.beginPath(); ctx.ellipse(-5, -105, 3.5, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -105, 3.5, 2.5, 0.4, 0, Math.PI * 2); ctx.fill();

    // ── Mouth — flat grumpy line turning down at corners
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -95);
    ctx.bezierCurveTo(-10, -97, 10, -97, 18, -95); // flat
    // Corner droop
    ctx.moveTo(-18, -95); ctx.lineTo(-22, -92); // left corner down
    ctx.moveTo(18, -95); ctx.lineTo(22, -92); // right corner down
    ctx.stroke();

    ctx.restore();
}

// ─── Pop Particles ────────────────────────────────────────────────────────
function spawnParticles(cx, cy) {
    const colors = ['#ff4444', '#ffdb4d', '#2244aa', '#fff', '#f5c89a', '#cc2222', '#44ee88'];
    particles = [];
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4,
            r: Math.random() * 10 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: Math.random() * 0.015 + 0.01,
            spin: (Math.random() - 0.5) * 0.3,
            angle: Math.random() * Math.PI * 2,
        });
    }
}

function updateDrawParticles() {
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.vx *= 0.97;
        p.angle += p.spin;
        p.life -= p.decay;

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
    // Dwarf base Y — feet touch roughly H*0.75
    const cy = H * 0.55;

    if (state === 'idle') {
        // Cheerful bob
        bobOffset = Math.sin(t * 3) * 6;
        // Draw at normal scale with bob
        drawDwarf(cx, cy + bobOffset, 1);

        if (elapsed >= 5) {
            setState('inflate');
        }
    }

    else if (state === 'inflate') {
        // Inflate over 3 seconds up to ~3× size before popping
        inflateT = Math.min(elapsed / 3, 1);
        const scale = 1 + inflateT * 2.5;

        // Balloon stretching — wider than tall at high inflation
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1 + inflateT * 0.5, 1); // get wider
        ctx.translate(-cx, -cy);
        drawDwarf(cx, cy, scale);
        ctx.restore();

        // Squeak sound (visual feedback: slight color overlay)
        if (inflateT > 0.6) {
            ctx.fillStyle = `rgba(255,0,0,${(inflateT - 0.6) * 0.15})`;
            ctx.fillRect(0, 0, W, H);
        }

        if (elapsed >= 3) {
            spawnParticles(cx, cy - 50);
            setState('pop');
        }
    }

    else if (state === 'pop') {
        updateDrawParticles();

        // Flash
        if (elapsed < 0.1) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillRect(0, 0, W, H);
        }

        if (elapsed >= 2) {
            setState('timer');
            // Show timer UI
            const timerEl = document.getElementById('timer');
            timerEl.classList.remove('hidden');
            initCountdown();
        }
    }

    else if (state === 'timer') {
        // Keep particles fading
        updateDrawParticles();
        // Starfield bg already drawn
    }
}

setState('idle');
loop();
