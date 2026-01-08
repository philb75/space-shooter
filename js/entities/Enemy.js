/**
 * Enemy - Enemy Ship Entity
 * Base class for all enemy types
 */

import Entity from './Entity.js';
import Config from '../core/Config.js';

class Enemy extends Entity {
    constructor(x, y, enemyType = 'basic') {
        super(x, y, 'enemy');

        // Enemy type
        this.enemyType = enemyType;

        // Size
        this.width = Config.ENEMY_SIZE.width;
        this.height = Config.ENEMY_SIZE.height;

        // Health based on type
        this.setTypeProperties(enemyType);

        // Movement
        this.speed = Config.ENEMY_SPEED_BASE;
        this.movePattern = null;
        this.patternData = {};

        // Store starting position for patterns
        this.startX = x;
        this.startY = y;

        // Collision
        this.collisionLayer = 'enemy';
        this.collidable = true;

        // Score value
        this.scoreValue = Config.SCORE_ENEMY_BASE;

        // Shooting (some enemies can shoot)
        this.canShoot = false;
        this.fireRate = 2000; // 2 seconds
        this.lastShotTime = 0;

        // Random movement system
        this.randomMoveTimer = 0;
        this.randomMoveInterval = 500 + Math.random() * 1000; // Change direction every 0.5-1.5 seconds
        this.setRandomVelocity();
    }

    /**
     * Set properties based on enemy type
     */
    setTypeProperties(type) {
        switch (type) {
            case Config.ENEMY_TYPES.BASIC:
                this.health = 1;
                this.maxHealth = 1;
                this.scoreValue = 100;
                this.speed = Config.ENEMY_SPEED_BASE;
                this.canShoot = true;
                this.fireRate = Config.ENEMY_FIRE_RATE_BASE; // 3 seconds
                break;

            case Config.ENEMY_TYPES.FAST:
                this.health = 1;
                this.maxHealth = 1;
                this.scoreValue = 150;
                this.speed = Config.ENEMY_SPEED_BASE * 1.5;
                this.canShoot = true;
                this.fireRate = Config.ENEMY_FIRE_RATE_BASE * 0.8; // 2.4 seconds (faster shooting)
                break;

            case Config.ENEMY_TYPES.TANK:
                this.health = 3;
                this.maxHealth = 3;
                this.scoreValue = 300;
                this.speed = Config.ENEMY_SPEED_BASE * 0.7;
                this.width = 40;
                this.height = 40;
                this.canShoot = true;
                this.fireRate = Config.ENEMY_FIRE_RATE_BASE * 1.2; // 3.6 seconds (slower shooting)
                break;

            case Config.ENEMY_TYPES.ZIGZAG:
                this.health = 2;
                this.maxHealth = 2;
                this.scoreValue = 200;
                this.speed = Config.ENEMY_SPEED_BASE;
                this.canShoot = true;
                this.fireRate = Config.ENEMY_FIRE_RATE_BASE * 0.9; // 2.7 seconds
                break;

            case Config.ENEMY_TYPES.BOSS:
                this.health = Config.BOSS.BASE_HEALTH;
                this.maxHealth = Config.BOSS.BASE_HEALTH;
                this.scoreValue = Config.SCORE_ENEMY_BASE * Config.BOSS.SCORE_MULTIPLIER;
                this.speed = Config.ENEMY_SPEED_BASE * 0.5; // Slower movement
                this.width = Config.ENEMY_SIZE.width * Config.BOSS.SIZE_MULTIPLIER;
                this.height = Config.ENEMY_SIZE.height * Config.BOSS.SIZE_MULTIPLIER;
                this.canShoot = true;
                this.fireRate = Config.BOSS.FIRE_RATE; // 1.5 seconds (fastest)
                break;
        }
    }

    /**
     * Set boss health based on wave number
     */
    setBossWave(waveNumber) {
        if (this.enemyType === Config.ENEMY_TYPES.BOSS) {
            const additionalHealth = (waveNumber - 1) * Config.BOSS.HEALTH_PER_WAVE;
            this.health = Config.BOSS.BASE_HEALTH + additionalHealth;
            this.maxHealth = this.health;
            this.scoreValue = Config.SCORE_ENEMY_BASE * Config.BOSS.SCORE_MULTIPLIER * waveNumber;
        }
    }

