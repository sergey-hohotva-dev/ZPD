// fileName: simulation_manager.js

class SimulationManager {
    constructor() {
        this.history = []; // История всех поколений
        this.timeAcceleration = 1; // Множитель скорости (по умолчанию 1x)
    }

    /**
     * Сохраняет статистику текущего поколения перед его сбросом
     */
    recordGeneration(generationNum, hunters, runners, collisionCount) {
        // Считаем среднее количество убийств у охотников
        const avgHunterKills = hunters.length > 0 
            ? hunters.reduce((acc, h) => acc + h.killCount, 0) / hunters.length 
            : 0;

        // Считаем среднее здоровье у бегунов
        const avgRunnerHealth = runners.length > 0
            ? runners.reduce((acc, r) => acc + r.health, 0) / runners.length
            : 0;

        // Формируем запись
        const record = {
            generation: generationNum,
            timestamp: new Date().toISOString(),
            huntersCount: hunters.length,
            runnersCount: runners.length,
            collisions: collisionCount,
            avgHunterKills: parseFloat(avgHunterKills.toFixed(2)),
            avgRunnerHealth: parseFloat(avgRunnerHealth.toFixed(2)),
            timeAcceleration: this.timeAcceleration
        };

        this.history.push(record);
        console.log(`[SimManager] Статистика поколения ${generationNum} записана.`);
        
        // Автосохранение в консоль каждые 10 поколений для отладки
        if (generationNum % 10 === 0) {
            console.log(`[SimManager] Прошло 10 поколений. Всего записей: ${this.history.length}`);
        }
    }

    /**
     * Экспорт всей истории в JSON файл
     */
    exportJSON() {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalGenerations: this.history.length,
                config: typeof CONFIG !== 'undefined' ? CONFIG : "Config not found"
            },
            history: this.history
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        this._downloadFile(blob, `evolution_data_gen${this.history.length}_${Date.now()}.json`);
    }

    /**
     * Экспорт истории в CSV (для Excel/Google Sheets)
     */
    exportCSV() {
        if (this.history.length === 0) {
            alert("Нет данных для экспорта. Подождите конца первого поколения.");
            return;
        }

        // Берем ключи из первой записи для заголовков
        const headers = Object.keys(this.history[0]);
        let csv = headers.join(',') + '\n';

        // Формируем строки
        for (const record of this.history) {
            const values = headers.map(header => {
                const val = record[header];
                // Если строка содержит запятые, оборачиваем в кавычки (на всякий случай)
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            });
            csv += values.join(',') + '\n';
        }

        const blob = new Blob([csv], {type: 'text/csv'});
        this._downloadFile(blob, `evolution_stats_gen${this.history.length}.csv`);
    }

    // Вспомогательная функция для скачивания
    _downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Создаем глобальный экземпляр, доступный во всех файлах
const simManager = new SimulationManager();