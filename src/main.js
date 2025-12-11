document.addEventListener('DOMContentLoaded', () => {
    
    /* --- 1. CONFIG & INIT --- */
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* --- 2. THREE.JS HERO ANIMATION --- */
    const initThreeHero = () => {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 1500;
        const posArray = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 18; // Spread
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.04,
            color: 0x3b82f6, // Brand Blue
            transparent: true,
            opacity: 0.8,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);
        camera.position.z = 4;

        // Mouse Interaction
        let mouseX = 0;
        let mouseY = 0;
        
        // Window Half
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) / 100;
            mouseY = (event.clientY - windowHalfY) / 100;
        });

        // Animation Loop
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            // Constant gentle rotation
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = mouseY * 0.05;
            particlesMesh.rotation.y += mouseX * 0.05;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Resize Handler
        window.addEventListener('resize', () => {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initThreeHero();

    /* --- 3. GSAP ANIMATIONS --- */
    
    // 3.1 Hero Reveal
    const heroTl = gsap.timeline();
    heroTl.from(".hero__title", { opacity: 0, y: 60, duration: 1, ease: "power3.out" })
          .from(".hero__desc", { opacity: 0, y: 30, duration: 1, ease: "power3.out" }, "-=0.6")
          .from(".hero__btns", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.6")
          .from(".hero__badge", { opacity: 0, scale: 0.8, duration: 0.5 }, "-=1");

    // 3.2 Generic Section Reveal (Excluding About & Hero)
    const sections = document.querySelectorAll('section:not(.hero):not(.about)');
    sections.forEach(section => {
        gsap.from(section.children, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        });
    });

    // 3.3 SPECIFIC: About Us Section Animation
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        gsap.from(".about__content", {
            scrollTrigger: { trigger: ".about", start: "top 75%" },
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
        
        gsap.from(".about__visual", {
            scrollTrigger: { trigger: ".about", start: "top 75%" },
            x: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: "power3.out"
        });

        gsap.from(".about__card", {
            scrollTrigger: { trigger: ".about", start: "top 60%" },
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.8,
            ease: "back.out(1.7)"
        });
    }

    // 3.4 Number Counters (Innovation Section)
    const stats = document.querySelectorAll('.stat__num');
    stats.forEach(stat => {
        const rawVal = stat.getAttribute('data-val'); // e.g. "98"
        const endVal = parseInt(rawVal, 10);
        
        gsap.to(stat, {
            scrollTrigger: { trigger: stat, start: "top 85%" },
            innerText: endVal,
            duration: 2.5,
            snap: { innerText: 1 },
            ease: "power2.out",
            onUpdate: function() {
                // Ensure no decimals during animation
                stat.innerHTML = Math.ceil(this.targets()[0].innerText);
            }
        });
    });

    /* --- 4. FORM LOGIC --- */
    const form = document.getElementById('contactForm');
    if (form) {
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phoneError');
        const messageBox = document.getElementById('formMessage');
        const captchaLabel = document.getElementById('captchaLabel');
        const captchaInput = document.getElementById('captchaInput');
        const captchaResult = document.getElementById('captchaResult');

        // Math Captcha
        const generateCaptcha = () => {
            const n1 = Math.floor(Math.random() * 10);
            const n2 = Math.floor(Math.random() * 10);
            captchaLabel.innerText = `Сколько будет ${n1} + ${n2}?`;
            captchaResult.value = n1 + n2;
        };
        generateCaptcha();

        // Phone Input Mask (Digits only)
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9+]/g, '');
        });

        // Submit Handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            phoneError.innerText = '';
            messageBox.innerText = '';
            messageBox.className = 'form__message';

            // Validate Phone
            if (phoneInput.value.length < 8) {
                phoneError.innerText = 'Пожалуйста, введите корректный номер (минимум 8 цифр).';
                return;
            }

            // Validate Captcha
            if (parseInt(captchaInput.value) !== parseInt(captchaResult.value)) {
                alert('Неверный результат примера.');
                captchaInput.value = '';
                generateCaptcha();
                return;
            }

            // Simulate AJAX
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Отправка...';
            btn.disabled = true;

            setTimeout(() => {
                messageBox.innerText = 'Заявка успешно отправлена! Мы свяжемся с вами.';
                messageBox.classList.add('success');
                form.reset();
                generateCaptcha();
                btn.innerText = originalText;
                btn.disabled = false;

                setTimeout(() => { messageBox.innerText = ''; }, 6000);
            }, 1500);
        });
    }

    /* --- 5. COOKIE POPUP --- */
    const cookiePopup = document.getElementById('cookiePopup');
    const cookieBtn = document.getElementById('cookieAccept');

    if (cookiePopup && !localStorage.getItem('digitraCookies')) {
        setTimeout(() => {
            cookiePopup.classList.add('show');
        }, 2500);
    }

    if (cookieBtn) {
        cookieBtn.addEventListener('click', () => {
            localStorage.setItem('digitraCookies', 'true');
            cookiePopup.classList.remove('show');
        });
    }

    /* --- 6. MOBILE MENU --- */
    const burger = document.querySelector('.header__burger');
    const body = document.body;
    const headerContainer = document.querySelector('.header__container');

    // Create menu dynamically to keep HTML clean
    if (burger && headerContainer) {
        const mobileMenu = document.createElement('div');
        mobileMenu.classList.add('mobile-menu');
        
        const navContent = document.querySelector('.header__menu').innerHTML;
        const btnContent = document.querySelector('.header__actions .header__btn').cloneNode(true);
        
        mobileMenu.innerHTML = `
            <ul class="header__menu" style="flex-direction: column; align-items: center; gap: 24px; margin-top: 40px;">
                ${navContent}
            </ul>
        `;
        // Append cloned button
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '30px';
        btnContainer.appendChild(btnContent);
        mobileMenu.appendChild(btnContainer);

        headerContainer.parentNode.insertBefore(mobileMenu, headerContainer.nextSibling);

        burger.addEventListener('click', () => {
            body.classList.toggle('menu-open');
            mobileMenu.classList.toggle('is-active');
            
            // Toggle burger animation
            const spans = burger.querySelectorAll('span');
            // CSS handles the span animation based on body class, 
            // but we ensure logic flows here.
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                body.classList.remove('menu-open');
                mobileMenu.classList.remove('is-active');
            });
        });
    }
});