// Countdown to February 28
(function () {
    const now = new Date();
    let target = new Date(now.getFullYear(), 1, 28, 0, 0, 0);
    if (now >= target) target = new Date(now.getFullYear() + 1, 1, 28, 0, 0, 0);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    const thEl = document.getElementById('total-hours');
    const tmEl = document.getElementById('total-minutes');
    const tsEl = document.getElementById('total-seconds');

    function pad(n, len = 2) {
        return String(Math.max(0, Math.floor(n))).padStart(len, '0');
    }

    function tick() {
        const diff = Math.max(0, target - Date.now());

        const totalSec = Math.floor(diff / 1000);
        const totalMin = Math.floor(diff / 60000);
        const totalHrs = Math.floor(diff / 3600000);

        // Standard breakdown
        dEl.textContent = pad(Math.floor(diff / 86400000));
        hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
        mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
        sEl.textContent = pad(Math.floor((diff % 60000) / 1000));

        // Totals
        thEl.textContent = totalHrs.toLocaleString('ru');
        tmEl.textContent = totalMin.toLocaleString('ru');
        tsEl.textContent = totalSec.toLocaleString('ru');
    }

    setInterval(tick, 1000);
    tick();
})();
