// === КОНСТАНТЫ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===

const CONFIG = {
  // Базовые параметры
  INITIAL_HUNTERS: 8,
  INITIAL_RUNNERS: 12,
  BASE_SIZE: 12,
  BASE_SPEED: 1.2,
  BASE_VISION: 50,
  VISION_ANGLE: Math.PI * 0.6,
  BREED_COOLDOWN: 180,
  BREED_DISTANCE: 40,
  MUTATION_RATE: 0.15,
  MUTATION_STRENGTH: 15,
  COLLISION_DAMAGE: 10,
  ENERGY_DECAY: 0.05,
  FRIENDLY_DAMAGE_MULTIPLIER: 0.1,
  ENEMY_DAMAGE_MULTIPLIER: 1.0,
  GENERATION_TIME: 2000, 
  EVOLUTION_STRENGTH: 0.3,
  TOP_RUNNERS_COUNT: 5,
  
  // НОВЫЕ ПАРАМЕТРЫ ДЛЯ ЕСТЕСТВЕННОЙ ЭВОЛЮЦИИ
  TOP_HUNTERS_COUNT: 5,
  BREED_ENABLED: true,               // Включить размножение
  BREED_PAIRS_COUNT: 3,              // Количество пар для размножения
  CHILD_PER_PAIR: 2,                 // Количество потомков от каждой пары
  
  // Лимиты популяции для естественной регуляции
  MIN_HUNTERS: 3,                    // Минимальное количество охотников
  MAX_HUNTERS: 25,                   // Максимальное количество охотников
  MIN_RUNNERS: 5,                    // Минимальное количество бегунов
  MAX_RUNNERS: 30,                   // Максимальное количество бегунов
  
  // Фактор роста популяции (сколько потомков от выживших)
  POPULATION_GROWTH_FACTOR: 1.5,     // На сколько увеличивается популяция
  
  // Переменные для отслеживания выживших (будут установлены в evolution.js)
  SURVIVED_HUNTERS: 0,
  SURVIVED_RUNNERS: 0
};

// Глобальные переменные
let canvas;
let ctx;
let generation = 1;
let collisionCount = 0;
let paused = false;
let hunters = [];
let runners = [];
let allAgents = [];

// Массивы для статистики поколений
let survivedHuntersGenes = [];
let survivedRunnersGenes = [];
let generationTimer = CONFIG.GENERATION_TIME;
let topRunnersHistory = [];
let topHuntersHistory = [];

// Инициализация canvas
function initCanvas() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
}