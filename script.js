document.addEventListener('DOMContentLoaded', function () {
    // ===== BUSINESS LOGIC (UTC+7 Vietnam Time) =====
    function getVietnamTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utc + (7 * 3600000));
    }

    const vietnamTime = getVietnamTime();
    const lastYear = vietnamTime.getFullYear() - 1;
    const currentYear = vietnamTime.getFullYear();
    const targetDate = new Date(currentYear, 1, 28); // February 28th

    if (targetDate < vietnamTime) {
        targetDate.setFullYear(currentYear + 1);
    }

    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    function updateCountdown() {
        const now = getVietnamTime();
        const timeRemaining = targetDate - now;

        if (timeRemaining < 0) {
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';

            // Celebration logic if needed
            return;
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ===== MAP INTERACTIVITY =====

    // Simple parallax effect for map decorators
    document.addEventListener('mousemove', function (e) {
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;

        const decorators = document.querySelectorAll('.decorator');
        decorators.forEach((el, index) => {
            const speed = (index + 1) * 0.5;
            el.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
        });
    });

    console.log('%c🗺️ Карта судьбы загружена! 🏰', 'font-size: 24px; color: #8b0000; font-weight: bold; background: #f4e4bc; padding: 10px; border: 2px solid #5c4033;');
});
