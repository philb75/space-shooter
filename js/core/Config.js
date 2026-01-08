/**
 * Game Configuration Constants
 * Central location for all game balance and settings
 */

const Config = {
    // Canvas settings
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    FIXED_TIME_STEP: 1000 / 60, // 16.67ms for 60 FPS

    // Player settings
    PLAYER_SPEED: 300, // pixels per second
    PLAYER_FIRE_RATE: 200, // milliseconds between shots
    PLAYER_HEALTH: 3,
    PLAYER_SIZE: { width: 48, height: 48 },
    PLAYER_START_X: 400, // Center of canvas
    PLAYER_START_Y: 500, // Near bottom

    // Player bounds (keep player on screen)
    PLAYER_BOUNDS: {
        minX: 0,
        maxX: 752, // 800 - 48 (player width)
        minY: 0,
        maxY: 552  // 600 - 48 (player height)
    },

    // Enemy settings
    ENEMY_SPEED_BASE: 100,
    ENEMY_SPEED_INCREMENT: 10, // per wave
    ENEMY_HEALTH_BASE: 1,
    ENEMY_SIZE: { width: 32, height: 32 },

    // Bullet settings
    BULLET_SPEED: 500,
    BULLET_DAMAGE: 1,
    BULLET_SIZE: { width: 8, height: 16 },
    BULLET_POOL_SIZE: 50, // Pre-allocate bullets for performance

    // Power-up settings
    POWERUP_DROP_CHANCE: 0.15, // 15% chance
    POWERUP_FALL_SPEED: 100,
    POWERUP_SIZE: { width: 32, height: 32 },
    POWERUP_DURATION: {
        RAPID_FIRE: 10000, // 10 seconds
        SHIELD: 15000      // 15 seconds
    },

    // Explosion settings
    EXPLOSION_DURATION: 500, // milliseconds
    EXPLOSION_FRAMES: 8,

    // Game balance
    SCORE_ENEMY_BASE: 100,
    COMBO_TIMEOUT: 2000, // 2 seconds to maintain combo
    MAX_COMBO_MULTIPLIER: 5,
    COMBO_MULTIPLIER_INCREMENT: 0.1, // 10% per kill

    // Wave settings
    WAVE_ENEMY_COUNT_BASE: 5,
    WAVE_ENEMY_COUNT_INCREMENT: 2, // per wave
    WAVE_SPAWN_INTERVAL: 1000, // milliseconds between enemy spawns
    WAVE_CLEAR_DELAY: 3000, // milliseconds before next wave

    // Colors (for rendering when no sprites available)
    COLORS: {
        PLAYER: '#00ffff',
        ENEMY: '#ff00ff',
        BULLET_PLAYER: '#ffff00',
        BULLET_ENEMY: '#ff0000',
        POWERUP: '#00ff00',
        BACKGROUND: '#000000',
        STAR: '#ffffff'
    },

    // Background settings
    BACKGROUND: {
        STAR_COUNT: 100,
        STAR_SPEED_MIN: 20,
        STAR_SPEED_MAX: 100,
        STAR_SIZE_MIN: 1,
        STAR_SIZE_MAX: 3
    },

    // Audio settings
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SFX_VOLUME: 0.7,
        MUSIC_VOLUME: 0.4
    },

    // Asset paths (will be used when we add sprites)
    ASSETS: {
        // Images
        PLAYER_SHIP: 'assets/images/player/ship.png',
        PLAYER_BULLET: 'assets/images/bullets/player-bullet.png',
        ENEMY_TYPE_1: 'assets/images/enemies/enemy-1.png',
        ENEMY_TYPE_2: 'assets/images/enemies/enemy-2.png',
        ENEMY_TYPE_3: 'assets/images/enemies/enemy-3.png',
        ENEMY_TYPE_4: 'assets/images/enemies/enemy-4.png',
        POWERUP_TRIPLE: 'assets/images/powerups/triple-shot.png',
        POWERUP_RAPID: 'assets/images/powerups/rapid-fire.png',
        POWERUP_SHIELD: 'assets/images/powerups/shield.png',
        POWERUP_BOMB: 'assets/images/powerups/bomb.png',
        EXPLOSION: 'assets/images/effects/explosion.png',
        BACKGROUND: 'assets/images/backgrounds/space.png',

        // Sounds
        SOUND_SHOOT: 'assets/sounds/sfx/shoot.wav',
        SOUND_EXPLOSION: 'assets/sounds/sfx/explosion.wav',
        SOUND_POWERUP: 'assets/sounds/sfx/powerup.wav',
        SOUND_HIT: 'assets/sounds/sfx/hit.wav',
        SOUND_SHIELD: 'assets/sounds/sfx/shield.wav',
        SOUND_BOMB: 'assets/sounds/sfx/bomb.wav',
        MUSIC_THEME: 'assets/sounds/music/theme.mp3'
    },

    // Power-up types
    POWERUP_TYPES: {
        TRIPLE_SHOT: 'triple-shot',
        RAPID_FIRE: 'rapid-fire',
        SHIELD: 'shield',
        BOMB: 'bomb'
    },

    // Enemy types
    ENEMY_TYPES: {
        BASIC: 'basic',
        FAST: 'fast',
        TANK: 'tank',
        ZIGZAG: 'zigzag'
    },

    // Game states
    STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover'
    },

    // Keyboard controls
    KEYS: {
        LEFT: ['ArrowLeft', 'KeyA'],
        RIGHT: ['ArrowRight', 'KeyD'],
        UP: ['ArrowUp', 'KeyW'],
        DOWN: ['ArrowDown', 'KeyS'],
        SHOOT: ['Space'],
        PAUSE: ['KeyP'],
        ENTER: ['Enter'],
        ESC: ['Escape']
    },

    // Debug settings
    DEBUG: {
        SHOW_FPS: false,
        SHOW_BOUNDS: false,
        SHOW_ENTITY_COUNT: false,
        INVINCIBLE: false
    }
};

export default Config;
