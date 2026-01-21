// fileName: main.js

// === ОСНОВНАЯ ЛОГИКА И ИНИЦИАЛИЗАЦИЯ ===

function init() {
  initCanvas();
  
  hunters = [];
  runners = [];
  allAgents = [];
  generation = 1;
  collisionCount = 0;
  generationTimer = CONFIG.GENERATION_TIME;
  survivedHuntersGenes = [];
  survivedRunnersGenes = [];
  topRunnersHistory = [];
  topHuntersHistory = [];
  
  // Сбрасываем счетчики выживших
  CONFIG.SURVIVED_HUNTERS = 0;
  CONFIG.SURVIVED_RUNNERS = 0;
  
  console.log("=== ИНИЦИАЛИЗАЦИЯ СИМУЛЯЦИИ ЕСТЕСТВЕННОЙ ЭВОЛЮЦИИ ===");
  console.log(`Система размножения: ${CONFIG.BREED_ENABLED ? 'ВКЛЮЧЕНА' : 'ВЫКЛЮЧЕНА'}`);
  
  // Создаем начальную популяцию
  for (let i = 0; i < CONFIG.INITIAL_HUNTERS; i++) {
    const agent = new Agent(
      Math.random() * (canvas.width - 30),
      Math.random() * (canvas.height - 30),
      'hunter'
    );
    hunters.push(agent);
    allAgents.push(agent);
  }
  
  for (let i = 0; i < CONFIG.INITIAL_RUNNERS; i++) {
    const agent = new Agent(
      Math.random() * (canvas.width - 30),
      Math.random() * (canvas.height - 30),
      'runner'
    );
    runners.push(agent);
    allAgents.push(agent);
  }
  
  console.log(`Начальная популяция: ${hunters.length} охотников, ${runners.length} бегунов`);
  
  // Инициализация контролов (слайдер и экспорт)
  if (typeof initSimulationControls === 'function') {
      initSimulationControls();
  }
  
  updateUI();
}

