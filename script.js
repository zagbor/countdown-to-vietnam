// ─── Canvas Setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ─── Dawn progress (0 = night, 1 = full day) ─────────────────────────────────
let dawnProgress = 0;   // actual rendered value — smoothly lerped
let dawnTarget = 0;   // target set on phrase change

// ─── Phrases (one-shot, last two shown together) ──────────────────────────────
const PHRASES = [
    "Look at every path closely and deliberately.",
    "Try it as many times as you think necessary.",
    "Does this path have a heart?",
    "If it does, the path is good.",
    "If it doesn't, it is of no use.",
    "Both paths lead nowhere;",
    "but one has a heart, the other doesn't.",
    "One makes for a joyful journey;",
    "as long as you follow it, you are one with it.",
    "The other will make you curse your life.",
    // last two always shown together:
    "One makes you strong;\nthe other weakens you.",
];
const TOTAL_PHRASES = PHRASES.length;   // 11 steps

let phraseIndex = 0;
let quoteEl = document.getElementById('quote-text');
let quoteTimer = null;
let quoteDone = false;

// Sync CSS to allow white-space:pre for the final combined line
quoteEl.style.whiteSpace = 'pre-line';

function updateDawn() {
    // Only update the target; the render loop smoothly interpolates dawnProgress
    dawnTarget = Math.min(phraseIndex / (TOTAL_PHRASES - 1), 1);
}

function showNextPhrase() {
    if (quoteDone) return;

    const phrase = PHRASES[phraseIndex];
    const isLast = phraseIndex === TOTAL_PHRASES - 1;

    quoteEl.classList.remove('visible');
    setTimeout(() => {
        quoteEl.textContent = phrase;
        void quoteEl.offsetWidth;
        quoteEl.classList.add('visible');
        phraseIndex++;
        updateDawn();

        if (isLast) {
            // stop cycling — final phrase stays forever
            clearInterval(quoteTimer);
            quoteDone = true;
        }
    }, 2500);
}

function startQuoteCycle() {
    showNextPhrase();
    quoteTimer = setInterval(() => {
        if (!quoteDone) showNextPhrase();
    }, 7000);
}

// ─── Star Field ───────────────────────────────────────────────────────────────
const STARS = [];
for (let i = 0; i < 220; i++) {
    STARS.push({
        x: Math.random(),
        y: Math.random() * 0.55,
        r: Math.random() * 1.5 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 2 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
    });
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
function lerpColor(a, b, t) {
    // a,b = [r,g,b] arrays
    return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}
function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function hex(c) { return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`; }

// Night → Day palette steps
const NIGHT_TOP = [7, 4, 15];
const DAY_TOP = [135, 190, 240];
const NIGHT_MID = [20, 11, 42];
const DAY_MID = [200, 230, 255];
const NIGHT_HOR = [74, 28, 53];
const DAY_HOR = [255, 210, 140];
const NIGHT_SUN = [194, 66, 10];
const DAY_SUN = [255, 245, 180];

// ─── Sky ──────────────────────────────────────────────────────────────────────
function drawSky(t) {
    const d = dawnProgress;
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
    sky.addColorStop(0, hex(lerpColor(NIGHT_TOP, DAY_TOP, d)));
    sky.addColorStop(0.35, hex(lerpColor(NIGHT_MID, DAY_MID, d * 0.8)));
    sky.addColorStop(0.65, hex(lerpColor([42, 16, 64], [230, 245, 255], d)));
    sky.addColorStop(0.85, hex(lerpColor(NIGHT_HOR, DAY_HOR, d)));
    sky.addColorStop(1, hex(lerpColor(NIGHT_SUN, DAY_SUN, d)));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.72);
}

// ─── Stars (fade out as dawn comes) ──────────────────────────────────────────
function drawStars(t) {
    const starAlpha = Math.max(0, 1 - dawnProgress * 2);
    if (starAlpha <= 0) return;
    STARS.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        ctx.save();
        ctx.globalAlpha = s.alpha * twinkle * 0.9 * starAlpha;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// ─── Sun — rises as dawn progresses ──────────────────────────────────────────
function drawSun(t) {
    const d = dawnProgress;
    // Night: sun sits at horizon. Day: sun rises higher
    const sunX = W * 0.5;
    const sunY = H * (0.60 - d * 0.22);  // 0.60 → 0.38
    const sunR = 20 + d * 32;            // grows as it rises

    // Glow
    for (let i = 3; i >= 0; i--) {
        const glowR = sunR + 60 + i * 60;
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
        const intensity = (0.08 + d * 0.12) - i * 0.015;
        glow.addColorStop(0, `rgba(255,180,40,${Math.max(0, intensity)})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
    }

    // Core
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, '#fff7d0');
    sunGrad.addColorStop(0.4, '#ffd060');
    sunGrad.addColorStop(1, 'rgba(255,120,20,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
}

