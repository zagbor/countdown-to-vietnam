document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем дату встречи - 28 февраля текущего года
    const lastYear = new Date().getFullYear()-1;
    const targetDate = new Date(currentYear, 1, 28); // 1 = февраль (месяцы 0-11)
    
    // Если 28 февраля уже прошло в этом году, устанавливаем на следующий год
    if (targetDate < new Date()) {
        targetDate.setFullYear(currentYear + 1);
    }
    
    // Элементы для отображения отсчета
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    // Дата начала отсчета (предположим, отсчет начался 1 января текущего года)
    const startDate = new Date(lastYear, 11, 21); // 0 = январь
    
    // Функция для обновления отсчета
    function updateCountdown() {
        const now = new Date();
        const timeRemaining = targetDate - now;
        
        // Если время истекло
        if (timeRemaining < 0) {
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            progressFill.style.width = '100%';
            progressFill.textContent = '100%';
            progressPercent.textContent = '100';
            
            // Изменяем заголовок, если время истекло
            document.querySelector('.countdown-title h2').textContent = 'Встреча состоялась!';
            return;
        }
        
        // Вычисляем дни, часы, минуты, секунды
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        // Обновляем элементы на странице
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Вычисляем и обновляем прогресс
        const totalDuration = targetDate - startDate;
        const elapsed = now - startDate;
        const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
        
        progressFill.style.width = `${progress}%`;
        progressFill.textContent = `${Math.round(progress)}%`;
        progressPercent.textContent = Math.round(progress);
    }
    
    // Обновляем отсчет каждую секунду
    setInterval(updateCountdown, 1000);
    
    // Инициализируем отсчет сразу
    updateCountdown();
    
    // Добавляем небольшой эффект анимации для сердечек
    const hearts = document.querySelectorAll('.fa-heart');
    hearts.forEach(heart => {
        heart.style.animation = 'heartbeat 1.5s ease-in-out infinite';
    });
    
    // Добавляем CSS для анимации сердечек
    const style = document.createElement('style');
    style.textContent = `
        @keyframes heartbeat {
            0% { transform: scale(1); }
            5% { transform: scale(1.1); }
            10% { transform: scale(1); }
            15% { transform: scale(1.2); }
            20% { transform: scale(1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});