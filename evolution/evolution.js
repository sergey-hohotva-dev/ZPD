// === СИСТЕМА ЭВОЛЮЦИИ И ПОКОЛЕНИЙ ===

function collectSurvivorStats() {
  // Для охотников: отбираем ТОП-5 по количеству убийств
  const allSurvivingHunters = hunters.filter(h => h.health > 0);
  
  if (allSurvivingHunters.length > 0) {
    const sortedHunters = [...allSurvivingHunters].sort((a, b) => b.killCount - a.killCount);
    const topHunterCount = Math.min(CONFIG.TOP_HUNTERS_COUNT, sortedHunters.length);
    survivedHuntersGenes = sortedHunters.slice(0, topHunterCount).map(h => ({...h.genes}));
    
    topHuntersHistory = sortedHunters.slice(0, topHunterCount).map(h => ({
      killCount: h.killCount,
      health: h.health,
      genes: {...h.genes}
    }));
    
    console.log(`Поколение ${generation}: Отобрано ${topHunterCount} лучших охотников из ${allSurvivingHunters.length} выживших`);
  } else {
    survivedHuntersGenes = [];
    topHuntersHistory = [];
    console.log(`Поколение ${generation}: Нет выживших охотников`);
  }
  
  // Для бегунов: отбираем ТОП-5 по здоровью
  const allSurvivingRunners = runners.filter(r => r.health > 0);
  
  if (allSurvivingRunners.length > 0) {
    const sortedRunners = [...allSurvivingRunners].sort((a, b) => b.health - a.health);
    const topCount = Math.min(CONFIG.TOP_RUNNERS_COUNT, sortedRunners.length);
    survivedRunnersGenes = sortedRunners.slice(0, topCount).map(r => ({...r.genes}));
    
    topRunnersHistory = sortedRunners.slice(0, topCount).map(r => ({
      health: r.health,
      genes: {...r.genes}
    }));
    
    console.log(`Поколение ${generation}: Отобрано ${topCount} лучших бегунов из ${allSurvivingRunners.length} выживших`);
  } else {
    survivedRunnersGenes = [];
    topRunnersHistory = [];
    console.log(`Поколение ${generation}: Нет выживших бегунов`);
  }
  
  // ВАЖНО: сохраняем общее количество выживших для следующего поколения
  CONFIG.SURVIVED_HUNTERS = allSurvivingHunters.length;
  CONFIG.SURVIVED_RUNNERS = allSurvivingRunners.length;
}

function calculateAverageGenes(genesArray, type = 'runner') {
  if (genesArray.length === 0) {
    return null;
  }
  
  const result = {};
  const keys = Object.keys(genesArray[0]);
  
  for (const key of keys) {
    let sum = 0;
    for (const genes of genesArray) {
      sum += genes[key];
    }
    result[key] = sum / genesArray.length;
  }
  
  return result;
}

