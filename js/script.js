import { personalInfo, skills, experience, projects, certifications, education, publications, recommendations } from '../data/content.js';

// --- Theme Toggle ---
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const defaultTheme = 'dark'; // Force default dark

// SVG icons for theme toggle
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
}

if (savedTheme) {
    setTheme(savedTheme);
} else {
    setTheme(defaultTheme);
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// --- Custom Cursor ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.matchMedia("(pointer: fine)").matches) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    // Use requestAnimationFrame for smoother cursor physics
    const loop = () => {
        // Easing factor
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;

        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    requestAnimationFrame(loop);

    const applyMagnetic = () => {
        cursorOutline.classList.add('magnetic');
        cursorDot.style.opacity = '0';
    };

    const removeMagnetic = () => {
        cursorOutline.classList.remove('magnetic');
        cursorDot.style.opacity = '1';
    };

    const addHoverListeners = () => {
        document.querySelectorAll('a, button, .card').forEach(el => {
            el.addEventListener('mouseenter', applyMagnetic);
            el.addEventListener('mouseleave', removeMagnetic);
        });
    };

    // Call initially and exported to be called after dynamic renders
    addHoverListeners();
}

// --- Card Glow Effect (Dynamic Flashlight) ---
function attachGlowEffect() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

function setActiveIndicator(dots, activeIndex) {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
        dot.setAttribute('aria-pressed', String(index === activeIndex));
    });
}

function getOrCreateIndicatorContainer(scroller, className) {
    if (!scroller?.parentElement) return null;

    let container = scroller.parentElement.querySelector(`.${className}`);
    if (!container) {
        container = document.createElement('div');
        container.className = `carousel-indicators mobile-carousel-indicators ${className}`;
        scroller.insertAdjacentElement('afterend', container);
    }

    container.innerHTML = '';
    return container;
}

function setupMobileScrollIndicators({ scroller, items, className, onActiveChange }) {
    const slides = Array.from(items || []);
    if (!scroller) return null;

    const existingContainer = scroller.parentElement?.querySelector(`.${className}`);
    if (slides.length <= 1) {
        existingContainer?.remove();
        return null;
    }

    const indicatorsContainer = getOrCreateIndicatorContainer(scroller, className);
    if (!indicatorsContainer) return null;

    slides.forEach((slide, index) => {
        slide.dataset.index = String(index);
    });

    const dots = slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `indicator-dot${index === 0 ? ' active' : ''}`;
        dot.dataset.index = index;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        indicatorsContainer.appendChild(dot);
        return dot;
    });

    const setActive = (index) => {
        setActiveIndicator(dots, index);
        if (typeof onActiveChange === 'function') {
            onActiveChange(index);
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            slides[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            setActive(index);
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.65) return;
                const index = Number(entry.target.dataset.index);
                if (Number.isNaN(index)) return;
                setActive(index);
            });
        }, { root: scroller, threshold: [0.65, 0.85] });

        slides.forEach((slide) => observer.observe(slide));
    }

    return { indicatorsContainer, dots, setActive };
}

// --- Render Functions ---

function renderAbout() {
    const container = document.querySelector('.about-content');
    if (!container) return;
    container.innerHTML = personalInfo.about.split('\n\n').map(p => `<p style="margin-bottom: 20px;">${p}</p>`).join('');
}

function renderCertifications() {
    const container = document.getElementById('cert-grid');
    if (!container) return;
    container.innerHTML = '';

    certifications.forEach((cert, i) => {
        const div = document.createElement('div');
        div.className = 'card cert-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;

        div.innerHTML = `
            <div class="cert-header">
                <div class="cert-logo">${cert.logo}</div>
                <div>
                    <h4 class="cert-name" style="margin:0;">${cert.name}</h4>
                    <span class="cert-issuer">${cert.issuer}</span>
                </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;  font-size: 0.85rem; color: var(--text-tertiary); margin-top: 16px;">
                <span>Issued ${cert.date}</span>
                <span style="font-family: monospace;">ID: ${cert.id}</span>
            </div>
        `;
        container.appendChild(div);
    });

    setupMobileScrollIndicators({
        scroller: container,
        items: container.querySelectorAll('.cert-card'),
        className: 'cert-mobile-indicators'
    });
}

