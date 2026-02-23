/**
 * Train Journey Scene
 * Infinite parallax scrolling with a train, ocean, and palms.
 */

// ─── Canvas Setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let W, H;
let isMobile = false;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    isMobile = W < 768;
}
window.addEventListener('resize', resize);
resize();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const random = (min, max) => Math.random() * (max - min) + min;

// ─── State ────────────────────────────────────────────────────────────────────
let time = 0;
let scrollPos = 0; // Global scroll position for parallax
const scrollSpeed = 0.05; // Base speed

// ─── Procedural Assets ────────────────────────────────────────────────────────

// Palms
const palms = [];
function initPalms() {
    palms.length = 0;
    const count = isMobile ? 15 : 25;
    for (let i = 0; i < count; i++) {
        palms.push({
            x: Math.random() * W * 4, // Spread over large virtual space
            scale: random(0.5, 1.2),
            rotation: random(-0.1, 0.1),
            sway: random(0.2, 0.5)
        });
    }
}
initPalms();

function drawPalm(x, y, scale, time, sway) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const trunkWiggle = Math.sin(time * 0.5) * 5 * sway;
    ctx.bezierCurveTo(5, -50, trunkWiggle + 10, -100, trunkWiggle, -150);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#4a2c1a'; // Brown
    ctx.stroke();

    // Leaves
    ctx.translate(trunkWiggle, -150);
    const leafCount = 6;
    for (let i = 0; i < leafCount; i++) {
        ctx.save();
        ctx.rotate((i / leafCount) * Math.PI * 2 + Math.sin(time * 0.8 + i) * 0.1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(30, -10, 60, 20);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1e4d2b'; // Dark Green
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore();
}

// ─── Layers ──────────────────────────────────────────────────────────────────

function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a2a6c'); // Deep blue
    grad.addColorStop(0.5, '#b21f1f'); // Reddish
    grad.addColorStop(1, '#fdbb2d'); // Sunset yellow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
}

function drawOcean(time) {
    const oceanTop = H * 0.6;
    const oceanGrad = ctx.createLinearGradient(0, oceanTop, 0, H);
    oceanGrad.addColorStop(0, '#001d3d');
    oceanGrad.addColorStop(1, '#003566');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, oceanTop, W, H - oceanTop);

    // Waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = oceanTop + 30 + i * 40;
        const offset = time * (0.05 + i * 0.02) * 50;
        ctx.moveTo(0, y);
        for (let x = 0; x <= W; x += 20) {
            const dy = Math.sin(x * 0.01 + offset) * 5;
            ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
    }
}

function drawCoastline(scroll) {
    const coastY = H * 0.75;
    ctx.fillStyle = '#d4a373'; // Sand color
    ctx.beginPath();

    // Use a buffer to ensure the wave doesn't "pop" at screen edges
    const buffer = 100;
    ctx.moveTo(-buffer, H);
    for (let x = -buffer; x <= W + buffer; x += 50) {
        const dx = (x + scroll) * 0.005;
        const dy = Math.sin(dx) * 20;
        ctx.lineTo(x, coastY + dy);
    }
    ctx.lineTo(W + buffer, H);
    ctx.fill();

    // Draw palms with parallax
    const palmScroll = scroll * 0.8;
    palms.forEach(p => {
        let px = (p.x - palmScroll) % (W * 4);
        if (px < -200) px += W * 4; // Larger buffer for palms
        drawPalm(px, coastY - 10, p.scale, time, p.sway);
    });
}

function drawRails(scroll) {
    const trainY = isMobile ? H * 0.84 : H * 0.78;
    const railY = trainY + 2;
    const sleeperWidth = isMobile ? 30 : 40;
    const sleeperSpacing = isMobile ? 50 : 60;

    ctx.save();

    // Sleepers (the wooden planks)
    ctx.fillStyle = '#3d2b1f';
    // Use a larger buffer to ensure no popping
    const buffer = sleeperSpacing * 2;
    const sleeperScroll = scroll % sleeperSpacing;
    for (let x = -buffer; x <= W + buffer; x += sleeperSpacing) {
        ctx.fillRect(x - sleeperScroll, railY, sleeperWidth, 6);
    }

    // Two parallel rails - slightly offset to look like 3D or just more solid
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, railY);
    ctx.lineTo(W, railY);
    ctx.moveTo(0, railY + 3);
    ctx.lineTo(W, railY + 3);
    ctx.stroke();

    ctx.restore();
}

