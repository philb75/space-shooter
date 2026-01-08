/**
 * Entity - Base Entity Class
 * All game objects inherit from this class (player, enemies, bullets, powerups)
 */

class Entity {
    constructor(x, y, type) {
        this.id = Entity.nextId++;
        this.type = type;

        // Position and movement
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;

        // Size (override in subclasses)
        this.width = 32;
        this.height = 32;

        // State
        this.active = true;
        this.health = 1;
        this.maxHealth = 1;

        // Collision
        this.collidable = true;
        this.collisionLayer = 'default'; // 'player', 'enemy', 'player-bullet', 'enemy-bullet', 'powerup'

        // Rendering
        this.visible = true;
        this.alpha = 1.0;
        this.rotation = 0;

        // Timing
        this.age = 0; // Time since creation (milliseconds)
    }

    /**
     * Update entity state
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update age
        this.age += deltaTime;

        // Update position based on velocity
        this.x += this.velocityX * deltaTime / 1000;
        this.y += this.velocityY * deltaTime / 1000;

        // Override in subclasses for custom behavior
        this.onUpdate(deltaTime);
    }

    /**
     * Custom update logic (override in subclasses)
     */
    onUpdate(deltaTime) {
        // Override in subclasses
    }

    /**
     * Render entity
     */
    render(canvas) {
        if (!this.visible || !this.active) return;

        // Override in subclasses
        this.onRender(canvas);
    }

    /**
     * Custom render logic (override in subclasses)
     */
    onRender(canvas) {
        // Override in subclasses
        // Default: render as colored rectangle
        canvas.drawRect(this.x, this.y, this.width, this.height, '#ffffff');
    }

    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2
        };
    }

    /**
     * Check if entity is off screen
     */
    isOffScreen(canvasWidth, canvasHeight, margin = 50) {
        const bounds = this.getBounds();
        return (
            bounds.right < -margin ||
            bounds.left > canvasWidth + margin ||
            bounds.bottom < -margin ||
            bounds.top > canvasHeight + margin
        );
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.onDeath();
        }

        this.onDamage(amount);
    }

    /**
     * Heal entity
     */
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    /**
     * Called when entity takes damage (override in subclasses)
     */
    onDamage(amount) {
        // Override in subclasses for hit effects, sound, etc.
    }

    /**
     * Called when entity dies (override in subclasses)
     */
    onDeath() {
        this.destroy();
    }

    /**
     * Destroy entity
     */
    destroy() {
        this.active = false;
        this.onDestroy();
    }

    /**
     * Called when entity is destroyed (override in subclasses)
     */
    onDestroy() {
        // Override in subclasses for cleanup, effects, etc.
    }

    /**
     * Get entity center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Set velocity
     */
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    /**
     * Set position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Move to position
     */
    moveTo(x, y) {
        this.setPosition(x, y);
    }

    /**
     * Check if entity is alive
     */
    isAlive() {
        return this.active && this.health > 0;
    }

    /**
     * Clone entity (for object pooling)
     */
    clone() {
        const clone = new this.constructor(this.x, this.y);
        return clone;
    }

    /**
     * Reset entity state (for object pooling)
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
        this.health = this.maxHealth;
        this.visible = true;
        this.alpha = 1.0;
        this.rotation = 0;
        this.age = 0;
    }
}

// Static ID counter for unique entity IDs
Entity.nextId = 1;

export default Entity;