function renderSkills() {
    const container = document.getElementById('skills-grid');
    const mobileShell = document.getElementById('skills-mobile-shell');
    if (!container) return;
    container.innerHTML = '';
    if (mobileShell) mobileShell.innerHTML = '';

    const skillEntries = Object.entries(skills);

    skillEntries.forEach(([category, list], i) => {
        const div = document.createElement('div');
        div.className = 'card skill-category-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        const tags = list.map(s => `<span class="tag">${s}</span>`).join('');
        div.innerHTML = `
            <h3 class="skill-category-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ${category}
            </h3>
            <div class="skill-tags">${tags}</div>
        `;
        container.appendChild(div);
    });

    if (!mobileShell) return;

    const pills = document.createElement('div');
    pills.className = 'skills-pills fade-up';
    pills.setAttribute('role', 'tablist');
    pills.setAttribute('aria-label', 'Technical expertise categories');

    const track = document.createElement('div');
    track.className = 'skills-mobile-track fade-up';

    skillEntries.forEach(([category, list], i) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `skills-pill${i === 0 ? ' active' : ''}`;
        pill.dataset.index = i;
        pill.setAttribute('role', 'tab');
        pill.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        pill.textContent = category;
        pills.appendChild(pill);

        const slide = document.createElement('article');
        slide.className = 'skills-mobile-card card fade-up';
        slide.dataset.index = i;
        slide.setAttribute('role', 'tabpanel');
        slide.innerHTML = `
            <div class="skills-mobile-card-head">
                <span class="skills-mobile-chip">${category}</span>
            </div>
            <div class="skill-tags">${list.map(skill => `<span class="tag">${skill}</span>`).join('')}</div>
        `;
        track.appendChild(slide);
    });

    mobileShell.appendChild(pills);
    mobileShell.appendChild(track);

    const pillButtons = pills.querySelectorAll('.skills-pill');
    const slides = track.querySelectorAll('.skills-mobile-card');

    const setActiveSkill = (index) => {
        pillButtons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === index;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });
    };

    pillButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            const targetSlide = slides[index];
            if (!targetSlide) return;
            targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            setActiveSkill(index);
        });
    });

    setupMobileScrollIndicators({
        scroller: track,
        items: slides,
        className: 'skills-mobile-indicators',
        onActiveChange: setActiveSkill
    });
}

function buildExperienceSummary(item) {
    const summaryParts = [];

    if (item.description) {
        summaryParts.push(item.description);
    }

    if (Array.isArray(item.achievements) && item.achievements.length > 0) {
        const limit = item.description ? 1 : 2;
        summaryParts.push(item.achievements.slice(0, limit).join(' '));
    }

    return summaryParts.join(' ').trim();
}

