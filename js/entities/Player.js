/**
 * Player - Player Ship Entity
 * The player-controlled spaceship
 */

import Entity from './Entity.js';
import Config from '../core/Config.js';

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 'player');

        // Size
        this.width = Config.PLAYER_SIZE.width;
        this.height = Config.PLAYER_SIZE.height;

        // Health
        this.health = Config.PLAYER_HEALTH;
        this.maxHealth = Config.PLAYER_HEALTH;

        // Movement
        this.speed = Config.PLAYER_SPEED;
        this.isMoving = false;

        // Shooting
        this.fireRate = Config.PLAYER_FIRE_RATE;
        this.lastShotTime = 0;
        this.canShoot = true;

        // Weapon level
        this.weaponLevel = 1; // 1 = single, 2 = double, 3 = triple
        this.bulletDamage = Config.BULLET_DAMAGE;

        // Power-ups
        this.shield = false;
        this.shieldTimer = 0;
        this.rapidFire = false;
        this.rapidFireTimer = 0;
        this.bombs = 0;

        // Collision
        this.collisionLayer = 'player';
        this.collidable = true;

        // Invincibility frames (after taking damage)
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 2000; // 2 seconds

        // Visual effects
        this.blinkTimer = 0;
        this.blinkInterval = 100; // Blink every 100ms when invincible
    }

    /**
     * Update player
     */
    onUpdate(deltaTime) {
        // Update power-up timers
        this.updatePowerUpTimers(deltaTime);

        // Update invincibility
        this.updateInvincibility(deltaTime);

        // Update shooting cooldown
        this.updateShooting(deltaTime);

        // Constrain to bounds
        this.constrainToBounds();
    }

    /**
     * Render player
     */
    onRender(canvas) {
        // Blink when invincible
        if (this.invincible) {
            this.blinkTimer += 16; // Approximate frame time
            if (Math.floor(this.blinkTimer / this.blinkInterval) % 2 === 0) {
                return; // Skip rendering (blink effect)
            }
        }

        // Draw player ship
        canvas.drawPlayerShip(this.x, this.y, this.width, this.height, this.isMoving);

        // Draw shield if active
        if (this.shield) {
            this.renderShield(canvas);
        }
    }

    /**
     * Render shield effect
     */
    renderShield(canvas) {
        const center = this.getCenter();
        const radius = Math.max(this.width, this.height) / 2 + 10;

        // Pulsing shield effect
        const pulseOffset = Math.sin(this.age / 200) * 3;

        canvas.save();
        canvas.setAlpha(0.5);
        canvas.drawCircleOutline(
            center.x,
            center.y,
            radius + pulseOffset,
            '#00ffff',
            3
        );
        canvas.resetAlpha();
        canvas.restore();
    }

    /**
     * Update power-up timers
     */
    updatePowerUpTimers(deltaTime) {
        // Shield timer
        if (this.shield) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shield = false;
                this.shieldTimer = 0;
            }
        }

        // Rapid fire timer
        if (this.rapidFire) {
            this.rapidFireTimer -= deltaTime;
            if (this.rapidFireTimer <= 0) {
                this.rapidFire = false;
                this.rapidFireTimer = 0;
            }
        }
    }

    /**
     * Update invincibility
     */
    updateInvincibility(deltaTime) {
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.invincibleTimer = 0;
                this.blinkTimer = 0;
            }
        }
    }

    /**
     * Update shooting cooldown
     */
    updateShooting(deltaTime) {
        if (!this.canShoot) {
            this.lastShotTime += deltaTime;

            const effectiveFireRate = this.rapidFire
                ? this.fireRate / 2 // Double fire rate with rapid fire
                : this.fireRate;

            if (this.lastShotTime >= effectiveFireRate) {
                this.canShoot = true;
                this.lastShotTime = 0;
            }
        }
    }

    /**
     * Constrain player to screen bounds
     */
    constrainToBounds() {
        this.x = Math.max(Config.PLAYER_BOUNDS.minX,
            Math.min(Config.PLAYER_BOUNDS.maxX, this.x));
        this.y = Math.max(Config.PLAYER_BOUNDS.minY,
            Math.min(Config.PLAYER_BOUNDS.maxY, this.y));
    }

    /**
     * Attempt to shoot
     */
    shoot() {
        if (!this.canShoot) return null;

        this.canShoot = false;
        this.lastShotTime = 0;

        // Return bullet spawn data based on weapon level
        return this.getBulletSpawnData();
    }

    /**
     * Get bullet spawn data based on weapon level
     */
    getBulletSpawnData() {
        const center = this.getCenter();
        const bulletSpeed = Config.BULLET_SPEED;
        const bullets = [];

        switch (this.weaponLevel) {
            case 1: // Single shot
                bullets.push({
                    x: center.x - Config.BULLET_SIZE.width / 2,
                    y: this.y - Config.BULLET_SIZE.height,
                    velocityX: 0,
                    velocityY: -bulletSpeed
                });
                break;

            case 2: // Double shot
                bullets.push({
                    x: this.x + this.width * 0.3 - Config.BULLET_SIZE.width / 2,
                    y: this.y - Config.BULLET_SIZE.height,
                    velocityX: 0,
                    velocityY: -bulletSpeed
                });
                bullets.push({
                    x: this.x + this.width * 0.7 - Config.BULLET_SIZE.width / 2,
                    y: this.y - Config.BULLET_SIZE.height,
                    velocityX: 0,
                    velocityY: -bulletSpeed
                });
                break;

            case 3: // Triple shot (spread)
                bullets.push({
                    x: center.x - Config.BULLET_SIZE.width / 2,
                    y: this.y - Config.BULLET_SIZE.height,
                    velocityX: 0,
                    velocityY: -bulletSpeed
                });
                bullets.push({
                    x: this.x + this.width * 0.2 - Config.BULLET_SIZE.width / 2,
                    y: this.y,
                    velocityX: -50,
                    velocityY: -bulletSpeed
                });
                bullets.push({
                    x: this.x + this.width * 0.8 - Config.BULLET_SIZE.width / 2,
                    y: this.y,
                    velocityX: 50,
                    velocityY: -bulletSpeed
                });
                break;
        }

        return bullets;
    }

    /**
     * Take damage (override)
     */
    takeDamage(amount) {
        // Check shield first
        if (this.shield) {
            this.shield = false;
            this.shieldTimer = 0;
            return; // Shield absorbed the hit
        }

        // Check invincibility
        if (this.invincible) {
            return; // Can't take damage while invincible
        }

        // Take damage
        super.takeDamage(amount);

        // Activate invincibility frames
        if (this.isAlive()) {
            this.invincible = true;
            this.invincibleTimer = this.invincibleDuration;
        }
    }

    /**
     * Apply power-up
     */
    applyPowerUp(type) {
        switch (type) {
            case Config.POWERUP_TYPES.TRIPLE_SHOT:
                this.weaponLevel = Math.min(this.weaponLevel + 1, 3);
                break;

            case Config.POWERUP_TYPES.RAPID_FIRE:
                this.rapidFire = true;
                this.rapidFireTimer = Config.POWERUP_DURATION.RAPID_FIRE;
                break;

            case Config.POWERUP_TYPES.SHIELD:
                this.shield = true;
                this.shieldTimer = Config.POWERUP_DURATION.SHIELD;
                break;

            case Config.POWERUP_TYPES.BOMB:
                this.bombs = Math.min(this.bombs + 1, 3);
                break;
        }
    }

    /**
     * Use bomb (clear all enemies on screen)
     */
    useBomb() {
        if (this.bombs > 0) {
            this.bombs--;
            return true;
        }
        return false;
    }

    /**
     * Reset player (for new game)
     */
    reset(x, y) {
        super.reset(x, y);

        this.health = Config.PLAYER_HEALTH;
        this.maxHealth = Config.PLAYER_HEALTH;
        this.weaponLevel = 1;
        this.shield = false;
        this.shieldTimer = 0;
        this.rapidFire = false;
        this.rapidFireTimer = 0;
        this.bombs = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;
        this.canShoot = true;
        this.lastShotTime = 0;
    }
}

export default Player;
