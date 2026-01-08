/**
 * WavePatterns - Wave Composition Definitions
 * Defines enemy types and formations for each wave
 */

import Config from '../core/Config.js';

class WavePatterns {
    /**
     * Get wave pattern for given wave number
     */
    static getWavePattern(waveNumber) {
        // Wave difficulty scales with wave number
        const baseCount = Config.WAVE_ENEMY_COUNT_BASE;
        const increment = Config.WAVE_ENEMY_COUNT_INCREMENT;
        const totalEnemies = baseCount + (waveNumber - 1) * increment;

        // Enemy type distribution changes with wave number
        let pattern;

        if (waveNumber === 1) {
            // Wave 1: All basic enemies
            pattern = this.createWave1();
        } else if (waveNumber === 2) {
            // Wave 2: Mix of basic and fast
            pattern = this.createWave2();
        } else if (waveNumber === 3) {
            // Wave 3: Introduce tanks
            pattern = this.createWave3();
        } else if (waveNumber === 4) {
            // Wave 4: Zigzag enemies appear
            pattern = this.createWave4();
        } else if (waveNumber === 5) {
            // Wave 5: Boss-like wave with many tanks
            pattern = this.createWave5();
        } else {
            // Wave 6+: Mixed composition, increasing difficulty
            pattern = this.createAdvancedWave(waveNumber, totalEnemies);
        }

        return pattern;
    }

    /**
     * Wave 1: Tutorial wave (all basic)
     */
    static createWave1() {
        return {
            enemies: [
                { type: Config.ENEMY_TYPES.BASIC, count: 5, pattern: 'straight' },
                { type: Config.ENEMY_TYPES.BOSS, count: 1, pattern: 'sineWave' },
            ],
            spawnDelay: 1000, // 1 second between spawns
            formation: 'line'
        };
    }

    /**
     * Wave 2: Introduce fast enemies
     */
    static createWave2() {
        return {
            enemies: [
                { type: Config.ENEMY_TYPES.BASIC, count: 4, pattern: 'sineWave' },
                { type: Config.ENEMY_TYPES.FAST, count: 3, pattern: 'straight' },
                { type: Config.ENEMY_TYPES.BOSS, count: 1, pattern: 'sineWave' },
            ],
            spawnDelay: 900,
            formation: 'scattered'
        };
    }

    /**
     * Wave 3: Introduce tank enemies
     */
    static createWave3() {
        return {
            enemies: [
                { type: Config.ENEMY_TYPES.BASIC, count: 5, pattern: 'zigzag' },
                { type: Config.ENEMY_TYPES.FAST, count: 3, pattern: 'sineWave' },
                { type: Config.ENEMY_TYPES.TANK, count: 1, pattern: 'straight' },
                { type: Config.ENEMY_TYPES.BOSS, count: 1, pattern: 'sineWave' },
            ],
            spawnDelay: 850,
            formation: 'mixed'
        };
    }

    /**
     * Wave 4: Introduce zigzag enemies
     */
    static createWave4() {
        return {
            enemies: [
                { type: Config.ENEMY_TYPES.BASIC, count: 4, pattern: 'randomJitter' },
                { type: Config.ENEMY_TYPES.FAST, count: 4, pattern: 'zigzag' },
                { type: Config.ENEMY_TYPES.ZIGZAG, count: 3, pattern: 'zigzag' },
                { type: Config.ENEMY_TYPES.TANK, count: 1, pattern: 'sineWave' },
                { type: Config.ENEMY_TYPES.BOSS, count: 1, pattern: 'zigzag' },
            ],
            spawnDelay: 800,
            formation: 'mixed'
        };
    }

    /**
     * Wave 5: Mini-boss wave
     */
    static createWave5() {
        return {
            enemies: [
                { type: Config.ENEMY_TYPES.BASIC, count: 6, pattern: 'sineWave' },
                { type: Config.ENEMY_TYPES.FAST, count: 4, pattern: 'zigzag' },
                { type: Config.ENEMY_TYPES.TANK, count: 3, pattern: 'straight' },
                { type: Config.ENEMY_TYPES.ZIGZAG, count: 3, pattern: 'randomJitter' },
                { type: Config.ENEMY_TYPES.BOSS, count: 1, pattern: 'sineWave' },
            ],
            spawnDelay: 750,
            formation: 'assault'
        };
    }

    /**
     * Advanced waves (6+): Procedural generation
     */
    static createAdvancedWave(waveNumber, totalEnemies) {
        // Distribution percentages based on wave number
        const basicPercent = Math.max(0.2, 0.5 - waveNumber * 0.03);
        const fastPercent = Math.min(0.4, 0.2 + waveNumber * 0.02);
        const tankPercent = Math.min(0.3, 0.1 + waveNumber * 0.02);
        const zigzagPercent = 1 - basicPercent - fastPercent - tankPercent;

        // Calculate enemy counts
        const basicCount = Math.floor(totalEnemies * basicPercent);
        const fastCount = Math.floor(totalEnemies * fastPercent);
        const tankCount = Math.floor(totalEnemies * tankPercent);
        const zigzagCount = totalEnemies - basicCount - fastCount - tankCount;

        // Random pattern selection
        const patterns = ['straight', 'sineWave', 'zigzag', 'randomJitter'];

        return {
            enemies: [
                {
                    type: Config.ENEMY_TYPES.BASIC,
                    count: basicCount,
                    pattern: patterns[Math.floor(Math.random() * patterns.length)]
                },
                {
                    type: Config.ENEMY_TYPES.FAST,
                    count: fastCount,
                    pattern: patterns[Math.floor(Math.random() * patterns.length)]
                },
                {
                    type: Config.ENEMY_TYPES.TANK,
                    count: tankCount,
                    pattern: patterns[Math.floor(Math.random() * patterns.length)]
                },
                {
                    type: Config.ENEMY_TYPES.ZIGZAG,
                    count: zigzagCount,
                    pattern: patterns[Math.floor(Math.random() * patterns.length)]
                },
                {
                    type: Config.ENEMY_TYPES.BOSS,
                    count: 1,
                    pattern: patterns[Math.floor(Math.random() * patterns.length)]
                },
            ],
            spawnDelay: Math.max(400, 1000 - waveNumber * 50), // Faster spawning
            formation: 'chaos'
        };
    }

    /**
     * Get spawn position based on formation type
     */
    static getSpawnPosition(formation, index, total) {
        const canvasWidth = Config.CANVAS_WIDTH;
        const enemyWidth = Config.ENEMY_SIZE.width;
        const margin = 50;

        switch (formation) {
            case 'line':
                // Evenly spaced across top
                const spacing = (canvasWidth - 2 * margin) / (total + 1);
                return {
                    x: margin + spacing * (index + 1) - enemyWidth / 2,
                    y: -enemyWidth
                };

            case 'scattered':
                // Random positions
                return {
                    x: margin + Math.random() * (canvasWidth - 2 * margin - enemyWidth),
                    y: -enemyWidth - Math.random() * 200
                };

            case 'mixed':
            case 'assault':
            case 'chaos':
            default:
                // Random with some variation in Y
                return {
                    x: margin + Math.random() * (canvasWidth - 2 * margin - enemyWidth),
                    y: -enemyWidth - Math.random() * 100
                };
        }
    }
}

export default WavePatterns;