function renderExperience() {
    const container = document.getElementById('experience-timeline');
    const mobileContainer = document.getElementById('mobile-experience-timeline');
    if (!container) return;
    container.innerHTML = '';
    if (mobileContainer) mobileContainer.innerHTML = '';

    experience.forEach((job, i) => {
        const div = document.createElement('div');
        div.className = 'timeline-item fade-up';

        let subRolesHtml = '';
        if (job.subRoles) {
            subRolesHtml = job.subRoles.map(sub => {
                const subAch = sub.achievements.map(sa => `<li>${sa}</li>`).join('');
                return `
                    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; flex-wrap:wrap; gap:8px;">
                            <h4 style="color:var(--text-primary); font-size: 1.1rem;">${sub.role}</h4>
                            <div class="timeline-period">${sub.period}</div>
                        </div>
                        <ul class="timeline-achievements">${subAch}</ul>
                    </div>
                `;
            }).join('');
        }

        const achievements = job.achievements.map(a => `<li>${a}</li>`).join('');

        div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <div>
                        <h3 class="timeline-role">${job.role}</h3>
                        <div class="timeline-company">${job.company}</div>
                    </div>
                    <div class="timeline-period">${job.period}</div>
                </div>
                <p class="timeline-desc">${job.description}</p>
                <ul class="timeline-achievements">${achievements}</ul>
                ${subRolesHtml}
            </div>
        `;
        container.appendChild(div);
    });

    if (!mobileContainer) return;

    const mobileEntries = [];

    experience.forEach((job) => {
        mobileEntries.push({
            role: job.role,
            company: job.company,
            period: job.period,
            summary: buildExperienceSummary(job)
        });

        if (Array.isArray(job.subRoles)) {
            job.subRoles.forEach((subRole) => {
                mobileEntries.push({
                    role: subRole.role,
                    company: job.company,
                    period: subRole.period,
                    summary: buildExperienceSummary(subRole)
                });
            });
        }
    });

    mobileEntries.forEach((entry, i) => {
        const article = document.createElement('article');
        article.className = 'mobile-exp-item fade-up';
        article.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
        article.innerHTML = `
            <span class="mobile-exp-marker" aria-hidden="true"></span>
            <div class="mobile-exp-card">
                <div class="mobile-exp-top">
                    <div>
                        <h3 class="mobile-exp-role">${entry.role}</h3>
                        <div class="mobile-exp-company">${entry.company}</div>
                    </div>
                    <div class="mobile-exp-period">${entry.period}</div>
                </div>
                <p class="mobile-exp-summary">${entry.summary}</p>
            </div>
        `;
        mobileContainer.appendChild(article);
    });
}

function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    container.innerHTML = '';

    projects.forEach((proj, i) => {
        const div = document.createElement('div');
        div.className = 'card project-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        div.innerHTML = `
            <div style="margin-bottom: 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </div>
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
        `;
        container.appendChild(div);
    });

    setupMobileScrollIndicators({
        scroller: container,
        items: container.querySelectorAll('.project-card'),
        className: 'projects-mobile-indicators'
    });
}

function renderEducation() {
    const container = document.getElementById('education-grid');
    if (!container) return;

    education.forEach((edu, i) => {
        const div = document.createElement('div');
        div.className = 'card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        div.innerHTML = `
            <div class="cert-header">
                <div class="edu-logo">${edu.logo}</div>
                <div>
                    <h4 class="cert-name" style="margin:0;">${edu.degree}</h4>
                    <div style="color: var(--accent); font-weight: 500; font-size: 0.95rem;">${edu.school}</div>
                </div>
            </div>
            ${edu.year ? `<div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 16px;">${edu.year}</div>` : ''}
        `;
        container.appendChild(div);
    });
}

function renderPublications() {
    const container = document.getElementById('publications-grid');
    if (!container) return;
    container.innerHTML = '';

    publications.forEach((pub, i) => {
        const div = document.createElement('div');
        div.className = 'card publication-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        div.innerHTML = `
            <h3 class="project-title">${pub.title}</h3>
            <div style="color: var(--accent); font-weight: 500; font-size: 0.9rem; margin-bottom: 12px;">${pub.journal}</div>
            <p class="project-desc" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">${pub.description}</p>
            <a href="${pub.link}" class="btn btn-outline" style="font-size: 0.85rem; padding: 10px 20px;" target="_blank" rel="noopener">
                Read Publication
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
        `;
        container.appendChild(div);
    });

    setupMobileScrollIndicators({
        scroller: container,
        items: container.querySelectorAll('.publication-card'),
        className: 'publications-mobile-indicators'
    });
}

function renderRecommendations() {
    const track = document.getElementById('recommendations-track');
    const viewport = document.querySelector('#recommendations .carousel-viewport');
    const indicatorsContainer = document.getElementById('rec-indicators');
    if (!track) return;
    track.innerHTML = '';
    if (indicatorsContainer) indicatorsContainer.innerHTML = '';

    recommendations.forEach((rec, i) => {
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = `
            <div class="card">
                <div class="rec-header">
                    <img src="${rec.image}" alt="${rec.name}" class="rec-avatar">
                    <div>
                        <h4 class="rec-name">
                            <a href="${rec.linkedin}" target="_blank" rel="noopener" style="text-decoration:none; color:inherit;">
                                ${rec.name}
                            </a>
                        </h4>
                        <span class="rec-role">${rec.role} at ${rec.company}</span>
                    </div>
                </div>
                <p class="rec-text">"${rec.text}"</p>
            </div>
        `;
        track.appendChild(div);
    });

    // Carousel Logic
    let currentIndex = 0;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    const dots = indicatorsContainer
        ? items.map((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = `indicator-dot${index === 0 ? ' active' : ''}`;
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Go to recommendation ${index + 1}`);
            dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
            indicatorsContainer.appendChild(dot);
            return dot;
        })
        : [];

    const isMobileRecommendations = () => window.matchMedia('(max-width: 768px)').matches;

    const syncRecommendationHeight = () => {
        if (!viewport) return;

        if (!isMobileRecommendations()) {
            viewport.style.height = '';
            return;
        }

        const activeCard = items[currentIndex]?.querySelector('.card');
        if (!activeCard) return;

        const viewportStyles = window.getComputedStyle(viewport);
        const verticalPadding =
            parseFloat(viewportStyles.paddingTop || '0') +
            parseFloat(viewportStyles.paddingBottom || '0');

        viewport.style.height = `${Math.ceil(activeCard.getBoundingClientRect().height + verticalPadding)}px`;
    };

    const getMobileScroller = () => (isMobileRecommendations() ? track : viewport);

    const moveRecommendationCarousel = (behavior = 'smooth') => {
        const activeItem = items[currentIndex];
        if (!activeItem) return;

        if (isMobileRecommendations()) {
            track.style.transform = '';
            track.scrollTo({
                left: activeItem.offsetLeft,
                behavior
            });
        } else {
            track.style.transform = `translateX(-${activeItem.offsetLeft}px)`;
        }

        setActiveIndicator(dots, currentIndex);
        syncRecommendationHeight();
    };

    document.getElementById('prev-rec')?.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
        moveRecommendationCarousel();
    });

    document.getElementById('next-rec')?.addEventListener('click', () => {
        currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
        moveRecommendationCarousel();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.currentTarget.dataset.index, 10);
            moveRecommendationCarousel();
        });
    });

    if (viewport) {
        let scrollFrame = 0;

        const syncRecommendationIndexFromScroll = () => {
            const scroller = getMobileScroller();
            if (!isMobileRecommendations()) return;
            if (!scroller) return;

            const closestIndex = items.reduce((closest, item, index) => {
                const distance = Math.abs(item.offsetLeft - scroller.scrollLeft);
                return distance < closest.distance ? { index, distance } : closest;
            }, { index: currentIndex, distance: Number.POSITIVE_INFINITY }).index;

            if (closestIndex === currentIndex) return;

            currentIndex = closestIndex;
            setActiveIndicator(dots, currentIndex);
            syncRecommendationHeight();
        };

        track.addEventListener('scroll', () => {
            if (!isMobileRecommendations()) return;
            if (scrollFrame) {
                cancelAnimationFrame(scrollFrame);
            }

            scrollFrame = requestAnimationFrame(() => {
                syncRecommendationIndexFromScroll();
                scrollFrame = 0;
            });
        }, { passive: true });

        items.forEach((item) => {
            item.querySelectorAll('img').forEach((image) => {
                image.addEventListener('load', syncRecommendationHeight);
            });
        });

        window.addEventListener('resize', () => {
            syncRecommendationHeight();
            moveRecommendationCarousel('auto');
        });
    }

    if (window.innerWidth <= 768) {
        track.scrollLeft = 0;
    }

    moveRecommendationCarousel('auto');
}

