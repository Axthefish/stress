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
     * Create a bubble pop sound - Enhanced for more impact
     */
    createPopSound(options = {}) {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;
        
        // Check concurrent sound limit
        if (this.activeSounds >= this.maxConcurrentSounds) {
            return; // Skip sound if too many playing
        }

        const {
            frequency = randomRange(600, 1200), // Higher, crisper frequencies (was 400-800)
            duration = 0.15,
            volume = 0.20 // 3x boost from 0.08 to 0.20
        } = options;

        try {
            this.activeSounds++;
            
            // Apply dynamic volume scaling based on concurrent sounds
            const volumeScale = Math.max(0.3, 1 - (this.activeSounds / this.maxConcurrentSounds) * 0.7);
            const adjustedVolume = volume * volumeScale;
            
            const oscillator = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator(); // High frequency harmonic
            const gainNode = this.audioContext.createGain();
            const gainNode2 = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Connect through master gain
            oscillator.connect(filter);
            oscillator2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(gainNode2);
            gainNode2.connect(this.masterGain);

            // Configure main oscillator (sine wave for pop)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(
                frequency * 0.4,
                this.audioContext.currentTime + duration
            );

            // Configure high harmonic (2x frequency for brightness)
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(
                frequency * 0.8,
                this.audioContext.currentTime + duration
            );

            // Configure filter (bandpass for crisp, punchy sound)
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime); // Higher cutoff
            filter.Q.value = 1.5;

            // Configure gain (smooth fade out)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(adjustedVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + duration
            );

            gainNode2.gain.setValueAtTime(adjustedVolume * 0.3, this.audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + duration * 0.7
            );

            // Play sounds
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            oscillator2.start(this.audioContext.currentTime);
            oscillator2.stop(this.audioContext.currentTime + duration);
            
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
     * Create a bubble creation sound - Enhanced
     */
    createBubbleSound() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Crisp, high-pitched sound (1200-1600Hz)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(randomRange(1200, 1600), this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(
                1800,
                this.audioContext.currentTime + 0.08
            );

            // Louder - 0.15 volume
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + 0.08
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.08);
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
     * Play pop sound with random variations - Enhanced
     */
    playPopSound() {
        const frequency = randomRange(600, 1200); // Higher, crisper
        const duration = randomRange(0.12, 0.18);
        const volume = randomRange(0.15, 0.25); // Much louder
        this.createPopSound({ frequency, duration, volume });
    }

    /**
     * Play bubble creation sound
     */
    playBubbleCreateSound() {
        this.createBubbleSound();
    }

    /**
     * Play BGM - Enhanced with louder chords
     */
    playPopBGM() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        // Play harmonious chord progression - louder
        const baseFrequencies = [
            261.63, // C4
            329.63, // E4
            392.00, // G4
            523.25  // C5
        ];

        baseFrequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createBackgroundTone(freq, 0.12); // Increased from 0.05 to 0.12
            }, index * 150);
        });
    }
    
    /**
     * Create background tone - Enhanced volume
     */
    createBackgroundTone(frequency, volume = 0.12) {
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
     * Play powerful BOOM explosion sound
     */
    playExplosionSound() {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        try {
            const duration = 0.8;
            
            // Create powerful noise burst
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                // Powerful noise with sharp attack
                const envelope = Math.exp(-i / (bufferSize * 0.3));
                output[i] = (Math.random() * 2 - 1) * envelope * 0.5;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;

            // Low frequency boom
            const lowOsc = this.audioContext.createOscillator();
            lowOsc.type = 'sine';
            lowOsc.frequency.setValueAtTime(80, this.audioContext.currentTime);
            lowOsc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + duration);

            // Mid frequency burst
            const midOsc = this.audioContext.createOscillator();
            midOsc.type = 'sawtooth';
            midOsc.frequency.setValueAtTime(600, this.audioContext.currentTime);
            midOsc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);

            const gainNode = this.audioContext.createGain();
            const lowGain = this.audioContext.createGain();
            const midGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            source.connect(filter);
            lowOsc.connect(lowGain);
            midOsc.connect(midGain);
            filter.connect(gainNode);
            lowGain.connect(gainNode);
            midGain.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Filter for punch
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + duration);
            filter.Q.value = 2;

            // Powerful volume - 0.15
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

            lowGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            lowGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration * 0.5);

            midGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            midGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration * 0.3);

            source.start();
            source.stop(this.audioContext.currentTime + duration);
            lowOsc.start();
            lowOsc.stop(this.audioContext.currentTime + duration);
            midOsc.start();
            midOsc.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to create explosion sound:', error);
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
     * Play combo sound based on level
     */
    playComboSound(level = 1) {
        if (!this.enabled || !this.audioContext || !this.masterGain) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Different pitches for different combo levels
            const frequencies = {
                1: [523.25, 659.25, 783.99], // C5, E5, G5 - NICE
                2: [659.25, 783.99, 987.77], // E5, G5, B5 - AMAZING
                3: [783.99, 987.77, 1174.66] // G5, B5, D6 - INSANE
            };

            const chordFreqs = frequencies[level] || frequencies[1];
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(chordFreqs[0], this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(chordFreqs[1], this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(chordFreqs[2], this.audioContext.currentTime + 0.2);

            const duration = 0.6;
            const volume = 0.15;

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to create combo sound:', error);
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