// Функция для создания потомков от лучших пар с правильным наследованием
function breedTopAgents(type) {
  const children = [];
  
  // Получаем топ агентов в зависимости от типа
  let topAgents = [];
  if (type === 'hunter') {
    if (survivedHuntersGenes.length === 0) return children;
    topAgents = survivedHuntersGenes.map((genes, index) => {
      const agent = new Agent(0, 0, 'hunter', null, genes);
      agent.killCount = topHuntersHistory[index]?.killCount || 0;
      return agent;
    }).sort((a, b) => b.killCount - a.killCount);
  } else {
    if (survivedRunnersGenes.length === 0) return children;
    topAgents = survivedRunnersGenes.map((genes, index) => {
      const agent = new Agent(0, 0, 'runner', null, genes);
      agent.health = topRunnersHistory[index]?.health || 100;
      return agent;
    }).sort((a, b) => b.health - a.health);
  }
  
  if (topAgents.length < 2) {
    console.log(`Недостаточно ${type} для размножения (нужно минимум 2)`);
    return children;
  }
  
  // Создаем пары из лучших агентов
  const pairsCount = Math.min(CONFIG.BREED_PAIRS_COUNT, Math.floor(topAgents.length / 2));
  
  console.log(`Создание ${pairsCount} пар для размножения ${type}...`);
  
  for (let i = 0; i < pairsCount; i++) {
    const parent1Index = i * 2;
    const parent2Index = i * 2 + 1;
    
    const parent1 = topAgents[parent1Index];
    const parent2 = topAgents[parent2Index];
    
    if (parent1 && parent2) {
      // Создаем потомков от этой пары
      for (let j = 0; j < CONFIG.CHILD_PER_PAIR; j++) {
        // Кроссовер генов: 50% от каждого родителя
        const childGenes = {};
        const geneKeys = Object.keys(parent1.genes);
        
        for (const key of geneKeys) {
          // Выбираем случайно от одного из родителей
          const baseValue = Math.random() > 0.5 ? parent1.genes[key] : parent2.genes[key];
          
          // Добавляем мутацию
          let mutatedValue = baseValue;
          if (Math.random() < CONFIG.MUTATION_RATE) {
            const mutation = (Math.random() - 0.5) * CONFIG.MUTATION_STRENGTH * 2;
            mutatedValue += mutation;
          }
          
          childGenes[key] = Math.max(0, Math.min(100, Math.round(mutatedValue)));
        }
        
        // Создаем потомка
        const child = new Agent(
          Math.random() * (canvas.width - 30),
          Math.random() * (canvas.height - 30),
          type,
          null,
          childGenes
        );
        
        children.push(child);
      }
    }
  }
  
  console.log(`Создано ${children.length} потомков ${type} от ${pairsCount} пар`);
  return children;
}

function nextGeneration() {
  console.log(`=== ПЕРЕХОД К ПОКОЛЕНИЮ ${generation + 1} ===`);
  
  // Собираем статистику выживших
  collectSurvivorStats();
  
  const avgHunterGenes = calculateAverageGenes(survivedHuntersGenes, 'hunter');
  const avgRunnerGenes = calculateAverageGenes(survivedRunnersGenes, 'runner');
  
  // Очищаем текущие массивы
  hunters = [];
  runners = [];
  allAgents = [];
  
  // РАСЧЕТ ЕСТЕСТВЕННОЙ ПОПУЛЯЦИИ:
  // Количество агентов в новом поколении зависит от выживших в предыдущем
  
  // Для охотников: если выжило мало, создаем больше, если много - оставляем больше
  const targetHunters = Math.max(
    CONFIG.MIN_HUNTERS,
    Math.min(CONFIG.MAX_HUNTERS, 
      Math.floor(CONFIG.SURVIVED_HUNTERS * CONFIG.POPULATION_GROWTH_FACTOR)
    )
  );
  
  // Для бегунов: аналогично, но с учетом баланса
  const targetRunners = Math.max(
    CONFIG.MIN_RUNNERS,
    Math.min(CONFIG.MAX_RUNNERS,
      Math.floor(CONFIG.SURVIVED_RUNNERS * CONFIG.POPULATION_GROWTH_FACTOR)
    )
  );
  
  console.log(`Целевая популяция: ${targetHunters} охотников, ${targetRunners} бегунов`);
  
  // ШАГ 1: СОЗДАЕМ ПОТОМКОВ ОТ ЛУЧШИХ ПАР (если размножение включено)
  let newHunters = [];
  let newRunners = [];
  
  if (CONFIG.BREED_ENABLED) {
    console.log("Система размножения ВКЛЮЧЕНА");
    
    // Создаем потомков охотников
    const hunterChildren = breedTopAgents('hunter');
    newHunters.push(...hunterChildren);
    
    // Создаем потомков бегунов
    const runnerChildren = breedTopAgents('runner');
    newRunners.push(...runnerChildren);
    
    console.log(`Создано потомков: ${hunterChildren.length} охотников, ${runnerChildren.length} бегунов`);
  }
  
  // ШАГ 2: ДОПОЛНЯЕМ ПОПУЛЯЦИЮ ДО ЦЕЛЕВОГО КОЛИЧЕСТВА
  // Если потомков меньше целевого количества, добавляем агентов со средними генами
  
  // Для охотников
  if (newHunters.length < targetHunters) {
    const needed = targetHunters - newHunters.length;
    for (let i = 0; i < needed; i++) {
      const agent = new Agent(
        Math.random() * (canvas.width - 30),
        Math.random() * (canvas.height - 30),
        'hunter',
        avgHunterGenes
      );
      newHunters.push(agent);
    }
    console.log(`Добавлено ${needed} охотников со средними генами`);
  }
  
  // Для бегунов
  if (newRunners.length < targetRunners) {
    const needed = targetRunners - newRunners.length;
    for (let i = 0; i < needed; i++) {
      const agent = new Agent(
        Math.random() * (canvas.width - 30),
        Math.random() * (canvas.height - 30),
        'runner',
        avgRunnerGenes
      );
      newRunners.push(agent);
    }
    console.log(`Добавлено ${needed} бегунов со средними генами`);
  }
  
  // ШАГ 3: ОГРАНИЧИВАЕМ МАКСИМАЛЬНЫЙ РАЗМЕР (на случай ошибок)
  if (newHunters.length > CONFIG.MAX_HUNTERS) {
    newHunters = newHunters.slice(0, CONFIG.MAX_HUNTERS);
  }
  
  if (newRunners.length > CONFIG.MAX_RUNNERS) {
    newRunners = newRunners.slice(0, CONFIG.MAX_RUNNERS);
  }
  
  // Устанавливаем новые популяции
  hunters = newHunters;
  runners = newRunners;
  allAgents = [...hunters, ...runners];
  
  // Обновляем поколение
  generation++;
  generationTimer = CONFIG.GENERATION_TIME;
  collisionCount = 0;
  
  console.log(`Новое поколение ${generation}:`);
  console.log(`  Охотники: ${hunters.length} (из них потомков: ${CONFIG.BREED_ENABLED ? 'да' : 'нет'})`);
  console.log(`  Бегуны: ${runners.length} (из них потомков: ${CONFIG.BREED_ENABLED ? 'да' : 'нет'})`);
  console.log(`  Всего агентов: ${allAgents.length}`);
  
  updateUI();
  showGenerationStats(avgHunterGenes, avgRunnerGenes);
}

