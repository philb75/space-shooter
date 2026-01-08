/**
 * Canvas Wrapper
 * Provides utility methods for canvas operations and drawing
 */

import Config from './Config.js';

class Canvas {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = Config.CANVAS_WIDTH;
        this.canvas.height = Config.CANVAS_HEIGHT;

        // Enable image smoothing for better sprite rendering
        this.ctx.imageSmoothingEnabled = false;

        // Background stars for scrolling effect
        this.stars = this.generateStars();
    }

    /**
     * Generate random stars for background
     */
    generateStars() {
        const stars = [];
        for (let i = 0; i < Config.BACKGROUND.STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * Config.CANVAS_WIDTH,
                y: Math.random() * Config.CANVAS_HEIGHT,
                size: Math.random() * (Config.BACKGROUND.STAR_SIZE_MAX - Config.BACKGROUND.STAR_SIZE_MIN) + Config.BACKGROUND.STAR_SIZE_MIN,
                speed: Math.random() * (Config.BACKGROUND.STAR_SPEED_MAX - Config.BACKGROUND.STAR_SPEED_MIN) + Config.BACKGROUND.STAR_SPEED_MIN,
                opacity: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
            });
        }
        return stars;
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = Config.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT);
    }

    /**
     * Update and render scrolling star field background
     */
    renderBackground(deltaTime) {
        // Update star positions
        this.stars.forEach(star => {
            star.y += star.speed * deltaTime / 1000;

            // Wrap stars around when they go off screen
            if (star.y > Config.CANVAS_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * Config.CANVAS_WIDTH;
            }
        });

        // Draw stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    /**
     * Draw a rectangle (for entities without sprites)
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    /**
     * Draw a rectangle outline
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }

    /**
     * Draw a circle
     */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw a circle outline
     */
    drawCircleOutline(x, y, radius, color, lineWidth = 2) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Draw an image (sprite)
     */
    drawImage(image, x, y, width, height) {
        if (image && image.complete) {
            this.ctx.drawImage(image, x, y, width, height);
        }
    }

    /**
     * Draw text
     */
    drawText(text, x, y, fontSize, color, align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px 'Courier New', monospace`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Draw text with outline
     */
    drawTextOutline(text, x, y, fontSize, fillColor, outlineColor, align = 'left', outlineWidth = 2) {
        this.ctx.font = `${fontSize}px 'Courier New', monospace`;
        this.ctx.textAlign = align;
        this.ctx.lineWidth = outlineWidth;

        // Draw outline
        this.ctx.strokeStyle = outlineColor;
        this.ctx.strokeText(text, x, y);

        // Draw fill
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Draw debug bounds for collision detection
     */
    drawBounds(entity, color = '#00ff00') {
        const bounds = entity.getBounds();
        this.drawRectOutline(
            bounds.left,
            bounds.top,
            bounds.right - bounds.left,
            bounds.bottom - bounds.top,
            color,
            1
        );
    }

    /**
     * Set alpha (transparency) for subsequent draw operations
     */
    setAlpha(alpha) {
        this.ctx.globalAlpha = alpha;
    }

    /**
     * Reset alpha to default (1.0)
     */
    resetAlpha() {
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Save canvas state
     */
    save() {
        this.ctx.save();
    }

    /**
     * Restore canvas state
     */
    restore() {
        this.ctx.restore();
    }

    /**
     * Rotate canvas
     */
    rotate(angle) {
        this.ctx.rotate(angle);
    }

    /**
     * Translate canvas
     */
    translate(x, y) {
        this.ctx.translate(x, y);
    }

    /**
     * Get canvas width
     */
    get width() {
        return Config.CANVAS_WIDTH;
    }

    /**
     * Get canvas height
     */
    get height() {
        return Config.CANVAS_HEIGHT;
    }

    /**
     * Get 2D context
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Get canvas element
     */
    getElement() {
        return this.canvas;
    }

    /**
     * Draw player spaceship
     */
    drawPlayerShip(x, y, width, height, isMoving = false) {
        const ctx = this.ctx;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        ctx.save();

        // Main ship body (sleek triangle)
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#00aacc';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(centerX, y); // Top point
        ctx.lineTo(x + width * 0.8, y + height); // Bottom right
        ctx.lineTo(x + width * 0.2, y + height); // Bottom left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit (glowing center)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, y + height * 0.4, width * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit glow
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX, y + height * 0.4, width * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Wings (blue accent)
        ctx.fillStyle = '#0088ff';
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1.5;

        // Left wing
        ctx.beginPath();
        ctx.moveTo(x + width * 0.2, y + height * 0.5);
        ctx.lineTo(x, y + height * 0.7);
        ctx.lineTo(x + width * 0.15, y + height * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(x + width * 0.8, y + height * 0.5);
        ctx.lineTo(x + width, y + height * 0.7);
        ctx.lineTo(x + width * 0.85, y + height * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Thrust effect (when moving)
        if (isMoving) {
            const thrustLength = 15 + Math.random() * 5;
            const thrustAlpha = 0.6 + Math.random() * 0.4;

            // Left thruster
            const leftThrustX = x + width * 0.3;
            const leftThrustY = y + height;

            const gradientLeft = ctx.createLinearGradient(
                leftThrustX, leftThrustY,
                leftThrustX, leftThrustY + thrustLength
            );
            gradientLeft.addColorStop(0, `rgba(255, 150, 0, ${thrustAlpha})`);
            gradientLeft.addColorStop(0.5, `rgba(255, 100, 0, ${thrustAlpha * 0.6})`);
            gradientLeft.addColorStop(1, 'rgba(255, 50, 0, 0)');

            ctx.fillStyle = gradientLeft;
            ctx.beginPath();
            ctx.moveTo(leftThrustX, leftThrustY);
            ctx.lineTo(leftThrustX - 4, leftThrustY + thrustLength);
            ctx.lineTo(leftThrustX + 4, leftThrustY + thrustLength);
            ctx.closePath();
            ctx.fill();

            // Right thruster
            const rightThrustX = x + width * 0.7;
            const rightThrustY = y + height;

            const gradientRight = ctx.createLinearGradient(
                rightThrustX, rightThrustY,
                rightThrustX, rightThrustY + thrustLength
            );
            gradientRight.addColorStop(0, `rgba(255, 150, 0, ${thrustAlpha})`);
            gradientRight.addColorStop(0.5, `rgba(255, 100, 0, ${thrustAlpha * 0.6})`);
            gradientRight.addColorStop(1, 'rgba(255, 50, 0, 0)');

            ctx.fillStyle = gradientRight;
            ctx.beginPath();
            ctx.moveTo(rightThrustX, rightThrustY);
            ctx.lineTo(rightThrustX - 4, rightThrustY + thrustLength);
            ctx.lineTo(rightThrustX + 4, rightThrustY + thrustLength);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw enemy ship
     */
    drawEnemyShip(x, y, width, height, type = 'basic') {
        const ctx = this.ctx;
        const centerX = x + width / 2;

        ctx.save();

        // Color based on enemy type
        const colors = {
            basic: { main: '#ff00ff', accent: '#cc00cc', dark: '#880088' },
            fast: { main: '#ff6600', accent: '#cc5500', dark: '#884400' },
            tank: { main: '#00ff00', accent: '#00cc00', dark: '#008800' },
            zigzag: { main: '#ffff00', accent: '#cccc00', dark: '#888800' },
            boss: { main: '#ff0000', accent: '#cc0000', dark: '#880000' }
        };

        const color = colors[type] || colors.basic;

        // Boss enemies get special rendering
        if (type === 'boss') {
            // Larger, more menacing design with weapons
            ctx.fillStyle = color.main;
            ctx.strokeStyle = color.dark;
            ctx.lineWidth = 3;

            // Main body (wider triangle)
            ctx.beginPath();
            ctx.moveTo(centerX, y + height); // Bottom point
            ctx.lineTo(x, y); // Top left
            ctx.lineTo(x + width, y); // Top right
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit (red glowing center)
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(centerX, y + height * 0.5, width * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Weapon turrets (left and right)
            ctx.fillStyle = color.dark;
            ctx.fillRect(x + width * 0.15, y + height * 0.6, width * 0.15, height * 0.25);
            ctx.fillRect(x + width * 0.7, y + height * 0.6, width * 0.15, height * 0.25);

            // Armor plating
            ctx.strokeStyle = color.accent;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.4);

            ctx.restore();
            return;
        }

        // Main body (inverted triangle)
        ctx.fillStyle = color.main;
        ctx.strokeStyle = color.dark;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(centerX, y + height); // Bottom point
        ctx.lineTo(x, y); // Top left
        ctx.lineTo(x + width, y); // Top right
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit (dark center)
        ctx.fillStyle = color.dark;
        ctx.beginPath();
        ctx.arc(centerX, y + height * 0.6, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Side details
        ctx.fillStyle = color.accent;
        ctx.fillRect(x + width * 0.1, y + height * 0.3, width * 0.15, height * 0.3);
        ctx.fillRect(x + width * 0.75, y + height * 0.3, width * 0.15, height * 0.3);

        ctx.restore();
    }

    /**
     * Draw bullet/projectile
     */
    drawBullet(x, y, width, height, isPlayer = true) {
        const ctx = this.ctx;
        const centerX = x + width / 2;

        ctx.save();

        if (isPlayer) {
            // Player bullet (yellow/cyan energy)
            const gradient = ctx.createLinearGradient(centerX, y, centerX, y + height);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#ffff00');
            gradient.addColorStop(1, '#00ffff');

            ctx.fillStyle = gradient;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y, width, height);

            // Bright core
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.3, y, width * 0.4, height * 0.5);
        } else {
            // Enemy bullet (red/magenta)
            const gradient = ctx.createLinearGradient(centerX, y, centerX, y + height);
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(1, '#ff0000');

            ctx.fillStyle = gradient;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 6;
            ctx.fillRect(x, y, width, height);
        }

        ctx.restore();
    }
}

export default Canvas;