function renderContact() {
    const container = document.getElementById('contact-content');
    if (!container) return;
    container.innerHTML = '';

    // ─── Left column: social / contact links (your existing logic) ───
    const linksCol = document.createElement('div');
    linksCol.className = 'contact-links-col';

    personalInfo.socials.forEach((social, i) => {
        const a = document.createElement('a');
        a.href = social.url;
        a.className = 'social-link fade-up';
        if (!social.url.startsWith('mailto:')) {
            a.target = '_blank';
            a.rel = 'noopener';
        }
        a.style.transitionDelay = `${i * 0.1}s`;
        a.innerHTML = `${social.icon}<span>${social.name}</span>`;
        linksCol.appendChild(a);
    });

    // ─── Right column: contact form ───
    const formCol = document.createElement('div');
    formCol.className = 'contact-form-col fade-up';
    formCol.style.transitionDelay = '0.2s';

    formCol.innerHTML = `
        <form id="contact-form" novalidate>
            <div class="form-row">
                <div class="form-group">
                    <label for="cf-name">Name</label>
                    <input type="text" id="cf-name" name="name"
                           placeholder="Your name" required autocomplete="name" />
                </div>
                <div class="form-group">
                    <label for="cf-email">Email</label>
                    <input type="email" id="cf-email" name="email"
                           placeholder="you@example.com" required autocomplete="email" />
                </div>
            </div>
            <div class="form-group">
                <label for="cf-subject">Subject</label>
                <input type="text" id="cf-subject" name="subject"
                       placeholder="What's this about?" required />
            </div>
            <div class="form-group">
                <label for="cf-message">Message</label>
                <textarea id="cf-message" name="message" rows="5"
                          placeholder="Tell me about your project, idea, or just say hi…" required></textarea>
            </div>

            <!-- Status message (hidden by default) -->
            <div id="form-status" class="form-status" aria-live="polite"></div>

            <button type="submit" class="btn btn-primary" id="form-submit-btn">
                Send Message
                <!-- Arrow icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            </button>
        </form>
    `;

    // ─── Wrap both cols in a two-column layout ───
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr 1.6fr';
    container.style.gap = '3rem';
    container.style.alignItems = 'center';

    container.appendChild(linksCol);
    container.appendChild(formCol);

    // Wire up the form submission
    handleContactForm();
}