function update() {
  if (paused) return;
  
  generationTimer--;
  
  // Отображаем прогресс поколения в консоль (реже при ускорении)
  if (generationTimer % 60 === 0 && simManager.timeAcceleration < 5) {
    const secondsLeft = Math.ceil(generationTimer / 60);
    console.log(`До смены поколения ${generation}: ${secondsLeft}с`);
  }
  
  if (generationTimer <= 0) {
    nextGeneration();
    return;
  }
  
  // Обновляем агентов
  hunters = hunters.filter(agent => agent.update(allAgents));
  runners = runners.filter(agent => agent.update(allAgents));
  allAgents = [...hunters, ...runners];
  
  // Проверяем столкновения
  checkAllCollisions();
  
  // Если осталось очень мало агентов, ускоряем смену поколения
  if (allAgents.length < 3) {
    generationTimer = Math.min(generationTimer, 60);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Рисуем всех агентов
  for (const agent of allAgents) {
    agent.draw(ctx);
  }
  
  // Отображаем информацию о размножении
  if (CONFIG.BREED_ENABLED) {
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Размножение: ВКЛ`, 10, canvas.height - 60);
    ctx.fillText(`Пары: ${CONFIG.BREED_PAIRS_COUNT}, Потомков/пара: ${CONFIG.CHILD_PER_PAIR}`, 10, canvas.height - 45);
    ctx.fillText(`Лимиты: Охотники ${CONFIG.MIN_HUNTERS}-${CONFIG.MAX_HUNTERS}`, 10, canvas.height - 30);
    ctx.fillText(`Бегуны ${CONFIG.MIN_RUNNERS}-${CONFIG.MAX_RUNNERS}`, 10, canvas.height - 15);
  }
  
  // Отображаем информацию о популяции
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '10px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Поколение: ${generation}`, canvas.width - 10, 20);
  ctx.fillText(`Ускорение: ${simManager ? simManager.timeAcceleration : 1}x`, canvas.width - 10, 35);
}

// === ОБНОВЛЕННЫЙ ИГРОВОЙ ЦИКЛ ===
function gameLoop() {
  // Получаем текущее ускорение
  const loops = (typeof simManager !== 'undefined') ? simManager.timeAcceleration : 1;

  // Выполняем логику несколько раз за один кадр
  for (let i = 0; i < loops; i++) {
     update();
     // Если во время update произошла пауза или сброс - прерываем цикл
     if (paused) break;
  }

  // Отрисовываем один раз
  draw();
  updateUI();
  
  requestAnimationFrame(gameLoop);
}

// === ОБНОВЛЕНИЕ ФУНКЦИИ СМЕНЫ ПОКОЛЕНИЯ (переопределение, если она была в evolution.js) ===
// Мы модифицируем стандартный flow, чтобы добавить сохранение статистики
const originalNextGeneration = window.nextGeneration; // Сохраняем ссылку если она уже есть

// Переопределяем функцию nextGeneration, чтобы внедрить сбор статистики
window.nextGeneration = function() {
  // 1. ЗАПИСЬ СТАТИСТИКИ (Самое важное изменение)
  if (typeof simManager !== 'undefined') {
      simManager.recordGeneration(generation, hunters, runners, collisionCount);
  }
  
  console.log(`=== ПЕРЕХОД К ПОКОЛЕНИЮ ${generation + 1} ===`);
  
  // Собираем статистику выживших (из evolution.js)
  collectSurvivorStats();
  
  const avgHunterGenes = calculateAverageGenes(survivedHuntersGenes, 'hunter');
  const avgRunnerGenes = calculateAverageGenes(survivedRunnersGenes, 'runner');
  
  // Очищаем текущие массивы
  hunters = [];
  runners = [];
  allAgents = [];
  
  // Расчет популяций (логика из evolution.js перенесена сюда для связности, или можно вызвать старую функцию если переписана логика)
  // Чтобы не дублировать код evolution.js, здесь мы используем ровно ту же логику:
  
  const targetHunters = Math.max(CONFIG.MIN_HUNTERS, Math.min(CONFIG.MAX_HUNTERS, Math.floor(CONFIG.SURVIVED_HUNTERS * CONFIG.POPULATION_GROWTH_FACTOR)));
  const targetRunners = Math.max(CONFIG.MIN_RUNNERS, Math.min(CONFIG.MAX_RUNNERS, Math.floor(CONFIG.SURVIVED_RUNNERS * CONFIG.POPULATION_GROWTH_FACTOR)));
  
  let newHunters = [];
  let newRunners = [];
  
  if (CONFIG.BREED_ENABLED) {
    newHunters.push(...breedTopAgents('hunter'));
    newRunners.push(...breedTopAgents('runner'));
  }
  
  if (newHunters.length < targetHunters) {
    const needed = targetHunters - newHunters.length;
    for (let i = 0; i < needed; i++) newHunters.push(new Agent(Math.random() * (canvas.width-30), Math.random() * (canvas.height-30), 'hunter', avgHunterGenes));
  }
  
  if (newRunners.length < targetRunners) {
    const needed = targetRunners - newRunners.length;
    for (let i = 0; i < needed; i++) newRunners.push(new Agent(Math.random() * (canvas.width-30), Math.random() * (canvas.height-30), 'runner', avgRunnerGenes));
  }
  
  // Обрезаем лишних
  hunters = newHunters.slice(0, CONFIG.MAX_HUNTERS);
  runners = newRunners.slice(0, CONFIG.MAX_RUNNERS);
  allAgents = [...hunters, ...runners];
  
  generation++;
  generationTimer = CONFIG.GENERATION_TIME;
  collisionCount = 0;
  
  showGenerationStats(avgHunterGenes, avgRunnerGenes);
}


// Инициализация и запуск
init();

// Горячие клавиши
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case ' ': 
      e.preventDefault();
      togglePause(); 
      break;
    case 'r': 
      e.preventDefault();
      resetSimulation(); 
      break;
    case 'b':
      e.preventDefault();
      toggleBreeding();
      break;
    case 'n':
      e.preventDefault();
      generationTimer = 1;
      break;
  }
});

// Запуск игрового цикла
gameLoop();