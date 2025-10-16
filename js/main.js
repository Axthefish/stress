/**
 * Main Application Module
 * Orchestrates all game modules and handles user interactions
 */

import { storage, isMobile, createRippleEffect, debounce } from './utils.js';
import audioManager from './AudioManager.js';
import physicsEngine from './PhysicsEngine.js';
import bubbleManager from './BubbleManager.js';

class StressResolveGame {
    constructor() {
        this.isInitialized = false;
        this.isFirstVisit = !storage.get('visited', false);
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        
        // UI elements
        this.elements = {};
        
        // Hold to generate state
        this.isHolding = false;
        this.holdTimer = null;
        this.holdIndicator = null;
        this.lastHoldX = 0;
        this.lastHoldY = 0;
    }

    /**
     * Initialize the game
     */
    async init() {
        if (this.isInitialized) return;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        console.log('Initializing Stress Resolve Game...');

        // Get UI elements
        this.cacheElements();

        // Initialize modules
        await this.initializeModules();

        // Setup event listeners
        this.setupEventListeners();

        // Setup update loop
        this.startUpdateLoop();

        // Handle first visit
        if (this.isFirstVisit) {
            this.showFirstVisitHint();
        }

        // Hide loading screen
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 500);

        this.isInitialized = true;
        console.log('Game initialized successfully!');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            gameContainer: document.getElementById('game-container'),
            bubbleContainer: document.getElementById('bubble-container'),
            popButton: document.getElementById('pop-button'),
            bubbleCount: document.getElementById('bubble-count'),
            hintText: document.getElementById('hint-text'),
            soundToggle: document.getElementById('sound-toggle'),
            soundIcon: document.getElementById('sound-icon'),
            infoButton: document.getElementById('info-button'),
            infoModal: document.getElementById('info-modal'),
            closeModal: document.getElementById('close-modal')
        };
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        // Initialize audio
        await audioManager.init();

        // Initialize bubble manager
        bubbleManager.init('bubble-container');

        // Update physics bounds
        physicsEngine.updateBounds();

        console.log('All modules initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Bubble creation on click/tap (single click)
        this.elements.bubbleContainer.addEventListener('click', (e) => {
            // Only create if not holding
            if (!this.isHolding) {
                this.handleBubbleCreate(e);
            }
        });

        // Hold to generate - Mouse events
        this.elements.bubbleContainer.addEventListener('mousedown', (e) => {
            this.handleHoldStart(e);
        });

        this.elements.bubbleContainer.addEventListener('mouseup', (e) => {
            this.handleHoldEnd(e);
        });

        this.elements.bubbleContainer.addEventListener('mouseleave', (e) => {
            this.handleHoldEnd(e);
        });

        this.elements.bubbleContainer.addEventListener('mousemove', (e) => {
            if (this.isHolding) {
                this.lastHoldX = e.clientX;
                this.lastHoldY = e.clientY;
                this.updateHoldIndicator(e.clientX, e.clientY);
            }
        });

        // Hold to generate - Touch events
        this.elements.bubbleContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.handleHoldStart({ clientX: touch.clientX, clientY: touch.clientY });
            }
            e.preventDefault();
        });

        this.elements.bubbleContainer.addEventListener('touchend', (e) => {
            this.handleHoldEnd(e);
            e.preventDefault();
        });

        this.elements.bubbleContainer.addEventListener('touchmove', (e) => {
            if (this.isHolding && e.touches.length > 0) {
                const touch = e.touches[0];
                this.lastHoldX = touch.clientX;
                this.lastHoldY = touch.clientY;
                this.updateHoldIndicator(touch.clientX, touch.clientY);
            }
            e.preventDefault();
        });

        // Pop all bubbles button
        this.elements.popButton.addEventListener('click', () => {
            this.handlePopAll();
        });

        // Sound toggle
        this.elements.soundToggle.addEventListener('click', () => {
            this.handleSoundToggle();
        });

        // Info modal
        this.elements.infoButton.addEventListener('click', () => {
            this.showInfoModal();
        });

        this.elements.closeModal.addEventListener('click', () => {
            this.hideInfoModal();
        });

        this.elements.infoModal.addEventListener('click', (e) => {
            if (e.target === this.elements.infoModal) {
                this.hideInfoModal();
            }
        });

        // Window resize
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Prevent context menu on long press (mobile)
        if (isMobile()) {
            this.elements.bubbleContainer.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
    }

    /**
     * Handle hold start
     */
    handleHoldStart(event) {
        this.isHolding = true;
        this.lastHoldX = event.clientX;
        this.lastHoldY = event.clientY;
        
        // Create first bubble immediately
        this.handleBubbleCreate(event);
        
        // Show hold indicator
        this.showHoldIndicator(event.clientX, event.clientY);
        
        // Start continuous generation
        const currentBubbleCount = bubbleManager.getBubbleCount();
        const generationInterval = currentBubbleCount > 100 ? 120 : 80; // Slower if many balls
        
        this.holdTimer = setInterval(() => {
            if (this.isHolding && bubbleManager.getBubbleCount() < bubbleManager.maxBubbles) {
                // Create bubble at current position
                bubbleManager.createBubble(this.lastHoldX, this.lastHoldY);
                this.updateBubbleCount();
            }
        }, generationInterval);
    }

    /**
     * Handle hold end
     */
    handleHoldEnd(event) {
        this.isHolding = false;
        
        // Clear interval
        if (this.holdTimer) {
            clearInterval(this.holdTimer);
            this.holdTimer = null;
        }
        
        // Hide hold indicator
        this.hideHoldIndicator();
    }

    /**
     * Show hold indicator
     */
    showHoldIndicator(x, y) {
        if (!this.holdIndicator) {
            this.holdIndicator = document.createElement('div');
            this.holdIndicator.className = 'hold-indicator';
            document.body.appendChild(this.holdIndicator);
        }
        
        this.holdIndicator.style.left = x + 'px';
        this.holdIndicator.style.top = y + 'px';
        this.holdIndicator.style.display = 'block';
    }

    /**
     * Update hold indicator position
     */
    updateHoldIndicator(x, y) {
        if (this.holdIndicator) {
            this.holdIndicator.style.left = x + 'px';
            this.holdIndicator.style.top = y + 'px';
        }
    }

    /**
     * Hide hold indicator
     */
    hideHoldIndicator() {
        if (this.holdIndicator) {
            this.holdIndicator.style.display = 'none';
        }
    }

    /**
     * Handle bubble creation
     */
    handleBubbleCreate(event) {
        const x = event.clientX;
        const y = event.clientY;

        // Create ripple effect
        createRippleEffect(x, y);

        // Create bubble
        bubbleManager.createBubble(x, y);

        // Force immediate UI update (bypass frame counter)
        this.updateBubbleCount();
        this.frameCounter = 0; // Reset frame counter to prevent immediate re-update

        // Hide hint after first bubble
        if (this.elements.hintText) {
            this.elements.hintText.classList.add('hidden');
        }
    }

    /**
     * Handle pop all bubbles
     */
    handlePopAll() {
        const count = bubbleManager.getBubbleCount();
        if (count === 0) return;

        // Add button animation
        gsap.to(this.elements.popButton, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });

        // Pop all bubbles
        bubbleManager.popAllBubbles();

        // Update UI after delay
        setTimeout(() => {
            this.updateBubbleCount();
        }, count * 20 + 1000);
    }

    /**
     * Handle sound toggle
     */
    handleSoundToggle() {
        const enabled = audioManager.toggle();
        this.elements.soundIcon.textContent = enabled ? '🔊' : '🔇';

        // Animate button
        gsap.to(this.elements.soundToggle, {
            scale: 1.2,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });

        // Save preference
        storage.set('soundEnabled', enabled);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const oldWidth = physicsEngine.bounds.width;
        const oldHeight = physicsEngine.bounds.height;
        
        // Update physics bounds
        physicsEngine.updateBounds();
        
        const newWidth = physicsEngine.bounds.width;
        const newHeight = physicsEngine.bounds.height;
        
        // Adjust bubble positions proportionally
        const widthRatio = newWidth / oldWidth;
        const heightRatio = newHeight / oldHeight;
        
        bubbleManager.bubbles.forEach(bubble => {
            // Scale position
            bubble.x = Math.max(bubble.size / 2, Math.min(newWidth - bubble.size / 2, bubble.x * widthRatio));
            bubble.y = Math.max(bubble.size / 2, Math.min(newHeight - bubble.size / 2, bubble.y * heightRatio));
            
            // Update visual position
            bubbleManager.updateBubblePosition(bubble);
            
            // Update physics body if exists
            if (bubble.physicsBody && physicsEngine.useMatterJS) {
                const { Body } = physicsEngine.Matter;
                Body.setPosition(bubble.physicsBody, { x: bubble.x, y: bubble.y });
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyPress(event) {
        switch (event.key.toLowerCase()) {
            case ' ':
            case 'enter':
                event.preventDefault();
                this.handlePopAll();
                break;
            case 'm':
                this.handleSoundToggle();
                break;
            case 'escape':
                this.hideInfoModal();
                break;
            case 'i':
            case '?':
                this.showInfoModal();
                break;
        }
    }

    /**
     * Update bubble count display
     */
    updateBubbleCount() {
        const count = bubbleManager.getBubbleCount();
        if (this.elements.bubbleCount) {
            this.elements.bubbleCount.textContent = count;
        }

        // Disable button if no bubbles
        if (count === 0) {
            this.elements.popButton.classList.add('disabled');
        } else {
            this.elements.popButton.classList.remove('disabled');
        }
    }

    /**
     * Show first visit hint
     */
    showFirstVisitHint() {
        if (this.elements.hintText) {
            this.elements.hintText.classList.remove('hidden');

            // Auto-hide after 5 seconds or first click
            setTimeout(() => {
                if (bubbleManager.getBubbleCount() === 0) {
                    gsap.to(this.elements.hintText, {
                        opacity: 0,
                        duration: 1,
                        onComplete: () => {
                            this.elements.hintText.classList.add('hidden');
                            this.elements.hintText.style.opacity = 1;
                        }
                    });
                }
            }, 5000);
        }

        // Mark as visited
        storage.set('visited', true);
    }

    /**
     * Show info modal
     */
    showInfoModal() {
        this.elements.infoModal.classList.remove('hidden');
        gsap.to(this.elements.infoModal, {
            opacity: 1,
            duration: 0.3
        });
    }

    /**
     * Hide info modal
     */
    hideInfoModal() {
        gsap.to(this.elements.infoModal, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                this.elements.infoModal.classList.add('hidden');
            }
        });
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
    }

    /**
     * Start update loop
     */
    startUpdateLoop() {
        this.lastFrameTime = performance.now();
        this.update();
    }

    /**
     * Main update loop
     */
    update() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Update physics
        physicsEngine.update(deltaTime);

        // Update bubble positions from physics engine
        bubbleManager.bubbles.forEach(bubble => {
            if (bubble.physicsEnabled && bubble.physicsBody) {
                bubbleManager.updateBubblePosition(bubble);
            }
        });

        // Update UI less frequently (every 10 frames = ~6 times per second)
        // This prevents flickering when rapidly clicking
        if (!this.frameCounter) this.frameCounter = 0;
        this.frameCounter++;
        if (this.frameCounter % 10 === 0) {
            this.updateBubbleCount();
        }

        // Request next frame
        this.animationFrameId = requestAnimationFrame(() => this.update());
    }

    /**
     * Stop update loop
     */
    stopUpdateLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Reset game
     */
    reset() {
        bubbleManager.clear();
        physicsEngine.reset();
        this.updateBubbleCount();
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.stopUpdateLoop();
        bubbleManager.destroy();
        physicsEngine.destroy();
        audioManager.destroy();
        this.isInitialized = false;
    }
}

// Create game instance
const game = new StressResolveGame();

// Initialize on load
game.init();

// Expose to window for debugging (optional)
if (typeof window !== 'undefined') {
    window.stressResolveGame = game;
}

export default game;

