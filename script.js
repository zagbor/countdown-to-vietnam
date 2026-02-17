// Physics and Game Logic
const Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

// Collision Categories
const CAT_DEFAULT = 0x0001;
const CAT_FALLING = 0x0002;
const CAT_STAYING = 0x0004;


// Task Lists
const tasks = {
    serious: [
        "Постирать одежду 🧺", "Купить билеты в Ханой ✈️", "Собрать чемодан 🧳", "Проверить паспорт 🛂",
        "Купить крем от загара ☀️", "Обменять валюту 💵", "Сделать страховку 🏥", "Зарядить пауэрбанк 🔋",
        "Скачать карты оффлайн 🗺️", "Купить аптечку 💊", "Проверить визу 📄", "Купить переходник для розетки 🔌",
        "Сделать копии документов 📑", "Собрать косметичку 💄", "Купить шляпу от солнца 👒",
        "Проверить бронь отеля 🏨", "Купить спрей от комаров 🦟", "Взять купальник 👙", "Взять солнечные очки 😎",
        "Собрать лекарства 💊", "Зарядить наушники 🎧", "Оплатить счета перед отъездом 💸",
        "Полить цветы 🌸", "Вынести мусор 🗑️", "Отдать кота соседям 🐈", "Проверить рейс 🕒",
        "Заказать такси в аэропорт 🚖", "Сделать маникюр 💅", "Сделать педикюр 🦶", "Постричь челку 💇‍♀️",
        "Купить новый чемодан 🛄", "Взвесить багаж ⚖️", "Распечатать билеты 🖨️", "Взять книгу в дорогу 📖",
        "Скачать фильмы 🎬", "Взять подушку для шеи 😴", "Найти удобную обувь 👟", "Купить пляжную сумку 👜",
        "Проверить погоду во Вьетнаме 🌦️", "Взять пляжное полотенце 🏖️", "Купить подводную камеру 📷",
        "Найти купальник который стройнит 👙", "Собрать аптечку 🚑", "Купить активированный уголь 🌑"
    ],
    semi: [
        "Скинуть 10 кг за 2 дня 🏃‍♀️", "Научиться готовить омаров 🦞", "Выучить вьетнамский за ночь 🇻🇳",
        "Стать мастером массажа 💆‍♀️", "Купить 5 новых купальников 👙", "Найти идеальное платье 👗",
        "Сделать депиляцию ВСЕГО 🌵", "Научиться есть суп палочками 🍜", "Отбелить зубы до слепоты 😁",
        "Накачать попу как у Ким 🍑", "Сесть на шпагат к утру 🤸‍♀️", "Выучить Камасутру наизусть 📖",
        "Научиться танцевать танец живота 💃", "Стать гуру медитации 🧘‍♀️", "Перебрать весь гардероб 👗",
        "Купить белье, которое сводит с ума 👙", "Научиться делать идеальные стрелки 👁️",
        "Прокачать пресс до кубиков 🍫", "Записаться на курсы обольщения 💋", "Купить духи с феромонами 🧪",
        "Научиться готовить Фо Бо 🍲", "Стать сомелье за час 🍷", "Научиться открывать кокосы зубами 🥥",
        "Сделать маску из золота ✨", "Найти позу, в которой я богиня 📸", "Научиться дышать маткой 🌸",
        "Купить шелковый халат 👘", "Сделать татуаж бровей навечно 🤨", "Найти купальник с пуш-апом 300% 🍈",
        "Выучить 100 комплиментов себе 👸", "Стать мастером тайского массажа 💆", "Отрастить волосы на 20 см за ночь 💇",
        "Купить платье с разрезом до уха ✂️", "Научиться ходить на шпильках по песку 👠",
        "Стать экспертом по афродизиакам 🦪", "Найти идеальный ракурс для селфи 🤳",
        "Записаться на тверк 🍑", "Купить масло для загара с блестками ✨", "Сделать пилинг всего тела 🧼",
        "Научиться стрелять глазками 🔫", "Стать загадочной и недоступной 🕵️‍♀️", "Найти идеальную помаду 💄",
        "Выучить историю Вьетнама (вкратце) 📚", "Научиться торговаться на рынке 💰"
    ],
    absurd: [
        "Стать богиней любви 💖", "Загипнотизировать Бориса взглядом 😍", "Изучить тантру ур. 80 🧘‍♀️",
        "Купить костюм медсестры... 🚑", "Подготовить розовые наручники 🔗", "Вспомнить уроки гейши 👘",
        "Захватить власть над его сердцем ❤️", "Устроить романтический апокалипсис 🌋",
        "Быть неотразимой 24/7 (даже во сне) ✨", "Подготовить 1000 поцелуев 💋", "Свести его с ума (гарантия 100%) 🤪",
        "Стать Мисс Вселенная (срочно) 👑", "Излучать сексуальность как радиацию ☢️", "Заказать оркестр для встречи 🎻",
        "Научиться летать от счастья 🧚‍♀️", "Превратить воду в вино 🍷", "Приручить дракона 🐉",
        "Стать повелительницей стихий 🌪️", "Заказать единорога в аэропорт 🦄", "Изучить левитацию 🧘",
        "Научиться телепортироваться к нему ⚡", "Купить звезду с неба ⭐", "Стать русалочкой 🧜‍♀️",
        "Заговорить на языке любви ❤️", "Очаровать всех мужчин в радиусе 100 км 🎯", "Стать императрицей Вьетнама 👑",
        "Научиться останавливать время ⏳", "Стать магнитом для комплиментов 🧲", "Вызвать дождь из лепестков роз 🌹",
        "Научиться читать мысли Бориса 🧠", "Стать причиной глобального потепления 🔥", "Затмить солнце своей красотой ☀️",
        "Создать эликсир вечной молодости 🧪", "Придумать новую позу в сексе 🧘", "Стать музой всех поэтов мира 📝",
        "Научиться спать с открытыми глазами 👀", "Стать вкуснее, чем манго 🥭", "Победить в конкурсе мокрых маек 💦",
        "Освоить технику бесконечного оргазма 🎆", "Стать причиной цунами страсти 🌊", "Научиться готовить приворотное зелье 🍲",
        "Стать королевой джунглей 🐆", "Найти пещеру с сокровищами 💎", "Покорить Эверест на каблуках 👠",
        "Стать самой желанной женщиной галактики 🌌", "Научиться дышать под водой 🐟", "Приручить тигра 🐯",
        "Стать владычицей морской 🌊", "Сделать так, чтобы он забыл свое имя 😵", "Стать его наваждением 👻",
        "Превратиться в бабочку 🦋", "Сделать так, чтобы мир вращался вокруг меня 🌍", "Стать ярче, чем фейерверк 🎆",
        "Заставить его сердце биться чаще 💓", "Стать главной достопримечательностью Вьетнама 🏯",
        "Научиться управлять погодой ⛈️", "Стать причиной пробок в Ханое 🚗", "Заставить цветы распускаться при моем появлении 🌸",
        "Стать слаще, чем сгущенка 🍬", "Стать горячее, чем солнце ☀️", "Изучить искусство соблазнения инопланетян 👽",
        "Стать причиной бессонницы у всех мужчин 😴", "Выучить язык дельфинов 🐬", "Стать королевой танцпола 💃",
        "Заставить вулкан проснуться от страсти 🌋", "Стать причиной радуги 🌈", "Научиться исчезать в полночь 🕛",
        "Стать загадкой Сфинкса 🦁", "Освоить технику поцелуя 'Вакуум' 💋", "Стать причиной затмения луны 🌑",
        "Заставить птиц петь мое имя 🐦", "Стать воплощением греха 🍎", "Стать святой и грешной одновременно 😇😈",
        "Научиться видеть сквозь одежду 👓", "Стать причиной таяния ледников 🧊", "Заставить его носить меня на руках 💪",
        "Стать его личным наркотиком 💉", "Научиться управлять его снами 💤", "Стать причиной революции (сексуальной) 🚩",
        "Заставить звезды падать к моим ногам 🌠", "Стать восьмым чудом света 🏛️", "Научиться проходить сквозь стены 👻",
        "Стать причиной землетрясения (в кровати) 🛏️", "Освоить искусство поцелуя смерти 💀", "Стать живой легендой 📜",
        "Заставить время остановиться ⏱️", "Стать причиной его улыбки 😊", "Научиться летать на метле 🧹",
        "Стать самой счастливой на свете 😄", "Влюбить в себя весь мир 🌍", "Стать центром вселенной 🌌"
    ]
};

