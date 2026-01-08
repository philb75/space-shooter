/**
 * SpawnSystem - Wave-Based Enemy Spawning
 * Manages enemy waves, spawning, and progression
 */

import Config from '../core/Config.js';
import Enemy from '../entities/Enemy.js';
import EnemyPatterns from '../patterns/EnemyPatterns.js';
import WavePatterns from '../patterns/WavePatterns.js';

class SpawnSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;

        // Wave state
        this.currentWave = 1;
        this.waveState = 'waiting'; // 'waiting', 'spawning', 'active', 'complete'
        this.wavePattern = null;
        this.enemiesToSpawn = [];
        this.spawnTimer = 0;
        this.spawnDelay = 1000;
        this.waveCompleteTimer = 0;

        // Callbacks
        this.onWaveStart = null;
        this.onWaveComplete = null;
    }

    /**
     * Update spawn system
     */
    update(deltaTime) {
        switch (this.waveState) {
            case 'waiting':
                // Waiting to start first wave (handled externally)
                break;

            case 'spawning':
                // Spawning enemies for current wave
                this.updateSpawning(deltaTime);
                break;

            case 'active':
                // Wave is active, check if all enemies destroyed
                this.checkWaveComplete();
                break;

            case 'complete':
                // Wave complete, wait before next wave
                this.updateWaveComplete(deltaTime);
                break;
        }
    }

    /**
     * Update enemy spawning
     */
    updateSpawning(deltaTime) {
        this.spawnTimer += deltaTime;

        if (this.spawnTimer >= this.spawnDelay && this.enemiesToSpawn.length > 0) {
            this.spawnNextEnemy();
            this.spawnTimer = 0;

            // Check if all enemies spawned
            if (this.enemiesToSpawn.length === 0) {
                this.waveState = 'active';
                console.log(`Wave ${this.currentWave}: All enemies spawned, wave active`);
            }
        }
    }

    /**
     * Spawn next enemy in queue
     */
    spawnNextEnemy() {
        if (this.enemiesToSpawn.length === 0) return;

        const enemyData = this.enemiesToSpawn.shift();

        // Create enemy
        const enemy = new Enemy(enemyData.x, enemyData.y, enemyData.type);

        // Configure boss enemy with wave-scaled health
        if (enemyData.type === Config.ENEMY_TYPES.BOSS) {
            enemy.setBossWave(this.currentWave);
        }

        // Apply wave speed multiplier
        const speedMultiplier = 1 + (this.currentWave - 1) * (Config.ENEMY_SPEED_INCREMENT / 100);
        enemy.speed *= speedMultiplier;

        // Assign movement pattern
        const pattern = this.getMovementPattern(enemyData.patternName);
        enemy.setPattern(pattern);

        // Add to entity manager
        this.entityManager.addEnemy(enemy);

        console.log(`Spawned ${enemyData.type} enemy (${this.enemiesToSpawn.length} remaining)`);
    }

    /**
     * Get movement pattern by name
     */
    getMovementPattern(patternName) {
        switch (patternName) {
            case 'straight':
                return EnemyPatterns.straight();
            case 'sineWave':
                return EnemyPatterns.sineWave();
            case 'zigzag':
                return EnemyPatterns.zigzag();
            case 'circular':
                return EnemyPatterns.circular();
            case 'diveBomb':
                return EnemyPatterns.diveBomb();
            case 'randomJitter':
                return EnemyPatterns.randomJitter();
            default:
                return EnemyPatterns.straight();
        }
    }

    /**
     * Check if wave is complete (all enemies destroyed)
     */
    checkWaveComplete() {
        const enemies = this.entityManager.getEnemies();

        if (enemies.length === 0) {
            console.log(`Wave ${this.currentWave} complete!`);
            this.waveState = 'complete';
            this.waveCompleteTimer = 0;

            // Trigger callback
            if (this.onWaveComplete) {
                this.onWaveComplete(this.currentWave);
            }
        }
    }

    /**
     * Update wave complete state
     */
    updateWaveComplete(deltaTime) {
        this.waveCompleteTimer += deltaTime;

        if (this.waveCompleteTimer >= Config.WAVE_CLEAR_DELAY) {
            this.startNextWave();
        }
    }

    /**
     * Start the next wave
     */
    startNextWave() {
        this.currentWave++;
        this.startWave(this.currentWave);
    }

    /**
     * Start a specific wave
     */
    startWave(waveNumber) {
        console.log(`Starting wave ${waveNumber}...`);

        this.currentWave = waveNumber;
        this.waveState = 'spawning';
        this.spawnTimer = 0;

        // Get wave pattern
        this.wavePattern = WavePatterns.getWavePattern(waveNumber);
        this.spawnDelay = this.wavePattern.spawnDelay;

        // Build enemy spawn queue
        this.enemiesToSpawn = [];
        let enemyIndex = 0;

        this.wavePattern.enemies.forEach(enemyGroup => {
            for (let i = 0; i < enemyGroup.count; i++) {
                const position = WavePatterns.getSpawnPosition(
                    this.wavePattern.formation,
                    enemyIndex,
                    this.getTotalEnemyCount()
                );

                this.enemiesToSpawn.push({
                    type: enemyGroup.type,
                    x: position.x,
                    y: position.y,
                    patternName: enemyGroup.pattern
                });

                enemyIndex++;
            }
        });

        // Shuffle for variety
        this.shuffleArray(this.enemiesToSpawn);

        console.log(`Wave ${waveNumber}: ${this.enemiesToSpawn.length} enemies queued`);
        console.log(`Spawn delay: ${this.spawnDelay}ms`);

        // Trigger callback
        if (this.onWaveStart) {
            this.onWaveStart(waveNumber);
        }
    }

    /**
     * Get total enemy count for current wave
     */
    getTotalEnemyCount() {
        if (!this.wavePattern) return 0;

        return this.wavePattern.enemies.reduce((sum, group) => sum + group.count, 0);
    }

    /**
     * Shuffle array in place
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Get current wave number
     */
    getCurrentWave() {
        return this.currentWave;
    }

    /**
     * Get wave state
     */
    getWaveState() {
        return this.waveState;
    }

    /**
     * Get remaining enemies to spawn
     */
    getRemainingSpawns() {
        return this.enemiesToSpawn.length;
    }

    /**
     * Reset spawn system
     */
    reset() {
        this.currentWave = 1;
        this.waveState = 'waiting';
        this.wavePattern = null;
        this.enemiesToSpawn = [];
        this.spawnTimer = 0;
        this.waveCompleteTimer = 0;
    }

    /**
     * Set callback for wave start
     */
    setOnWaveStart(callback) {
        this.onWaveStart = callback;
    }

    /**
     * Set callback for wave complete
     */
    setOnWaveComplete(callback) {
        this.onWaveComplete = callback;
    }
}

export default SpawnSystem;
