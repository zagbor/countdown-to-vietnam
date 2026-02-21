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

    // ── Cloak / Cape (behind body)
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.moveTo(-55, -60);
    ctx.bezierCurveTo(-80, -10, -85, 50, -60, 110);
    ctx.bezierCurveTo(-30, 130, 30, 130, 60, 110);
    ctx.bezierCurveTo(85, 50, 80, -10, 55, -60);
    ctx.closePath();
    ctx.fill();

    // Cloak gold trim
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 4;
    ctx.stroke();

    // ── Body / Doublet (Lannister crimson)
    ctx.fillStyle = '#9b1a1a';
    ctx.beginPath();
    ctx.ellipse(0, 40, 42, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Doublet vertical seam details
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-20, -5); ctx.lineTo(-20, 85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, -5); ctx.lineTo(20, 85); ctx.stroke();

    // ── Gold Pauldrons (shoulder guards)
    ctx.fillStyle = '#c9a227';
    // left
    ctx.beginPath();
    ctx.ellipse(-50, -15, 22, 13, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a07a10'; ctx.lineWidth = 2; ctx.stroke();
    // right
    ctx.beginPath();
    ctx.ellipse(50, -15, 22, 13, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // ── Arms (shorter, stocky)
    ctx.fillStyle = '#9b1a1a';
    // left arm + hand with goblet
    ctx.beginPath();
    ctx.ellipse(-62, 20, 13, 32, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // right arm
    ctx.beginPath();
    ctx.ellipse(58, 25, 13, 28, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // ── Hands
    ctx.fillStyle = '#f0c59e';
    // left hand
    ctx.beginPath(); ctx.arc(-68, 48, 11, 0, Math.PI * 2); ctx.fill();
    // right hand
    ctx.beginPath(); ctx.arc(64, 50, 11, 0, Math.PI * 2); ctx.fill();

    // ── Goblet of wine (left hand)
    ctx.fillStyle = '#c9a227';
    // cup base
    ctx.beginPath();
    ctx.roundRect(-80, 44, 22, 22, [0, 0, 4, 4]);
    ctx.fill();
    // stem
    ctx.fillRect(-72, 64, 6, 10);
    // base plate
    ctx.fillRect(-78, 72, 18, 4);
    // wine inside
    ctx.fillStyle = '#6b0f0f';
    ctx.beginPath();
    ctx.ellipse(-69, 47, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-73, 49, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // ── Neck
    ctx.fillStyle = '#f0c59e';
    ctx.beginPath();
    ctx.roundRect(-10, -92, 20, 20, 4);
    ctx.fill();

    // ── Head (large, slightly wide — dwarfism proportions)
    ctx.fillStyle = '#f0c59e';
    ctx.beginPath();
    ctx.ellipse(0, -122, 40, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Blond hair (tousled, slightly unkempt)
    ctx.fillStyle = '#d4a017';
    // back of head / sides
    ctx.beginPath();
    ctx.ellipse(0, -128, 44, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // forelock tufts
    ctx.beginPath();
    ctx.moveTo(-30, -148);
    ctx.bezierCurveTo(-35, -165, -20, -170, -15, -155);
    ctx.bezierCurveTo(-8, -170, 0, -172, 2, -158);
    ctx.bezierCurveTo(8, -172, 22, -168, 20, -152);
    ctx.bezierCurveTo(28, -165, 38, -160, 32, -148);
    ctx.closePath();
    ctx.fill();

    // ── Face over hair
    ctx.fillStyle = '#f0c59e';
    ctx.beginPath();
    ctx.ellipse(0, -118, 34, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slight stubble / beard jawline
    ctx.fillStyle = 'rgba(180, 140, 80, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -100, 28, 14, 0, 0, Math.PI);
    ctx.fill();

    // ── Eyes — one slightly narrower (knowing, amused)
    // Whites
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-14, -122, 9, 7, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(14, -122, 9, 7, 0.1, 0, Math.PI * 2); ctx.fill();
    // Irises (green)
    ctx.fillStyle = '#4a7c4e';
    ctx.beginPath(); ctx.arc(-14, -121, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, -121, 5, 0, Math.PI * 2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-14, -121, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, -121, 2.5, 0, Math.PI * 2); ctx.fill();
    // Lids — right eye slightly lower/drooped for wry look
    ctx.strokeStyle = '#7a5533';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-14, -124, 9, Math.PI + 0.4, -0.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(14, -123, 9, Math.PI + 0.65, -0.2); ctx.stroke(); // more drooped

    // ── Eyebrows (raised on one side — quizzical)
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-24, -132); ctx.quadraticCurveTo(-14, -137, -4, -133); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -135); ctx.quadraticCurveTo(14, -138, 24, -131); ctx.stroke(); // raised

    // ── Nose (prominent, rounded)
    ctx.fillStyle = '#d9a47a';
    ctx.beginPath();
    ctx.ellipse(2, -112, 8, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Nostrils
    ctx.fillStyle = '#c0845a';
    ctx.beginPath(); ctx.ellipse(-3, -108, 3, 2, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -108, 3, 2, 0.5, 0, Math.PI * 2); ctx.fill();

    // ── Smirk (asymmetric smile — left side higher)
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-16, -99);
    ctx.bezierCurveTo(-10, -103, 2, -103, 8, -100);
    ctx.bezierCurveTo(14, -97, 18, -96, 20, -98);
    ctx.stroke();

    // ── Lannister lion pin (chest)
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b0000';
    ctx.font = 'bold 9px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♛', 0, 1);

    // ── Legs (short and sturdy — boots and trousers)
    ctx.fillStyle = '#4a2000';
    ctx.beginPath(); ctx.roundRect(-28, 85, 22, 38, [0, 0, 4, 4]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(6, 85, 22, 38, [0, 0, 4, 4]); ctx.fill();

    // Boot shine
    ctx.fillStyle = '#2a1200';
    ctx.beginPath(); ctx.ellipse(-17, 122, 18, 10, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(17, 122, 18, 10, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.ellipse(-22, 118, 6, 3, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, 118, 6, 3, -0.5, 0, Math.PI * 2); ctx.fill();

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
