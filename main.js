import './style.css';

// ═══════════════════════════════════════════════════
// AKS Solutions — Interactive Portfolio Scripts
// Performance-optimized: throttled events, paused
// off-screen canvases, passive listeners, RAF batching
// ═══════════════════════════════════════════════════

// ─── UTILITIES ───
function throttle(fn, ms) {
    let last = 0, raf = 0;
    return function (...args) {
        const now = performance.now();
        if (now - last >= ms) {
            last = now;
            fn.apply(this, args);
        } else {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                last = performance.now();
                fn.apply(this, args);
            });
        }
    };
}

// ─── PRELOADER (faster: 1.2s instead of 2s) ───
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1200);
});

// ─── CUSTOM CURSOR (optimized with RAF batching) ───
const cursorDot = document.getElementById('cursor-dot');
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Direct DOM update via transform for zero-layout-thrash
    cursorDot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
}, { passive: true });

function animateCursor() {
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    cursorGlow.style.transform = `translate3d(${glowX - 18}px, ${glowY - 18}px, 0)`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Override cursor CSS to use transform instead of left/top
cursorDot.style.left = '0';
cursorDot.style.top = '0';
cursorDot.style.willChange = 'transform';
cursorGlow.style.left = '0';
cursorGlow.style.top = '0';
cursorGlow.style.willChange = 'transform';

// Cursor hover states
const hoverTargets = document.querySelectorAll('a, button, .service-card, .portfolio-card, .stack-tag, .approach-step, .testimonial-btn, .social-link, .featured-project-card, select');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'), { passive: true });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'), { passive: true });
});

// ─── UNIFIED SCROLL HANDLER (single listener, throttled) ───
const scrollProgress = document.getElementById('scroll-progress');
const nav = document.getElementById('nav');
const heroContent = document.querySelector('.hero-content');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const onScroll = throttle(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Scroll progress bar
    scrollProgress.style.width = ((scrollTop / scrollHeight) * 100) + '%';

    // Nav background
    nav.classList.toggle('scrolled', scrollTop > 30);

    // Hero parallax
    if (heroContent && scrollTop < window.innerHeight) {
        heroContent.style.transform = `translate3d(0, ${scrollTop * 0.12}px, 0)`;
        heroContent.style.opacity = Math.max(0, 1 - scrollTop / (window.innerHeight * 0.7));
    }

    // Active nav link
    let currentSection = '';
    for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollTop >= sections[i].offsetTop - 200) {
            currentSection = sections[i].id;
            break;
        }
    }
    navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + currentSection ? 'var(--cyan)' : '';
    });
}, 16); // ~60fps

window.addEventListener('scroll', onScroll, { passive: true });

// ─── MOBILE MENU ───
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
    });
});

// ─── SCROLL REVEAL (unchanged, already optimal) ───
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // stop watching once revealed
        }
    });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// ─── ANIMATED COUNTERS (faster: 1.4s) ───
document.querySelectorAll('.counter').forEach(counter => {
    const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const target = parseInt(counter.dataset.target);
        const startTime = performance.now();
        const duration = 1400;

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                counter.textContent = target;
            }
        }
        requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(counter);
});

// ─── METRIC BAR ANIMATION ───
document.querySelectorAll('.metric-card').forEach(card => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            card.classList.add('animated');
            observer.disconnect();
        }
    }, { threshold: 0.5 });
    observer.observe(card);
});

// ─── SERVICE CARD GLOW FOLLOW (throttled mousemove) ───
document.querySelectorAll('.service-card').forEach(card => {
    const glow = card.querySelector('.service-glow');
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
    }, { passive: true });
});

