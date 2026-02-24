// Countdown to February 28
(function () {
    const now = new Date();
    let target = new Date(now.getFullYear(), 1, 28, 0, 0, 0);
    if (now >= target) target = new Date(now.getFullYear() + 1, 1, 28, 0, 0, 0);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

    function tick() {
        const diff = target - Date.now();
        dEl.textContent = pad(Math.floor(diff / 86400000));
        hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
        mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
        sEl.textContent = pad(Math.floor((diff % 60000) / 1000));
    }

    setInterval(tick, 1000);
    tick();
})();
