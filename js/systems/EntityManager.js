/**
 * EntityManager - Entity Lifecycle Management
 * Manages all game entities (player, enemies, bullets, etc.)
 */

import Config from '../core/Config.js';
import Pool from '../utils/Pool.js';
import Bullet from '../entities/Bullet.js';

class EntityManager {
    constructor() {
        // Entity collections
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.explosions = [];
        this.floatingTexts = [];

        // Object pooling for bullets
        this.bulletPool = new Pool(Bullet, Config.BULLET_POOL_SIZE);

        // Statistics
        this.stats = {
            enemiesKilled: 0,
            bulletsFired: 0,
            powerupsCollected: 0
        };
    }

    /**
     * Set player entity
     */
    setPlayer(player) {
        this.player = player;
    }

    /**
     * Get player entity
     */
    getPlayer() {
        return this.player;
    }

    /**
     * Add enemy
     */
    addEnemy(enemy) {
        this.enemies.push(enemy);
    }

    /**
     * Add bullet (from pool)
     */
    addBullet(x, y, velocityX, velocityY, isPlayerBullet = true, damage = Config.BULLET_DAMAGE) {
        const bullet = this.bulletPool.get(x, y, velocityX, velocityY, isPlayerBullet, damage);
        this.bullets.push(bullet);
        this.stats.bulletsFired++;
        return bullet;
    }

    /**
     * Add power-up
     */
    addPowerUp(powerup) {
        this.powerups.push(powerup);
    }

    /**
     * Add explosion
     */
    addExplosion(explosion) {
        this.explosions.push(explosion);
    }

    /**
     * Add floating text
     */
    addFloatingText(floatingText) {
        this.floatingTexts.push(floatingText);
    }

    /**
     * Update all entities
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        // Update player
        if (this.player && this.player.isAlive()) {
            this.player.update(deltaTime);
        }

        // Update enemies
        this.updateEntities(this.enemies, deltaTime, canvasWidth, canvasHeight);

        // Update bullets
        this.updateEntities(this.bullets, deltaTime, canvasWidth, canvasHeight);

        // Update power-ups
        this.updateEntities(this.powerups, deltaTime, canvasWidth, canvasHeight);

        // Update explosions
        this.updateEntities(this.explosions, deltaTime, canvasWidth, canvasHeight);

        // Update floating texts
        this.updateEntities(this.floatingTexts, deltaTime, canvasWidth, canvasHeight);

        // Clean up inactive entities
        this.cleanup();
    }

    /**
     * Update entity array
     */
    updateEntities(entities, deltaTime, canvasWidth, canvasHeight) {
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];

            if (!entity.active) continue;

            entity.update(deltaTime);

            // Remove if off-screen (but NOT enemies - they should stay and bounce back)
            if (entity.type !== 'enemy' && entity.isOffScreen(canvasWidth, canvasHeight)) {
                entity.destroy();
            }
        }
    }

    /**
     * Clean up inactive entities
     */
    cleanup() {
        // Clean enemies
        this.enemies = this.enemies.filter(e => e.active);

        // Clean bullets (return to pool)
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.active) {
                this.bulletPool.release(bullet);
                this.bullets.splice(i, 1);
            }
        }

        // Clean power-ups
        this.powerups = this.powerups.filter(p => p.active);

        // Clean explosions
        this.explosions = this.explosions.filter(e => e.active);

        // Clean floating texts
        this.floatingTexts = this.floatingTexts.filter(t => t.active);
    }

    /**
     * Render all entities
     */
    render(canvas) {
        // Render order: back to front
        // 1. Bullets (behind everything)
        this.bullets.forEach(bullet => bullet.render(canvas));

        // 2. Power-ups
        this.powerups.forEach(powerup => powerup.render(canvas));

        // 3. Enemies
        this.enemies.forEach(enemy => enemy.render(canvas));

        // 4. Player (in front of enemies)
        if (this.player && this.player.isAlive()) {
            this.player.render(canvas);
        }

        // 5. Explosions (on top)
        this.explosions.forEach(explosion => explosion.render(canvas));

        // 6. Floating texts (very top)
        this.floatingTexts.forEach(text => text.render(canvas));
    }

    /**
     * Get all enemies
     */
    getEnemies() {
        return this.enemies.filter(e => e.active);
    }

    /**
     * Get all player bullets
     */
    getPlayerBullets() {
        return this.bullets.filter(b => b.active && b.isPlayerBullet);
    }

    /**
     * Get all enemy bullets
     */
    getEnemyBullets() {
        return this.bullets.filter(b => b.active && !b.isPlayerBullet);
    }

    /**
     * Get all power-ups
     */
    getPowerUps() {
        return this.powerups.filter(p => p.active);
    }

    /**
     * Get total entity count
     */
    getEntityCount() {
        let count = 0;
        if (this.player) count++;
        count += this.enemies.filter(e => e.active).length;
        count += this.bullets.filter(b => b.active).length;
        count += this.powerups.filter(p => p.active).length;
        count += this.explosions.filter(e => e.active).length;
        return count;
    }

    /**
     * Clear all entities (except player)
     */
    clearEnemies() {
        this.enemies.forEach(e => e.destroy());
        this.enemies = [];
    }

    /**
     * Clear all bullets
     */
    clearBullets() {
        this.bullets.forEach(b => this.bulletPool.release(b));
        this.bullets = [];
    }

    /**
     * Clear all power-ups
     */
    clearPowerUps() {
        this.powerups.forEach(p => p.destroy());
        this.powerups = [];
    }

    /**
     * Clear all explosions
     */
    clearExplosions() {
        this.explosions.forEach(e => e.destroy());
        this.explosions = [];
    }

    /**
     * Clear everything
     */
    clearAll() {
        this.player = null;
        this.clearEnemies();
        this.clearBullets();
        this.clearPowerUps();
        this.clearExplosions();

        // Reset stats
        this.stats = {
            enemiesKilled: 0,
            bulletsFired: 0,
            powerupsCollected: 0
        };
    }

    /**
     * Get statistics
     */
    getStats() {
        return { ...this.stats };
    }
}

export default EntityManager;