    /**
     * Scale difficulty based on wave number (for all enemies)
     */
    setWaveDifficulty(waveNumber) {
        if (waveNumber <= 1) return;

        // Decrease fire rate (shoot faster) each wave
        const fireRateReduction = (waveNumber - 1) * Config.ENEMY_FIRE_RATE_DECREMENT;
        this.fireRate = Math.max(800, this.fireRate - fireRateReduction); // Minimum 0.8 seconds between shots

        // Boss enemies get additional health scaling
        if (this.enemyType === Config.ENEMY_TYPES.BOSS) {
            this.setBossWave(waveNumber);
        }
    }

    /**
     * Set random velocity in all directions
     */
    setRandomVelocity() {
        // Random direction: up, down, left, right combinations
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
    }

    /**
     * Update enemy
     */
    onUpdate(deltaTime) {
        // Update random movement timer
        this.randomMoveTimer += deltaTime;

        // Change direction randomly at intervals
        if (this.randomMoveTimer >= this.randomMoveInterval) {
            this.randomMoveTimer = 0;
            this.randomMoveInterval = 500 + Math.random() * 1000; // Next change in 0.5-1.5 seconds
            this.setRandomVelocity();
        }

        // Check screen boundaries
        const bounds = this.getBounds();
        const canvasWidth = Config.CANVAS_WIDTH;
        const playerFloor = Config.PLAYER_START_Y - 50; // Don't go below this height (50px above player start)

        // Prevent going below player ship height
        if (bounds.bottom >= playerFloor && this.velocityY > 0) {
            this.y = playerFloor - this.height;
            this.velocityY = -Math.abs(this.velocityY); // Bounce up
            this.setRandomVelocity(); // Also change direction randomly
        }

        // Bounce at top
        if (bounds.top <= 0 && this.velocityY < 0) {
            this.y = 0;
            this.velocityY = Math.abs(this.velocityY); // Bounce down
        }

        // Bounce at sides
        if (bounds.left <= 0 && this.velocityX < 0) {
            this.x = 0;
            this.velocityX = Math.abs(this.velocityX); // Bounce right
        }
        if (bounds.right >= canvasWidth && this.velocityX > 0) {
            this.x = canvasWidth - this.width;
            this.velocityX = -Math.abs(this.velocityX); // Bounce left
        }

        // Update shooting cooldown
        if (this.canShoot) {
            this.lastShotTime += deltaTime;
        }
    }

    /**
     * Render enemy
     */
    onRender(canvas) {
        canvas.drawEnemyShip(this.x, this.y, this.width, this.height, this.enemyType);

        // Draw health bar for tanks and bosses
        if ((this.enemyType === Config.ENEMY_TYPES.TANK || this.enemyType === Config.ENEMY_TYPES.BOSS) && this.health < this.maxHealth) {
            this.renderHealthBar(canvas);
        }
    }

    /**
     * Render health bar
     */
    renderHealthBar(canvas) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;

        // Background (red)
        canvas.drawRect(barX, barY, barWidth, barHeight, '#ff0000');

        // Health (green)
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        canvas.drawRect(barX, barY, healthWidth, barHeight, '#00ff00');
    }

    /**
     * Set movement pattern
     */
    setPattern(pattern) {
        this.movePattern = pattern;
        return this;
    }

    /**
     * Attempt to shoot (for enemies that can shoot)
     */
    shoot() {
        if (!this.canShoot || this.lastShotTime < this.fireRate) {
            return null;
        }

        this.lastShotTime = 0;

        const center = this.getCenter();
        return {
            x: center.x - Config.BULLET_SIZE.width / 2,
            y: this.y + this.height,
            velocityX: 0,
            velocityY: Config.BULLET_SPEED / 2 // Slower than player bullets
        };
    }

    /**
     * Called when enemy is destroyed
     */
    onDeath() {
        // Trigger explosion
        this.onDestroy();
        super.onDeath();
    }

    /**
     * Called when enemy takes damage
     */
    onDamage(amount) {
        // Visual feedback could be added here
    }

    /**
     * Reset enemy (for object pooling)
     */
    reset(x, y, enemyType = 'basic') {
        super.reset(x, y);

        this.enemyType = enemyType;
        this.setTypeProperties(enemyType);
        this.startX = x;
        this.startY = y;
        this.movePattern = null;
        this.patternData = {};
        this.lastShotTime = 0;

        // Reset random movement
        this.randomMoveTimer = 0;
        this.randomMoveInterval = 500 + Math.random() * 1000;
        this.setRandomVelocity();
    }
}

export default Enemy;
