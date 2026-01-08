/**
 * Game - Main Game Class
 * Orchestrates the game loop, state management, and all game systems
 */

import Config from './Config.js';
import GameState from './GameState.js';
import Canvas from './Canvas.js';
import EntityManager from '../systems/EntityManager.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import AudioSystem from '../systems/AudioSystem.js';
import SpawnSystem from '../systems/SpawnSystem.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Explosion from '../entities/Explosion.js';
import FloatingText from '../entities/FloatingText.js';
import PowerUp from '../entities/PowerUp.js';
import EnemyPatterns from '../patterns/EnemyPatterns.js';

class Game {
    constructor() {
        // Core systems
        this.canvas = new Canvas(document.getElementById('gameCanvas'));
        this.state = new GameState(Config.STATES.MENU);
        this.entityManager = new EntityManager();
        this.collisionSystem = new CollisionSystem(this.entityManager);
        this.audioSystem = new AudioSystem();
        this.spawnSystem = new SpawnSystem(this.entityManager);

        // Game loop timing
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = Config.FIXED_TIME_STEP;

        // Game state
        this.score = 0;
        this.wave = 1;
        this.lives = Config.PLAYER_HEALTH;
        this.combo = 0;
        this.comboTimer = 0;

        // Screen shake
        this.screenShake = {
            duration: 0,
            intensity: 0,
            offsetX: 0,
            offsetY: 0
        };

        // Power-up buffs
        this.activeBuffs = {
            rapidFire: false,
            shield: false
        };
        this.buffTimers = {
            rapidFire: 0,
            shield: 0
        };

        // Wave transition
        this.showingWaveMessage = false;
        this.waveMessageTimer = 0;
        this.waveMessageDuration = 2000; // 2 seconds
        this.waveMessageText = '';

        // Input
        this.keys = {};

        // Animation frame ID
        this.animationId = null;

        // Debug
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        // Initialize
        this.init();
    }

    /**
     * Initialize game
     */
    init() {
        console.log('Initializing game...');

        // Set up event listeners
        this.setupEventListeners();

        // Set up state listeners
        this.setupStateListeners();

        // Start game loop
        this.start();

        console.log('Game initialized!');
    }

    /**
     * Set up event listeners for UI and keyboard
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Menu buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_select');
            this.startGame();
        });

        document.getElementById('instructionsButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_navigate');
            this.showInstructions();
        });

        document.getElementById('highScoresButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_navigate');
            this.showHighScores();
        });

        document.getElementById('backFromInstructions').addEventListener('click', () => {
            this.audioSystem.playSound('menu_navigate');
            this.backToMenu();
        });

        document.getElementById('backFromScores').addEventListener('click', () => {
            this.audioSystem.playSound('menu_navigate');
            this.backToMenu();
        });

        // Pause/Resume buttons
        document.getElementById('resumeButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_select');
            this.resumeGame();
        });

        document.getElementById('quitButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_navigate');
            this.quitToMenu();
        });

        // Game over buttons
        document.getElementById('restartButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_select');
            this.startGame();
        });

        document.getElementById('menuButton').addEventListener('click', () => {
            this.audioSystem.playSound('menu_navigate');
            this.backToMenu();
        });

        document.getElementById('submitScore').addEventListener('click', () => {
            this.audioSystem.playSound('menu_select');
            this.submitHighScore();
        });

        // Enter key for name submission
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.audioSystem.playSound('menu_select');
                this.submitHighScore();
            }
        });
    }

    /**
     * Set up state change listeners
     */
    setupStateListeners() {
        // When entering playing state, initialize game
        this.state.onEnter(Config.STATES.PLAYING, () => {
            this.initializeGameSession();
        });

        // When entering game over state, show final score
        this.state.onEnter(Config.STATES.GAME_OVER, () => {
            this.showGameOver();
        });

        // Set up collision callbacks
        this.collisionSystem.setOnEnemyDestroyed((enemy) => {
            this.onEnemyDestroyed(enemy);
        });

        this.collisionSystem.setOnPlayerHit((player) => {
            this.onPlayerHit(player);
        });

        this.collisionSystem.setOnPowerUpCollected((powerup, player) => {
            this.onPowerUpCollected(powerup, player);
        });

        // Set up spawn system callbacks
        this.spawnSystem.setOnWaveStart((waveNumber) => {
            this.onWaveStart(waveNumber);
        });

        this.spawnSystem.setOnWaveComplete((waveNumber) => {
            this.onWaveComplete(waveNumber);
        });
    }

