document.addEventListener('DOMContentLoaded', () => {
    // ==================== CONFIG ====================
    // FORMSPREE: Replace YOUR_FORMSPREE_FORM_ID in your HTML form action
    // Get your form ID from https://formspree.io after signing up with heypunitgautam@gmail.com
    //
    // CUSTOM BACKEND (alternative): Change this to your backend URL when deployed
    // Local: http://localhost:3000 | Production: https://your-backend-domain.com
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://your-backend-domain.com'; // <-- CHANGE THIS IF USING CUSTOM BACKEND

    // ==================== NAVBAR ====================
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            });
        });
    }

    // ==================== SCROLL ANIMATIONS ====================
    const fadeUpElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeUpElements.forEach(element => {
        observer.observe(element);
    });

    // ==================== BACK TO TOP ====================
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================== FORM HANDLING ====================
    
    // Helper: Show toast notification
    function showToast(message, type = 'success') {
        const existing = document.querySelector('.form-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `form-toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="toast-message">${message}</span>
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Helper: Set button loading state
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="btn-spinner"></span> Sending...';
            button.disabled = true;
        } else {
            button.textContent = button.dataset.originalText || 'Submit';
            button.disabled = false;
        }
    }

    // Contact Form Handler (supports both Formspree and custom backend)
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Pre-select service from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        const serviceSelect = document.getElementById('service');
        
        if (serviceParam && serviceSelect) {
            const options = Array.from(serviceSelect.options);
            const match = options.find(opt => opt.value === serviceParam);
            if (match) {
                serviceSelect.value = serviceParam;
            }
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            const action = contactForm.getAttribute('action');

            // Basic validation
            if (!data.name || !data.email || !data.goals) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            setButtonLoading(submitBtn, true);

            // Check if using Formspree
            const isFormspree = action && action.includes('formspree.io');

            try {
                let response;

                if (isFormspree) {
                    // Formspree AJAX submission
                    response = await fetch(action, {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' },
                        body: formData
                    });
                } else if (action && action !== '#') {
                    // Custom backend API
                    response = await fetch(action, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                } else {
                    // No backend configured — show message
                    showToast('Form backend not configured yet. Please set up Formspree or deploy the backend.', 'error');
                    setButtonLoading(submitBtn, false);
                    return;
                }

                if (isFormspree) {
                    // Formspree response handling
                    if (response.ok) {
                        showToast('Thank you! Your inquiry has been sent. We will contact you within 24 hours.', 'success');
                        contactForm.reset();
                    } else {
                        const result = await response.json().catch(() => ({}));
                        showToast(result.error || 'Something went wrong. Please try again.', 'error');
                    }
                } else {
                    // Custom backend response handling
                    const result = await response.json();
                    if (response.ok && result.success) {
                        showToast(result.message, 'success');
                        contactForm.reset();
                    } else {
                        showToast(result.message || 'Something went wrong. Please try again.', 'error');
                    }
                }

            } catch (error) {
                console.error('Form submission error:', error);
                // Fallback: save to localStorage if backend is unreachable
                saveToLocalFallback('contacts', data);
                showToast('Unable to reach server. Your inquiry has been saved locally and will be sent when connection is restored.', 'error');
            } finally {
                setButtonLoading(submitBtn, false);
            }
        });
    }

    // LocalStorage fallback for offline submissions
    function saveToLocalFallback(type, data) {
        const key = `vf_pending_${type}`;
        const pending = JSON.parse(localStorage.getItem(key) || '[]');
        pending.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(pending));
    }

    // Try to sync pending submissions when back online
    async function syncPendingSubmissions() {
        const types = ['contacts'];
        for (const type of types) {
            const key = `vf_pending_${type}`;
            const pending = JSON.parse(localStorage.getItem(key) || '[]');
            if (pending.length === 0) continue;

            const synced = [];
            for (const data of pending) {
                try {
                    const response = await fetch(`${API_BASE}/api/${type === 'contacts' ? 'contact' : type}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (response.ok) synced.push(data);
                } catch (e) {
                    break; // Stop if server is still unreachable
                }
            }

            // Remove synced items
            const remaining = pending.filter(p => !synced.includes(p));
            localStorage.setItem(key, JSON.stringify(remaining));
        }
    }

    // Attempt sync on page load
    if (navigator.onLine) {
        syncPendingSubmissions();
    }

    window.addEventListener('online', syncPendingSubmissions);

    // ==================== NEWSLETTER (if present) ====================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            const btn = newsletterForm.querySelector('button');
            
            if (!email) {
                showToast('Please enter your email.', 'error');
                return;
            }

            setButtonLoading(btn, true);
            try {
                const response = await fetch(`${API_BASE}/api/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const result = await response.json();
                
                if (response.ok) {
                    showToast(result.message, 'success');
                    newsletterForm.reset();
                } else if (response.status === 409) {
                    showToast('You are already subscribed!', 'success');
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                showToast('Unable to subscribe right now. Please try again later.', 'error');
            } finally {
                setButtonLoading(btn, false);
            }
        });
    }

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==================== ACTIVE NAV HIGHLIGHTING ====================
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a:not(.btn-primary-sm)');
    
    if (sections.length > 0 && navLinksAll.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            const scrollPos = window.scrollY + 150;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinksAll.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.includes('#' + current)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ==================== ANALYTICS (Page View Tracking) ====================
    // Track page view on load
    try {
        fetch(`${API_BASE}/api/analytics/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page: window.location.pathname,
                referrer: document.referrer
            })
        }).catch(() => {}); // Silently fail
    } catch (e) {}

    // ==================== WHATSAPP NUMBER UPDATE REMINDER ====================
    // Check if placeholder is still present
    const waLinks = document.querySelectorAll('a[href*="YOUR_PHONE_NUMBER_HERE"]');
    if (waLinks.length > 0) {
        console.warn('⚠️  REMINDER: Replace YOUR_PHONE_NUMBER_HERE in all WhatsApp links with your actual number!');
    }
});
