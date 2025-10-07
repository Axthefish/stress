# 🫧 Stress.tw - Interactive Stress Relief

> **Live at: [https://stress.tw](https://stress.tw)** 🌐

An interactive stress relief web application featuring soft bouncing balls with realistic physics and spectacular cascade explosion effects. Create balls, watch them fall and bounce, then release all stress with a satisfying explosion.

**Perfect for:** Work breaks, study sessions, anxiety relief, and quick relaxation.

## ✨ Features

- **Soft Bouncing Balls**: Click to create bouncy balls that fall and bounce naturally
- **Realistic Physics**: Gravity, collision detection, and soft landing deformation using Matter.js
- **Cascade Explosion System**: Each ball explodes individually with 4-layer visual effects
- **Ripple Effect**: Explosions spread from center outward like water ripples (4ms cascade)
- **Multi-Sensory Feedback**: Visual flash, screen shake, and haptic vibration (mobile)
- **Beautiful Visual Effects**: Flash rings, particle bursts, energy rings, and smooth animations
- **Performance Optimized**: Smooth 60fps even with 50+ balls
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Macaron Color Palette**: Soft, soothing pastel colors
- **Audio Experience**: Immersive sound effects using Howler.js

## 🎮 How to Play

1. **Create Balls**: Click or tap anywhere on the screen
2. **Watch Physics**: Balls fall naturally, bounce, and squash on landing
3. **Build Up**: Create 15-20 balls for maximum satisfaction
4. **Explode All**: Click the "Explode All" button
5. **Experience**: 
   - Anticipation squeeze (100ms)
   - Screen flash & shake
   - Cascade explosion from center outward
   - Each ball: flash ring → burst explosion → particles → energy ring
6. **Repeat**: Create more and enjoy the stress relief

## 🎹 Keyboard Shortcuts

- `Space` or `Enter`: Explode all balls
- `M`: Toggle sound on/off
- `I` or `?`: Show info modal
- `Escape`: Close modal

## 🛠️ Technologies Used

- **Vanilla JavaScript (ES6 Modules)**: Core application logic
- **GSAP 3.12.5**: Professional-grade animation engine for smooth effects
- **Matter.js 0.19.0**: 2D physics engine for realistic gravity and collisions
- **Howler.js 2.2.4**: Web Audio API wrapper for sound effects
- **CSS3**: Modern styling with custom properties and glassmorphism
- **HTML5**: Semantic markup and Web APIs (Vibration, LocalStorage)

## 📁 Project Structure

```
StressResolve/
├── index.html                      # Main HTML entry
├── css/
│   ├── style.css                  # Main styles (soft ball aesthetics)
│   └── animations.css             # Animation keyframes
├── js/
│   ├── main.js                    # Main controller (60fps update loop)
│   ├── BubbleManager.js           # Ball lifecycle & cascade explosion
│   ├── PhysicsEngine.js           # Matter.js wrapper & physics
│   ├── AudioManager.js            # Howler.js wrapper & audio
│   └── utils.js                   # Utility functions
├── audio/                          # Sound effects
├── docs/
│   ├── ARCHITECTURE_CN.md         # 🇨🇳 Architecture documentation
│   ├── ARCHITECTURE_DIAGRAM.md    # 📊 Mermaid diagrams
│   ├── CASCADE_EXPLOSION.md       # 💥 Explosion system details
│   └── CHANGELOG.md               # 📝 Version history
└── README.md                       # This file
```

## 🚀 Getting Started

### Play Online
Visit **[https://stress.tw](https://stress.tw)** - No installation required!

### Local Development

#### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required for basic usage (can run directly from file system)
- For optimal experience, serve via HTTP/HTTPS (for full audio support)

#### Installation

1. Clone or download this repository
```bash
git clone https://github.com/YOUR_USERNAME/stress-tw.git
cd stress-tw
```

2. Open `index.html` in your web browser

**OR**

Serve via a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### Deployment

Ready to deploy your own version? Check out:
- 📘 **[DEPLOY_CHECKLIST_EN.md](DEPLOY_CHECKLIST_EN.md)** - Quick deployment guide
- 🌐 **[GODADDY_SETUP.md](GODADDY_SETUP.md)** - Domain configuration guide

**Recommended platforms:**
- Vercel (recommended - free, fast, auto-SSL)
- Netlify
- Cloudflare Pages
- GitHub Pages

## ⚙️ Configuration

Key parameters you can adjust:

### Ball Settings (BubbleManager.js)
```javascript
maxBubbles: 150              // Maximum balls on screen
bubbleSize: [50, 100]        // Size range in pixels
delayPerBubble: 4            // Cascade explosion interval (ms)
particlesPerBubble: 4        // Particle count per ball
energyRingProb: 50%          // Energy ring appearance rate
```

### Physics Settings (PhysicsEngine.js)
```javascript
gravity: { x: 0, y: 1.0 }    // Downward gravity (natural fall)
restitution: 0.65            // Bounce coefficient (soft & bouncy)
friction: 0.02               // Surface friction
frictionAir: 0.015           // Air resistance
```

### Explosion Timing
```javascript
anticipationDelay: 100ms     // Pre-explosion squeeze duration
explosionScale: 1.8 → 2.5x   // Burst expansion multiplier
particleDuration: 300ms      // Particle animation time
```

## 🎨 Customization

### Changing Color Palette

Edit the color generation in `BubbleManager.js`:

```javascript
const colorPalettes = [
    randomHSL(340, 360, 70, 80),  // Pink range
    randomHSL(270, 290, 70, 80),  // Purple range
    randomHSL(190, 210, 70, 80),  // Blue range
    randomHSL(150, 170, 65, 75),  // Green range
    randomHSL(25, 35, 70, 80),    // Orange range
];
```

### Adjusting Explosion Speed

In `BubbleManager.js`, modify cascade interval:

```javascript
const delayPerBubble = 4;  // Recommended: 2-10ms
// 2ms = faster cascade
// 4ms = balanced (default)
// 6ms = slower, more visible ripple
// 10ms = very slow, sequential feeling
```

### Tuning Physics Feel

In `PhysicsEngine.js`:

```javascript
restitution: 0.65    // 0.5-0.8 range
// Lower = less bouncy (softer)
// Higher = more bouncy (energetic)

gravity: { x: 0, y: 1.0 }
// Increase y for faster fall
// Decrease for slower, floatier feel
```

## 💡 Explosion System Highlights

### Cascade Explosion Mechanics

1. **Anticipation Phase** (100ms)
   - All balls squeeze to 0.85x scale
   - Creates expectation for explosion

2. **Trigger Phase** (instant)
   - Haptic vibration (mobile): [50ms, 30ms pause, 100ms]
   - Full-screen white flash
   - Screen shake (6 quick shakes)
   - 3-layer shockwave from center

3. **Cascade Phase** (0.2-0.6s depending on ball count)
   - Balls sorted by distance from center
   - Each explodes with 4ms interval
   - Creates visible ripple effect

4. **Individual Ball Explosion**
   - Flash ring: White-to-color gradient burst
   - Explosive burst: 1.8x → 2.5x expansion
   - Radial particles: 4 particles fly outward
   - Energy ring: Colored shockwave (50% chance)

### Performance Optimization

- Load distributed across multiple frames (4ms intervals)
- Only 4 particles per ball (vs 10-24 in naive approach)
- Energy rings on 50% of balls only
- Sound effects throttled (every 5th ball)
- GPU-accelerated transforms with `will-change`
- Result: Smooth 60fps with 20 balls, 52fps with 50 balls

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 13+, macOS)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## ⚡ Performance

| Ball Count | Frame Rate | Experience |
|------------|-----------|------------|
| 10-20 balls | 60 FPS | Perfect |
| 30-40 balls | 58 FPS | Excellent |
| 50+ balls | 52 FPS | Good |

**Optimization Techniques:**
- GPU-accelerated CSS transforms (`transform` over `top/left`)
- `will-change: transform, opacity` for optimal rendering
- Time-distributed explosion (4ms cascade prevents frame spikes)
- Particle throttling (80% reduction vs naive implementation)
- Matter.js physics with optimized settings
- Efficient DOM cleanup and memory management
- RequestAnimationFrame for smooth 60fps update loop

## 📐 Architecture

For detailed architecture documentation with diagrams:
- 📘 **[ARCHITECTURE_CN.md](docs/ARCHITECTURE_CN.md)** - Complete architecture guide (Chinese)
- 📊 **[ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md)** - Mermaid diagrams
- 💥 **[CASCADE_EXPLOSION.md](docs/CASCADE_EXPLOSION.md)** - Explosion system deep dive

### Core Modules

```
main.js (Orchestrator)
  ├── BubbleManager.js (Lifecycle & Explosion)
  │     └── Handles: Creation, Animation, Cascade Explosion
  ├── PhysicsEngine.js (Matter.js Wrapper)  
  │     └── Handles: Gravity, Collisions, Bouncing
  ├── AudioManager.js (Howler.js Wrapper)
  │     └── Handles: Sound Effects, Audio Control
  └── utils.js (Utilities)
        └── Math, DOM, Storage helpers
```

## 🐛 Known Issues

- iOS requires user interaction before audio can play (Web Audio API requirement)
- Backdrop-filter may reduce performance on older devices
- Vibration API not supported on desktop browsers
- 100+ balls may cause slight frame drops on low-end mobile devices

## 🔮 Future Enhancements

- [ ] Canvas rendering mode for higher performance
- [ ] WebGL particle system for complex effects
- [ ] Object pooling for particle recycling
- [ ] Multiple explosion patterns (spiral, random, line)
- [ ] Customizable color themes
- [ ] Slow-motion effect during explosion peak
- [ ] Combo system (successive explosions = bigger effects)
- [ ] Statistics dashboard (total balls created, explosions triggered)
- [ ] Share explosion GIFs

## 📝 License

This project is open source and available for personal and commercial use.

## 🙏 Acknowledgments

- Inspired by classic bubble wrap popping
- Glassmorphism design trend
- GSAP, Matter.js, and Web Audio API communities

## 🌐 Links

- **Live Site:** [https://stress.tw](https://stress.tw)
- **Repository:** [GitHub](https://github.com/YOUR_USERNAME/stress-tw)

## 📧 Contact

For questions, suggestions, or bug reports, please open an issue on the repository.

## 🎓 Learning Resources

This project demonstrates:
- Modern ES6 module architecture
- Physics engine integration (Matter.js)
- Animation optimization techniques
- Performance profiling and optimization
- Multi-sensory UX design (visual + audio + haptic)
- State management in vanilla JS
- Responsive and accessible design

Perfect for learning:
- How to structure a performant interactive application
- Physics-based animations
- Cascade/ripple effect implementation
- Time-distributed rendering for performance
- Browser API usage (Vibration, LocalStorage, Web Audio)

---

**Made with ❤️ for stress relief and ultimate satisfaction**

Create. Watch. EXPLODE! 💥✨🎉