// ─── 3D TILT EFFECT (lighter: 4deg max, smooth reset) ───
document.querySelectorAll('[data-tilt]').forEach(card => {
    let tiltRAF = 0;
    card.addEventListener('mousemove', (e) => {
        cancelAnimationFrame(tiltRAF);
        tiltRAF = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px) translateZ(0)`;
        });
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(tiltRAF);
        card.style.transform = '';
    });
});

// ─── CANVAS VISIBILITY TRACKING ───
// Only animate canvases that are visible on screen
function createVisibilityTracker(element) {
    let isVisible = false;
    const obs = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    }, { threshold: 0, rootMargin: '100px' });
    obs.observe(element);
    return () => isVisible;
}

// ─── HERO PARTICLE CANVAS (optimized: spatial grid, fewer distance checks) ───
(() => {
    const canvas = document.getElementById('hero-particles');
    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', throttle(resize, 200));

    const isVisible = createVisibilityTracker(canvas);

    const particles = [];
    const particleCount = 60; // reduced from 80

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.3 + 0.1,
        });
    }

    const connectionDist = 120;
    const connectionDistSq = connectionDist * connectionDist; // avoid sqrt

    let time = 0;
    function draw() {
        requestAnimationFrame(draw);
        if (!isVisible()) return; // skip when off-screen

        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Draw connecting lines (use distance squared to skip sqrt)
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            const pi = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const pj = particles[j];
                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < connectionDistSq) {
                    const alpha = (1 - Math.sqrt(distSq) / connectionDist) * 0.08;
                    ctx.strokeStyle = `rgba(0,153,170,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(pi.x, pi.y);
                    ctx.lineTo(pj.x, pj.y);
                    ctx.stroke();
                }
            }
        }

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            const pulse = 0.9 + Math.sin(time * 0.5 + i * 0.3) * 0.1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = i % 5 === 0
                ? `rgba(176,141,58,${p.alpha * pulse * 1.5})`
                : `rgba(0,153,170,${p.alpha * pulse * 1.5})`;
            ctx.fill();
        }

        // Central glow (reuse gradient only on resize)
        const gradient = ctx.createRadialGradient(W * 0.3, H * 0.5, 0, W * 0.3, H * 0.5, W * 0.4);
        gradient.addColorStop(0, 'rgba(0,153,170,0.03)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        time += 0.01;
    }
    draw();
})();