    /**
     * Handle key down events
     */
    handleKeyDown(e) {
        this.keys[e.code] = true;

        // Prevent default for game keys
        const gameKeys = [
            ...Config.KEYS.LEFT,
            ...Config.KEYS.RIGHT,
            ...Config.KEYS.UP,
            ...Config.KEYS.DOWN,
            ...Config.KEYS.SHOOT,
            ...Config.KEYS.PAUSE
        ];

        if (gameKeys.includes(e.code)) {
            e.preventDefault();
        }

        // Pause handling
        if (Config.KEYS.PAUSE.includes(e.code)) {
            this.togglePause();
        }
    }

    /**
     * Handle key up events
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    /**
     * Check if any key in array is pressed
     */
    isKeyPressed(keyArray) {
        return keyArray.some(key => this.keys[key]);
    }

    /**
     * Start the game loop
     */
    start() {
        console.log('Starting game loop...');
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * Main game loop
     */
    loop(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update FPS counter
        this.updateFPS(currentTime);

        // Update game state
        this.update(deltaTime);

        // Render current frame
        this.render(deltaTime);

        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Only update if playing
        if (this.state.is(Config.STATES.PLAYING)) {
            // Update player input
            this.updatePlayerInput(deltaTime);

            // Update all entities
            this.entityManager.update(deltaTime, Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT);

            // Check collisions
            this.collisionSystem.checkCollisions();

            // Update spawn system (wave-based)
            this.spawnSystem.update(deltaTime);

            // Update combo timer
            this.updateCombo(deltaTime);

            // Update wave message
            this.updateWaveMessage(deltaTime);

            // Update screen shake
            this.updateScreenShake(deltaTime);

            // Update power-up buffs
            this.updateBuffs(deltaTime);

            // Update HUD
            this.updateHUD();

            // Check if player is dead
            const player = this.entityManager.getPlayer();
            if (player && !player.isAlive()) {
                this.endGame();
            }
        }
    }

    /**
     * Update player based on input
     */
    updatePlayerInput(deltaTime) {
        const player = this.entityManager.getPlayer();
        if (!player || !player.isAlive()) return;

        // Calculate velocity based on input
        let velocityX = 0;
        let velocityY = 0;

        if (this.isKeyPressed(Config.KEYS.LEFT)) {
            velocityX = -player.speed;
        }
        if (this.isKeyPressed(Config.KEYS.RIGHT)) {
            velocityX = player.speed;
        }
        if (this.isKeyPressed(Config.KEYS.UP)) {
            velocityY = -player.speed;
        }
        if (this.isKeyPressed(Config.KEYS.DOWN)) {
            velocityY = player.speed;
        }

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX = (velocityX / magnitude) * player.speed;
            velocityY = (velocityY / magnitude) * player.speed;
        }

        // Track if player is moving (for thrust effect)
        player.isMoving = (velocityX !== 0 || velocityY !== 0);

        // Set player velocity
        player.velocityX = velocityX;
        player.velocityY = velocityY;

        // Shooting
        if (this.isKeyPressed(Config.KEYS.SHOOT)) {
            const bulletsData = player.shoot();
            if (bulletsData) {
                // Play shoot sound
                this.audioSystem.playSound('shoot');

                // Create bullets from spawn data
                bulletsData.forEach(bulletData => {
                    this.entityManager.addBullet(
                        bulletData.x,
                        bulletData.y,
                        bulletData.velocityX,
                        bulletData.velocityY,
                        true, // isPlayerBullet
                        player.bulletDamage
                    );
                });
            }
        }
    }

    /**
     * Called when wave starts
     */
    onWaveStart(waveNumber) {
        console.log(`Wave ${waveNumber} starting!`);
        this.wave = waveNumber;

        // Show wave message
        this.showingWaveMessage = true;
        this.waveMessageTimer = 0;
        this.waveMessageText = `WAVE ${waveNumber}`;
    }

    /**
     * Called when wave completes
     */
    onWaveComplete(waveNumber) {
        console.log(`Wave ${waveNumber} completed!`);

        // Show wave complete message
        this.showingWaveMessage = true;
        this.waveMessageTimer = 0;
        this.waveMessageText = `WAVE ${waveNumber} COMPLETE!`;
    }

