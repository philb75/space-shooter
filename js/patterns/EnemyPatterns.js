/**
 * EnemyPatterns - Reusable Enemy Movement Patterns
 * Define how enemies move on screen
 */

import Config from '../core/Config.js';

class EnemyPatterns {
    /**
     * Straight down movement
     */
    static straight(speed = Config.ENEMY_SPEED_BASE) {
        return (enemy, deltaTime) => {
            enemy.velocityX = 0;
            enemy.velocityY = speed;
        };
    }

    /**
     * Sine wave movement
     */
    static sineWave(speed = Config.ENEMY_SPEED_BASE, amplitude = 80, frequency = 0.003) {
        return (enemy, deltaTime) => {
            // Initialize pattern data
            if (!enemy.patternData.sineOffset) {
                enemy.patternData.sineOffset = 0;
            }

            enemy.patternData.sineOffset += speed * deltaTime / 1000;

            // Calculate sine wave position
            const offset = Math.sin(enemy.patternData.sineOffset * frequency * Math.PI) * amplitude;

            enemy.velocityY = speed;
            enemy.x = enemy.startX + offset;
        };
    }

    /**
     * Zigzag movement
     */
    static zigzag(speed = Config.ENEMY_SPEED_BASE, width = 100, switchTime = 1000) {
        return (enemy, deltaTime) => {
            // Initialize pattern data
            if (!enemy.patternData.zigzagDirection) {
                enemy.patternData.zigzagDirection = 1;
                enemy.patternData.zigzagTimer = 0;
            }

            enemy.patternData.zigzagTimer += deltaTime;

            // Switch direction
            if (enemy.patternData.zigzagTimer >= switchTime) {
                enemy.patternData.zigzagDirection *= -1;
                enemy.patternData.zigzagTimer = 0;
            }

            enemy.velocityY = speed;
            enemy.velocityX = enemy.patternData.zigzagDirection * (speed * 0.8);
        };
    }

    /**
     * Circular movement
     */
    static circular(speed = Config.ENEMY_SPEED_BASE, radius = 60, angularSpeed = 2) {
        return (enemy, deltaTime) => {
            // Initialize pattern data
            if (enemy.patternData.angle === undefined) {
                enemy.patternData.angle = 0;
                enemy.patternData.centerY = enemy.startY;
            }

            // Update angle
            enemy.patternData.angle += angularSpeed * deltaTime / 1000;

            // Calculate circular position
            const offsetX = Math.cos(enemy.patternData.angle) * radius;
            const offsetY = Math.sin(enemy.patternData.angle) * radius;

            enemy.x = enemy.startX + offsetX;
            enemy.y = enemy.patternData.centerY + offsetY;

            // Move center downward
            enemy.patternData.centerY += speed * deltaTime / 1000;
        };
    }

    /**
     * Dive bomb towards player
     */
    static diveBomb(player, chargeTime = 1500, diveSpeed = 400) {
        return (enemy, deltaTime) => {
            // Initialize pattern data
            if (!enemy.patternData.diveState) {
                enemy.patternData.diveState = 'charging';
                enemy.patternData.diveTimer = 0;
            }

            if (enemy.patternData.diveState === 'charging') {
                // Hover while charging
                enemy.velocityX = 0;
                enemy.velocityY = Config.ENEMY_SPEED_BASE * 0.3;

                enemy.patternData.diveTimer += deltaTime;

                if (enemy.patternData.diveTimer >= chargeTime && player && player.isAlive()) {
                    // Calculate direction to player
                    const dx = player.getCenter().x - enemy.getCenter().x;
                    const dy = player.getCenter().y - enemy.getCenter().y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Set dive velocity
                    enemy.velocityX = (dx / distance) * diveSpeed;
                    enemy.velocityY = (dy / distance) * diveSpeed;

                    enemy.patternData.diveState = 'diving';
                }
            }
            // If diving, velocities are already set
        };
    }

    /**
     * Approach and retreat
     */
    static approachRetreat(speed = Config.ENEMY_SPEED_BASE, approachDistance = 200, retreatDistance = 100) {
        return (enemy, deltaTime) => {
            // Initialize pattern data
            if (!enemy.patternData.retreatState) {
                enemy.patternData.retreatState = 'approach';
            }

            const distanceTraveled = enemy.y - enemy.startY;

            if (enemy.patternData.retreatState === 'approach') {
                enemy.velocityX = 0;
                enemy.velocityY = speed;

                if (distanceTraveled >= approachDistance) {
                    enemy.patternData.retreatState = 'retreat';
                }
            } else if (enemy.patternData.retreatState === 'retreat') {
                enemy.velocityX = 0;
                enemy.velocityY = -speed * 0.5;

                if (distanceTraveled <= retreatDistance) {
                    enemy.patternData.retreatState = 'approach';
                }
            }
        };
    }

    /**
     * Diagonal sweep
     */
    static diagonalSweep(speed = Config.ENEMY_SPEED_BASE, direction = 1) {
        return (enemy, deltaTime) => {
            enemy.velocityX = direction * speed * 0.5;
            enemy.velocityY = speed;
        };
    }

    /**
     * Random jitter
     */
    static randomJitter(speed = Config.ENEMY_SPEED_BASE, jitterAmount = 30) {
        return (enemy, deltaTime) => {
            // Initialize pattern data
            if (!enemy.patternData.jitterTimer) {
                enemy.patternData.jitterTimer = 0;
                enemy.patternData.jitterX = 0;
            }

            enemy.patternData.jitterTimer += deltaTime;

            // Change jitter direction every 200ms
            if (enemy.patternData.jitterTimer >= 200) {
                enemy.patternData.jitterX = (Math.random() - 0.5) * jitterAmount * 2;
                enemy.patternData.jitterTimer = 0;
            }

            enemy.velocityX = enemy.patternData.jitterX;
            enemy.velocityY = speed;
        };
    }
}

export default EnemyPatterns;