// ─── Horizon glow ─────────────────────────────────────────────────────────────
function drawHorizonGlow() {
    const hY = H * 0.62;
    const d = dawnProgress;
    const glow = ctx.createLinearGradient(0, hY - 60, 0, hY + 80);
    glow.addColorStop(0, 'rgba(220,90,20,0)');
    glow.addColorStop(0.4, `rgba(230,100,30,${0.25 + d * 0.2})`);
    glow.addColorStop(0.7, `rgba(255,180,80,${0.45 + d * 0.3})`);
    glow.addColorStop(1, 'rgba(240,130,40,0.1)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, hY - 60, W, 140);
}

// ─── Mountains (multiple ranges + peaks) ─────────────────────────────────────
function drawMountains() {
    const hY = H * 0.62;
    const d = dawnProgress;

    // Darkest mountain colour shifts to a lighter blue-grey at dawn
    function mtnColor(base, lit) {
        return hex(lerpColor(base, lit, d * 0.7));
    }

    // "Gentle" factor for mobile: reduce heights when width < 600
    const mFactor = W < 600 ? 0.65 : 1.0;

    // ── Range 0 — very far, haziest ──
    ctx.fillStyle = mtnColor([30, 12, 48], [160, 185, 210]);
    ctx.beginPath();
    ctx.moveTo(0, hY + 40);
    ctx.bezierCurveTo(W * 0.05, hY - 10 * mFactor, W * 0.12, hY - 50 * mFactor, W * 0.22, hY - 20 * mFactor);
    ctx.bezierCurveTo(W * 0.30, hY + 5 * mFactor, W * 0.38, hY - 70 * mFactor, W * 0.48, hY - 55 * mFactor);
    ctx.bezierCurveTo(W * 0.58, hY - 70 * mFactor, W * 0.65, hY + 0 * mFactor, W * 0.72, hY - 35 * mFactor);
    ctx.bezierCurveTo(W * 0.80, hY - 65 * mFactor, W * 0.90, hY - 10 * mFactor, W, hY + 30 * mFactor);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    // ── Range 1 — mid mountains, left cluster ──
    ctx.fillStyle = mtnColor([18, 8, 32], [110, 140, 175]);
    ctx.beginPath();
    ctx.moveTo(0, hY + 60);
    ctx.bezierCurveTo(W * 0.04, hY + 20 * mFactor, W * 0.10, hY - 30 * mFactor, W * 0.18, hY + 15 * mFactor);
    ctx.bezierCurveTo(W * 0.22, hY + 35 * mFactor, W * 0.27, hY - 90 * mFactor, W * 0.35, hY - 140 * mFactor);   // left peak
    ctx.bezierCurveTo(W * 0.43, hY - 90 * mFactor, W * 0.47, hY + 20 * mFactor, W * 0.50, hY + 30 * mFactor);
    ctx.lineTo(W * 0.50, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    // ── Range 2 — mid mountains, right cluster ──
    ctx.fillStyle = mtnColor([15, 6, 26], [105, 135, 170]);
    ctx.beginPath();
    ctx.moveTo(W * 0.50, hY + 30);
    ctx.bezierCurveTo(W * 0.53, hY + 20 * mFactor, W * 0.58, hY - 60 * mFactor, W * 0.66, hY - 120 * mFactor);  // right peak
    ctx.bezierCurveTo(W * 0.74, hY - 60 * mFactor, W * 0.79, hY + 20 * mFactor, W * 0.83, hY + 30 * mFactor);
    ctx.bezierCurveTo(W * 0.88, hY - 40 * mFactor, W * 0.94, hY + 15 * mFactor, W, hY + 60 * mFactor);
    ctx.lineTo(W, H); ctx.lineTo(W * 0.50, H);
    ctx.closePath(); ctx.fill();

    // ── MAIN central peak ──
    ctx.fillStyle = mtnColor([17, 8, 32], [90, 120, 160]);
    ctx.beginPath();
    ctx.moveTo(0, hY + 80);
    ctx.bezierCurveTo(W * 0.08, hY + 30, W * 0.18, hY - 30 * mFactor, W * 0.30, hY + 20 * mFactor);
    ctx.bezierCurveTo(W * 0.35, hY + 40 * mFactor, W * 0.40, hY - 110 * mFactor, W * 0.50, hY - 200 * mFactor);  // PEAK
    ctx.bezierCurveTo(W * 0.60, hY - 110 * mFactor, W * 0.65, hY + 40 * mFactor, W * 0.70, hY + 20 * mFactor);
    ctx.bezierCurveTo(W * 0.82, hY - 40 * mFactor, W * 0.92, hY + 30 * mFactor, W, hY + 80);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    // Snow on main peak
    const peakX = W * 0.5;
    const peakY = hY - 200;
    const snowAlpha = 0.5 + d * 0.3;
    const snowGrad = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, 60);
    snowGrad.addColorStop(0, `rgba(255,248,240,${snowAlpha})`);
    snowGrad.addColorStop(1, 'rgba(255,248,240,0)');
    ctx.fillStyle = snowGrad;
    ctx.beginPath();
    ctx.arc(peakX, peakY + 12, 60, 0, Math.PI * 2);
    ctx.fill();

    // Snow on left side-peak (W*0.35, hY-140)
    const lPeakX = W * 0.35, lPeakY = hY - 140 * mFactor;
    const lsnow = ctx.createRadialGradient(lPeakX, lPeakY, 0, lPeakX, lPeakY, 36);
    lsnow.addColorStop(0, `rgba(255,248,240,${snowAlpha * 0.6})`);
    lsnow.addColorStop(1, 'rgba(255,248,240,0)');
    ctx.fillStyle = lsnow;
    ctx.beginPath();
    ctx.arc(lPeakX, lPeakY + 8, 36, 0, Math.PI * 2);
    ctx.fill();

    // Snow on right side-peak (W*0.66, hY-120)
    const rPeakX = W * 0.66, rPeakY = hY - 120 * mFactor;
    const rsnow = ctx.createRadialGradient(rPeakX, rPeakY, 0, rPeakX, rPeakY, 28);
    rsnow.addColorStop(0, `rgba(255,248,240,${snowAlpha * 0.5})`);
    rsnow.addColorStop(1, 'rgba(255,248,240,0)');
    ctx.fillStyle = rsnow;
    ctx.beginPath();
    ctx.arc(rPeakX, rPeakY + 6, 28, 0, Math.PI * 2);
    ctx.fill();
}

// ─── Ground + River ───────────────────────────────────────────────────────────
function drawGround(t) {
    const d = dawnProgress;
    const hY = H * 0.62;

    // Ground
    const groundGrad = ctx.createLinearGradient(0, hY, 0, H);
    groundGrad.addColorStop(0, hex(lerpColor([10, 5, 26], [60, 80, 55], d)));
    groundGrad.addColorStop(1, hex(lerpColor([7, 4, 15], [40, 60, 40], d)));
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, hY, W, H - hY);

    // ── River (meanders across the lower third) ──
    const riverY1 = H * 0.82;
    const riverY2 = H * 0.88;
    const wave = Math.sin(t * 0.4) * W * 0.015;   // gentle shimmer

    // River body
    const riverPath = new Path2D();
    riverPath.moveTo(0, riverY1 + W * 0.05);
    riverPath.bezierCurveTo(
        W * 0.15, riverY1 - 10 + wave,
        W * 0.30, riverY2 + 15,
        W * 0.50, riverY1 + 5 + wave * 0.5
    );
    riverPath.bezierCurveTo(
        W * 0.68, riverY1 - 12 + wave,
        W * 0.82, riverY2 + 10,
        W, riverY1 + 20
    );
    riverPath.lineTo(W, riverY2 + 30);
    riverPath.bezierCurveTo(
        W * 0.80, riverY2 + 15,
        W * 0.65, riverY2 + 25,
        W * 0.50, riverY2 + 5 + wave * 0.5
    );
    riverPath.bezierCurveTo(
        W * 0.32, riverY1 + 32,
        W * 0.18, riverY2 + 20,
        0, riverY2 + 15
    );
    riverPath.closePath();

    // River fill — dark blue-grey at night, lighter teal-blue at dawn
    const rCol1 = lerpColor([8, 12, 30], [60, 120, 160], d);
    const rCol2 = lerpColor([12, 18, 45], [100, 170, 210], d);
    const riverGrad = ctx.createLinearGradient(0, riverY1, 0, riverY2 + 30);
    riverGrad.addColorStop(0, rgba(rCol2, 0.85));
    riverGrad.addColorStop(1, rgba(rCol1, 0.9));
    ctx.fillStyle = riverGrad;
    ctx.fill(riverPath);

    // River shimmer highlight
    ctx.save();
    ctx.clip(riverPath);
    const shimmerX = W * (0.2 + 0.6 * ((Math.sin(t * 0.7) + 1) / 2));
    const shimmer = ctx.createRadialGradient(shimmerX, riverY1 + 10, 0, shimmerX, riverY1 + 10, W * 0.18);
    shimmer.addColorStop(0, `rgba(255,255,255,${0.06 + d * 0.1})`);
    shimmer.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, riverY1 - 10, W, riverY2 - riverY1 + 60);
    ctx.restore();
}

