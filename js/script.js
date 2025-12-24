import { personalInfo, skills, experience, projects, certifications, education, publications, recommendations } from '../data/content.js';

// --- Theme Toggle ---
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const defaultTheme = 'dark'; // Force default dark

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
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
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.background = 'rgba(100, 100, 100, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.background = 'transparent';
        });
    });
}

// --- Render Functions ---

function renderAbout() {
    const container = document.querySelector('.about-content');
    if (!container) return;
    container.innerHTML = personalInfo.about.split('\n\n').map(p => `<p>${p}</p>`).join('');
}

function renderCertifications() {
    const container = document.getElementById('cert-grid');
    if (!container) return;

    certifications.forEach((cert, i) => {
        const div = document.createElement('div');
        div.className = 'cert-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;

        div.innerHTML = `
            <div class="cert-header">
                <div class="cert-logo">${cert.logo}</div>
                <div>
                    <h4 class="cert-name" style="margin:0;">${cert.name}</h4>
                    <span style="font-size:0.9rem; color:var(--text-secondary);">${cert.issuer}</span>
                </div>
            </div>
            <div class="cert-meta">
                <span>Issued ${cert.date}</span>
                <span class="cert-id">ID: ${cert.id}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderSkills() {
    const container = document.getElementById('skills-grid');
    if (!container) return;

    Object.entries(skills).forEach(([category, list], i) => {
        const div = document.createElement('div');
        div.className = 'skill-category-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        const tags = list.map(s => `<span class="skill-tag">${s}</span>`).join('');
        div.innerHTML = `
            <h3 class="skill-category-title">${category}</h3>
            <div class="skill-tags">${tags}</div>
        `;
        container.appendChild(div);
    });
}

function renderExperience() {
    const container = document.getElementById('experience-timeline');
    if (!container) return;

    experience.forEach((job, i) => {
        const div = document.createElement('div');
        div.className = 'timeline-item fade-up';

        const achievements = job.achievements.map(a => `<li>${a}</li>`).join('');

        let subRolesHtml = '';
        if (job.subRoles) {
            subRolesHtml = job.subRoles.map(sub => {
                const subAch = sub.achievements.map(sa => `<li>${sa}</li>`).join('');
                return `
                    <div class="timeline-sub-role">
                        <h4>${sub.role}</h4>
                        <div class="timeline-period" style="font-size:0.8rem;">${sub.period}</div>
                        <ul style="padding-left:20px; color:var(--text-secondary); margin-top:8px;">${subAch}</ul>
                    </div>
                `;
            }).join('');
        }

        div.innerHTML = `
            <h3 class="timeline-role">${job.role}</h3>
            <div class="timeline-company">${job.company}</div>
            <div class="timeline-period">${job.period}</div>
            <p style="margin-bottom:12px;">${job.description}</p>
            <ul style="padding-left:20px; color:var(--text-secondary);">${achievements}</ul>
            ${subRolesHtml}
        `;
        container.appendChild(div);
    });
}

function renderEducation() {
    const container = document.getElementById('education-grid');
    if (!container) return;

    education.forEach((edu, i) => {
        const div = document.createElement('div');
        div.className = 'education-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        div.innerHTML = `
            <h3>${edu.degree}</h3>
            <div class="education-school">${edu.school}</div>
            <div class="timeline-period">${edu.year}</div>
        `;
        container.appendChild(div);
    });
}

function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    projects.forEach((proj, i) => {
        const div = document.createElement('div');
        div.className = 'project-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        const tags = proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
        div.innerHTML = `
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
            <div class="project-tags">${tags}</div>
        `;
        container.appendChild(div);
    });
}

function renderPublications() {
    const container = document.getElementById('publications-grid');
    if (!container) return;

    publications.forEach((pub, i) => {
        const div = document.createElement('div');
        div.className = 'publication-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        div.innerHTML = `
            <h3 class="publication-title">${pub.title}</h3>
            <div class="publication-journal">${pub.journal}</div>
            <p class="publication-desc">${pub.description}</p>
            <a href="${pub.link}" class="btn btn-outline btn-sm" target="_blank" rel="noopener">Read Publication</a>
        `;
        container.appendChild(div);
    });
}



function renderRecommendations() {
    const container = document.getElementById('recommendations-grid');
    if (!container) return;

    recommendations.forEach((rec, i) => {
        const div = document.createElement('div');
        div.className = 'recommendation-card fade-up';
        div.style.transitionDelay = `${i * 0.1}s`;
        div.innerHTML = `
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
        `;
        container.appendChild(div);
    });
}



function renderContact() {
    const container = document.getElementById('contact-content');
    if (!container) return;

    personalInfo.socials.forEach((social, i) => {
        const a = document.createElement('a');
        a.href = social.url;
        a.className = 'social-link fade-up';
        // Only open in new tab for non-mailto links
        if (!social.url.startsWith('mailto:')) {
            a.target = "_blank";
            a.rel = "noopener";
        }
        a.style.transitionDelay = `${i * 0.1}s`;
        a.innerHTML = `
            ${social.icon}
            <span>${social.name}</span>
        `;
        container.appendChild(a);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderAbout();
    renderCertifications();
    renderSkills();
    renderExperience();
    renderEducation();
    renderProjects();
    renderPublications();
    renderRecommendations();
    renderContact();

    document.getElementById('year').textContent = new Date().getFullYear();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));
});
