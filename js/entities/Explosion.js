/**
 * Explosion - Explosion Effect Entity
 * Visual feedback when entities are destroyed
 */

import Entity from './Entity.js';
import Config from '../core/Config.js';

class Explosion extends Entity {
    constructor(x, y, size = 'medium') {
        super(x, y, 'explosion');

        // Explosion properties
        this.explosionSize = size;
        this.duration = Config.EXPLOSION_DURATION;
        this.maxDuration = Config.EXPLOSION_DURATION;
        this.particleCount = 8;
        this.particles = [];

        // Set size based on type
        this.setSizeProperties(size);

        // Generate particles
        this.generateParticles();

        // Not collidable
        this.collidable = false;
    }

    /**
     * Set size properties
     */
    setSizeProperties(size) {
        switch (size) {
            case 'small':
                this.width = 24;
                this.height = 24;
                this.particleCount = 6;
                this.duration = 300;
                this.maxDuration = 300;
                break;

            case 'medium':
                this.width = 48;
                this.height = 48;
                this.particleCount = 8;
                this.duration = 500;
                this.maxDuration = 500;
                break;

            case 'large':
                this.width = 72;
                this.height = 72;
                this.particleCount = 12;
                this.duration = 700;
                this.maxDuration = 700;
                break;
        }
    }

    /**
     * Generate explosion particles
     */
    generateParticles() {
        this.particles = [];

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < this.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / this.particleCount;
            const speed = 100 + Math.random() * 100;

            this.particles.push({
                x: centerX,
                y: centerY,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: this.getRandomColor(),
                life: 1.0
            });
        }
    }

    /**
     * Get random explosion color
     */
    getRandomColor() {
        const colors = [
            '#ff6600', // Orange
            '#ff3300', // Red-orange
            '#ffaa00', // Yellow-orange
            '#ff0000', // Red
            '#ffff00'  // Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Update explosion
     */
    onUpdate(deltaTime) {
        this.duration -= deltaTime;

        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.velocityX * deltaTime / 1000;
            particle.y += particle.velocityY * deltaTime / 1000;
            particle.life = this.duration / this.maxDuration;

            // Slow down particles
            particle.velocityX *= 0.95;
            particle.velocityY *= 0.95;
        });

        // Destroy when duration expires
        if (this.duration <= 0) {
            this.destroy();
        }
    }

    /**
     * Render explosion
     */
    onRender(canvas) {
        const progress = 1 - (this.duration / this.maxDuration);

        // Center flash (bright at start, fades quickly)
        if (progress < 0.3) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const flashAlpha = 1 - (progress / 0.3);
            const flashRadius = this.width / 2 * (1 + progress);

            canvas.save();
            canvas.setAlpha(flashAlpha * 0.8);
            canvas.drawCircle(centerX, centerY, flashRadius, '#ffffff');
            canvas.resetAlpha();
            canvas.restore();
        }

        // Render particles
        this.particles.forEach(particle => {
            canvas.save();
            canvas.setAlpha(particle.life);
            canvas.drawCircle(
                particle.x,
                particle.y,
                particle.size * particle.life,
                particle.color
            );
            canvas.resetAlpha();
            canvas.restore();
        });

        // Outer ring (expands outward)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const ringRadius = (this.width / 2) * (1 + progress * 2);
        const ringAlpha = 1 - progress;

        canvas.save();
        canvas.setAlpha(ringAlpha * 0.5);
        canvas.drawCircleOutline(
            centerX,
            centerY,
            ringRadius,
            '#ffaa00',
            3
        );
        canvas.resetAlpha();
        canvas.restore();
    }

    /**
     * Initialize explosion (for object pooling)
     */
    init(x, y, size = 'medium') {
        this.x = x;
        this.y = y;
        this.explosionSize = size;
        this.active = true;
        this.visible = true;

        this.setSizeProperties(size);
        this.generateParticles();
    }

    /**
     * Reset explosion (for object pooling)
     */
    reset(x, y, size = 'medium') {
        this.init(x, y, size);
    }
}

export default Explosion;
