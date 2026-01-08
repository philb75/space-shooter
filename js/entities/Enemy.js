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
                break;

            case Config.ENEMY_TYPES.FAST:
                this.health = 1;
                this.maxHealth = 1;
                this.scoreValue = 150;
                this.speed = Config.ENEMY_SPEED_BASE * 1.5;
                break;

            case Config.ENEMY_TYPES.TANK:
                this.health = 3;
                this.maxHealth = 3;
                this.scoreValue = 300;
                this.speed = Config.ENEMY_SPEED_BASE * 0.7;
                this.width = 40;
                this.height = 40;
                break;

            case Config.ENEMY_TYPES.ZIGZAG:
                this.health = 2;
                this.maxHealth = 2;
                this.scoreValue = 200;
                this.speed = Config.ENEMY_SPEED_BASE;
                break;
        }
    }

    /**
     * Update enemy
     */
    onUpdate(deltaTime) {
        // Apply movement pattern if set
        if (this.movePattern) {
            this.movePattern(this, deltaTime);
        } else {
            // Default: move straight down
            this.velocityY = this.speed;
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

        // Draw health bar for tanks
        if (this.enemyType === Config.ENEMY_TYPES.TANK && this.health < this.maxHealth) {
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
    }
}

export default Enemy;
