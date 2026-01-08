/**
 * Space Shooter - Main Entry Point
 * Classic vertical scrolling space shooter game
 */

import Game from './js/core/Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🚀 SPACE SHOOTER 🚀', 'font-size: 24px; color: #00ffff; font-weight: bold;');
    console.log('%cBy Claude Code', 'font-size: 14px; color: #00ff00;');
    console.log('%c═════════════════════════════════════════', 'color: #00ffff;');

    try {
        // Create game instance
        const game = new Game();

        // Make game globally accessible for debugging
        window.game = game;

        console.log('%c✓ Game initialized successfully!', 'color: #00ff00; font-weight: bold;');
        console.log('%cTip: You can access the game instance via window.game in the console', 'color: #ffaa00;');
        console.log('%c═════════════════════════════════════════', 'color: #00ffff;');

    } catch (error) {
        console.error('%c✗ Failed to initialize game:', 'color: #ff0000; font-weight: bold;', error);
        alert('Failed to start game. Please check the console for errors.');
    }
});

// Handle window visibility changes (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.game && window.game.state) {
        if (document.hidden && window.game.state.is('playing')) {
            window.game.pauseGame();
            console.log('Game paused (tab hidden)');
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game && window.game.canvas) {
        // Canvas size is fixed, but we could add responsive handling here if needed
        console.log('Window resized');
    }
});

// Prevent context menu on canvas (right-click)
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
});

// Log performance info
console.log('%cPerformance Info:', 'color: #00ffff; font-weight: bold;');
console.log('Navigator:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
});

// Check for required features
const requiredFeatures = {
    'Canvas API': 'getContext' in document.createElement('canvas'),
    'requestAnimationFrame': 'requestAnimationFrame' in window,
    'localStorage': 'localStorage' in window,
    'ES6 Modules': true // If we got here, modules are supported
};

console.log('Required Features:', requiredFeatures);

const missingFeatures = Object.entries(requiredFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

if (missingFeatures.length > 0) {
    console.error('%c✗ Missing required features:', 'color: #ff0000; font-weight: bold;', missingFeatures);
    alert(`Your browser is missing required features: ${missingFeatures.join(', ')}\nPlease use a modern browser.`);
}
