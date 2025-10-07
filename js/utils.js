/**
 * Utility Functions Module
 * Provides helper functions for random generation, math operations, and DOM manipulation
 */

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Choose a random element from an array
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random HSL color
 * @param {number} hueMin - Minimum hue (0-360)
 * @param {number} hueMax - Maximum hue (0-360)
 * @param {number} saturation - Saturation percentage (0-100)
 * @param {number} lightness - Lightness percentage (0-100)
 */
export function randomHSL(hueMin, hueMax, saturation, lightness) {
    const hue = randomRange(hueMin, hueMax);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a unique ID
 */
export function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Calculate distance between two points
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points (in radians)
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Generate a blob path for SVG
 * @param {number} size - Size of the blob
 * @param {number} points - Number of points for the blob
 */
export function generateBlobPath(size, points = 8) {
    const angleStep = (Math.PI * 2) / points;
    let path = 'M ';
    
    const pathPoints = [];
    
    for (let i = 0; i <= points; i++) {
        const angle = i * angleStep;
        const radius = size / 2 * (0.8 + Math.random() * 0.4);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        pathPoints.push({ x, y });
    }
    
    // Create smooth curves using quadratic Bezier
    for (let i = 0; i < pathPoints.length - 1; i++) {
        const current = pathPoints[i];
        const next = pathPoints[i + 1];
        
        if (i === 0) {
            path += `${current.x} ${current.y}`;
        }
        
        // Control point between current and next
        const cpAngle = (i + 0.5) * angleStep;
        const cpRadius = size / 2 * 1.2;
        const cpx = Math.cos(cpAngle) * cpRadius;
        const cpy = Math.sin(cpAngle) * cpRadius;
        
        path += ` Q ${cpx} ${cpy} ${next.x} ${next.y}`;
    }
    
    return path + ' Z';
}

/**
 * Create a ripple effect at a specific position
 */
export function createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    
    // Animate with GSAP
    gsap.to(ripple, {
        scale: 3,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove()
    });
}

/**
 * Check if device is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get viewport dimensions
 */
export function getViewport() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

/**
 * Check if two circles overlap
 */
export function circlesOverlap(x1, y1, r1, x2, y2, r2) {
    const dist = distance(x1, y1, x2, y2);
    return dist < (r1 + r2);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Local storage helpers with fallback
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    }
};

/**
 * Easing functions for animations
 */
export const easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frames = [];
        this.lastTime = performance.now();
    }
    
    update() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        
        this.frames.push(delta);
        if (this.frames.length > 60) {
            this.frames.shift();
        }
        
        const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
        this.fps = Math.round(1000 / avg);
    }
    
    getFPS() {
        return this.fps;
    }
}

/**
 * Format number with leading zeros
 */
export function padZero(num, length = 2) {
    return String(num).padStart(length, '0');
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${padZero(mins)}:${padZero(secs)}`;
}

/**
 * Create particle element
 */
export function createParticle(x, y, color, size = 10) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
    `;
    return particle;
}

// Export all as default object as well
export default {
    randomRange,
    randomInt,
    randomChoice,
    randomHSL,
    generateUniqueId,
    clamp,
    lerp,
    distance,
    angle,
    degToRad,
    radToDeg,
    generateBlobPath,
    createRippleEffect,
    isMobile,
    getViewport,
    circlesOverlap,
    debounce,
    throttle,
    storage,
    easing,
    PerformanceMonitor,
    padZero,
    formatTime,
    createParticle
};

