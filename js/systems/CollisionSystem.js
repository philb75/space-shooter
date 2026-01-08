/**
 * CollisionSystem - AABB Collision Detection
 * Handles all collision detection and resolution
 */

import Config from '../core/Config.js';

class CollisionSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;

        // Collision callbacks
        this.onEnemyDestroyed = null;
        this.onPlayerHit = null;
        this.onPowerUpCollected = null;
    }

    /**
     * Check all collisions
     */
    checkCollisions() {
        const player = this.entityManager.getPlayer();
        if (!player || !player.isAlive()) return;

        const enemies = this.entityManager.getEnemies();
        const playerBullets = this.entityManager.getPlayerBullets();
        const enemyBullets = this.entityManager.getEnemyBullets();
        const powerups = this.entityManager.getPowerUps();

        // Player bullets vs enemies
        this.checkBulletEnemyCollisions(playerBullets, enemies);

        // Enemy bullets vs player
        this.checkBulletPlayerCollisions(enemyBullets, player);

        // Player vs enemies (collision damage)
        this.checkPlayerEnemyCollisions(player, enemies);

        // Player vs powerups
        this.checkPlayerPowerupCollisions(player, powerups);
    }

    /**
     * Check player bullet vs enemy collisions
     */
    checkBulletEnemyCollisions(bullets, enemies) {
        bullets.forEach(bullet => {
            if (!bullet.active) return;

            enemies.forEach(enemy => {
                if (!enemy.active) return;

                if (this.isColliding(bullet, enemy)) {
                    // Damage enemy
                    enemy.takeDamage(bullet.damage);

                    // Destroy bullet
                    bullet.destroy();

                    // Trigger callback if enemy destroyed
                    if (!enemy.isAlive() && this.onEnemyDestroyed) {
                        this.onEnemyDestroyed(enemy);
                    }
                }
            });
        });
    }

    /**
     * Check enemy bullet vs player collisions
     */
    checkBulletPlayerCollisions(bullets, player) {
        if (!player || !player.isAlive()) return;

        bullets.forEach(bullet => {
            if (!bullet.active) return;

            if (this.isColliding(bullet, player)) {
                // Damage player
                player.takeDamage(bullet.damage);

                // Destroy bullet
                bullet.destroy();

                // Trigger callback
                if (this.onPlayerHit) {
                    this.onPlayerHit(player);
                }
            }
        });
    }

    /**
     * Check player vs enemy collisions
     */
    checkPlayerEnemyCollisions(player, enemies) {
        if (!player || !player.isAlive()) return;

        enemies.forEach(enemy => {
            if (!enemy.active) return;

            if (this.isColliding(player, enemy)) {
                // Damage both
                enemy.takeDamage(999); // Instant kill enemy on collision
                player.takeDamage(1);

                // Trigger callbacks
                if (!enemy.isAlive() && this.onEnemyDestroyed) {
                    this.onEnemyDestroyed(enemy);
                }

                if (this.onPlayerHit) {
                    this.onPlayerHit(player);
                }
            }
        });
    }

    /**
     * Check player vs powerup collisions
     */
    checkPlayerPowerupCollisions(player, powerups) {
        if (!player || !player.isAlive()) return;

        powerups.forEach(powerup => {
            if (!powerup.active) return;

            if (this.isColliding(player, powerup)) {
                // Trigger callback (will handle powerup logic)
                if (this.onPowerUpCollected) {
                    this.onPowerUpCollected(powerup, player);
                }

                // Destroy powerup
                powerup.destroy();
            }
        });
    }

    /**
     * AABB collision detection
     */
    isColliding(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();

        return !(
            bounds1.right < bounds2.left ||
            bounds1.left > bounds2.right ||
            bounds1.bottom < bounds2.top ||
            bounds1.top > bounds2.bottom
        );
    }

    /**
     * Check if point is inside entity bounds
     */
    isPointInside(x, y, entity) {
        const bounds = entity.getBounds();
        return (
            x >= bounds.left &&
            x <= bounds.right &&
            y >= bounds.top &&
            y <= bounds.bottom
        );
    }

    /**
     * Get distance between two entities
     */
    getDistance(entity1, entity2) {
        const center1 = entity1.getCenter();
        const center2 = entity2.getCenter();

        const dx = center2.x - center1.x;
        const dy = center2.y - center1.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check circular collision (alternative to AABB)
     */
    isCollidingCircular(entity1, entity2) {
        const center1 = entity1.getCenter();
        const center2 = entity2.getCenter();

        const radius1 = Math.max(entity1.width, entity1.height) / 2;
        const radius2 = Math.max(entity2.width, entity2.height) / 2;

        const distance = this.getDistance(entity1, entity2);

        return distance < (radius1 + radius2);
    }

    /**
     * Set callback for enemy destroyed
     */
    setOnEnemyDestroyed(callback) {
        this.onEnemyDestroyed = callback;
    }

    /**
     * Set callback for player hit
     */
    setOnPlayerHit(callback) {
        this.onPlayerHit = callback;
    }

    /**
     * Set callback for powerup collected
     */
    setOnPowerUpCollected(callback) {
        this.onPowerUpCollected = callback;
    }
}

export default CollisionSystem;