// ─── Photo (blended into bg) ──────────────────────────────────────────────────
const photoImg = new Image();
photoImg.src = '1771793901832.png';

function drawPhoto() {
    if (!photoImg.complete || photoImg.naturalWidth === 0) return;

    const hY = H * 0.62;
    // Get peak height with mFactor (mFactor is calculated in drawMountains, 
    // but we need it here too. Let's make it more central or recalculate)
    const mFactor = W < 600 ? 0.65 : 1.0;
    const peakY = hY - 200 * mFactor;
    const scale = Math.min(W, H) / 700;

    // Reduce base height for larger screens to improve proportions
    const baseImgH = W > 1000 ? 140 : 210;
    const imgH = baseImgH * scale;
    const imgW = imgH * (photoImg.naturalWidth / photoImg.naturalHeight);

    const cx = W * 0.5;
    const drawX = cx - imgW / 2;
    const drawY = peakY - imgH + 55 * scale * mFactor; // match relative vertical pos

    ctx.save();

    // Draw photo
    ctx.globalAlpha = 0.95; // Increased opacity for better visibility without vignette
    ctx.drawImage(photoImg, drawX, drawY, imgW, imgH);

    ctx.restore();
}

// ─── Wind Particles ──────────────────────────────────────────────────────────
// Types: 0=leaf, 1=dust, 2=twig
const WIND_PARTICLES = [];
const WIND_COUNT = 80;