// State
let engine;
let runner;
let canvas;
let ctx;
let spawnInterval;
let currentStage = 'idle';
let spawnRate = 2000;
let isMobile = window.innerWidth < 768;

document.addEventListener('DOMContentLoaded', () => {
    initPhysics();
    initCountdown();
    requestAnimationFrame(renderLoop); // Start custom rendering loop

    document.getElementById('start-btn').addEventListener('click', startChaos);

    window.addEventListener('resize', handleResize);
});

function handleResize() {
    isMobile = window.innerWidth < 768;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initPhysics() {
    engine = Engine.create({
        enableSleeping: true // Optimization: stop calculating physics for resting bodies
    });
    engine.world.gravity.y = 0.75; // Reduced gravity by 25% for slower fall

    // Custom Canvas Setup
    const container = document.getElementById('canvas-container');
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Create ground
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
        isStatic: true,
        label: 'ground'
    });

    // Walls
    const wallLeft = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, label: 'wall' });
    const wallRight = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, label: 'wall' });

    Composite.add(engine.world, [ground, wallLeft, wallRight]);

    // Add mouse control
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(engine.world, mouseConstraint);

    // Start physics runner
    runner = Runner.create();
    Runner.run(runner, engine);
}

// Custom Rendering Loop
function renderLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bodies = Composite.allBodies(engine.world);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    bodies.forEach(body => {
        if (body.label === 'ground' || body.label === 'wall') return; // Don't render invisible walls

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        // Draw Task Bubbles
        if (body.customData) {
            // Calculate dimensions from bounds
            const w = body.bounds.max.x - body.bounds.min.x;
            const h = body.bounds.max.y - body.bounds.min.y;

            // Draw Shadow (Removed for performance optimization)
            // ctx.shadowColor = 'rgba(0,0,0,0.1)';
            // ctx.shadowBlur = 5;
            // ctx.shadowOffsetY = 3;

            // Draw Bubble
            ctx.fillStyle = body.customData.color || '#fff';

            // Custom Rounded Rect implementation
            const x = -w / 2;
            const y = -h / 2;
            const radius = h / 2;

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();

            ctx.fill();

            // Stroke
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reset Shadow for text
            ctx.shadowColor = 'transparent';

            // Draw Text
            ctx.fillStyle = body.customData.textColor || '#000';
            ctx.font = `bold ${body.customData.textSize}px Montserrat`;
            ctx.fillText(body.customData.text, 0, 0);
        }

        ctx.restore();
    });

    requestAnimationFrame(renderLoop);
}

