/**
 * AudioSystem - Sound Effects and Music Management
 * Handles all game audio with HTML5 Audio API
 */

import Config from '../core/Config.js';

class AudioSystem {
    constructor() {
        // Audio enabled state
        this.enabled = true;
        this.sfxEnabled = true;
        this.musicEnabled = true;

        // Volume levels
        this.masterVolume = Config.AUDIO.MASTER_VOLUME;
        this.sfxVolume = Config.AUDIO.SFX_VOLUME;
        this.musicVolume = Config.AUDIO.MUSIC_VOLUME;

        // Sound effects library
        this.sounds = {};
        this.music = null;

        // Pool of audio objects for overlapping sounds
        this.soundPools = {};

        // Initialize with placeholder sounds (web audio API)
        this.useWebAudio = true;
        this.audioContext = null;

        // Initialize audio context (for procedural sounds)
        this.initAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.useWebAudio = true;
            }
        } catch (e) {
            console.warn('Web Audio API not supported, using HTML5 Audio');
            this.useWebAudio = false;
        }
    }

    /**
     * Load sound from file
     */
    loadSound(name, path, poolSize = 3) {
        if (!this.enabled) return;

        // Create pool for overlapping sounds
        this.soundPools[name] = [];

        for (let i = 0; i < poolSize; i++) {
            const audio = new Audio(path);
            audio.volume = this.sfxVolume * this.masterVolume;
            audio.preload = 'auto';

            this.soundPools[name].push({
                audio: audio,
                playing: false
            });
        }

        this.sounds[name] = path;
    }

    /**
     * Play sound effect
     */
    playSound(name, volume = 1.0) {
        if (!this.enabled || !this.sfxEnabled) return;

        // Check if sound exists
        if (!this.soundPools[name]) {
            // Use procedural sound if no file loaded
            this.playProceduralSound(name);
            return;
        }

        // Find available audio instance from pool
        const pool = this.soundPools[name];
        const available = pool.find(item => !item.playing);

        if (available) {
            available.audio.volume = this.sfxVolume * this.masterVolume * volume;
            available.audio.currentTime = 0;
            available.playing = true;

            available.audio.play().catch(e => {
                console.warn('Audio play failed:', e);
            });

            // Mark as not playing when finished
            available.audio.onended = () => {
                available.playing = false;
            };
        }
    }

    /**
     * Play procedural sound (fallback)
     */
    playProceduralSound(name) {
        if (!this.useWebAudio || !this.audioContext) return;

        const ctx = this.audioContext;

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                this.playProceduralSoundInternal(name, ctx);
            }).catch(err => {
                console.warn('Failed to resume audio context:', err);
            });
            return;
        }

        this.playProceduralSoundInternal(name, ctx);
    }

    /**
     * Internal method to play procedural sounds
     */
    playProceduralSoundInternal(name, ctx) {
        const now = ctx.currentTime;

        switch (name) {
            case 'shoot':
                this.synthesizeShoot(ctx, now);
                break;
            case 'explosion':
                this.synthesizeExplosion(ctx, now);
                break;
            case 'hit':
                this.synthesizeHit(ctx, now);
                break;
            case 'powerup':
                this.synthesizePowerup(ctx, now);
                break;
            case 'menu_select':
                this.synthesizeMenuSelect(ctx, now);
                break;
            case 'menu_navigate':
                this.synthesizeMenuNavigate(ctx, now);
                break;
            default:
                console.warn(`Unknown procedural sound: ${name}`);
        }
    }

    /**
     * Synthesize shoot sound
     */
    synthesizeShoot(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Laser-like sound
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    /**
     * Synthesize explosion sound
     */
    synthesizeExplosion(ctx, time) {
        // Noise-based explosion
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        noise.buffer = buffer;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Filter sweep
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, time);
        filter.frequency.exponentialRampToValueAtTime(50, time + 0.5);

        // Envelope
        gain.gain.setValueAtTime(0.5 * this.sfxVolume * this.masterVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        noise.start(time);
        noise.stop(time + 0.5);
    }

    /**
     * Synthesize hit sound
     */
    synthesizeHit(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Impact sound
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.15);

        gain.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc.start(time);
        osc.stop(time + 0.15);
    }

    /**
     * Synthesize powerup sound
     */
    synthesizePowerup(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Rising arpeggio
        osc.frequency.setValueAtTime(400, time);
        osc.frequency.setValueAtTime(500, time + 0.1);
        osc.frequency.setValueAtTime(600, time + 0.2);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, time);
        gain.gain.setValueAtTime(0, time + 0.3);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    /**
     * Play background music
     */
    playMusic(path = null, loop = true) {
        if (!this.enabled || !this.musicEnabled) return;

        if (this.music) {
            this.music.pause();
        }

        if (path) {
            this.music = new Audio(path);
            this.music.volume = this.musicVolume * this.masterVolume;
            this.music.loop = loop;

            this.music.play().catch(e => {
                console.warn('Music play failed:', e);
            });
        }
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Set SFX volume
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }
    }

    /**
     * Update all audio volumes
     */
    updateAllVolumes() {
        // Update music
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }

        // Update sound effect pools
        Object.values(this.soundPools).forEach(pool => {
            pool.forEach(item => {
                item.audio.volume = this.sfxVolume * this.masterVolume;
            });
        });
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }

    /**
     * Enable/disable SFX
     */
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
    }

    /**
     * Enable/disable music
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }

    /**
     * Synthesize menu select sound
     */
    synthesizeMenuSelect(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Confirm sound
        osc.frequency.setValueAtTime(600, time);
        osc.frequency.setValueAtTime(800, time + 0.05);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    /**
     * Synthesize menu navigate sound
     */
    synthesizeMenuNavigate(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Blip sound
        osc.frequency.setValueAtTime(400, time);

        gain.gain.setValueAtTime(0.15 * this.sfxVolume * this.masterVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    /**
     * Resume audio context (for browser autoplay policy)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume().catch(err => {
                console.warn('Failed to resume audio context:', err);
            });
        }
        return Promise.resolve();
    }
}

export default AudioSystem;