function renderFooterSocials() {
    const container = document.getElementById('mobile-footer-socials');
    if (!container) return;

    container.innerHTML = '';

    personalInfo.socials.forEach((social) => {
        const link = document.createElement('a');
        link.href = social.url;
        link.className = 'footer-social-link';
        link.setAttribute('aria-label', social.name);
        link.innerHTML = social.icon;

        if (!social.url.startsWith('mailto:')) {
            link.target = '_blank';
            link.rel = 'noopener';
        }

        container.appendChild(link);
    });
}

// ─────────────────────────────────────────────
//  Contact Form Handler — Web3Forms integration
//  Sign up free at https://web3forms.com
//  Paste your Access Key below (from your dashboard)
// ─────────────────────────────────────────────
function handleContactForm() {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    const submitBtn = document.getElementById('form-submit-btn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ── Basic client-side validation ──
        const name = form.querySelector('#cf-name').value.trim();
        const email = form.querySelector('#cf-email').value.trim();
        const subject = form.querySelector('#cf-subject').value.trim();
        const message = form.querySelector('#cf-message').value.trim();

        if (!name || !email || !subject || !message) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        // ── Loading state ──
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        try {
            // ── Web3Forms API call ──
            // TODO: Replace 'YOUR_WEB3FORMS_ACCESS_KEY' with your actual key.
            //       Get it free at https://web3forms.com → Create Form → copy the key.
            //       No backend needed — emails arrive directly to your inbox.
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    access_key: '7ec3e9a5-45bb-4515-a8a2-83da0f77c0b0', // ← PASTE YOUR KEY HERE

                    // These map to the email you receive:
                    name,
                    email,
                    subject,
                    message,

                    // Optional: customise the email subject line in your inbox
                    // (Web3Forms uses this field automatically)
                    // subject: `Portfolio contact: ${subject}`,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showStatus('Message sent! I\'ll get back to you soon. 🎉', 'success');
                form.reset();
            } else {
                // Web3Forms returned an error
                showStatus(data.message || 'Something went wrong. Please try again.', 'error');
            }
        } catch (err) {
            // Network or unexpected error
            showStatus('Unable to send — please try emailing me directly.', 'error');
            console.error('Contact form error:', err);
        } finally {
            // ── Restore button ──
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Send Message
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>`;
        }
    });

    // Helper: show status message
    function showStatus(msg, type) {
        statusEl.textContent = msg;
        statusEl.className = `form-status ${type}`; // CSS classes: .success / .error
        statusEl.style.display = 'block';

        // Auto-hide success after 6 s
        if (type === 'success') {
            setTimeout(() => { statusEl.style.display = 'none'; }, 6000);
        }
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    if (!mobileMenuBtn || !navLinksContainer) return;

    const setMenuState = (isOpen) => {
        navLinksContainer.classList.toggle('is-open', isOpen);
        mobileMenuBtn.classList.toggle('is-open', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
        document.body.classList.toggle('menu-open', isOpen);
    };

    mobileMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        setMenuState(!navLinksContainer.classList.contains('is-open'));
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('click', (event) => {
        if (!navLinksContainer.classList.contains('is-open')) return;
        if (navLinksContainer.contains(event.target) || mobileMenuBtn.contains(event.target)) return;
        setMenuState(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            setMenuState(false);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Render dynamic content
    renderAbout();
    renderSkills();
    renderExperience();
    renderEducation();
    renderProjects();
    renderPublications();
    renderCertifications();
    renderRecommendations();
    renderContact();
    renderFooterSocials();
    initMobileMenu();

    document.getElementById('year').textContent = new Date().getFullYear();

    // Attach Javascript behavior to dynamically injected elements
    attachGlowEffect();

    // Re-attach custom cursor magnetic listeners for injected dynamic elements
    if (window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll('.card').forEach(el => {
            el.addEventListener('mouseenter', () => document.querySelector('.cursor-outline').classList.add('magnetic'));
            el.addEventListener('mouseleave', () => document.querySelector('.cursor-outline').classList.remove('magnetic'));
        });
    }

    // Scroll Observer for Active Nav Links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const dockLinks = document.querySelectorAll('.mobile-dock-link');

    const updateActiveLinks = (links, id) => {
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveLinks(navLinks, id);
                updateActiveLinks(dockLinks, id);
            }
        });
    }, { threshold: 0.3, rootMargin: "-50px 0px -20% 0px" });

    sections.forEach(section => navObserver.observe(section));

    // Scroll Observer for Fade Up Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});
