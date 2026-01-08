/**
 * Bullet - Projectile Entity
 * Bullets fired by player or enemies
 */

import Entity from './Entity.js';
import Config from '../core/Config.js';

class Bullet extends Entity {
    constructor(x, y, isPlayerBullet = true) {
        super(x, y, isPlayerBullet ? 'player-bullet' : 'enemy-bullet');

        // Size
        this.width = Config.BULLET_SIZE.width;
        this.height = Config.BULLET_SIZE.height;

        // Properties
        this.isPlayerBullet = isPlayerBullet;
        this.damage = Config.BULLET_DAMAGE;

        // Collision
        this.collisionLayer = isPlayerBullet ? 'player-bullet' : 'enemy-bullet';
        this.collidable = true;

        // Visual
        this.visible = true;
    }

    /**
     * Initialize bullet (for object pooling)
     */
    init(x, y, velocityX, velocityY, isPlayerBullet = true, damage = Config.BULLET_DAMAGE) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.isPlayerBullet = isPlayerBullet;
        this.damage = damage;
        this.active = true;
        this.visible = true;
        this.age = 0;
        this.collisionLayer = isPlayerBullet ? 'player-bullet' : 'enemy-bullet';
        this.type = isPlayerBullet ? 'player-bullet' : 'enemy-bullet';
    }

    /**
     * Update bullet
     */
    onUpdate(deltaTime) {
        // Bullets don't need custom update logic
        // Position is updated by base Entity class
    }

    /**
     * Render bullet
     */
    onRender(canvas) {
        canvas.drawBullet(this.x, this.y, this.width, this.height, this.isPlayerBullet);
    }

    /**
     * Called when bullet hits something
     */
    onHit(target) {
        this.destroy();
    }

    /**
     * Reset bullet (for object pooling)
     */
    reset(x, y, velocityX, velocityY, isPlayerBullet = true) {
        this.init(x, y, velocityX, velocityY, isPlayerBullet);
    }
}

export default Bullet;
