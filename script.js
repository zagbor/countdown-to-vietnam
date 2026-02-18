document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initEnergyParticles();
});

// --- Countdown Logic ---
function initCountdown() {
    function getTargetDates() {
        const now = new Date();
        let year = now.getFullYear();
        let target = new Date(year, 1, 28); // February 28th
        if (now > target) {
            target = new Date(year + 1, 1, 28);
        }
        return target;
    }

    const targetDate = getTargetDates();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function update() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.innerText = d.toString().padStart(2, '0');
        hoursEl.innerText = h.toString().padStart(2, '0');
        minutesEl.innerText = m.toString().padStart(2, '0');
        secondsEl.innerText = s.toString().padStart(2, '0');
    }

    setInterval(update, 1000);
    update();
}

// --- Interactive Energy Particles ---
function initEnergyParticles() {
    const canvas = document.getElementById('energy-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    const particleCount = 150; // Enough for visual density but performant

    // Mouse interaction
    const mouse = { x: null, y: null, active: false };

    // Colors: Deep Blue, Purple, Soft Gold
    const colors = [
        'rgba(43, 16, 85, 0.8)',   // Deep Purple
        'rgba(117, 151, 222, 0.8)', // Soft Blue
        'rgba(255, 215, 0, 0.6)',   // Gold
        'rgba(200, 100, 255, 0.5)'  // Magenta hint
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Interaction Listeners
    canvas.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    canvas.addEventListener('touchstart', e => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        mouse.active = false;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow, drifting mood
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.life = Math.random() * 100 + 100;
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // "Energy" property - increases near mouse
            this.energy = 0;
            this.maxEnergy = 5;
        }

        update() {
            this.life--;
            if (this.life <= 0) {
                this.reset();
            }

            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Mouse Interaction (Attraction/Swirl)
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 200;

                if (dist < interactionRadius) {
                    const force = (interactionRadius - dist) / interactionRadius;

                    // Gentle attraction + Swirl
                    const angle = Math.atan2(dy, dx);

                    // Move towards mouse
                    this.vx += Math.cos(angle) * force * 0.05;
                    this.vy += Math.sin(angle) * force * 0.05;

                    // Swirl (tangent)
                    this.vx += -Math.sin(angle) * force * 0.05;
                    this.vy += Math.cos(angle) * force * 0.05;

                    this.energy = Math.min(this.energy + 0.1, this.maxEnergy);
                }
            }

            // Decay energy
            this.energy *= 0.95;

            // Boundaries (wrap around)
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Limit speed
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const maxSpeed = 1 + this.energy; // Faster when energized
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + this.energy, 0, Math.PI * 2);
            ctx.fillStyle = this.color;

            // Glow effect based on energy
            ctx.shadowBlur = (this.size * 2) + (this.energy * 5);
            ctx.shadowColor = this.color;

            ctx.fill();

            // Connected lines (optional, for "structure" feel)
            // Only keeping circles for "particles" feel unless requested
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        // Trail effect - fade to transparent instead of drawing color
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';

        // Reset shadow for clear command (performance)
        ctx.shadowBlur = 0;

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connecting lines for nearby particles to simulate "energy field"
        // Optimization: check fewer particles or reduce distance
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            // Check only a subset or neighbors to save CPU? 
            // Let's just do a simple distance check for now, particleCount is low (150).
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 150, 255, ${0.2 * (1 - dist / 100)})`;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}
