import './style.css';

// ═══════════════════════════════════════════════════
// AKS Solutions — Interactive Portfolio Scripts
// ═══════════════════════════════════════════════════

// ─── PRELOADER ───
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 2000);
});

// ─── CUSTOM CURSOR ───
const cursorDot = document.getElementById('cursor-dot');
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover states
const hoverTargets = document.querySelectorAll('a, button, .service-card, .portfolio-card, .stack-tag, .approach-step, .testimonial-btn, .social-link, select');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─── SCROLL PROGRESS ───
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = progress + '%';
});

// ─── NAV SCROLL STATE ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
});

// ─── MOBILE MENU ───
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
    });
});

// ─── SCROLL REVEAL ───
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// ─── ANIMATED COUNTERS ───
document.querySelectorAll('.counter').forEach(counter => {
    const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const target = parseInt(counter.dataset.target);
        const startTime = performance.now();
        const duration = 2000;

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

// ─── SERVICE CARD GLOW FOLLOW ───
document.querySelectorAll('.service-card').forEach(card => {
    const glow = card.querySelector('.service-glow');
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.left = x + 'px';
        glow.style.top = y + 'px';
    });
});

// ─── 3D TILT EFFECT FOR CARDS ───
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ─── HERO PARTICLE CANVAS ───
(() => {
    const canvas = document.getElementById('hero-particles');
    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const particleCount = 80;

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

    let time = 0;
    function draw() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    const alpha = (1 - dist / 130) * 0.08;
                    ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Update and draw particles
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            const pulse = Math.sin(time * 0.5 + i * 0.3) * 0.1 + 0.9;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = i % 5 === 0
                ? `rgba(194,162,77,${p.alpha * pulse})`
                : `rgba(0,240,255,${p.alpha * pulse})`;
            ctx.fill();
        });

        // Central glow
        const gradient = ctx.createRadialGradient(W * 0.3, H * 0.5, 0, W * 0.3, H * 0.5, W * 0.4);
        gradient.addColorStop(0, 'rgba(0,240,255,0.015)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        time += 0.01;
        requestAnimationFrame(draw);
    }
    draw();
})();

// ─── PORTFOLIO CANVASES ───
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
    new ResizeObserver(resize).observe(parent);

    let time = 0;
    function draw() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Dark background
        ctx.fillStyle = `rgb(${Math.floor(r * 0.08)},${Math.floor(g * 0.08)},${Math.floor(b * 0.08)})`;
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
        requestAnimationFrame(draw);
    }
    draw();
});

// ─── ARCHITECTURE CANVAS ───
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
    new ResizeObserver(resize).observe(parent);

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
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0c0c14';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 24) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 24) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const abs = n => ({ x: n.lx * W, y: n.ly * H });

        // Edges with animated dashes
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -time * 12;
        edges.forEach(([a, b]) => {
            const pa = abs(nodes[a]), pb = abs(nodes[b]);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = 'rgba(0,240,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        // Data flow animation on edges
        edges.forEach(([a, b], i) => {
            const pa = abs(nodes[a]), pb = abs(nodes[b]);
            const t = (time * 0.3 + i * 0.15) % 1;
            const fx = pa.x + (pb.x - pa.x) * t;
            const fy = pa.y + (pb.y - pa.y) * t;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,240,255,${0.5 + Math.sin(time + i) * 0.2})`;
            ctx.fill();
        });

        // Nodes
        nodes.forEach((n, i) => {
            const { x, y } = abs(n);
            const w = 100, h = 28;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.roundRect(x - w / 2 + 2, y - h / 2 + 2, w, h, 4);
            ctx.fill();

            // Node box
            ctx.fillStyle = '#10101a';
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
            ctx.fill();

            ctx.strokeStyle = `rgba(0,240,255,${0.15 + Math.sin(time + i) * 0.05})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
            ctx.stroke();

            // Accent bar
            ctx.fillStyle = `rgba(0,240,255,${0.4 + Math.sin(time + i) * 0.15})`;
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, 3, h, [4, 0, 0, 4]);
            ctx.fill();

            // Label
            ctx.fillStyle = '#8a8a9a';
            ctx.font = "500 9px 'Inter', sans-serif";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.lb, x + 2, y);
        });

        time += 0.012;
        requestAnimationFrame(draw);
    }
    draw();
})();

// ─── ABOUT CANVAS ───
(() => {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();
    new ResizeObserver(resize).observe(parent);

    let time = 0;
    function draw() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0c0c14';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 36) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 36) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const cx = W / 2, cy = H / 2;

        // Rotating squares
        [70, 110, 160, 210].forEach((r, i) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(time * 0.1 * (i % 2 === 0 ? 1 : -1));
            ctx.strokeStyle = `rgba(0,240,255,${0.06 - i * 0.012})`;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-r, -r, r * 2, r * 2);
            ctx.restore();
        });

        // Radar line
        const ang = time * 0.4;
        const len = 120;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        ctx.strokeStyle = 'rgba(0,240,255,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.fill();

        // Moving dot
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(194,162,77,0.7)';
        ctx.fill();

        // Orbit rings
        [60, 100].forEach((r, i) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,240,255,${0.04 + i * 0.01})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        // Location labels
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.font = "500 8px 'JetBrains Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText('PKT: 30°00N 71°32E', 16, H - 16);
        ctx.textAlign = 'right';
        ctx.fillText('EUR: 50°51N 4°21E', W - 16, H - 16);

        time += 0.013;
        requestAnimationFrame(draw);
    }
    draw();
})();

// ─── TESTIMONIALS CAROUSEL ───
(() => {
    const track = document.getElementById('testimonial-track');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    const dots = document.querySelectorAll('.testimonial-dot');
    let current = 0;
    const total = dots.length;

    function goto(index) {
        current = ((index % total) + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn.addEventListener('click', () => goto(current - 1));
    nextBtn.addEventListener('click', () => goto(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goto(i)));

    // Auto-play
    let autoPlay = setInterval(() => goto(current + 1), 5000);

    [prevBtn, nextBtn, track].forEach(el => {
        el.addEventListener('mouseenter', () => clearInterval(autoPlay));
        el.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => goto(current + 1), 5000);
        });
    });
})();

// ─── CONTACT FORM ───
(() => {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validation
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

    // Real-time validation feedback
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.style.borderColor = '';
            }
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

// ─── PARALLAX ON SCROLL ───
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
        heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
    }
});

// ─── ACTIVE NAV LINK HIGHLIGHT ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + current) {
            link.style.color = 'var(--cyan)';
        }
    });
});
