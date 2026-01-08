/**
 * Pool - Object Pooling Utility
 * Reuses objects instead of creating/destroying them for performance
 */

class Pool {
    constructor(ClassType, initialSize = 20) {
        this.ClassType = ClassType;
        this.available = [];
        this.inUse = [];

        // Pre-allocate objects
        for (let i = 0; i < initialSize; i++) {
            this.available.push(new ClassType());
        }
    }

    /**
     * Get an object from the pool
     */
    get(...args) {
        let obj;

        if (this.available.length > 0) {
            // Reuse existing object
            obj = this.available.pop();
        } else {
            // Create new object if pool is empty
            obj = new this.ClassType();
        }

        // Initialize/reset object
        if (obj.init) {
            obj.init(...args);
        } else if (obj.reset) {
            obj.reset(...args);
        }

        // Track as in use
        this.inUse.push(obj);

        return obj;
    }

    /**
     * Return an object to the pool
     */
    release(obj) {
        const index = this.inUse.indexOf(obj);
        if (index !== -1) {
            this.inUse.splice(index, 1);
            this.available.push(obj);
            obj.active = false;
        }
    }

    /**
     * Return all inactive objects to the pool
     */
    releaseInactive() {
        for (let i = this.inUse.length - 1; i >= 0; i--) {
            const obj = this.inUse[i];
            if (!obj.active) {
                this.inUse.splice(i, 1);
                this.available.push(obj);
            }
        }
    }

    /**
     * Get all active (in-use) objects
     */
    getActive() {
        return this.inUse.filter(obj => obj.active);
    }

    /**
     * Get count of available objects
     */
    getAvailableCount() {
        return this.available.length;
    }

    /**
     * Get count of in-use objects
     */
    getInUseCount() {
        return this.inUse.length;
    }

    /**
     * Get total pool size
     */
    getTotalSize() {
        return this.available.length + this.inUse.length;
    }

    /**
     * Clear the pool
     */
    clear() {
        this.available = [];
        this.inUse = [];
    }

    /**
     * Grow pool by specified amount
     */
    grow(count) {
        for (let i = 0; i < count; i++) {
            this.available.push(new this.ClassType());
        }
    }
}

export default Pool;