function showGenerationStats(avgHunterGenes, avgRunnerGenes) {
  console.log(`=== СТАТИСТИКА ПОКОЛЕНИЯ ${generation} ===`);
  
  // Статистика по охотникам
  if (survivedHuntersGenes.length > 0) {
    console.log(`Выжило охотников в предыдущем поколении: ${CONFIG.SURVIVED_HUNTERS}`);
    console.log(`Отобрано лучших охотников для размножения: ${survivedHuntersGenes.length}`);
    
    if (avgHunterGenes) {
      console.log('Средние гены лучших охотников:');
      for (const [key, value] of Object.entries(avgHunterGenes)) {
        console.log(`  ${key}: ${value.toFixed(1)}`);
      }
    }
    
    if (topHuntersHistory.length > 0) {
      console.log('Лучшие охотники по убийствам:');
      topHuntersHistory.forEach((hunter, index) => {
        console.log(`  ${index + 1}. ${hunter.killCount} убийств (здоровье: ${Math.floor(hunter.health)} HP)`);
      });
    }
  } else {
    console.log('Нет выживших охотников в предыдущем поколении');
  }
  
  // Статистика по бегунам
  if (survivedRunnersGenes.length > 0) {
    console.log(`Выжило бегунов в предыдущем поколении: ${CONFIG.SURVIVED_RUNNERS}`);
    console.log(`Отобрано лучших бегунов для размножения: ${survivedRunnersGenes.length}`);
    
    if (avgRunnerGenes) {
      console.log('Средние гены лучших бегунов:');
      for (const [key, value] of Object.entries(avgRunnerGenes)) {
        console.log(`  ${key}: ${value.toFixed(1)}`);
      }
    }
    
    if (topRunnersHistory.length > 0) {
      console.log('Лучшие бегуны по здоровью:');
      topRunnersHistory.forEach((runner, index) => {
        console.log(`  ${index + 1}. ${Math.floor(runner.health)} HP`);
      });
    }
  } else {
    console.log('Нет выживших бегунов в предыдущем поколении');
  }
  
  console.log('=================================');
}