// Main Application Controller
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Theme Management
  const themeSelect = document.getElementById('theme-select');
  const savedTheme = localStorage.getItem('shreya_portfolio_theme') || 'cyber';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', (e) => {
      const theme = e.target.value;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('shreya_portfolio_theme', theme);
    });
  }

  // 2. Dynamic Hero Role Typing Animation
  const typedRoleEl = document.getElementById('typed-role');
  if (typedRoleEl) {
    const roles = [
      'Full-Stack Software Engineer',
      'AI/ML & Generative AI Specialist',
      'Scalable Backend System Architect',
      'Competitive Programmer (200+ Solved)',
      'Design Head & UI/UX Leader'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLoop() {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typedRoleEl.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 40;
      } else {
        typedRoleEl.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        isDeleting = true;
        typingSpeed = 1800; // Pause at end of word
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingSpeed = 400; // Pause before new word
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  // 3. Dynamic Projects Rendering & Filtering
  let allProjects = [];
  const projectsGrid = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  try {
    const res = await fetch('/api/projects');
    allProjects = await res.json();
    renderProjects(allProjects);
  } catch (err) {
    console.error('Failed to load projects from API, falling back to static embed:', err);
  }

  function renderProjects(projects) {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-category', project.category);

      const statsHtml = project.stats.map(s => `
        <div class="pstat-item">
          <span class="pstat-val">${s.val}</span>
          <span class="pstat-label">${s.label}</span>
        </div>
      `).join('');

      const tagsHtml = project.tags.slice(0, 5).map(t => `<span class="tag-pill">${t}</span>`).join('');

      card.innerHTML = `
        <div class="project-thumb-wrap">
          <img src="${project.image}" alt="${project.title}" class="project-thumb" loading="lazy" onerror="this.src='assets/images/avatar.svg'">
          <span class="project-category-badge">${project.categoryLabel}</span>
          <span class="project-year-badge">${project.year}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title font-heading">${project.title.split('—')[0].trim()}</h3>
          <p class="project-tagline">${project.tagline}</p>
          <p class="project-summary">${project.summary.substring(0, 160)}...</p>
          <div class="project-stats-grid">
            ${statsHtml}
          </div>
          <div class="project-tags">
            ${tagsHtml}
          </div>
          <div class="project-actions">
            <button type="button" class="btn-case-study" data-project-id="${project.id}">
              Inspect Architecture ▹
            </button>
            <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn-icon-link" title="GitHub Repository">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            ${project.liveDemo ? `
              <a href="${project.liveDemo}" target="_blank" rel="noopener noreferrer" class="btn-icon-link" title="Live Application / Demo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            ` : ''}
          </div>
        </div>
      `;

      projectsGrid.appendChild(card);
    });

    // Attach case study modal openers
    document.querySelectorAll('.btn-case-study').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-project-id');
        openCaseStudyModal(pId);
      });
    });
  }

  // Filter click handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      if (cat === 'all') {
        renderProjects(allProjects);
      } else {
        const filtered = allProjects.filter(p => p.category === cat);
        renderProjects(filtered);
      }
    });
  });

  // 4. Case Study Modal Engine
  const modalOverlay = document.getElementById('case-study-modal');
  const modalClose = document.getElementById('modal-close');
  const modalContent = document.getElementById('modal-body-content');

  function openCaseStudyModal(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project || !modalContent) return;

    modalContent.innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <span class="project-category-badge" style="position:static; display:inline-block; margin-bottom:0.75rem;">${project.categoryLabel} • ${project.year}</span>
        <h2 class="font-heading" style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">${project.title}</h2>
        <p style="color:var(--accent-blue); font-family:'JetBrains Mono'; font-size:0.95rem;">${project.tagline}</p>
      </div>

      <div style="width:100%; height:260px; border-radius:12px; overflow:hidden; margin-bottom:1.75rem; border:1px solid var(--border-color); background:#070B0E;">
        <img src="${project.image}" alt="${project.title}" style="width:100%; height:100%; object-fit:contain;">
      </div>

      <div style="margin-bottom:1.5rem;">
        <h3 class="font-heading" style="font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; color:var(--text-main);">Project Synopsis</h3>
        <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.7;">${project.summary}</p>
      </div>

      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
        <h3 class="font-heading" style="font-size:1.15rem; font-weight:700; margin-bottom:0.5rem; color:var(--accent-cyan);">System Architecture &amp; Data Pipeline</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.65;">${project.architecture}</p>
      </div>

      <div style="margin-bottom:1.75rem;">
        <h3 class="font-heading" style="font-size:1.15rem; font-weight:700; margin-bottom:0.75rem; color:#FFFFFF;">Interview Talking Points &amp; Technical Decisions</h3>
        <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.6rem;">
          ${project.interviewPoints.map(pt => `
            <li style="position:relative; padding-left:1.5rem; color:var(--text-muted); font-size:0.92rem; line-height:1.6;">
              <span style="position:absolute; left:0; color:var(--accent-cyan); font-weight:bold;">▹</span>
              ${pt}
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:2rem;">
        ${project.tags.map(t => `<span class="tag-pill" style="font-size:0.8rem; padding:0.3rem 0.75rem;">${t}</span>`).join('')}
      </div>

      <div style="display:flex; gap:1rem; border-top:1px solid var(--border-color); padding-top:1.5rem;">
        <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex:1; justify-content:center;">
          View Source on GitHub ↗
        </a>
        ${project.liveDemo ? `
          <a href="${project.liveDemo}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="flex:1; justify-content:center;">
            Launch Live Application ↗
          </a>
        ` : ''}
      </div>
    `;

    modalOverlay.classList.add('active');
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  // 5. Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Dispatching Transmission...';

      const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (res.ok) {
          formStatus.className = 'form-status success';
          formStatus.innerText = data.message;
          contactForm.reset();
        } else {
          formStatus.className = 'form-status error';
          formStatus.innerText = data.error || 'Failed to dispatch message.';
        }
      } catch (err) {
        formStatus.className = 'form-status error';
        formStatus.innerText = 'Network error: Message failed to send. Please email shreyakhadekar@gmail.com directly.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Message ▹';
      }
    });
  }

  // 6. Copy Email Button
  const btnCopyEmail = document.getElementById('btn-copy-email');
  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
      navigator.clipboard.writeText('shreyakhadekar@gmail.com').then(() => {
        const origText = btnCopyEmail.innerText;
        btnCopyEmail.innerText = '✓ Copied!';
        setTimeout(() => btnCopyEmail.innerText = origText, 2000);
      });
    });
  }

  // 7. Active Nav Scrollspy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 8. Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinksList = document.getElementById('nav-links');
  if (mobileBtn && navLinksList) {
    mobileBtn.addEventListener('click', () => {
      navLinksList.style.display = navLinksList.style.display === 'flex' ? 'none' : 'flex';
      navLinksList.style.flexDirection = 'column';
      navLinksList.style.position = 'absolute';
      navLinksList.style.top = '72px';
      navLinksList.style.left = '0';
      navLinksList.style.width = '100%';
      navLinksList.style.background = 'var(--bg-glass)';
      navLinksList.style.padding = '1.5rem';
      navLinksList.style.borderBottom = '1px solid var(--border-color)';
    });
  }
});