function initCountdown() {
    function getTargetDates() {
        const now = new Date();
        let year = now.getFullYear();
        let target = new Date(year, 1, 28);
        if (now > target) {
            target = new Date(year + 1, 1, 28);
        }
        return target;
    }

    const targetDate = getTargetDates();

    function update() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = d.toString().padStart(2, '0');
        document.getElementById('hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
    }

    setInterval(update, 1000);
    update();
}

function startChaos() {
    const btn = document.getElementById('start-btn');
    btn.style.display = 'none';

    createUIBodies();

    currentStage = 'serious';
    spawnLoop();
}

function createUIBodies() {
    const title = document.querySelector('.main-title');
    const timer = document.getElementById('countdown-box');

    const titleRect = title.getBoundingClientRect();
    const timerRect = timer.getBoundingClientRect();

    const titleBody = Bodies.rectangle(
        titleRect.left + titleRect.width / 2,
        titleRect.top + titleRect.height / 2,
        titleRect.width,
        titleRect.height,
        {
            isStatic: true,
            label: 'title', // Custom renderer will ignore this label
            collisionFilter: { category: CAT_FALLING }
        }
    );

    const timerBody = Bodies.rectangle(
        timerRect.left + timerRect.width / 2,
        timerRect.top + timerRect.height / 2,
        timerRect.width,
        timerRect.height,
        {
            isStatic: true,
            label: 'timer',
            collisionFilter: { category: CAT_FALLING }
        }
    );

    // Sync positions
    Events.on(engine, 'afterUpdate', () => {
        if (!titleBody.isStatic) {
            const pos = titleBody.position;
            const angle = titleBody.angle;
            title.style.transform = `translate(${pos.x - titleRect.width / 2 - titleRect.left}px, ${pos.y - titleRect.height / 2 - titleRect.top}px) rotate(${angle}rad)`;
        }

        if (!timerBody.isStatic) {
            const pos = timerBody.position;
            const angle = timerBody.angle;
            timer.style.transform = `translate(${pos.x - timerRect.width / 2 - timerRect.left}px, ${pos.y - timerRect.height / 2 - timerRect.top}px) rotate(${angle}rad)`;
        }
    });

    Composite.add(engine.world, [titleBody, timerBody]);

    // Check for "Weight" (Stacked Bodies)
    Events.on(engine, 'afterUpdate', () => {
        const allBodies = Composite.allBodies(engine.world);
        // Optimization: Filter bubbles once
        const bubbles = allBodies.filter(b => b.label === 'bubble');

        const checkLoad = (targetBody) => {
            // Even if dynamic (fallen), we still check load for floor break
            if (!targetBody) return;

            const width = targetBody.bounds.max.x - targetBody.bounds.min.x;
            const left = targetBody.position.x - width / 2 - 50;
            const right = targetBody.position.x + width / 2 + 50;
            const top = targetBody.position.y;
            const scanHeight = 800; // Increased scan height for larger stacks

            // Count bodies that are:
            // 1. Physically above the target (within width)
            // 2. Close enough (scanHeight)
            // 3. Stationary (speed < 1) - meaning they have landed
            // 4. Actually bubbles
            let stackCount = 0;
            for (let body of bubbles) {
                if (body.speed < 1 &&
                    body.position.x > left &&
                    body.position.x < right &&
                    body.position.y < top &&
                    body.position.y > top - scanHeight) {
                    stackCount++;
                }
            }

            // Trigger if 10 or more bodies are piled up -> Block falls
            if (stackCount >= 10 && targetBody.isStatic) {
                Matter.Body.setStatic(targetBody, false);
            }
        };

        checkLoad(titleBody);
        checkLoad(timerBody);
    });
}