// ─── PORTFOLIO CANVASES (pause when off-screen) ───
document.querySelectorAll('.portfolio-canvas').forEach(canvas => {
    const parent = canvas.parentElement;
    const colorStr = canvas.dataset.color;
    const [r, g, b] = colorStr.split(',').map(Number);
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth || 600;
        canvas.height = parent.offsetHeight || 400;
    }
    resize();
    new ResizeObserver(throttle(resize, 200)).observe(parent);

    const isVisible = createVisibilityTracker(canvas);

    let time = 0;
    function draw() {
        requestAnimationFrame(draw);
        if (!isVisible()) return;

        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = `rgb(${230 + Math.floor(r * 0.05)},${230 + Math.floor(g * 0.05)},${232 + Math.floor(b * 0.04)})`;
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y <= H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Animated circles
        for (let i = 0; i < 3; i++) {
            const cx = W * (0.3 + i * 0.2);
            const cy = H * 0.5;
            const radius = 40 + Math.sin(time + i * 1.2) * 15;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.08 + Math.sin(time + i) * 0.03})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }

        // Floating dots
        for (let i = 0; i < 6; i++) {
            const px = W * (0.15 + i * 0.14);
            const py = H * (0.3 + Math.sin(time * 0.5 + i * 0.8) * 0.15);
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + Math.sin(time + i) * 0.15})`;
            ctx.fill();
        }

        time += 0.012;
    }
    draw();
});

// ─── ARCHITECTURE CANVAS (pause when off-screen) ───
(() => {
    const canvas = document.getElementById('arch-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();
    new ResizeObserver(throttle(resize, 200)).observe(parent);

    const isVisible = createVisibilityTracker(canvas);

    const nodes = [
        { lx: 0.5, ly: 0.1, lb: 'Client Layer' },
        { lx: 0.5, ly: 0.32, lb: 'API Gateway' },
        { lx: 0.2, ly: 0.56, lb: 'Auth Service' },
        { lx: 0.5, ly: 0.56, lb: 'Core Logic' },
        { lx: 0.8, ly: 0.56, lb: 'Integrations' },
        { lx: 0.5, ly: 0.82, lb: 'Data Layer' },
    ];
    const edges = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5]];

    let time = 0;
    function draw() {
        requestAnimationFrame(draw);
        if (!isVisible()) return;

        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#e6e6eb';
        ctx.fillRect(0, 0, W, H);

        // Grid (wider spacing = fewer draws)
        ctx.strokeStyle = 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 32) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 32) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const abs = n => ({ x: n.lx * W, y: n.ly * H });

        // Edges
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -time * 12;
        ctx.strokeStyle = 'rgba(0,153,170,0.15)';
        ctx.lineWidth = 1;
        edges.forEach(([a, b]) => {
            const pa = abs(nodes[a]), pb = abs(nodes[b]);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        // Data flow dots
        edges.forEach(([a, b], i) => {
            const pa = abs(nodes[a]), pb = abs(nodes[b]);
            const t = (time * 0.3 + i * 0.15) % 1;
            ctx.beginPath();
            ctx.arc(pa.x + (pb.x - pa.x) * t, pa.y + (pb.y - pa.y) * t, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,153,170,${0.6 + Math.sin(time + i) * 0.2})`;
            ctx.fill();
        });

        // Nodes
        nodes.forEach((n, i) => {
            const { x, y } = abs(n);
            const w = 100, h = 28;

            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            ctx.beginPath();
            ctx.roundRect(x - w / 2 + 2, y - h / 2 + 2, w, h, 4);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
            ctx.fill();

            ctx.strokeStyle = `rgba(0,153,170,${0.25 + Math.sin(time + i) * 0.08})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
            ctx.stroke();

            ctx.fillStyle = `rgba(0,153,170,${0.5 + Math.sin(time + i) * 0.15})`;
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, 3, h, [4, 0, 0, 4]);
            ctx.fill();

            ctx.fillStyle = '#5a5a72';
            ctx.font = "500 9px 'Inter', sans-serif";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.lb, x + 2, y);
        });

        time += 0.012;
    }
    draw();
})();

// ─── ABOUT CANVAS (INTERACTIVE THEMATIC MAP) ───
(() => {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.offsetWidth * dpr;
        canvas.height = parent.offsetHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    new ResizeObserver(throttle(resize, 200)).observe(parent);

    const isVisible = createVisibilityTracker(canvas);

    let d3, worldMap;
    (async () => {
        try {
            d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
            const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            worldMap = await response.json();
        } catch (err) {
            console.error("Map failed to load.", err);
        }
    })();

    const locations = [
        { name: 'Belgium', coords: [4.4699, 50.5039] },
        { name: 'Pakistan', coords: [69.3451, 30.3753] }
    ];

    // Highlight precise countries by their standard GeoJSON name
    const activeCountries = ['Belgium', 'Pakistan']; 

    let time = 0;
    
    // Draw a classic teardrop map pin with white hole
    function drawPin(ctx, x, y, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        ctx.shadowColor = 'rgba(64,224,208,0.4)';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(8, -12, 12, -18, 12, -24);
        ctx.arc(0, -24, 12, 0, Math.PI, true);
        ctx.bezierCurveTo(-12, -18, -8, -12, 0, 0);
        ctx.fillStyle = '#40e0d0'; // Turquoise/Cyan
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, -24, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.restore();
    }

    function draw() {
        if (!worldMap || !d3) {
            requestAnimationFrame(draw);
            return;
        }
        requestAnimationFrame(draw);
        if (!isVisible()) return;

        const W = parent.offsetWidth;
        const H = parent.offsetHeight;
        ctx.clearRect(0, 0, W, H);

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        // Top-left text
        ctx.fillStyle = '#52545d';
        ctx.font = "600 16px 'Inter', sans-serif";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('World Domination 6%', 20, 20);

        // D3 Projection
        let scale = W * 0.16; // Adjust strictly to fit full world
        if (W < 500) scale = W * 0.25;
        
        const projection = d3.geoMercator()
            .scale(scale)
            .translate([W / 2, H * 0.65]); // Push down slightly

        const pathGenerator = d3.geoPath().projection(projection).context(ctx);

        // Draw Map Landmasses
        worldMap.features.forEach(feature => {
            ctx.beginPath();
            pathGenerator(feature);
            
            if (activeCountries.includes(feature.properties.name)) {
                ctx.fillStyle = '#52545d'; // Dark charcoal
            } else {
                ctx.fillStyle = '#e5e7e9'; // Light gray
            }
            
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        // Draw Client Pins
        locations.forEach((loc, i) => {
            const [x, y] = projection(loc.coords);
            
            // Cyan ripple
            const pulse = (time * 1.5 + i * Math.PI) % 2; 
            const radius = 5 + pulse * 12;
            const alpha = Math.max(0, 1 - pulse * 0.5);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(64,224,208,${alpha * 0.4})`;
            ctx.fill();

            // Bobbing pin
            const bob = Math.sin(time * 3 + i) * 3;
            drawPin(ctx, x, y + bob, 0.7);
        });

        time += 0.015;
    }
    draw();
})();

// ─── (Testimonials carousel removed — replaced with Featured Projects) ───

// ─── CONTACT FORM ───
(() => {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = form.querySelectorAll('[required]');
        let valid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff4444';
                valid = false;
                setTimeout(() => input.style.borderColor = '', 2000);
            }
        });

        if (valid) {
            successMsg.classList.add('visible');
            form.reset();
            setTimeout(() => successMsg.classList.remove('visible'), 5000);
        }
    });

    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) input.style.borderColor = '';
        });
    });
})();

// ─── SMOOTH SCROLL FOR NAV LINKS ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});