function makeParticle(fromRight) {
    const type = Math.random() < 0.35 ? 0 : Math.random() < 0.55 ? 2 : 1;
    const speed = type === 1
        ? 40 + Math.random() * 60      // dust: fast
        : 30 + Math.random() * 50;     // leaf/twig: medium
    const size = type === 0
        ? 4 + Math.random() * 8        // leaf
        : type === 2
            ? 2 + Math.random() * 5        // twig
            : 1 + Math.random() * 2.5;     // dust
    return {
        type,
        x: fromRight ? W + size * 2 : -size * 2,
        y: Math.random() * H * 0.95,
        vy: (Math.random() - 0.45) * 18,   // slight vertical drift
        speed,
        size,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 4,   // rad/s
        wobble: Math.random() * Math.PI * 2, // phase
        wobbleAmp: 8 + Math.random() * 20,
        wobbleFreq: 0.8 + Math.random() * 1.5,
        alpha: type === 1 ? 0.15 + Math.random() * 0.35 : 0.55 + Math.random() * 0.35,
        // colour palette — earthy/autumnal
        hue: type === 0
            ? [28, 38, 20, 55, 15][Math.floor(Math.random() * 5)] // ochre, brown, olive
            : type === 2
                ? 30
                : 40,
        sat: type === 0 ? 55 + Math.random() * 30
            : type === 2 ? 20 + Math.random() * 20
                : 10 + Math.random() * 15,
        lit: type === 1 ? 65 + Math.random() * 25 : 25 + Math.random() * 30,
        // length for twig
        len: type === 2 ? 6 + Math.random() * 14 : 0,
    };
}

