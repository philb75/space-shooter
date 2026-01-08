/**
 * GameState - Finite State Machine
 * Manages game state transitions (menu, playing, paused, gameover)
 */

import Config from './Config.js';

class GameState {
    constructor(initialState = Config.STATES.MENU) {
        this.current = initialState;
        this.previous = null;

        // Define valid state transitions
        this.transitions = {
            [Config.STATES.MENU]: [Config.STATES.PLAYING],
            [Config.STATES.PLAYING]: [Config.STATES.PAUSED, Config.STATES.GAME_OVER],
            [Config.STATES.PAUSED]: [Config.STATES.PLAYING, Config.STATES.MENU],
            [Config.STATES.GAME_OVER]: [Config.STATES.MENU, Config.STATES.PLAYING]
        };

        // State event listeners
        this.listeners = {
            enter: {},
            exit: {}
        };
    }

    /**
     * Check if transition to new state is valid
     */
    canTransition(newState) {
        return this.transitions[this.current].includes(newState);
    }

    /**
     * Transition to a new state
     */
    transition(newState) {
        if (!this.canTransition(newState)) {
            console.warn(`Invalid transition: ${this.current} -> ${newState}`);
            return false;
        }

        console.log(`State transition: ${this.current} -> ${newState}`);

        // Exit current state
        this.exit(this.current);

        // Update state
        this.previous = this.current;
        this.current = newState;

        // Enter new state
        this.enter(newState);

        return true;
    }

    /**
     * Force transition (bypass validation)
     * Use with caution
     */
    forceTransition(newState) {
        console.log(`Force state transition: ${this.current} -> ${newState}`);

        this.exit(this.current);
        this.previous = this.current;
        this.current = newState;
        this.enter(newState);
    }

    /**
     * Enter state handler
     */
    enter(state) {
        console.log(`Entering state: ${state}`);

        // Show/hide appropriate screens
        this.updateScreens(state);

        // Call registered enter listeners
        if (this.listeners.enter[state]) {
            this.listeners.enter[state].forEach(callback => callback());
        }
    }

    /**
     * Exit state handler
     */
    exit(state) {
        console.log(`Exiting state: ${state}`);

        // Call registered exit listeners
        if (this.listeners.exit[state]) {
            this.listeners.exit[state].forEach(callback => callback());
        }
    }

    /**
     * Update screen visibility based on state
     */
    updateScreens(state) {
        // Hide all screens first
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('instructionsScreen').classList.add('hidden');
        document.getElementById('highScoresScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');

        // Show appropriate screen
        switch (state) {
            case Config.STATES.MENU:
                document.getElementById('menuScreen').classList.remove('hidden');
                break;

            case Config.STATES.PLAYING:
                document.getElementById('hud').classList.remove('hidden');
                break;

            case Config.STATES.PAUSED:
                document.getElementById('hud').classList.remove('hidden');
                document.getElementById('pauseScreen').classList.remove('hidden');
                break;

            case Config.STATES.GAME_OVER:
                document.getElementById('gameOverScreen').classList.remove('hidden');
                break;
        }
    }

    /**
     * Register a callback for entering a state
     */
    onEnter(state, callback) {
        if (!this.listeners.enter[state]) {
            this.listeners.enter[state] = [];
        }
        this.listeners.enter[state].push(callback);
    }

    /**
     * Register a callback for exiting a state
     */
    onExit(state, callback) {
        if (!this.listeners.exit[state]) {
            this.listeners.exit[state] = [];
        }
        this.listeners.exit[state].push(callback);
    }

    /**
     * Check if currently in a specific state
     */
    is(state) {
        return this.current === state;
    }

    /**
     * Check if previously in a specific state
     */
    was(state) {
        return this.previous === state;
    }

    /**
     * Get current state
     */
    getCurrent() {
        return this.current;
    }

    /**
     * Get previous state
     */
    getPrevious() {
        return this.previous;
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.previous = null;
        this.forceTransition(Config.STATES.MENU);
    }
}

export default GameState;