    /**
     * Update wave message display
     */
    updateWaveMessage(deltaTime) {
        if (this.showingWaveMessage) {
            this.waveMessageTimer += deltaTime;

            if (this.waveMessageTimer >= this.waveMessageDuration) {
                this.showingWaveMessage = false;
            }
        }
    }

    /**
     * Update combo timer
     */
    updateCombo(deltaTime) {
        if (this.combo > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
    }

    /**
     * Trigger screen shake effect
     */
    triggerScreenShake(intensity = 5, duration = 200) {
        // Only apply if new shake is stronger
        if (intensity > this.screenShake.intensity) {
            this.screenShake.intensity = intensity;
            this.screenShake.duration = duration;
        }
    }

    /**
     * Update screen shake
     */
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;

            // Calculate shake offset based on intensity
            const shakeAmount = this.screenShake.intensity * (this.screenShake.duration / 200);
            this.screenShake.offsetX = (Math.random() - 0.5) * shakeAmount * 2;
            this.screenShake.offsetY = (Math.random() - 0.5) * shakeAmount * 2;

            // Stop shaking when duration expires
            if (this.screenShake.duration <= 0) {
                this.screenShake.duration = 0;
                this.screenShake.intensity = 0;
                this.screenShake.offsetX = 0;
                this.screenShake.offsetY = 0;
            }
        }
    }

    /**
     * Called when enemy is destroyed
     */
    onEnemyDestroyed(enemy) {
        // Play explosion sound
        this.audioSystem.playSound('explosion');

        // Trigger screen shake (larger for tank enemies)
        const shakeIntensity = enemy.enemyType === Config.ENEMY_TYPES.TANK ? 8 : 4;
        this.triggerScreenShake(shakeIntensity, 200);

        // Create explosion
        const explosion = new Explosion(
            enemy.x + enemy.width / 2 - 24,
            enemy.y + enemy.height / 2 - 24,
            enemy.enemyType === Config.ENEMY_TYPES.TANK ? 'large' : 'medium'
        );
        this.entityManager.addExplosion(explosion);

        // Increment combo
        this.combo++;
        this.comboTimer = Config.COMBO_TIMEOUT;

        // Add score with multiplier
        const multiplier = this.getComboMultiplier();
        const points = Math.floor(enemy.scoreValue * multiplier);
        this.score += points;

        // Create floating text showing points earned
        const color = multiplier > 2 ? '#ffff00' : (multiplier > 1.5 ? '#ffaa00' : '#ffffff');
        const floatingText = new FloatingText(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            `+${points}`,
            color
        );
        this.entityManager.addFloatingText(floatingText);

        // Drop power-up (15% chance)
        this.dropPowerUp(enemy);

        console.log(`Enemy destroyed! +${points} points (${multiplier.toFixed(1)}x combo)`);
    }

    /**
     * Drop power-up from enemy
     */
    dropPowerUp(enemy) {
        // 15% chance to drop
        if (Math.random() > Config.POWERUP_DROP_CHANCE) return;

        // Random power-up type
        const types = [
            Config.POWERUP_TYPES.TRIPLE_SHOT,
            Config.POWERUP_TYPES.RAPID_FIRE,
            Config.POWERUP_TYPES.SHIELD,
            Config.POWERUP_TYPES.BOMB
        ];

        // Weight distribution (make shield and bomb rarer)
        const weights = [3, 3, 2, 1]; // Triple shot and rapid fire more common
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        let selectedType;
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedType = types[i];
                break;
            }
        }

        // Create power-up at enemy position
        const powerup = new PowerUp(
            enemy.x + enemy.width / 2 - Config.POWERUP_SIZE.width / 2,
            enemy.y,
            selectedType
        );

        this.entityManager.addPowerUp(powerup);
        console.log(`Power-up dropped: ${selectedType}`);
    }

    /**
     * Called when player is hit
     */
    onPlayerHit(player) {
        // Check shield
        if (this.activeBuffs.shield) {
            // Shield absorbs hit
            this.audioSystem.playSound('powerup'); // Shield deflect sound
            return;
        }

        // Play hit sound
        this.audioSystem.playSound('hit');

        // Trigger screen shake
        this.triggerScreenShake(6, 250);

        // Update lives
        this.lives = player.health;

        console.log(`Player hit! Lives remaining: ${this.lives}`);

        // Create small explosion at player location
        if (player.isAlive()) {
            const explosion = new Explosion(
                player.x + player.width / 2 - 12,
                player.y + player.height / 2 - 12,
                'small'
            );
            this.entityManager.addExplosion(explosion);
        }
    }

    /**
     * Called when power-up is collected
     */
    onPowerUpCollected(powerup, player) {
        // Play power-up sound
        this.audioSystem.playSound('powerup');

        console.log(`Power-up collected: ${powerup.powerupType}`);

        // Apply power-up effect
        switch (powerup.powerupType) {
            case Config.POWERUP_TYPES.TRIPLE_SHOT:
                // Upgrade weapon level
                if (player.weaponLevel < 3) {
                    player.weaponLevel++;
                    console.log(`Weapon upgraded to level ${player.weaponLevel}`);
                }
                break;

            case Config.POWERUP_TYPES.RAPID_FIRE:
                // Activate rapid fire buff
                this.activeBuffs.rapidFire = true;
                this.buffTimers.rapidFire = Config.POWERUP_DURATION.RAPID_FIRE;
                player.fireRate = Config.PLAYER_FIRE_RATE / 2; // Double fire rate
                console.log('Rapid fire activated!');
                break;

            case Config.POWERUP_TYPES.SHIELD:
                // Activate shield buff
                this.activeBuffs.shield = true;
                this.buffTimers.shield = Config.POWERUP_DURATION.SHIELD;
                console.log('Shield activated!');
                break;

            case Config.POWERUP_TYPES.BOMB:
                // Activate bomb (instant effect)
                this.activateBomb();
                break;
        }

        // Create floating text
        const floatingText = new FloatingText(
            powerup.x + powerup.width / 2,
            powerup.y + powerup.height / 2,
            powerup.powerupType.toUpperCase(),
            '#00ff00'
        );
        this.entityManager.addFloatingText(floatingText);
    }

    /**
     * Update power-up buffs
     */
    updateBuffs(deltaTime) {
        const player = this.entityManager.getPlayer();
        if (!player) return;

        // Update rapid fire
        if (this.activeBuffs.rapidFire) {
            this.buffTimers.rapidFire -= deltaTime;
            if (this.buffTimers.rapidFire <= 0) {
                this.activeBuffs.rapidFire = false;
                player.fireRate = Config.PLAYER_FIRE_RATE; // Reset fire rate
                console.log('Rapid fire expired');
            }
        }

        // Update shield
        if (this.activeBuffs.shield) {
            this.buffTimers.shield -= deltaTime;
            if (this.buffTimers.shield <= 0) {
                this.activeBuffs.shield = false;
                console.log('Shield expired');
            }
        }
    }

    /**
     * Activate bomb (clear all enemies)
     */
    activateBomb() {
        console.log('Bomb activated! Clearing all enemies...');

        // Play explosion sound
        this.audioSystem.playSound('explosion');

        // Trigger big screen shake
        this.triggerScreenShake(12, 400);

        // Get all enemies
        const enemies = this.entityManager.getEnemies();

        // Destroy all enemies
        enemies.forEach(enemy => {
            // Create explosion at enemy position
            const explosion = new Explosion(
                enemy.x + enemy.width / 2 - 24,
                enemy.y + enemy.height / 2 - 24,
                'large'
            );
            this.entityManager.addExplosion(explosion);

            // Add score (no combo bonus for bomb kills)
            this.score += enemy.scoreValue;

            // Destroy enemy
            enemy.destroy();
        });

        console.log(`Bomb destroyed ${enemies.length} enemies!`);
    }

    /**
     * Render current frame
     */
    render(deltaTime) {
        // Clear canvas
        this.canvas.clear();

        // Render background
        this.canvas.renderBackground(deltaTime);

        // Render based on state
        if (this.state.is(Config.STATES.PLAYING) || this.state.is(Config.STATES.PAUSED)) {
            this.renderGame();
        }

        // Render debug info
        if (Config.DEBUG.SHOW_FPS) {
            this.renderDebugInfo();
        }
    }

    /**
     * Render game elements
     */
    renderGame() {
        // Apply screen shake
        if (this.screenShake.duration > 0) {
            this.canvas.save();
            this.canvas.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        }

        // Render all entities (managed by EntityManager)
        this.entityManager.render(this.canvas);

        // Render buff indicators
        this.renderBuffIndicators();

        // Reset screen shake
        if (this.screenShake.duration > 0) {
            this.canvas.restore();
        }

        // Render wave message (outside shake)
        if (this.showingWaveMessage) {
            this.renderWaveMessage();
        }
    }

    /**
     * Render wave transition message
     */
    renderWaveMessage() {
        const alpha = Math.min(1, (this.waveMessageDuration - this.waveMessageTimer) / 500);

        this.canvas.save();
        this.canvas.setAlpha(alpha);

        // Draw semi-transparent overlay
        this.canvas.drawRect(0, 0, Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT, 'rgba(0, 0, 0, 0.5)');

        // Draw message text
        const fontSize = 48;
        const y = Config.CANVAS_HEIGHT / 2;

        this.canvas.drawTextOutline(
            this.waveMessageText,
            Config.CANVAS_WIDTH / 2,
            y,
            fontSize,
            '#00ffff',
            '#000000',
            'center',
            4
        );

        this.canvas.resetAlpha();
        this.canvas.restore();
    }

    /**
     * Render active buff indicators
     */
    renderBuffIndicators() {
        const player = this.entityManager.getPlayer();
        if (!player || !player.isAlive()) return;

        let indicatorY = player.y - 20;

        // Render shield indicator
        if (this.activeBuffs.shield) {
            const alpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
            this.canvas.save();
            this.canvas.setAlpha(alpha);

            // Draw shield circle around player
            const shieldRadius = Math.max(player.width, player.height) * 0.8;
            this.canvas.drawCircleOutline(
                player.x + player.width / 2,
                player.y + player.height / 2,
                shieldRadius,
                '#00ff00',
                3
            );

            this.canvas.resetAlpha();
            this.canvas.restore();

            // Shield timer bar above player
            const timerWidth = player.width;
            const timerProgress = this.buffTimers.shield / Config.POWERUP_DURATION.SHIELD;

            this.canvas.drawRect(
                player.x,
                indicatorY,
                timerWidth,
                4,
                'rgba(0, 0, 0, 0.5)'
            );
            this.canvas.drawRect(
                player.x,
                indicatorY,
                timerWidth * timerProgress,
                4,
                '#00ff00'
            );

            indicatorY -= 8;
        }

        // Render rapid fire indicator
        if (this.activeBuffs.rapidFire) {
            const timerWidth = player.width;
            const timerProgress = this.buffTimers.rapidFire / Config.POWERUP_DURATION.RAPID_FIRE;

            this.canvas.drawRect(
                player.x,
                indicatorY,
                timerWidth,
                4,
                'rgba(0, 0, 0, 0.5)'
            );
            this.canvas.drawRect(
                player.x,
                indicatorY,
                timerWidth * timerProgress,
                4,
                '#ffaa00'
            );
        }
    }

    /**
     * Render debug information
     */
    renderDebugInfo() {
        const player = this.entityManager.getPlayer();
        const debugInfo = [
            `FPS: ${this.fps}`,
            `State: ${this.state.current}`,
            `Entities: ${this.entityManager.getEntityCount()}`,
            `Player: ${player ? `(${Math.floor(player.x)}, ${Math.floor(player.y)}) HP:${player.health}` : 'None'}`
        ];

        debugInfo.forEach((text, index) => {
            this.canvas.drawText(text, 10, 20 + (index * 20), 14, '#00ff00', 'left');
        });
    }

    /**
     * Update FPS counter
     */
    updateFPS(currentTime) {
        this.frameCount++;

        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }

    /**
     * Update HUD display
     */
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('lives').textContent = this.lives;

        // Show/hide combo
        const comboElement = document.querySelector('.hud-section.combo');
        if (this.combo > 0) {
            comboElement.classList.remove('hidden');
            const multiplier = this.getComboMultiplier();
            document.getElementById('combo').textContent = `x${multiplier.toFixed(1)}`;
        } else {
            comboElement.classList.add('hidden');
        }
    }

    /**
     * Calculate combo multiplier
     */
    getComboMultiplier() {
        return Math.min(
            1 + (this.combo * Config.COMBO_MULTIPLIER_INCREMENT),
            Config.MAX_COMBO_MULTIPLIER
        );
    }

    /**
     * Initialize a new game session
     */
    initializeGameSession() {
        console.log('Initializing game session...');

        // Resume audio context (for browser autoplay policy)
        this.audioSystem.resume();

        // Reset game state
        this.score = 0;
        this.wave = 1;
        this.lives = Config.PLAYER_HEALTH;
        this.combo = 0;
        this.comboTimer = 0;

        // Reset power-up buffs
        this.activeBuffs = {
            rapidFire: false,
            shield: false
        };
        this.buffTimers = {
            rapidFire: 0,
            shield: 0
        };

        // Reset wave messages
        this.showingWaveMessage = false;
        this.waveMessageTimer = 0;

        // Clear all entities
        this.entityManager.clearAll();

        // Create player
        const player = new Player(Config.PLAYER_START_X, Config.PLAYER_START_Y);
        this.entityManager.setPlayer(player);

        // Reset and start spawn system
        this.spawnSystem.reset();
        this.spawnSystem.startWave(1);

        // Update HUD
        this.updateHUD();

        console.log('Game session initialized!');
    }

    /**
     * Start game
     */
    startGame() {
        console.log('Starting game...');
        this.state.transition(Config.STATES.PLAYING);
    }

    /**
     * Pause game
     */
    pauseGame() {
        if (this.state.is(Config.STATES.PLAYING)) {
            this.state.transition(Config.STATES.PAUSED);
        }
    }

    /**
     * Resume game
     */
    resumeGame() {
        if (this.state.is(Config.STATES.PAUSED)) {
            this.state.transition(Config.STATES.PLAYING);
        }
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.state.is(Config.STATES.PLAYING)) {
            this.pauseGame();
        } else if (this.state.is(Config.STATES.PAUSED)) {
            this.resumeGame();
        }
    }

    /**
     * End game (game over)
     */
    endGame() {
        console.log('Game over!');
        this.state.transition(Config.STATES.GAME_OVER);
    }

    /**
     * Show game over screen
     */
    showGameOver() {
        // Display final score
        document.getElementById('finalScore').textContent = this.score;

        // Check if it's a high score
        const highScores = this.loadHighScores();
        const isHighScore = highScores.length < 10 || this.score > highScores[highScores.length - 1].score;

        if (isHighScore) {
            document.getElementById('newHighScore').classList.remove('hidden');
            document.getElementById('playerName').value = '';
            document.getElementById('playerName').focus();
        } else {
            document.getElementById('newHighScore').classList.add('hidden');
        }
    }

    /**
     * Quit to menu
     */
    quitToMenu() {
        this.state.forceTransition(Config.STATES.MENU);
    }

    /**
     * Back to menu
     */
    backToMenu() {
        // Hide all screens
        document.getElementById('instructionsScreen').classList.add('hidden');
        document.getElementById('highScoresScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');

        // Show menu
        this.state.forceTransition(Config.STATES.MENU);
    }

    /**
     * Show instructions
     */
    showInstructions() {
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('instructionsScreen').classList.remove('hidden');
    }

    /**
     * Show high scores
     */
    showHighScores() {
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('highScoresScreen').classList.remove('hidden');
        this.renderHighScores();
    }

    /**
     * Render high scores list
     */
    renderHighScores() {
        const highScores = this.loadHighScores();
        const listElement = document.getElementById('highScoresList');

        if (highScores.length === 0) {
            listElement.innerHTML = '<p class="no-scores">No high scores yet!</p>';
            return;
        }

        let html = '';
        highScores.forEach((entry, index) => {
            html += `
                <div class="score-entry">
                    <span class="score-rank">#${index + 1}</span>
                    <span class="score-name">${entry.name}</span>
                    <span class="score-value">${entry.score}</span>
                </div>
            `;
        });

        listElement.innerHTML = html;
    }

    /**
     * Submit high score
     */
    submitHighScore() {
        const playerName = document.getElementById('playerName').value.trim() || 'Anonymous';

        // Save score
        this.saveHighScore(playerName, this.score);

        // Hide input
        document.getElementById('newHighScore').classList.add('hidden');
    }

    /**
     * Load high scores from localStorage
     */
    loadHighScores() {
        const saved = localStorage.getItem('space-shooter-highscores');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore(name, score) {
        const highScores = this.loadHighScores();

        // Add new score
        highScores.push({
            name: name,
            score: score,
            date: new Date().toISOString()
        });

        // Sort by score (descending)
        highScores.sort((a, b) => b.score - a.score);

        // Keep top 10
        const topScores = highScores.slice(0, 10);

        // Save to localStorage
        localStorage.setItem('space-shooter-highscores', JSON.stringify(topScores));

        console.log('High score saved:', { name, score });
    }

    /**
     * Stop the game loop
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Destroy game instance
     */
    destroy() {
        this.stop();
        // Clean up event listeners if needed
    }
}

export default Game;
