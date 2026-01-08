/**
 * FloatingText - Floating Score Text Entity
 * Shows score popups when enemies are destroyed
 */

import Entity from './Entity.js';

class FloatingText extends Entity {
    constructor(x, y, text, color = '#ffff00') {
        super(x, y, 'floating-text');

        // Text properties
        this.text = text;
        this.color = color;
        this.fontSize = 20;

        // Animation
        this.duration = 1000; // 1 second
        this.maxDuration = 1000;
        this.velocityY = -50; // Float upward
        this.alpha = 1.0;

        // Not collidable
        this.collidable = false;
        this.width = 0;
        this.height = 0;
    }

    /**
     * Update floating text
     */
    onUpdate(deltaTime) {
        this.duration -= deltaTime;

        // Fade out over time
        this.alpha = this.duration / this.maxDuration;

        // Slow down over time
        this.velocityY *= 0.95;

        // Destroy when duration expires
        if (this.duration <= 0) {
            this.destroy();
        }
    }

    /**
     * Render floating text
     */
    onRender(canvas) {
        canvas.save();
        canvas.setAlpha(this.alpha);

        // Draw text with outline for visibility
        canvas.drawTextOutline(
            this.text,
            this.x,
            this.y,
            this.fontSize,
            this.color,
            '#000000',
            'center',
            2
        );

        canvas.resetAlpha();
        canvas.restore();
    }

    /**
     * Initialize floating text (for object pooling)
     */
    init(x, y, text, color = '#ffff00') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.duration = 1000;
        this.maxDuration = 1000;
        this.velocityY = -50;
        this.alpha = 1.0;
        this.active = true;
        this.visible = true;
    }

    /**
     * Reset floating text (for object pooling)
     */
    reset(x, y, text, color = '#ffff00') {
        this.init(x, y, text, color);
    }
}

export default FloatingText;
