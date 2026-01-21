// fileName: ui.js

// === UI И УПРАВЛЕНИЕ ===

function updateUI() {
  document.getElementById('hunterCount').textContent = hunters.length;
  document.getElementById('runnerCount').textContent = runners.length;
  document.getElementById('collisionCount').textContent = collisionCount;
  document.getElementById('generation').textContent = generation;
  
  const secondsLeft = Math.ceil(generationTimer / 60);
  document.querySelector('#generationTimer span').textContent = `${secondsLeft}с`;
  
  // Обновляем статистику топ-5 охотников
  const topHuntersElement = document.getElementById('topHuntersInfo') || createTopHuntersElement();
  const topHuntersStatsElement = document.getElementById('topHuntersStats');
  
  if (hunters.length > 0) {
    const topHunters = [...hunters]
      .sort((a, b) => b.killCount - a.killCount)
      .slice(0, CONFIG.TOP_HUNTERS_COUNT);
    
    if (topHunters.length > 0) {
      topHuntersElement.style.display = 'block';
      
      let statsHTML = '';
      topHunters.forEach((hunter, index) => {
        const healthPercent = Math.floor((hunter.health / hunter.maxHealth) * 100);
        statsHTML += `<div>${index + 1}. ${hunter.killCount} убийств (${healthPercent}% HP)</div>`;
      });
      
      topHuntersStatsElement.innerHTML = statsHTML;
    } else {
      topHuntersElement.style.display = 'none';
    }
  } else {
    topHuntersElement.style.display = 'none';
  }
  
  // Обновляем статистику топ-5 бегунов
  const topRunnersElement = document.getElementById('topRunnersInfo');
  const topRunnerStatsElement = document.getElementById('topRunnerStats');
  
  if (runners.length > 0) {
    const topRunners = [...runners]
      .sort((a, b) => b.health - a.health)
      .slice(0, CONFIG.TOP_RUNNERS_COUNT);
    
    if (topRunners.length > 0) {
      topRunnersElement.style.display = 'block';
      
      let statsHTML = '';
      topRunners.forEach((runner, index) => {
        const healthPercent = Math.floor((runner.health / runner.maxHealth) * 100);
        statsHTML += `<div>${index + 1}. ${Math.floor(runner.health)} HP (${healthPercent}%)</div>`;
      });
      
      topRunnerStatsElement.innerHTML = statsHTML;
    } else {
      topRunnersElement.style.display = 'none';
    }
  } else {
    topRunnersElement.style.display = 'none';
  }
  
  // Обновляем информацию о системе размножения
  const breedInfoElement = document.getElementById('breedInfo');
  if (!breedInfoElement) {
    createBreedInfoElement();
  } else {
    updateBreedInfo();
  }
}

// === НОВАЯ ФУНКЦИЯ: Инициализация кнопок симуляции ===
function initSimulationControls() {
    const accSlider = document.getElementById("accSlider");
    const accValue = document.getElementById("accValue");

    if (accSlider) {
        accSlider.oninput = (e) => {
            const val = parseInt(e.target.value);
            // Обновляем значение в глобальном менеджере
            if (typeof simManager !== 'undefined') {
                simManager.timeAcceleration = val;
            }
            // Обновляем текст
            if (accValue) accValue.innerText = val + "x";
        };
    }

    // Привязка кнопок экспорта
    const btnJson = document.getElementById("btnExportJson");
    const btnCsv = document.getElementById("btnExportCsv");

    if (btnJson) {
        btnJson.onclick = () => {
            if (typeof simManager !== 'undefined') simManager.exportJSON();
        };
    }
    
    if (btnCsv) {
        btnCsv.onclick = () => {
            if (typeof simManager !== 'undefined') simManager.exportCSV();
        };
    }
}

function createTopHuntersElement() {
  const ui = document.getElementById('ui');
  const huntersElement = document.createElement('div');
  huntersElement.className = 'stat hunter-stat';
  huntersElement.id = 'topHuntersInfo';
  huntersElement.style.display = 'none';
  huntersElement.innerHTML = `
    <div>Топ-${CONFIG.TOP_HUNTERS_COUNT} охотников (убийства):</div>
    <div id="topHuntersStats"></div>
  `;
  ui.appendChild(huntersElement);
  return huntersElement;
}

function createBreedInfoElement() {
  const ui = document.getElementById('ui');
  const breedElement = document.createElement('div');
  breedElement.className = 'stat';
  breedElement.id = 'breedInfo';
  breedElement.innerHTML = `
    <div>Система размножения: <span id="breedStatus">ВКЛ</span></div>
    <div>Пары: <span id="breedPairs">${CONFIG.BREED_PAIRS_COUNT}</span></div>
    <div>Потомков/пара: <span id="childrenPerPair">${CONFIG.CHILD_PER_PAIR}</span></div>
    <div>Лимиты: Охотники ${CONFIG.MIN_HUNTERS}-${CONFIG.MAX_HUNTERS}</div>
    <div>Бегуны ${CONFIG.MIN_RUNNERS}-${CONFIG.MAX_RUNNERS}</div>
  `;
  ui.appendChild(breedElement);
}

function updateBreedInfo() {
  const breedStatus = document.getElementById('breedStatus');
  const breedPairs = document.getElementById('breedPairs');
  const childrenPerPair = document.getElementById('childrenPerPair');
  
  if (breedStatus) {
    breedStatus.textContent = CONFIG.BREED_ENABLED ? 'ВКЛ' : 'ВЫКЛ';
    breedStatus.style.color = CONFIG.BREED_ENABLED ? '#51cf66' : '#ff6b6b';
  }
  if (breedPairs) breedPairs.textContent = CONFIG.BREED_PAIRS_COUNT;
  if (childrenPerPair) childrenPerPair.textContent = CONFIG.CHILD_PER_PAIR;
}

function addAgents(type, count) {
  let averageGenes = null;
  
  if (type === 'hunter' && survivedHuntersGenes.length > 0) {
    averageGenes = calculateAverageGenes(survivedHuntersGenes, 'hunter');
  } else if (type === 'runner' && survivedRunnersGenes.length > 0) {
    averageGenes = calculateAverageGenes(survivedRunnersGenes, 'runner');
  }
  
  for (let i = 0; i < count; i++) {
    const agent = new Agent(
      Math.random() * (canvas.width - 30),
      Math.random() * (canvas.height - 30),
      type,
      averageGenes
    );
    
    if (type === 'hunter') {
      hunters.push(agent);
    } else {
      runners.push(agent);
    }
    allAgents.push(agent);
  }
  updateUI();
}

function togglePause() {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? 'Продолжить' : 'Пауза';
}

function resetSimulation() {
  // Сбрасываем историю симуляции при полном сбросе
  if (typeof simManager !== 'undefined') {
      simManager.history = [];
      console.log("История симуляции очищена.");
  }
  init();
}

function toggleBreeding() {
  CONFIG.BREED_ENABLED = !CONFIG.BREED_ENABLED;
  const button = document.getElementById('breedBtn');
  if (button) {
    button.textContent = CONFIG.BREED_ENABLED ? 'Выкл размножение' : 'Вкл размножение';
  }
  console.log(`Размножение ${CONFIG.BREED_ENABLED ? 'включено' : 'выключено'}`);
  updateBreedInfo();
}

// Экспорт функций
window.addAgents = addAgents;
window.togglePause = togglePause;
window.resetSimulation = resetSimulation;
window.toggleBreeding = toggleBreeding;