function spawnLoop() {
    if (currentStage === 'flooded') return;

    let delay = spawnRate;
    let type = 'serious';

    spawnRate *= 0.975; // Faster decay (approx 25% faster transition)
    if (spawnRate < 60) spawnRate = 60;

    if (spawnRate > 1000) { type = 'serious'; }
    else if (spawnRate > 400) { type = 'semi'; if (Math.random() > 0.7) type = 'serious'; }
    else { type = 'absurd'; if (Math.random() > 0.8) type = 'semi'; }

    if (Composite.allBodies(engine.world).length < 200) { // Optimization: Reduced limit from 350 to 200
        createTaskBubble(type);
    }

    let nextSpawn = spawnRate + (Math.random() * 200 - 100);
    if (nextSpawn < 40) nextSpawn = 40;

    spawnInterval = setTimeout(spawnLoop, nextSpawn);
}

function breakFloor() {
    if (currentStage === 'collapsed') return;
    currentStage = 'collapsed';

    // Find ground and remove it
    const bodies = Composite.allBodies(engine.world);
    const ground = bodies.find(b => b.label === 'ground');

    if (ground) {
        // Change ground mask so it only holds 'staying' objects
        ground.collisionFilter.mask = CAT_STAYING | CAT_DEFAULT;
    }

    // Unfreeze Title and Timer if they are still hanging automatically
    const titleBody = bodies.find(b => b.label === 'title'); // Note: labels might not be unique if not careful, but here they are
    const timerBody = bodies.find(b => b.label === 'timer');

    // Actually we need references or search by position/type if labels aren't unique. 
    // In our code we created them with unique labels 'title' and 'timer'? 
    // Let's check init logic. Yes: label: 'title', label: 'timer'.

    if (titleBody) Matter.Body.setStatic(titleBody, false);
    if (timerBody) Matter.Body.setStatic(timerBody, false);

    // Wake up everyone
    bodies.forEach(b => Matter.Sleeping.set(b, false));
}

// Task Deck System to prevent duplicates
const taskDeck = {
    serious: [...tasks.serious],
    semi: [...tasks.semi],
    absurd: [...tasks.absurd]
};

function getUniqueTask(type) {
    if (taskDeck[type].length === 0) {
        // Replenish deck if empty
        taskDeck[type] = [...tasks[type]];
    }

    const randomIndex = Math.floor(Math.random() * taskDeck[type].length);
    // Remove and return the item
    return taskDeck[type].splice(randomIndex, 1)[0];
}

function createTaskBubble(type) {
    const text = getUniqueTask(type);

    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = -100;

    let color, size;

    // Scale size for mobile
    const mobileScale = isMobile ? 0.7 : 1;

    if (type === 'serious') { color = '#B2DFDB'; size = 0.8 * mobileScale; }
    else if (type === 'semi') { color = '#FFCC80'; size = 1.0 * mobileScale; }
    else { color = '#F48FB1'; size = 1.2 * mobileScale; }

    // Pre-measure text for width
    if (!ctx) return; // safety
    const fontSize = 16 * size;
    ctx.font = `bold ${fontSize}px Montserrat`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    const width = textWidth + (40 * size);
    const height = 44 * size;

    const category = (type === 'serious') ? CAT_FALLING : CAT_STAYING;

    const body = Bodies.rectangle(x, y, width, height, {
        chamfer: { radius: height / 2 },
        restitution: 0.5,
        label: 'bubble',
        collisionFilter: { category: category }
    });

    body.customData = {
        text: text,
        textSize: fontSize,
        textColor: '#004D40',
        color: color
    };

    Matter.Body.setAngle(body, Math.random() * Math.PI / 8 - Math.PI / 16);
    Matter.Body.setAngularVelocity(body, Math.random() * 0.1 - 0.05);

    Composite.add(engine.world, body);

    // Trigger Floor Collapse on first "Absurd" task
    if (type === 'absurd') {
        if (!window.hasAbsurdTriggered) {
            window.hasAbsurdTriggered = true;
            // Delay break slightly to let it fall a bit? User said "after fall".
            // Let's give it 2 seconds to be visible falling.
            setTimeout(breakFloor, 2000);
        }
    }
}