// Seed initial particles spread across screen
for (let i = 0; i < WIND_COUNT; i++) {
    const p = makeParticle(false);
    p.x = Math.random() * W;   // start spread
    WIND_PARTICLES.push(p);
}

function drawLeaf(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(${p.hue},${p.sat}%,${p.lit}%)`;
    // Simple teardrop leaf
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.3,
        p.size * 0.9, p.size * 0.3,
        0, p.size * 0.6);
    ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.3,
        -p.size * 0.9, -p.size * 0.3,
        0, -p.size);
    ctx.fill();
    // Midrib
    ctx.strokeStyle = `hsla(${p.hue},${p.sat}%,${p.lit - 12}%,0.6)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(0, p.size * 0.6);
    ctx.stroke();
    ctx.restore();
}

function drawTwig(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = `hsl(${p.hue},${p.sat}%,${p.lit}%)`;
    ctx.lineWidth = p.size * 0.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-p.len, 0);
    ctx.lineTo(p.len, 0);
    ctx.stroke();
    ctx.restore();
}

function drawDust(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(${p.hue},${p.sat}%,${p.lit}%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function updateAndDrawWind(dt, t) {
    // Wind direction is left-to-right (positive x)
    for (let i = 0; i < WIND_PARTICLES.length; i++) {
        const p = WIND_PARTICLES[i];
        // Horizontal — main wind speed
        p.x += p.speed * dt;
        // Vertical wobble
        p.y += p.vy * dt + Math.sin(t * p.wobbleFreq + p.wobble) * p.wobbleAmp * dt;
        // Spin
        p.angle += p.spin * dt;

        // Recycle when off-screen
        if (p.x > W + 30 || p.y > H + 20 || p.y < -20) {
            Object.assign(p, makeParticle(false));
            p.x = -10;
            p.y = Math.random() * H;
        }

        if (p.type === 0) drawLeaf(p);
        else if (p.type === 2) drawTwig(p);
        else drawDust(p);
    }
}

// ─── Main Render Loop ─────────────────────────────────────────────────────────
let lastTs = 0;
function loop(ts) {
    requestAnimationFrame(loop);
    const t = ts * 0.001;
    const dt = Math.min((ts - lastTs) * 0.001, 0.05); // cap dt
    lastTs = ts;

    // Smoothly approach dawnTarget (speed: 0.4 per second → ~2.5 s per step)
    dawnProgress += (dawnTarget - dawnProgress) * Math.min(dt * 0.4, 1);

    ctx.clearRect(0, 0, W, H);
    drawSky(t);
    drawStars(t);
    drawHorizonGlow();
    drawSun(t);
    drawMountains();
    drawGround(t);
    drawPhoto();
    updateAndDrawWind(dt, t);
}
requestAnimationFrame(loop);

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function initCountdown() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 1, 28, 0, 0, 0);
    if (now >= target) target = new Date(now.getFullYear() + 1, 1, 28, 0, 0, 0);

    function update() {
        const diff = target - new Date();
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

// ─── Init ─────────────────────────────────────────────────────────────────────
initCountdown();
setTimeout(startQuoteCycle, 1500);
