/**
 * PowerUp - Collectible Power-Up Entity
 * Various power-ups that drop from destroyed enemies
 */

import Entity from './Entity.js';
import Config from '../core/Config.js';

class PowerUp extends Entity {
    constructor(x, y, type = Config.POWERUP_TYPES.TRIPLE_SHOT) {
        super(x, y, 'powerup');

        // Power-up properties
        this.powerupType = type;
        this.width = Config.POWERUP_SIZE.width;
        this.height = Config.POWERUP_SIZE.height;
        this.velocityY = Config.POWERUP_FALL_SPEED;

        // Visual properties
        this.rotation = 0;
        this.rotationSpeed = 2; // radians per second
        this.pulseTime = 0;
        this.pulseSpeed = 3; // oscillations per second

        // Collidable
        this.collidable = true;
    }

    /**
     * Update power-up
     */
    onUpdate(deltaTime) {
        // Update rotation
        this.rotation += this.rotationSpeed * (deltaTime / 1000);

        // Update pulse animation
        this.pulseTime += this.pulseSpeed * (deltaTime / 1000);
    }

    /**
     * Render power-up
     */
    onRender(canvas) {
        canvas.save();

        // Move to center of power-up
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Apply rotation
        canvas.ctx.translate(centerX, centerY);
        canvas.ctx.rotate(this.rotation);

        // Apply pulse (scale)
        const pulseScale = 1 + Math.sin(this.pulseTime * Math.PI * 2) * 0.1;
        canvas.ctx.scale(pulseScale, pulseScale);

        // Draw based on type
        this.drawPowerUpIcon(canvas);

        canvas.restore();

        // Draw glow effect
        this.drawGlow(canvas, centerX, centerY);
    }

    /**
     * Draw power-up icon
     */
    drawPowerUpIcon(canvas) {
        const halfSize = this.width / 2;

        switch (this.powerupType) {
            case Config.POWERUP_TYPES.TRIPLE_SHOT:
                this.drawTripleShotIcon(canvas, halfSize);
                break;

            case Config.POWERUP_TYPES.RAPID_FIRE:
                this.drawRapidFireIcon(canvas, halfSize);
                break;

            case Config.POWERUP_TYPES.SHIELD:
                this.drawShieldIcon(canvas, halfSize);
                break;

            case Config.POWERUP_TYPES.BOMB:
                this.drawBombIcon(canvas, halfSize);
                break;
        }
    }

    /**
     * Draw triple shot icon (three arrows up)
     */
    drawTripleShotIcon(canvas, halfSize) {
        canvas.drawRect(-halfSize, -halfSize, this.width, this.height, '#0066ff');

        // Three vertical lines
        canvas.ctx.fillStyle = '#00ffff';
        canvas.ctx.fillRect(-8, -10, 3, 12);
        canvas.ctx.fillRect(-2, -12, 3, 14);
        canvas.ctx.fillRect(4, -10, 3, 12);

        // Arrow heads
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(-6.5, -10);
        canvas.ctx.lineTo(-8, -12);
        canvas.ctx.lineTo(-10, -10);
        canvas.ctx.moveTo(-0.5, -12);
        canvas.ctx.lineTo(-2, -14);
        canvas.ctx.lineTo(-4, -12);
        canvas.ctx.moveTo(5.5, -10);
        canvas.ctx.lineTo(4, -12);
        canvas.ctx.lineTo(2, -10);
        canvas.ctx.stroke();
    }

    /**
     * Draw rapid fire icon (speedlines)
     */
    drawRapidFireIcon(canvas, halfSize) {
        canvas.drawRect(-halfSize, -halfSize, this.width, this.height, '#ff6600');

        // Speed lines
        canvas.ctx.strokeStyle = '#ffaa00';
        canvas.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const y = -8 + i * 4;
            const offset = i * 2;
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(-8 + offset, y);
            canvas.ctx.lineTo(8 - offset, y);
            canvas.ctx.stroke();
        }
    }

    /**
     * Draw shield icon (hexagon shield)
     */
    drawShieldIcon(canvas, halfSize) {
        canvas.drawRect(-halfSize, -halfSize, this.width, this.height, '#00aa00');

        // Shield hexagon
        canvas.ctx.strokeStyle = '#00ff00';
        canvas.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) {
                canvas.ctx.moveTo(x, y);
            } else {
                canvas.ctx.lineTo(x, y);
            }
        }
        canvas.ctx.closePath();
        canvas.ctx.fill();
        canvas.ctx.stroke();

        // Plus sign in center
        canvas.ctx.strokeStyle = '#00ff00';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(-4, 0);
        canvas.ctx.lineTo(4, 0);
        canvas.ctx.moveTo(0, -4);
        canvas.ctx.lineTo(0, 4);
        canvas.ctx.stroke();
    }

    /**
     * Draw bomb icon (circle with fuse)
     */
    drawBombIcon(canvas, halfSize) {
        canvas.drawRect(-halfSize, -halfSize, this.width, this.height, '#660000');

        // Bomb body (circle)
        canvas.ctx.fillStyle = '#000000';
        canvas.ctx.strokeStyle = '#ff0000';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.beginPath();
        canvas.ctx.arc(0, 2, 8, 0, Math.PI * 2);
        canvas.ctx.fill();
        canvas.ctx.stroke();

        // Fuse
        canvas.ctx.strokeStyle = '#ffaa00';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(0, -6);
        canvas.ctx.lineTo(-3, -10);
        canvas.ctx.stroke();

        // Spark
        const sparkSize = 2;
        canvas.ctx.fillStyle = '#ffff00';
        canvas.ctx.fillRect(-3 - sparkSize / 2, -10 - sparkSize / 2, sparkSize, sparkSize);
    }

    /**
     * Draw glow effect around power-up
     */
    drawGlow(canvas, centerX, centerY) {
        const glowAlpha = 0.3 + Math.sin(this.pulseTime * Math.PI * 2) * 0.2;
        const glowRadius = this.width * 0.8;

        canvas.save();
        canvas.setAlpha(glowAlpha);

        let glowColor;
        switch (this.powerupType) {
            case Config.POWERUP_TYPES.TRIPLE_SHOT:
                glowColor = '#00ffff';
                break;
            case Config.POWERUP_TYPES.RAPID_FIRE:
                glowColor = '#ffaa00';
                break;
            case Config.POWERUP_TYPES.SHIELD:
                glowColor = '#00ff00';
                break;
            case Config.POWERUP_TYPES.BOMB:
                glowColor = '#ff0000';
                break;
        }

        canvas.drawCircle(centerX, centerY, glowRadius, glowColor);
        canvas.resetAlpha();
        canvas.restore();
    }

    /**
     * Initialize power-up (for object pooling)
     */
    init(x, y, type) {
        this.x = x;
        this.y = y;
        this.powerupType = type;
        this.velocityY = Config.POWERUP_FALL_SPEED;
        this.rotation = 0;
        this.pulseTime = 0;
        this.active = true;
        this.visible = true;
    }

    /**
     * Reset power-up (for object pooling)
     */
    reset(x, y, type) {
        this.init(x, y, type);
    }
}

export default PowerUp;
