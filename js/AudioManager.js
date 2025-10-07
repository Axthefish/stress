/**
 * Audio Manager Module
 * Manages all audio playback including background music and sound effects
 */

import { randomRange } from './utils.js';

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.initialized = false;
        this.audioContext = null;
        this.activeSounds = 0; // Track active sounds
        this.maxConcurrentSounds = 8; // Limit concurrent sounds
        this.soundQueue = []; // Queue for sounds when limit reached
        this.masterGain = null; // Master volume control
    }

    /**
     * Initialize audio system
     */
    async init() {
        if (this.initialized) return;

        try {
            // Create Web Audio Context for synthesized sounds
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7; // Slightly reduce overall volume
            this.masterGain.connect(this.audioContext.destination);
            
            // Unlock audio on iOS (requires user interaction)
            this.unlockAudio();
            
            this.initialized = true;
            console.log('AudioManager initialized successfully');
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
        }
    }

    /**
     * Unlock audio on iOS devices
     */
    unlockAudio() {
        const unlock = () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('touchend', unlock);
            document.removeEventListener('click', unlock);
        };

        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('touchend', unlock, { once: true });
        document.addEventListener('click', unlock, { once: true });
    }

    /**
     * Create a bubble pop sound using Web Audio API
     */
    createPopSound(options = {}) {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;
        
        // Check concurrent sound limit
        if (this.activeSounds >= this.maxConcurrentSounds) {
            return; // Skip sound if too many playing
        }

        const {
            frequency = randomRange(400, 800), // Lower, gentler frequencies
            duration = 0.15,
            volume = 0.08 // Even softer base volume
        } = options;

        try {
            this.activeSounds++;
            
            // Apply dynamic volume scaling based on concurrent sounds
            const volumeScale = Math.max(0.3, 1 - (this.activeSounds / this.maxConcurrentSounds) * 0.7);
            const adjustedVolume = volume * volumeScale;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Connect through master gain
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Configure oscillator (sine wave for soft, gentle pop)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(
                frequency * 0.5, // Gentler frequency drop
                this.audioContext.currentTime + duration
            );

            // Configure filter (lowpass for softer, rounder sound)
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, this.audioContext.currentTime); // Lower cutoff
            filter.Q.value = 1; // Softer rolloff

            // Configure gain (smooth fade out)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(adjustedVolume, this.audioContext.currentTime + 0.01); // Soft attack
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + duration
            );

            // Play sound
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            // Decrease active sound count when done
            setTimeout(() => {
                this.activeSounds = Math.max(0, this.activeSounds - 1);
            }, duration * 1000);
        } catch (error) {
            this.activeSounds = Math.max(0, this.activeSounds - 1);
            console.warn('Failed to create pop sound:', error);
        }
    }

    /**
     * Create a bubble creation sound
     */
    createBubbleSound() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Soft, high-pitched sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(
                1200,
                this.audioContext.currentTime + 0.05
            );

            // Very quiet
            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.05
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (error) {
            console.warn('Failed to create bubble sound:', error);
        }
    }

    /**
     * Create ambient background sound
     */
    createAmbientSound() {
        if (!this.enabled || !this.audioContext) return;

        try {
            // Create white noise for ambient sound
            const bufferSize = 2 * this.audioContext.sampleRate;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.audioContext.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            whiteNoise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Lowpass filter for softer sound
            filter.type = 'lowpass';
            filter.frequency.value = 400;

            // Very low volume
            gainNode.gain.value = 0.03;

            this.ambientSource = whiteNoise;
            this.ambientGain = gainNode;

            // Don't start automatically - let user enable it
            // whiteNoise.start();
        } catch (error) {
            console.warn('Failed to create ambient sound:', error);
        }
    }

    /**
     * Play pop sound with random variations
     */
    playPopSound() {
        const frequency = randomRange(400, 800); // Lower, gentler
        const duration = randomRange(0.12, 0.18); // Slightly longer
        const volume = randomRange(0.06, 0.12); // Even softer for better stacking
        this.createPopSound({ frequency, duration, volume });
    }

    /**
     * Play bubble creation sound
     */
    playBubbleCreateSound() {
        this.createBubbleSound();
    }

    /**
     * Play BGM (series of harmonious tones)
     */
    playPopBGM() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        // Play a gentle, harmonious chord progression
        const baseFrequencies = [
            261.63, // C4
            329.63, // E4
            392.00, // G4
            523.25  // C5
        ];

        baseFrequencies.forEach((freq, index) => {
            setTimeout(() => {
                // Use dedicated method to bypass concurrent sound limit
                this.createBackgroundTone(freq);
            }, index * 150); // Slower progression
        });
    }
    
    /**
     * Create background tone (bypasses concurrent sound limit)
     */
    createBackgroundTone(frequency) {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
            filter.Q.value = 1;

            const duration = 0.8;
            const volume = 0.05; // Very soft

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to create background tone:', error);
        }
    }

    /**
     * Create gentle whoosh sound effect (instead of harsh explosion)
     */
    playExplosionSound() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        try {
            const duration = 0.8;
            
            // Create gentle filtered noise (like a soft breeze)
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                // Gentler noise with smooth envelope
                const envelope = Math.exp(-i / (bufferSize * 0.4));
                output[i] = (Math.random() * 2 - 1) * envelope * 0.2; // Even quieter
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain); // Connect through master gain

            // Very gentle lowpass filter
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
            filter.Q.value = 0.5; // Soft rolloff

            // Very soft volume - reduced even more
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.04, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

            source.start();
            source.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to create whoosh sound:', error);
        }
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set audio enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if audio is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Start ambient sound
     */
    startAmbient() {
        if (this.ambientSource && !this.ambientPlaying) {
            this.ambientSource.start();
            this.ambientPlaying = true;
        }
    }

    /**
     * Stop ambient sound
     */
    stopAmbient() {
        if (this.ambientSource && this.ambientPlaying) {
            this.ambientSource.stop();
            this.ambientPlaying = false;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.ambientSource) {
            try {
                this.ambientSource.stop();
            } catch (e) {
                // Already stopped
            }
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Create singleton instance
const audioManager = new AudioManager();

export default audioManager;

