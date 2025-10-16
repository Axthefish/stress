/**
 * Bubble Manager Module
 * Manages bubble creation, animation, and destruction
 */

import { 
    randomRange, 
    randomInt, 
    randomChoice, 
    randomHSL, 
    generateUniqueId,
    generateBlobPath,
    createParticle,
    getViewport
} from './utils.js';
import audioManager from './AudioManager.js';
import physicsEngine from './PhysicsEngine.js';

class BubbleManager {
    constructor() {
        this.bubbles = [];
        this.container = null;
        this.maxBubbles = 150;
        this.isPopping = false;
        this.shapes = ['circle', 'ellipse', 'blob'];
        this.bubbleCount = 0;
    }

    /**
     * Initialize bubble manager
     */
    init(containerId = 'bubble-container') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Bubble container not found');
            return false;
        }
        return true;
    }

    /**
     * Create a new bubble at specified position
     */
    createBubble(x, y) {
        // Check max bubbles limit
        if (this.bubbles.length >= this.maxBubbles) {
            this.removeOldestBubble();
        }

        const bubble = this.generateBubbleData(x, y);
        const element = this.createBubbleElement(bubble);
        
        bubble.element = element;
        this.container.appendChild(element);
        
        // Add to bubbles array
        this.bubbles.push(bubble);
        
        // Animate creation (pop in)
        this.animateBubbleCreation(bubble);
        
        // Add to physics engine after a short delay (let pop-in animation complete)
        setTimeout(() => {
            physicsEngine.addBubble(bubble);
            this.startBounceDetection(bubble);
        }, 300);
        
        // Play creation sound
        audioManager.playBubbleCreateSound();
        
        // Update counter
        this.bubbleCount++;
        
        return bubble;
    }

    /**
     * Generate bubble data
     */
    generateBubbleData(x, y) {
        // Mostly circles for bouncy ball feel
        const shapeWeights = ['circle', 'circle', 'circle', 'circle', 'ellipse'];
        const shape = randomChoice(shapeWeights);
        const size = randomRange(50, 100); // Medium size for satisfying physics
        
        // Vibrant candy colors (high saturation, medium-bright lightness)
        const colorPalettes = [
            randomHSL(330, 350, 95, 60),  // Neon Pink
            randomHSL(270, 290, 95, 60),  // Magic Purple
            randomHSL(200, 220, 95, 55),  // Electric Blue
            randomHSL(140, 160, 95, 55),  // Fluorescent Green
            randomHSL(20, 40, 95, 60),    // Passionate Orange
        ];
        
        return {
            id: generateUniqueId(),
            x: x,
            y: y,
            shape: shape,
            size: size,
            color: randomChoice(colorPalettes),
            opacity: randomRange(0.9, 0.95), // High visibility
            rotation: randomRange(0, 360),
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            createdAt: Date.now(),
            bounceCount: 0 // Track number of bounces
        };
    }

    /**
     * Create bubble DOM element
     */
    createBubbleElement(bubble) {
        const element = document.createElement('div');
        element.className = `bubble ${bubble.shape}`;
        element.id = bubble.id;
        
        const adjustedSize = bubble.size * (bubble.shape === 'ellipse' ? 1.3 : 1);
        
        element.style.cssText = `
            width: ${bubble.size}px;
            height: ${adjustedSize}px;
            left: ${bubble.x - bubble.size / 2}px;
            top: ${bubble.y - adjustedSize / 2}px;
            color: ${bubble.color};
            opacity: ${bubble.opacity};
            transform: rotate(${bubble.rotation}deg) scale(0);
            transition: none;
        `;
        
        // For blob shapes, use clip-path
        if (bubble.shape === 'blob') {
            const points = randomInt(6, 8);
            const pathData = this.generateBlobClipPath(points);
            element.style.clipPath = pathData;
            element.style.borderRadius = '45%';
        }
        
        return element;
    }

    /**
     * Generate blob clip-path
     */
    generateBlobClipPath(points) {
        const values = [];
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * 360;
            const radius = randomRange(40, 60);
            values.push(`${50 + radius * Math.cos(angle * Math.PI / 180)}% ${50 + radius * Math.sin(angle * Math.PI / 180)}%`);
        }
        return `polygon(${values.join(', ')})`;
    }

    /**
     * Animate bubble creation - Exaggerated pop-in with rotation
     */
    animateBubbleCreation(bubble) {
        const randomRotation = randomRange(0, 360);
        gsap.to(bubble.element, {
            scale: 1,
            rotation: randomRotation,
            duration: 0.5,
            ease: "back.out(2.5)",
            keyframes: [
                { scale: 1.2, duration: 0.25 },
                { scale: 1, duration: 0.25 }
            ]
        });
    }

    /**
     * Start bounce detection for landing squash effect
     */
    startBounceDetection(bubble) {
        let lastY = bubble.y;
        let lastVelocityY = 0;
        
        const checkBounce = () => {
            if (!bubble.physicsBody || !bubble.element) return;
            
            const currentY = bubble.physicsBody.position.y;
            const currentVelocityY = bubble.physicsBody.velocity.y;
            
            // Detect bounce (velocity changes from positive to negative)
            if (lastVelocityY > 3 && currentVelocityY < -0.5) {
                this.animateLandingSquash(bubble, lastVelocityY);
                bubble.bounceCount++;
            }
            
            lastY = currentY;
            lastVelocityY = currentVelocityY;
            
            // Continue checking
            if (bubble.physicsEnabled) {
                requestAnimationFrame(checkBounce);
            }
        };
        
        checkBounce();
    }
    
    /**
     * Animate landing squash effect - Enhanced deformation
     */
    animateLandingSquash(bubble, impactVelocity) {
        if (!bubble.element) return;
        
        // Calculate squash amount based on impact velocity - increased from 0.25 to 0.4
        const squashAmount = Math.min(impactVelocity / 20, 0.4);
        const scaleX = 1 + squashAmount;
        const scaleY = 1 - squashAmount;
        
        // Squash - increased duration from 0.1 to 0.15
        gsap.to(bubble.element, {
            scaleX: scaleX,
            scaleY: scaleY,
            duration: 0.15,
            ease: "power2.out",
            onComplete: () => {
                // Stretch back - stronger elastic recovery
                gsap.to(bubble.element, {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 0.35,
                    ease: "elastic.out(1, 0.5)"
                });
            }
        });
    }
    

    /**
     * Update bubble visual position
     */
    updateBubblePosition(bubble) {
        if (!bubble.element) return;
        
        // Get physics position if available
        const pos = physicsEngine.getBubblePosition(bubble);
        
        const adjustedSize = bubble.size * (bubble.shape === 'ellipse' ? 1.3 : 1);
        
        bubble.element.style.left = `${pos.x - bubble.size / 2}px`;
        bubble.element.style.top = `${pos.y - adjustedSize / 2}px`;
    }

    /**
     * Remove oldest bubble
     */
    removeOldestBubble() {
        if (this.bubbles.length > 0) {
            this.removeBubble(this.bubbles[0].id);
        }
    }

    /**
     * Remove a specific bubble
     */
    removeBubble(bubbleId) {
        const index = this.bubbles.findIndex(b => b.id === bubbleId);
        if (index === -1) return;
        
        const bubble = this.bubbles[index];
        
        // Remove from physics
        physicsEngine.removeBubble(bubble);
        
        // Remove element
        if (bubble.element && bubble.element.parentNode) {
            bubble.element.remove();
        }
        
        // Remove from array
        this.bubbles.splice(index, 1);
    }

    /**
     * Pop all bubbles with CASCADE EXPLOSION - each bubble has its own effect
     */
    popAllBubbles() {
        if (this.isPopping || this.bubbles.length === 0) return;
        
        this.isPopping = true;
        
        // Calculate center of mass for shockwave origin
        const bubblesToPop = [...this.bubbles];
        const centerX = bubblesToPop.reduce((sum, b) => sum + b.x, 0) / bubblesToPop.length;
        const centerY = bubblesToPop.reduce((sum, b) => sum + b.y, 0) / bubblesToPop.length;
        
        // Sort bubbles by distance from center (closest explode first for ripple effect)
        bubblesToPop.sort((a, b) => {
            const distA = Math.sqrt((a.x - centerX) ** 2 + (a.y - centerY) ** 2);
            const distB = Math.sqrt((b.x - centerX) ** 2 + (b.y - centerY) ** 2);
            return distA - distB;
        });
        
        // === PHASE 1: ANTICIPATION (蓄力) ===
        bubblesToPop.forEach(bubble => {
            if (bubble.element) {
                gsap.to(bubble.element, {
                    scale: 0.8,
                    duration: 0.12,
                    ease: "power2.in"
                });
            }
        });
        
        setTimeout(() => {
            // === PHASE 2: CASCADE EXPLOSION (连锁爆炸) ===
            
            // Haptic feedback (mobile)
            this.triggerHapticFeedback(bubblesToPop.length);
            
            // Screen flash - enhanced
            this.createScreenFlash(bubblesToPop.length, centerX, centerY);
            
            // Screen shake - enhanced
            this.createScreenShake(bubblesToPop.length);
            
            // Initial shockwave from center
            this.createImpactShockwave(centerX, centerY);
            
            // Play sounds
            audioManager.playPopBGM();
            audioManager.playExplosionSound();
            
            // Show combo text based on count
            this.showComboText(bubblesToPop.length);
            
            // Cascade explosion - each bubble explodes individually with slight delay
            this.explodeCascade(bubblesToPop);
            
            // Reset state
            setTimeout(() => {
                this.isPopping = false;
            }, 1500);
            
        }, 120); // Anticipation delay
    }
    
    /**
     * Trigger haptic feedback on mobile devices - Enhanced
     */
    triggerHapticFeedback(count = 0) {
        // Vibration API for mobile devices
        if (navigator.vibrate) {
            // Pattern: [vibrate, pause, vibrate] - stronger pattern
            // Adjust intensity based on ball count
            let pattern = [100, 50, 150];
            if (count > 50) {
                pattern = [150, 50, 200]; // Stronger for large explosions
            }
            navigator.vibrate(pattern);
        }
        
        // iOS Haptic Feedback (if available)
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
            window.webkit.messageHandlers.haptic.postMessage('impact');
        }
    }
    
    /**
     * Screen flash effect - Enhanced brightness and duration
     */
    createScreenFlash(count = 0, centerX = window.innerWidth / 2, centerY = window.innerHeight / 2) {
        const flash = document.createElement('div');
        const centerPercent = `${(centerX / window.innerWidth) * 100}% ${(centerY / window.innerHeight) * 100}%`;
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle at ${centerPercent}, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
        `;
        document.body.appendChild(flash);
        
        // Stronger, longer flash
        gsap.to(flash, {
            opacity: 1,
            duration: 0.08,
            onComplete: () => {
                gsap.to(flash, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => flash.remove()
                });
            }
        });
        
        // Multiple flashes for large explosions
        if (count > 50) {
            setTimeout(() => {
                const flash2 = document.createElement('div');
                flash2.style.cssText = flash.style.cssText;
                document.body.appendChild(flash2);
                gsap.to(flash2, {
                    opacity: 0.7,
                    duration: 0.05,
                    onComplete: () => {
                        gsap.to(flash2, {
                            opacity: 0,
                            duration: 0.4,
                            ease: "power2.out",
                            onComplete: () => flash2.remove()
                        });
                    }
                });
            }, 150);
        }
    }
    
    /**
     * Screen shake effect - Enhanced amplitude and pattern
     */
    createScreenShake(count = 0) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        // Stronger shake with decreasing amplitude
        const timeline = gsap.timeline({
            onComplete: () => {
                gsap.set(container, { x: 0, y: 0 });
            }
        });
        
        // Large to small shake pattern - 8-10 shakes
        const shakes = [
            { x: 20, y: 15, duration: 0.04 },
            { x: -18, y: -12, duration: 0.04 },
            { x: 15, y: 10, duration: 0.04 },
            { x: -12, y: -8, duration: 0.04 },
            { x: 10, y: 6, duration: 0.04 },
            { x: -8, y: -4, duration: 0.04 },
            { x: 5, y: 3, duration: 0.04 },
            { x: -3, y: -2, duration: 0.04 },
            { x: 0, y: 0, duration: 0.04 }
        ];
        
        shakes.forEach(shake => {
            timeline.to(container, shake);
        });
    }
    
    /**
     * Impact shockwave - powerful and fast (optimized)
     */
    createImpactShockwave(x, y) {
        // Create 3 rings for more impact
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ring = document.createElement('div');
                ring.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: 60px;
                    height: 60px;
                    border: 3px solid rgba(255, 255, 255, ${0.8 - i * 0.2});
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    z-index: 10000;
                    will-change: transform, opacity;
                `;
                document.body.appendChild(ring);
                
                gsap.to(ring, {
                    width: '+=700',
                    height: '+=700',
                    borderWidth: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => ring.remove()
                });
            }, i * 50);
        }
    }
    
    /**
     * Cascade explosion - Optimized timing for better visual clarity
     */
    explodeCascade(bubblesToPop) {
        const totalBubbles = bubblesToPop.length;
        
        // Optimized timing - slower to see each explosion
        let delayPerBubble = 10; // Default 10ms
        let soundInterval = 5;
        
        // Adjust timing for large numbers
        if (totalBubbles > 50) {
            delayPerBubble = 5; // Faster cascade for very large numbers
            soundInterval = 10;
        } else if (totalBubbles > 20) {
            delayPerBubble = 7;
            soundInterval = 8;
        }
        
        bubblesToPop.forEach((bubble, index) => {
            setTimeout(() => {
                if (!bubble.element) return;
                
                // Pass total count for performance scaling
                this.explodeSingleBubbleEnhanced(bubble, index, totalBubbles);
                
                // Occasional pop sound (less frequent for large numbers)
                if (index % soundInterval === 0) {
                    audioManager.playPopSound();
                }
            }, index * delayPerBubble);
        });
    }
    
    /**
     * Enhanced single bubble explosion with maximum visual impact
     * Now with dynamic performance scaling
     */
    explodeSingleBubbleEnhanced(bubble, index, totalBubbles = 0) {
        if (!bubble.element) return;
        
        // Remove from physics
        physicsEngine.removeBubble(bubble);
        
        // Get position
        const rect = bubble.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // === PERFORMANCE SCALING ===
        // Reduce effect density for large numbers of bubbles
        const isHighDensity = totalBubbles > 30;
        const isVeryHighDensity = totalBubbles > 50;
        
        // === VISUAL EFFECT 1: Bright Flash Ring ===
        // Skip some flash rings when there are many bubbles
        if (!isVeryHighDensity || index % 2 === 0) {
            this.createBubbleFlashRing(centerX, centerY, bubble.color, bubble.size);
        }
        
        // === VISUAL EFFECT 2: Explosive Burst ===
        // Quick expand then explode
        gsap.to(bubble.element, {
            scale: 1.8,
            duration: 0.08,
            ease: "power2.out",
            onComplete: () => {
                // Shatter into pieces effect
                gsap.to(bubble.element, {
                    scale: 2.5,
                    opacity: 0,
                    duration: 0.15,
                    ease: "power2.in",
                    onComplete: () => {
                        if (bubble.element && bubble.element.parentNode) {
                            bubble.element.remove();
                        }
                    }
                });
            }
        });
        
        // === VISUAL EFFECT 3: Radial Particles ===
        // Reduce particle count for high density
        const particleCount = isVeryHighDensity ? 2 : (isHighDensity ? 3 : 4);
        this.createRadialBurst(centerX, centerY, bubble.color, bubble.size, particleCount);
        
        // === VISUAL EFFECT 4: Energy Ring ===
        // Reduce energy ring probability for large numbers
        let energyRingChance = 0.5; // 50% default
        if (isVeryHighDensity) {
            energyRingChance = 0.2; // 20% for very high density
        } else if (isHighDensity) {
            energyRingChance = 0.3; // 30% for high density
        }
        
        if (Math.random() < energyRingChance) {
            this.createEnergyRing(centerX, centerY, bubble.color);
        }
        
        // Remove from array
        const arrayIndex = this.bubbles.indexOf(bubble);
        if (arrayIndex > -1) {
            this.bubbles.splice(arrayIndex, 1);
        }
    }
    
    /**
     * Create bright flash ring on bubble explosion - Longer duration
     */
    createBubbleFlashRing(x, y, color, size) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,255,255,1) 0%, ${color} 50%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9998;
            will-change: transform, opacity;
            box-shadow: 0 0 30px ${color};
        `;
        document.body.appendChild(flash);
        
        gsap.to(flash, {
            scale: 4,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => flash.remove()
        });
    }
    
    /**
     * Create radial particle burst - Enhanced size and count
     */
    createRadialBurst(x, y, color, size, particleCount = 4) {
        // Larger particles for more impact - 12-24px range
        const particleSize = randomRange(12, 24);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
            const distance = randomRange(60, 120);
            
            const particle = createParticle(x, y, color, particleSize);
            particle.style.boxShadow = `0 0 ${particleSize * 3}px ${color}`;
            document.body.appendChild(particle);
            
            const tx = x + Math.cos(angle) * distance;
            const ty = y + Math.sin(angle) * distance;
            
            gsap.to(particle, {
                x: tx - x,
                y: ty - y,
                opacity: 0,
                scale: 0,
                duration: 0.5,
                ease: "power1.out",
                onComplete: () => particle.remove()
            });
        }
    }
    
    /**
     * Create energy ring effect (optimized)
     */
    createEnergyRing(x, y, color) {
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 30px;
            height: 30px;
            border: 2px solid ${color};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9997;
            box-shadow: 0 0 10px ${color};
            will-change: transform, opacity;
        `;
        document.body.appendChild(ring);
        
        gsap.to(ring, {
            width: '+=100',
            height: '+=100',
            opacity: 0,
            borderWidth: 0,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => ring.remove()
        });
    }
    
    /**
     * Fast particles - minimal but impactful
     */
    createFastParticles(x, y, color) {
        // Only 4-6 particles per bubble
        const count = randomInt(4, 6);
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const distance = randomRange(100, 200);
            const size = randomRange(5, 10);
            
            const particle = createParticle(x, y, color, size);
            particle.style.willChange = 'transform, opacity';
            document.body.appendChild(particle);
            
            // Ultra-fast particle burst
            const tx = x + Math.cos(angle) * distance;
            const ty = y + Math.sin(angle) * distance - 80;
            
            gsap.to(particle, {
                x: tx - x,
                y: ty - y,
                opacity: 0,
                scale: 0.3,
                duration: 0.4,
                ease: "power1.out",
                onComplete: () => particle.remove()
            });
        }
    }

    /**
     * Pop a single bubble - optimized
     */
    popBubble(bubble) {
        if (!bubble.element) return;
        
        // Kill all animations
        if (bubble.riseTween) bubble.riseTween.kill();
        if (bubble.rotateTween) bubble.rotateTween.kill();
        if (bubble.floatTween) bubble.floatTween.kill();
        
        // Get current position
        const rect = bubble.element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Faster, simpler pop animation
        gsap.to(bubble.element, {
            scale: 1.2,
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
                if (bubble.element && bubble.element.parentNode) {
                    bubble.element.remove();
                }
            }
        });
        
        // Simpler particle effect (less particles = better performance)
        this.createSimpleExplosion(x, y, bubble.color, bubble.size);
        
        // Play pop sound
        audioManager.playPopSound();
        
        // Remove from physics
        physicsEngine.removeBubble(bubble);
        
        // Remove from array
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
            this.bubbles.splice(index, 1);
        }
    }

    /**
     * Create particle explosion effect
     */
    createParticleExplosion(x, y, color, bubbleSize) {
        const particleCount = Math.min(Math.floor(bubbleSize / 8), 16);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = randomRange(50, 120);
            const size = randomRange(4, 10);
            
            const particle = createParticle(x, y, color, size);
            document.body.appendChild(particle);
            
            gsap.to(particle, {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                opacity: 0,
                scale: 0,
                duration: randomRange(0.6, 1),
                ease: "power2.out",
                onComplete: () => particle.remove()
            });
        }
    }
    
    /**
     * Create simple explosion - lighter on performance
     */
    createSimpleExplosion(x, y, color, bubbleSize) {
        const particleCount = Math.min(Math.floor(bubbleSize / 10), 12); // Fewer particles
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = randomRange(40, 80);
            const size = randomRange(4, 8);
            
            const particle = createParticle(x, y, color, size);
            document.body.appendChild(particle);
            
            gsap.to(particle, {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                opacity: 0,
                scale: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => particle.remove()
            });
        }
    }
    
    /**
     * Create enhanced explosion with shockwave (kept for reference)
     */
    createEnhancedExplosion(x, y, color, bubbleSize) {
        // Create shockwave ring
        const shockwave = document.createElement('div');
        shockwave.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${bubbleSize}px;
            height: ${bubbleSize}px;
            border: 3px solid ${color};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(shockwave);
        
        gsap.to(shockwave, {
            scale: 3,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => shockwave.remove()
        });
        
        // Create multiple particle rings
        const particleCount = Math.min(Math.floor(bubbleSize / 6), 24);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = randomRange(60, 140);
            const size = randomRange(5, 12);
            
            const particle = createParticle(x, y, color, size);
            document.body.appendChild(particle);
            
            // Vary animation for more natural effect
            const duration = randomRange(0.4, 0.8);
            const finalDistance = distance + randomRange(-20, 20);
            
            gsap.to(particle, {
                x: x + Math.cos(angle) * finalDistance,
                y: y + Math.sin(angle) * finalDistance + randomRange(-30, 30),
                opacity: 0,
                scale: 0,
                rotation: randomRange(-180, 180),
                duration: duration,
                ease: "power2.out",
                onComplete: () => particle.remove()
            });
        }
        
        // Add some sparkle particles
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = randomRange(30, 80);
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 10px white;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(sparkle);
            
            gsap.to(sparkle, {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                opacity: 0,
                scale: 0,
                duration: randomRange(0.3, 0.6),
                ease: "power2.out",
                onComplete: () => sparkle.remove()
            });
        }
    }


    /**
     * Get current bubble count
     */
    getBubbleCount() {
        return this.bubbles.length;
    }

    /**
     * Get total bubbles created
     */
    getTotalCreated() {
        return this.bubbleCount;
    }

    /**
     * Clear all bubbles
     */
    clear() {
        this.bubbles.forEach(bubble => {
            if (bubble.element && bubble.element.parentNode) {
                bubble.element.remove();
            }
            physicsEngine.removeBubble(bubble);
        });
        this.bubbles = [];
    }

    /**
     * Show combo text based on bubble count
     */
    showComboText(count) {
        let text = '';
        let colorClass = '';
        
        if (count >= 100) {
            text = 'INSANE!!!';
            colorClass = 'rainbow';
            audioManager.playComboSound(3);
        } else if (count >= 50) {
            text = 'AMAZING!';
            colorClass = 'rainbow';
            audioManager.playComboSound(2);
        } else if (count >= 30) {
            text = 'NICE!';
            colorClass = '';
            audioManager.playComboSound(1);
        } else {
            return; // No combo text for < 30 balls
        }
        
        const comboElement = document.createElement('div');
        comboElement.className = `combo-text ${colorClass}`;
        comboElement.textContent = text;
        document.body.appendChild(comboElement);
        
        // Animate: scale from 0 to 2 to 1.5, then fade out
        gsap.fromTo(comboElement, 
            { scale: 0, opacity: 0 },
            { 
                scale: 2, 
                opacity: 1, 
                duration: 0.3,
                ease: "back.out(2)",
                onComplete: () => {
                    gsap.to(comboElement, {
                        scale: 1.5,
                        duration: 0.2,
                        ease: "power2.out",
                        onComplete: () => {
                            gsap.to(comboElement, {
                                opacity: 0,
                                y: -50,
                                duration: 0.5,
                                delay: 0.5,
                                ease: "power2.in",
                                onComplete: () => comboElement.remove()
                            });
                        }
                    });
                }
            }
        );
    }

    /**
     * Destroy bubble manager
     */
    destroy() {
        this.clear();
        this.container = null;
    }
}

// Create singleton instance
const bubbleManager = new BubbleManager();

export default bubbleManager;

