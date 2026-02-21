// ─── State Machine ────────────────────────────────────────────────────────
// States: 'idle' → 'inflate' → 'pop' → 'timer'
let state = 'idle';
let stateStart = Date.now();

let W, H;
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

let inflateT = 0;
let particles = [];

// ─── Resize ───────────────────────────────────────────────────────────────
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ─── State helper ─────────────────────────────────────────────────────────
function setState(s) {
    state = s;
    stateStart = Date.now();
}

// ─── Background ───────────────────────────────────────────────────────────
function drawBg() {
    const g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, '#2d1f5e');
    g.addColorStop(0.5, '#1a1035');
    g.addColorStop(1, '#0d0816');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let i = 0; i < 60; i++) {
        const sx = Math.abs(Math.sin(i * 347.3) * W);
        const sy = Math.abs(Math.cos(i * 193.7) * H);
        const sr = Math.abs(Math.sin(i * 71.1)) * 1.2 + 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ─── Draw Realistic Dwarf ────────────────────────────────────────────────
// Dwarf proportions: stocky normal-sized torso, shorter legs
// scale = 1 normal, >1 inflated
function drawDwarf(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Helper — radial skin gradient
    function sg(x, y, r0, r1, c0, c1) {
        const g = ctx.createRadialGradient(x, y - r1 * 0.25, r0, x, y, r1);
        g.addColorStop(0, c0);
        g.addColorStop(1, c1);
        return g;
    }

    // ── Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath(); ctx.ellipse(0, 148, 42, 9, 0, 0, Math.PI * 2); ctx.fill();

    // ────────────────────────────────
    // LEGS (short — dwarf proportions)
    // ────────────────────────────────
    const trG = ctx.createLinearGradient(-36, 82, 36, 82);
    trG.addColorStop(0, '#26262a'); trG.addColorStop(0.5, '#3a3a3e'); trG.addColorStop(1, '#1c1c20');
    ctx.fillStyle = trG;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-29, 82);
    ctx.bezierCurveTo(-33, 100, -32, 122, -26, 140);
    ctx.bezierCurveTo(-20, 146, -8, 146, -6, 140);
    ctx.bezierCurveTo(-2, 122, -1, 100, 0, 82);
    ctx.closePath(); ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(29, 82);
    ctx.bezierCurveTo(33, 100, 32, 122, 26, 140);
    ctx.bezierCurveTo(20, 146, 8, 146, 6, 140);
    ctx.bezierCurveTo(2, 122, 1, 100, 0, 82);
    ctx.closePath(); ctx.fill();
    // Crease lines
    ctx.strokeStyle = 'rgba(80,80,90,0.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-15, 84); ctx.lineTo(-13, 138); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, 84); ctx.lineTo(13, 138); ctx.stroke();

    // ── Shoes (brown leather)
    const shG = ctx.createLinearGradient(-38, 136, 38, 150);
    shG.addColorStop(0, '#3e2510'); shG.addColorStop(1, '#1c0d05');
    ctx.fillStyle = shG;
    // Left
    ctx.beginPath();
    ctx.moveTo(-28, 138); ctx.bezierCurveTo(-36, 140, -42, 147, -37, 150);
    ctx.bezierCurveTo(-27, 153, -8, 153, -4, 149);
    ctx.bezierCurveTo(-1, 146, -2, 140, -6, 138); ctx.closePath(); ctx.fill();
    // Right
    ctx.beginPath();
    ctx.moveTo(28, 138); ctx.bezierCurveTo(36, 140, 42, 147, 37, 150);
    ctx.bezierCurveTo(27, 153, 8, 153, 4, 149);
    ctx.bezierCurveTo(1, 146, 2, 140, 6, 138); ctx.closePath(); ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.ellipse(-22, 143, 10, 4, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, 143, 10, 4, -0.1, 0, Math.PI * 2); ctx.fill();

    // ────────────────────────────────
    // BODY — dark leather jacket
    // ────────────────────────────────
    const jG = ctx.createRadialGradient(-8, -8, 4, 2, 38, 70);
    jG.addColorStop(0, '#323232'); jG.addColorStop(0.5, '#1e1e1e'); jG.addColorStop(1, '#0e0e0e');
    ctx.fillStyle = jG;
    ctx.beginPath();
    ctx.moveTo(-46, -50);
    ctx.bezierCurveTo(-57, -18, -60, 32, -50, 82);
    ctx.lineTo(50, 82);
    ctx.bezierCurveTo(60, 32, 57, -18, 46, -50);
    ctx.bezierCurveTo(30, -64, -30, -64, -46, -50);
    ctx.closePath(); ctx.fill();

    // Jacket edge highlight
    ctx.strokeStyle = 'rgba(72,72,72,0.65)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-46, -50); ctx.bezierCurveTo(-57, -18, -60, 32, -50, 82); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(46, -50); ctx.bezierCurveTo(57, -18, 60, 32, 50, 82); ctx.stroke();

    // Lapels
    ctx.fillStyle = '#2c2c2c';
    ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(-17, -46); ctx.lineTo(-22, 2); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(17, -46); ctx.lineTo(22, 2); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill();
    // Shirt under lapels
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath(); ctx.moveTo(-11, -50); ctx.lineTo(11, -50); ctx.lineTo(14, 12); ctx.lineTo(-14, 12); ctx.closePath(); ctx.fill();
    // Zip dashes
    ctx.strokeStyle = 'rgba(55,55,55,0.8)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(0, 78); ctx.stroke();
    ctx.setLineDash([]);

    // Belt
    ctx.strokeStyle = 'rgba(85,55,25,0.85)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-48, 75); ctx.lineTo(48, 75); ctx.stroke();
    ctx.fillStyle = 'rgba(155,120,55,0.9)';
    ctx.fillRect(-8, 71, 16, 8);
    ctx.strokeStyle = 'rgba(200,165,75,0.7)'; ctx.lineWidth = 1;
    ctx.strokeRect(-8, 71, 16, 8);

    // Shoulders
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath(); ctx.ellipse(-50, -38, 16, 9, -0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(50, -38, 16, 9, 0.28, 0, Math.PI * 2); ctx.fill();

    // ── Arms
    const aGL = ctx.createLinearGradient(-68, 0, -44, 0);
    aGL.addColorStop(0, '#111'); aGL.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = aGL;
    ctx.beginPath(); ctx.ellipse(-58, 14, 13, 36, -0.28, 0, Math.PI * 2); ctx.fill();
    const aGR = ctx.createLinearGradient(44, 0, 68, 0);
    aGR.addColorStop(0, '#2a2a2a'); aGR.addColorStop(1, '#111');
    ctx.fillStyle = aGR;
    ctx.beginPath(); ctx.ellipse(58, 20, 13, 33, 0.2, 0, Math.PI * 2); ctx.fill();

    // ── Hands
    function hand(hx, hy) {
        ctx.fillStyle = sg(hx, hy - 4, 2, 13, '#d09060', '#b06030');
        ctx.beginPath(); ctx.ellipse(hx, hy, 11, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(130,70,35,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(hx - 8, hy - 2); ctx.lineTo(hx + 8, hy - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hx - 6, hy + 3); ctx.lineTo(hx + 6, hy + 3); ctx.stroke();
    }
    hand(-64, 46);
    hand(64, 50);

    // ── Cigarette (right hand)
    ctx.strokeStyle = '#ddd8c4'; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(66, 48); ctx.lineTo(88, 38); ctx.stroke();
    ctx.strokeStyle = '#b88050'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(66, 48); ctx.lineTo(72, 45); ctx.stroke();
    ctx.fillStyle = '#ff5500'; ctx.shadowColor = '#ff3000'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(89, 37, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(200,200,200,0.15)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(89, 34); ctx.bezierCurveTo(84, 24, 94, 14, 88, 3); ctx.stroke();

    // ── Neck
    ctx.fillStyle = sg(0, -82, 3, 15, '#c08050', '#a06030');
    ctx.beginPath();
    ctx.moveTo(-12, -68); ctx.bezierCurveTo(-13, -88, -12, -95, -9, -97);
    ctx.lineTo(9, -97); ctx.bezierCurveTo(12, -95, 13, -88, 12, -68);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, -70, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

    // ─────────────────────────────────
    // HEAD — realistic shape with grad
    // ─────────────────────────────────
    // Hair base (behind head)
    ctx.fillStyle = '#1c1208';
    ctx.beginPath(); ctx.ellipse(0, -126, 37, 33, 0, 0, Math.PI * 2); ctx.fill();

    // Skull
    ctx.fillStyle = sg(4, -130, 8, 42, '#d09060', '#9e6030');
    ctx.beginPath();
    ctx.moveTo(-34, -118);
    ctx.bezierCurveTo(-38, -143, -28, -160, 0, -161);
    ctx.bezierCurveTo(28, -160, 38, -143, 34, -118);
    ctx.bezierCurveTo(40, -103, 38, -88, 30, -78);
    ctx.bezierCurveTo(20, -68, -20, -68, -30, -78);
    ctx.bezierCurveTo(-38, -88, -40, -103, -34, -118);
    ctx.closePath(); ctx.fill();

    // Side shadow (light from upper-left)
    const fsG = ctx.createLinearGradient(-38, -130, 38, -130);
    fsG.addColorStop(0, 'rgba(0,0,0,0)');
    fsG.addColorStop(0.6, 'rgba(0,0,0,0)');
    fsG.addColorStop(1, 'rgba(0,0,0,0.30)');
    ctx.fillStyle = fsG;
    ctx.beginPath(); ctx.ellipse(0, -118, 34, 42, 0, 0, Math.PI * 2); ctx.fill();

    // ── Hair (short, dark, textured)
    ctx.fillStyle = '#1c1208';
    ctx.beginPath();
    ctx.moveTo(-34, -118);
    ctx.bezierCurveTo(-40, -146, -28, -162, 0, -163);
    ctx.bezierCurveTo(28, -162, 40, -146, 34, -118);
    ctx.bezierCurveTo(28, -126, -28, -126, -34, -118);
    ctx.closePath(); ctx.fill();
    // Hair strands
    ctx.strokeStyle = 'rgba(56,36,16,0.5)'; ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 9, -163 + Math.abs(i));
        ctx.bezierCurveTo(i * 9 + 2, -145, i * 9 + 1, -132, i * 8, -122);
        ctx.stroke();
    }
    // Sideburns
    ctx.fillStyle = '#201006';
    ctx.beginPath(); ctx.ellipse(-34, -108, 7, 13, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(34, -108, 7, 13, 0.15, 0, Math.PI * 2); ctx.fill();

    // ── Ear (left)
    ctx.fillStyle = sg(-38, -114, 2, 9, '#c28052', '#9a6030');
    ctx.beginPath(); ctx.ellipse(-37, -114, 8, 12, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(130,70,35,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-37, -114, 5, 0.4, Math.PI - 0.4); ctx.stroke();

    // ── Forehead lines
    ctx.strokeStyle = 'rgba(130,70,35,0.18)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-19, -140); ctx.bezierCurveTo(-9, -142, 9, -142, 19, -140); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, -134); ctx.bezierCurveTo(-8, -136, 8, -136, 16, -134); ctx.stroke();

    // ── Eyebrows (heavy, furrowed)
    function brow(bx, by, tilt) {
        ctx.save(); ctx.translate(bx, by); ctx.rotate(tilt);
        ctx.fillStyle = '#1c1208';
        ctx.beginPath(); ctx.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    brow(-14, -131, -0.20);
    brow(14, -131, 0.20);

    // ── Eyes (full detail)
    function eye(ex, ey, droop) {
        // White
        ctx.fillStyle = '#ededf2';
        ctx.beginPath(); ctx.ellipse(ex, ey, 10, 6.5, 0, 0, Math.PI * 2); ctx.fill();
        // Iris (hazel)
        const iG = ctx.createRadialGradient(ex - 1, ey - 1, 0, ex, ey, 5.5);
        iG.addColorStop(0, '#8a5818'); iG.addColorStop(0.6, '#5a3308'); iG.addColorStop(1, '#281808');
        ctx.fillStyle = iG; ctx.beginPath(); ctx.arc(ex, ey, 5.5, 0, Math.PI * 2); ctx.fill();
        // Pupil
        ctx.fillStyle = '#0c0806'; ctx.beginPath(); ctx.arc(ex, ey, 2.8, 0, Math.PI * 2); ctx.fill();
        // Catchlight
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.beginPath(); ctx.arc(ex - 2, ey - 2, 1.7, 0, Math.PI * 2); ctx.fill();
        // Upper eyelid skin
        ctx.fillStyle = '#906040';
        ctx.beginPath(); ctx.ellipse(ex, ey - 4 + droop, 10, 4, 0, 0, Math.PI, true); ctx.fill();
        // Lower bag / shadow
        ctx.fillStyle = 'rgba(130,70,35,0.20)';
        ctx.beginPath(); ctx.ellipse(ex, ey + 4, 10, 3, 0, 0, Math.PI); ctx.fill();
        // Lash line
        ctx.strokeStyle = '#180c04'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(ex, ey - 1, 9.5, Math.PI + 0.4, -0.4); ctx.stroke();
    }
    eye(-13, -119, 1.1);
    eye(13, -119, 1.9); // droopier on right = wry

    // ── Nose
    ctx.strokeStyle = 'rgba(130,70,35,0.28)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-3, -129); ctx.bezierCurveTo(-4, -119, -5, -111, -5, -106); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -129); ctx.bezierCurveTo(4, -119, 5, -111, 5, -106); ctx.stroke();
    ctx.fillStyle = sg(0, -106, 2, 9, '#be7045', '#9e5828');
    ctx.beginPath(); ctx.ellipse(0, -106, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
    // Nostrils
    ctx.fillStyle = 'rgba(70,35,15,0.62)';
    ctx.beginPath(); ctx.ellipse(-5, -104, 3.5, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -104, 3.5, 2.5, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, -102, 9, 3, 0, 0, Math.PI); ctx.fill();

    // ── Lips
    const lG = ctx.createLinearGradient(-17, -96, 17, -88);
    lG.addColorStop(0, '#aa6858'); lG.addColorStop(0.5, '#c07868'); lG.addColorStop(1, '#aa6858');
    ctx.fillStyle = lG;
    ctx.beginPath(); ctx.moveTo(-17, -96); ctx.bezierCurveTo(-9, -92, 9, -92, 17, -96);
    ctx.bezierCurveTo(9, -87, -9, -87, -17, -96); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#946050';
    ctx.beginPath(); ctx.moveTo(-17, -96); ctx.bezierCurveTo(-8, -98.5, 8, -98.5, 17, -96);
    ctx.bezierCurveTo(6, -100, 0, -101, -6, -100);
    ctx.bezierCurveTo(-0, -100, 0, -100, 0, -100);
    ctx.bezierCurveTo(0, -100, -6, -100, -17, -96); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(75,28,18,0.70)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-17, -96); ctx.bezierCurveTo(-7, -97, 7, -97, 17, -96); ctx.stroke();
    // Corner droop (grumpy Jimmy face)
    ctx.beginPath(); ctx.moveTo(-17, -96); ctx.lineTo(-21, -92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, -96); ctx.lineTo(21, -92); ctx.stroke();

    // ── Stubble
    const stG = ctx.createRadialGradient(0, -94, 4, 0, -98, 28);
    stG.addColorStop(0, 'rgba(45,25,10,0.28)'); stG.addColorStop(1, 'rgba(45,25,10,0)');
    ctx.fillStyle = stG;
    ctx.beginPath(); ctx.ellipse(0, -93, 26, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(38,22,10,0.22)';
    for (let i = 0; i < 32; i++) {
        const sx = Math.sin(i * 83.1) * 0.88 * 24;
        const sy = -96 + Math.cos(i * 61.3) * 15;
        if (sy > -112 && sy < -78) {
            ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
        }
    }

    // ── Nasolabial folds
    ctx.strokeStyle = 'rgba(130,70,35,0.17)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-11, -109); ctx.bezierCurveTo(-17, -102, -19, -97, -21, -92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, -109); ctx.bezierCurveTo(17, -102, 19, -97, 21, -92); ctx.stroke();

    ctx.restore();
}

// ─── Pop Particles ────────────────────────────────────────────────────────
function spawnParticles(cx, cy) {
    const colors = ['#ff4444', '#ffdb4d', '#1c1c1c', '#fff', '#d09060', '#cc2222', '#44ee88'];
    particles = [];
    for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 4;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 5,
            r: Math.random() * 11 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: Math.random() * 0.012 + 0.008,
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
        p.vy += 0.38;
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
    const cy = H * 0.56; // feet roughly at H*0.72

    if (state === 'idle') {
        const bob = Math.sin(t * 2.8) * 5;
        drawDwarf(cx, cy + bob, 1);
        if (elapsed >= 5) setState('inflate');
    }

    else if (state === 'inflate') {
        inflateT = Math.min(elapsed / 3.5, 1);
        // Balloon-like: grows rounder (wider proportionally)
        const scale = 1 + inflateT * 2.4;
        ctx.save();
        ctx.translate(cx, cy);
        const stretch = 1 + inflateT * 0.45; // wider than tall = balloon
        ctx.scale(stretch, 1);
        ctx.translate(-cx, -cy);
        drawDwarf(cx, cy, scale);
        ctx.restore();

        // Reddish overlay as pressure builds
        if (inflateT > 0.55) {
            ctx.fillStyle = `rgba(255,0,0,${(inflateT - 0.55) * 0.14})`;
            ctx.fillRect(0, 0, W, H);
        }

        if (elapsed >= 3.5) {
            spawnParticles(cx, cy - 60);
            setState('pop');
        }
    }

    else if (state === 'pop') {
        // Flash
        if (elapsed < 0.12) {
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.fillRect(0, 0, W, H);
        }
        updateDrawParticles();
        if (elapsed >= 2.2) {
            setState('timer');
            const timerEl = document.getElementById('timer');
            timerEl.classList.remove('hidden');
            initCountdown();
        }
    }

    else if (state === 'timer') {
        updateDrawParticles();
    }
}

setState('idle');
loop();
