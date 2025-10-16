/**
 * Physics Engine Module
 * Handles collision detection and physics simulation for bubbles
 */

import { distance } from './utils.js';

class PhysicsEngine {
    constructor() {
        this.bubbles = [];
        this.gravity = { x: 0, y: 1.0 }; // Positive Y for downward movement (gravity)
        this.bounds = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.useMatterJS = typeof Matter !== 'undefined';
        
        if (this.useMatterJS) {
            this.initMatterJS();
        }
    }

    /**
     * Initialize Matter.js physics engine
     */
    initMatterJS() {
        try {
            const { Engine, World, Bodies, Body } = Matter;
            
            this.engine = Engine.create({
                gravity: { x: 0, y: 1.0 }, // Natural downward gravity
                enableSleeping: true // Enable sleep mode for better stacking
            });
            
            this.world = this.engine.world;
            this.Matter = Matter;
            
            // Create invisible boundaries
            this.createBoundaries();
            
            console.log('Matter.js initialized successfully');
        } catch (error) {
            console.warn('Matter.js initialization failed, using simple collision:', error);
            this.useMatterJS = false;
        }
    }

    /**
     * Create world boundaries
     */
    createBoundaries() {
        const { Bodies, World } = this.Matter;
        const thickness = 50;
        
        // Left wall
        const leftWall = Bodies.rectangle(
            -thickness / 2,
            this.bounds.height / 2,
            thickness,
            this.bounds.height * 2,
            { isStatic: true }
        );
        
        // Right wall
        const rightWall = Bodies.rectangle(
            this.bounds.width + thickness / 2,
            this.bounds.height / 2,
            thickness,
            this.bounds.height * 2,
            { isStatic: true }
        );
        
        // Bottom (optional - bubbles should float up before reaching)
        const bottom = Bodies.rectangle(
            this.bounds.width / 2,
            this.bounds.height + thickness / 2,
            this.bounds.width,
            thickness,
            { isStatic: true }
        );
        
        // TOP boundary - CRITICAL to prevent bubbles flying off screen
        const top = Bodies.rectangle(
            this.bounds.width / 2,
            -thickness / 2,
            this.bounds.width * 2,
            thickness,
            { isStatic: true }
        );
        
        World.add(this.world, [leftWall, rightWall, bottom, top]);
    }

    /**
     * Add a bubble to the physics simulation
     */
    addBubble(bubble) {
        if (this.useMatterJS) {
            this.addBubbleMatter(bubble);
        } else {
            this.addBubbleSimple(bubble);
        }
    }

    /**
     * Add bubble using Matter.js
     */
    addBubbleMatter(bubble) {
        const { Bodies, World, Body } = this.Matter;
        
        const body = Bodies.circle(
            bubble.x,
            bubble.y,
            bubble.size / 2,
            {
                restitution: 0.3,      // Lower bounciness for better stacking
                friction: 0.1,         // Higher friction for better grip
                frictionAir: 0.05,     // More air resistance to slow down faster
                frictionStatic: 0.5,   // Static friction to prevent sliding when stacked
                density: 0.005,        // Heavier for more stable stacking
                slop: 0.05,           // Collision tolerance
                sleepThreshold: 60,    // Time before sleeping (in ms)
                collisionFilter: {
                    group: 0,
                    category: 0x0001,
                    mask: 0xFFFF
                }
            }
        );
        
        // No initial force - let gravity do the work
        
        World.add(this.world, body);
        bubble.physicsBody = body;
        bubble.physicsEnabled = true;
    }

    /**
     * Add bubble using simple collision detection
     */
    addBubbleSimple(bubble) {
        bubble.velocityX = 0;
        bubble.velocityY = 0; // Start with no velocity, gravity will pull it down
        bubble.physicsEnabled = true;
        this.bubbles.push(bubble);
    }

    /**
     * Remove bubble from physics simulation
     */
    removeBubble(bubble) {
        if (this.useMatterJS && bubble.physicsBody) {
            const { World } = this.Matter;
            World.remove(this.world, bubble.physicsBody);
        } else {
            const index = this.bubbles.indexOf(bubble);
            if (index > -1) {
                this.bubbles.splice(index, 1);
            }
        }
        bubble.physicsEnabled = false;
    }

    /**
     * Update physics simulation
     */
    update(deltaTime = 16) {
        if (this.useMatterJS) {
            this.updateMatter(deltaTime);
        } else {
            this.updateSimple(deltaTime);
        }
    }

    /**
     * Update Matter.js physics
     */
    updateMatter(deltaTime) {
        const { Engine } = this.Matter;
        Engine.update(this.engine, deltaTime);
    }

