document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. SCROLL PROGRESS BAR
    // ============================================================
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    });

    // ============================================================
    // 2. THEME TOGGLE
    // ============================================================
    const themeToggleBtn = document.querySelector('.theme-toggle');
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '🌙';
        } else {
            themeToggleBtn.innerHTML = '☀️';
        }
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = '☀️';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = '🌙';
            }
        });
    }

    // ============================================================
    // 3. MOBILE MENU & BACKDROP
    // ============================================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const navLinksList = document.querySelector('.nav-links');
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-nav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);
    }

    const openMobileMenu = () => {
        navLinksList.classList.add('mobile-open');
        backdrop.classList.add('active');
        mobileMenuBtn.innerHTML = '✕';
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.setAttribute('aria-label', 'Close Navigation Menu');
        document.body.style.overflow = 'hidden';
    };

    const closeMobileMenu = () => {
        navLinksList.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Open Navigation Menu');
        document.body.style.overflow = '';
    };

    if (mobileMenuBtn && navLinksList) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navLinksList.classList.contains('mobile-open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close on link click
        navLinksList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close when clicking outside / on backdrop
        backdrop.addEventListener('click', closeMobileMenu);
        document.addEventListener('click', (e) => {
            if (!navLinksList.contains(e.target) && !mobileMenuBtn.contains(e.target) && navLinksList.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinksList.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });

        // Auto close if viewport resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navLinksList.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });
    }

    // ============================================================
    // 4. NAVBAR SCROLL EFFECT
    // ============================================================
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // ============================================================
    // 5. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ============================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate').forEach(el => observer.observe(el));

    // ============================================================
    // 6. ANIMATED NUMBER COUNTERS
    // ============================================================
    function animateCounter(el) {
        const rawText = el.textContent.trim();
        const suffix = rawText.replace(/[\d.]/g, '');  // e.g. "%" or "M+" or "+"
        const rawNum = rawText.replace(/[^\d.]/g, '');
        const end = parseFloat(rawNum);
        if (isNaN(end)) return;
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(start + (end - start) * eased);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

    // ============================================================
    // 7. 3D TILT EFFECT ON CARDS
    // ============================================================
    document.querySelectorAll('.card-modern').forEach(card => {
        if (card.classList.contains('no-tilt') || card.closest('#intimate-wash') || card.id === 'intimate-wash-card') {
            card.style.transform = 'none';
            return;
        }
        card.addEventListener('mousemove', (e) => {
            if (card.classList.contains('no-tilt') || card.closest('#intimate-wash')) {
                card.style.transform = 'none';
                return;
            }
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ============================================================
    // 8. BUTTON RIPPLE EFFECT
    // ============================================================
    function addRipple(e) {
        const btn = e.currentTarget;
        const existingRipple = btn.querySelector('.ripple');
        if (existingRipple) existingRipple.remove();
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const rect = btn.getBoundingClientRect();
        circle.classList.add('ripple');
        circle.style.width = circle.style.height = diameter + 'px';
        circle.style.left = (e.clientX - rect.left - diameter / 2) + 'px';
        circle.style.top  = (e.clientY - rect.top  - diameter / 2) + 'px';
        btn.appendChild(circle);
        circle.addEventListener('animationend', () => circle.remove());
    }

    document.querySelectorAll('.btn, .btn-primary, .btn-outline, .btn-nav, .btn-yellow, .btn-glass').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', addRipple);
    });

    // ============================================================
    // 9. FLOATING BUBBLES ON ALL PAGES & HEADERS
    // ============================================================
    // A. Header Banners (.hero on index, .page-header on subpages)
    const headerBanners = document.querySelectorAll('.hero, .page-header');
    headerBanners.forEach(header => {
        const isHero = header.classList.contains('hero');
        const particleCount = isHero ? 18 : 14;
        for (let i = 0; i < particleCount; i++) {
            const bubble = document.createElement('span');
            bubble.classList.add('hero-bubble');
            const size = Math.random() * 18 + 8;
            bubble.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 7}s;
                animation-duration: ${Math.random() * 5 + 5}s;
            `;
            header.appendChild(bubble);
        }
    });

    // B. Global Ambient Floating Bubbles across every page
    const ambientContainer = document.createElement('div');
    ambientContainer.className = 'ambient-bubbles-container';
    ambientContainer.setAttribute('aria-hidden', 'true');
    const ambientCount = 18;
    for (let i = 0; i < ambientCount; i++) {
        const bubble = document.createElement('span');
        bubble.classList.add('ambient-bubble');
        const size = Math.random() * 22 + 8;
        const drift = (Math.random() - 0.5) * 50;
        bubble.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
            animation-duration: ${Math.random() * 7 + 8}s;
            --drift: ${drift.toFixed(1)}px;
        `;
        ambientContainer.appendChild(bubble);
    }
    document.body.appendChild(ambientContainer);

    // ============================================================
    // 10. ACTIVE NAV LINK HIGHLIGHT
    // ============================================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ============================================================
    // 11. HERO BANNER AUTO SLIDER
    // ============================================================
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots   = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    const heroSection = document.querySelector('.hero');

    if (slides.length > 1) {
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
            currentSlide = index;
        };

        const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
        const prevSlide = () => showSlide((currentSlide - 1 + slides.length) % slides.length);
        const startAutoSlide = () => { clearInterval(slideInterval); slideInterval = setInterval(nextSlide, 4500); };
        const stopAutoSlide  = () => clearInterval(slideInterval);

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoSlide(); });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.getAttribute('data-slide'), 10);
                if (!isNaN(idx)) { showSlide(idx); startAutoSlide(); }
            });
        });

        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopAutoSlide);
            heroSection.addEventListener('mouseleave', startAutoSlide);

            // Touch Swipe Gesture for Mobile / Tablet
            let touchStartX = 0;
            let touchEndX = 0;
            heroSection.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoSlide();
            }, { passive: true });

            heroSection.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchEndX - touchStartX;
                if (Math.abs(diff) > 40) {
                    if (diff < 0) {
                        nextSlide(); // swiped left
                    } else {
                        prevSlide(); // swiped right
                    }
                }
                startAutoSlide();
            }, { passive: true });
        }

        startAutoSlide();
    }

    // ============================================================
    // 12. PARALLAX on Section Images (subtle)
    // ============================================================
    const parallaxImgs = document.querySelectorAll('.parallax-img');
    if (parallaxImgs.length) {
        window.addEventListener('scroll', () => {
            parallaxImgs.forEach(img => {
                const rect = img.getBoundingClientRect();
                const offset = (rect.top / window.innerHeight) * 20;
                img.style.transform = `translateY(${offset}px)`;
            });
        });
    }

    // ============================================================
    // 13. SCROLL-TO-TOP BUTTON
    // ============================================================
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.innerHTML = '↑';
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================================
    // 14. FLOATING GRADIENT ORBS (Ambient Background Depth)
    // ============================================================
    const orbContainer = document.createElement('div');
    orbContainer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 2; i++) {
        const orb = document.createElement('div');
        orb.className = 'gradient-orb';
        orb.style.top = (Math.random() * 60 + 10) + 'vh';
        orb.style.left = (Math.random() * 60 + 10) + 'vw';
        orbContainer.appendChild(orb);
    }
    document.body.appendChild(orbContainer);

    // ============================================================
    // 15. CARD GLOW MOUSE TRACKING
    // ============================================================
    document.querySelectorAll('.card-modern').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });
    });

    // ============================================================
    // 16. SMOOTH SCROLL for Anchor Links
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================================================
    // 17. STAGGER ANIMATION for Grid Children
    // ============================================================
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll('.card-modern, .animate');
                children.forEach((child, index) => {
                    child.style.transitionDelay = (index * 0.1) + 's';
                    child.classList.add('active');
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.grid-2, .grid-3, .grid-4').forEach(grid => {
        staggerObserver.observe(grid);
    });

});