function drawTrain(time) {
    const trainY = isMobile ? H * 0.84 : H * 0.78; // Moved up on mobile
    const coachCount = isMobile ? 3 : 4;
    const coachW = isMobile ? W * 0.25 : W * 0.18;
    const coachH = isMobile ? 50 : 65;
    const spacing = 10;
    const totalTrainW = coachCount * coachW + (coachCount - 1) * spacing;
    const startX = (W - totalTrainW) / 2;

    // Slight vibration
    const vib = Math.sin(time * 25) * 1.2;

    for (let c = 0; c < coachCount; c++) {
        const coachX = startX + c * (coachW + spacing);
        ctx.save();
        ctx.translate(vib, vib);

        // Coach Body
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.roundRect(coachX, trainY - coachH, coachW, coachH, 8);
        ctx.fill();

        // Connector
        if (c < coachCount - 1) {
            ctx.fillStyle = '#111';
            ctx.fillRect(coachX + coachW, trainY - coachH + 20, spacing, 10);
        }

        // Windows
        const windowCount = isMobile ? 2 : 3;
        const winPadding = 12;
        const winW = (coachW - winPadding * (windowCount + 1)) / windowCount;
        const winH = coachH * 0.45;
        const winY = trainY - coachH + 12;

        for (let i = 0; i < windowCount; i++) {
            const wx = coachX + winPadding + i * (winW + winPadding);

            // Window glow
            ctx.fillStyle = 'rgba(255, 255, 200, 0.25)'; // Increased glow
            ctx.fillRect(wx, winY, winW, winH);

            // Heart Window (In second carriage, middle window)
            const middleWin = Math.floor(windowCount / 2);
            if (c === 1 && i === middleWin) {
                drawHeart(wx + winW / 2, winY + winH / 2, 8, time);
            }
        }

        // Wheels
        ctx.fillStyle = '#000';
        const wheelR = isMobile ? 6 : 8;
        ctx.beginPath();
        ctx.arc(coachX + coachW * 0.2, trainY, wheelR, 0, Math.PI * 2);
        ctx.arc(coachX + coachW * 0.8, trainY, wheelR, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawHeart(x, y, size, time) {
    const blink = (Math.sin(time * 4) + 1) / 2; // 0 to 1
    if (blink < 0.2) return; // Blinking effect

    ctx.save();
    ctx.translate(x, y);
    const scale = 0.8 + blink * 0.4; // Pulsing
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -size, -size * 1.5, -size, -size * 1.5, size / 2);
    ctx.bezierCurveTo(-size * 1.5, size * 1.5, 0, size * 2, 0, size * 2.5);
    ctx.bezierCurveTo(0, size * 2, size * 1.5, size * 1.5, size * 1.5, size / 2);
    ctx.bezierCurveTo(size * 1.5, -size, 0, -size, 0, 0);

    ctx.fillStyle = `rgba(255, 50, 50, ${blink * 0.8 + 0.2})`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'red';
    ctx.fill();
    ctx.restore();
}

// ─── Render Loop ─────────────────────────────────────────────────────────────
let lastTs = 0;
function loop(ts) {
    const dt = (ts - lastTs) * 0.001;
    lastTs = ts;
    if (dt > 0.1) { requestAnimationFrame(loop); return; } // Pause/tab switch protection

    time += dt;
    const speedMultiplier = isMobile ? 1.5 : 1.0;
    scrollPos += scrollSpeed * W * dt * 10 * speedMultiplier;

    ctx.clearRect(0, 0, W, H);

    drawSky();
    drawOcean(time);
    drawCoastline(scrollPos);
    drawRails(scrollPos);
    drawTrain(time);

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function initCountdown() {
    const now = new Date();
    // Target is February 28
    let target = new Date(now.getFullYear(), 1, 28, 0, 0, 0);
    if (now >= target) target = new Date(now.getFullYear() + 1, 1, 28, 0, 0, 0);

    function update() {
        const diff = target - new Date();
        const d = Math.max(0, Math.floor(diff / 86400000));
        const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
        const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
        const s = Math.max(0, Math.floor((diff % 60000) / 1000));

        document.getElementById('days').textContent = String(d).padStart(2, '0');
        document.getElementById('hours').textContent = String(h).padStart(2, '0');
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }
    setInterval(update, 1000);
    update();
}

initCountdown();