    /**
     * Update simple physics
     */
    updateSimple(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Update positions
        this.bubbles.forEach(bubble => {
            if (!bubble.physicsEnabled) return;
            
            // Apply gravity
            bubble.velocityY += this.gravity.y * dt;
            
            // Update position
            bubble.x += bubble.velocityX * dt * 60;
            bubble.y += bubble.velocityY * dt * 60;
            
            // Boundary collision
            this.handleBoundaryCollision(bubble);
        });
        
        // Collision detection
        this.detectCollisions();
    }

    /**
     * Handle boundary collisions
     */
    handleBoundaryCollision(bubble) {
        const radius = bubble.size / 2;
        const margin = 10;
        
        // Left boundary
        if (bubble.x - radius < margin) {
            bubble.x = margin + radius;
            bubble.velocityX = Math.abs(bubble.velocityX) * 0.5;
        }
        
        // Right boundary
        if (bubble.x + radius > this.bounds.width - margin) {
            bubble.x = this.bounds.width - margin - radius;
            bubble.velocityX = -Math.abs(bubble.velocityX) * 0.5;
        }
        
        // Bottom boundary (should rarely happen)
        if (bubble.y + radius > this.bounds.height) {
            bubble.y = this.bounds.height - radius;
            bubble.velocityY = -Math.abs(bubble.velocityY) * 0.5;
        }
        
        // Apply boundary repulsion force
        this.applyBoundaryRepulsion(bubble);
    }

    /**
     * Apply gentle repulsion from boundaries
     */
    applyBoundaryRepulsion(bubble) {
        const margin = 100;
        const force = 0.3;
        const radius = bubble.size / 2;
        
        // Left
        if (bubble.x - radius < margin) {
            bubble.velocityX += force;
        }
        
        // Right
        if (bubble.x + radius > this.bounds.width - margin) {
            bubble.velocityX -= force;
        }
    }

    /**
     * Simple collision detection
     */
    detectCollisions() {
        for (let i = 0; i < this.bubbles.length; i++) {
            for (let j = i + 1; j < this.bubbles.length; j++) {
                const b1 = this.bubbles[i];
                const b2 = this.bubbles[j];
                
                if (!b1.physicsEnabled || !b2.physicsEnabled) continue;
                
                this.resolveCollision(b1, b2);
            }
        }
    }

    /**
     * Resolve collision between two bubbles
     */
    resolveCollision(b1, b2) {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (b1.size + b2.size) / 2;
        
        if (dist < minDist && dist > 0) {
            // Calculate overlap
            const overlap = minDist - dist;
            const angle = Math.atan2(dy, dx);
            
            // Separate bubbles
            const separationX = Math.cos(angle) * overlap / 2;
            const separationY = Math.sin(angle) * overlap / 2;
            
            b1.x -= separationX;
            b1.y -= separationY;
            b2.x += separationX;
            b2.y += separationY;
            
            // Apply bounce velocities (elastic collision simulation)
            const nx = dx / dist;
            const ny = dy / dist;
            
            const relativeVelocityX = b2.velocityX - b1.velocityX;
            const relativeVelocityY = b2.velocityY - b1.velocityY;
            
            const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;
            
            if (dotProduct < 0) {
                const restitution = 0.65; // Bouncy soft feel
                const impulse = (1 + restitution) * dotProduct / 2;
                
                b1.velocityX += impulse * nx;
                b1.velocityY += impulse * ny;
                b2.velocityX -= impulse * nx;
                b2.velocityY -= impulse * ny;
            }
        }
    }

    /**
     * Get bubble position (works for both Matter.js and simple physics)
     */
    getBubblePosition(bubble) {
        if (this.useMatterJS && bubble.physicsBody) {
            return {
                x: bubble.physicsBody.position.x,
                y: bubble.physicsBody.position.y,
                rotation: bubble.physicsBody.angle * (180 / Math.PI)
            };
        }
        return {
            x: bubble.x,
            y: bubble.y,
            rotation: bubble.rotation || 0
        };
    }

    /**
     * Update window bounds
     */
    updateBounds() {
        this.bounds = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Recreate boundaries for Matter.js
        if (this.useMatterJS) {
            // Clear old boundaries
            const { World } = this.Matter;
            World.clear(this.world);
            this.createBoundaries();
        }
    }

    /**
     * Reset physics engine
     */
    reset() {
        if (this.useMatterJS) {
            const { World } = this.Matter;
            World.clear(this.world);
            this.createBoundaries();
        } else {
            this.bubbles = [];
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.useMatterJS && this.engine) {
            const { Engine } = this.Matter;
            Engine.clear(this.engine);
        }
        this.bubbles = [];
    }
}

// Create singleton instance
const physicsEngine = new PhysicsEngine();

export default physicsEngine;

