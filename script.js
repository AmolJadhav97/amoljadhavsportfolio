(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;

  /* ============ YEAR ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ LOADER ============ */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, reduceMotion ? 200 : 1400);
  });

  /* ============ SMOOTH SCROLL (Lenis) ============ */
  let lenis;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* Anchor links -> smooth scroll via Lenis or native */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      closeMobileMenu();
    });
  });

  /* ============ NAV SCROLL STATE ============ */
  const siteNav = document.getElementById('site-nav');
  const onScroll = () => {
    siteNav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ MOBILE MENU ============ */
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  }
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* ============ HERO ROTATOR ============ */
  const rotatorWords = document.querySelectorAll('.rotator-word');
  if (rotatorWords.length) {
    let idx = 0;
    setInterval(() => {
      rotatorWords[idx].classList.remove('is-active');
      idx = (idx + 1) % rotatorWords.length;
      rotatorWords[idx].classList.add('is-active');
    }, 3200);
  }

  /* ============ SCROLL REVEALS ============ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ PIPELINE RAIL + NAV ACTIVE STATE ============ */
  const railItems = Array.from(document.querySelectorAll('.pipeline-rail li'));
  const railFill = document.querySelector('.rail-line-fill');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const scenes = railItems
    .map(li => document.getElementById(li.dataset.target))
    .filter(Boolean);

  railItems.forEach(li => {
    li.addEventListener('click', () => {
      const target = document.getElementById(li.dataset.target);
      if (!target) return;
      if (lenis) lenis.scrollTo(target); else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  function updateRail() {
    const scrollPos = window.scrollY + window.innerHeight * 0.4;
    let activeIndex = 0;
    scenes.forEach((scene, i) => {
      if (scene.offsetTop <= scrollPos) activeIndex = i;
    });

    railItems.forEach((li, i) => {
      li.classList.toggle('is-active', i === activeIndex);
      li.classList.toggle('is-passed', i < activeIndex);
    });

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
    if (railFill) railFill.style.height = pct + '%';

    const activeId = scenes[activeIndex] ? scenes[activeIndex].id : null;
    navLinks.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + activeId);
    });
  }
  window.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);
  updateRail();

  /* ============ TIMELINE FILL ============ */
  const timelineTrackFill = document.querySelector('.timeline-track-fill');
  const timeline = document.getElementById('timeline');
  function updateTimeline() {
    if (!timeline || !timelineTrackFill) return;
    const rect = timeline.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.6;
    const total = rect.height;
    const progressed = Math.min(total, Math.max(0, viewportCenter - rect.top));
    timelineTrackFill.style.height = (total > 0 ? (progressed / total) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();

  /* ============ ANIMATED COUNTERS ============ */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = reduceMotion ? 0 : 1600;
      const start = performance.now();

      function tick(now) {
        const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = prefix + value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* ============ TECH DOCK TOOLTIPS ============ */
  document.querySelectorAll('.dock-icon').forEach(btn => {
    const tooltip = document.createElement('span');
    tooltip.className = 'dock-tooltip';
    tooltip.innerHTML = `
      <strong>${btn.dataset.name}</strong>
      <span>${btn.dataset.desc}</span>
      <span class="years">${btn.dataset.years} experience</span>
    `;
    btn.appendChild(tooltip);
    btn.setAttribute('aria-label', `${btn.dataset.name}: ${btn.dataset.desc}`);
  });

  /* ============ AI DEMO SEQUENCE ============ */
  const aiSection = document.getElementById('ai');
  const aiPromptText = document.getElementById('ai-prompt-text');
  const aiPromptBubble = document.getElementById('ai-prompt');
  const aiThinking = document.getElementById('ai-thinking');
  const aiResponse = document.getElementById('ai-response');
  const aiResponseText = document.getElementById('ai-response-text');

  const PROMPT_LOG = 'Work Item #45231:\nTitle: Update token expiry handling\nDescription: Modify authentication service logic to refresh expired tokens automatically.\n\nWork Item #45245:\nTitle: Improve deployment validation\nDescription: Add additional checks to reduce failed deployment scenarios.';
  const RESPONSE_TEXT = 'This release improves application security and deployment reliability by enhancing authentication token handling and introducing additional validation checks. These updates reduce user disruption caused by session expiry issues and improve release stability.';

  let aiPlayed = false;
  function typeInto(el, text, speed, done) {
    let i = 0;
    el.textContent = '';
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        if (done) done();
      }
    }, speed);
  }

  function playAiDemo() {
    if (aiPlayed || !aiPromptText) return;
    aiPlayed = true;
    aiPromptBubble.classList.add('is-visible');
    typeInto(aiPromptText, PROMPT_LOG, reduceMotion ? 0 : 12, () => {
      setTimeout(() => {
        aiThinking.classList.remove('is-hidden');
        setTimeout(() => {
          aiThinking.classList.add('is-hidden');
          aiResponse.hidden = false;
          requestAnimationFrame(() => aiResponse.classList.add('is-visible'));
          typeInto(aiResponseText, RESPONSE_TEXT, reduceMotion ? 0 : 16);
        }, reduceMotion ? 100 : 1400);
      }, 300);
    });
  }

  if (aiSection) {
    const aiObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) playAiDemo(); });
    }, { threshold: 0.4 });
    aiObserver.observe(aiSection);
  }

  /* ============ COPY EMAIL ============ */
  const copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('amolsjadhav6213@gmail.com');
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('is-copied');
        }, 2000);
      } catch (err) {
        copyBtn.textContent = 'Press Ctrl+C';
      }
    });
  }

  /* ============ BACK TO TOP ============ */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ============ GLOW-CARD CURSOR TRACKING ============ */
  if (!reduceMotion) {
    document.querySelectorAll('.glow-card, .dock-icon').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  }

  /* ============ INFINITY ICON MOTION ============ */
  (function setupInfinityIconMotion(){
    const wrap = document.querySelector('.infinity-wrap');
    if (!wrap) return;
    if (reduceMotion) return;

    const icons = Array.from(wrap.querySelectorAll('.inf-icon'));
    if (icons.length < 2) return;

    const classOrder = icons.map((icon, index) => `icon-${index + 1}`);
    let currentOrder = classOrder.slice();

    function rotateClasses() {
      currentOrder.push(currentOrder.shift());
      icons.forEach((icon, index) => {
        icon.className = `inf-icon ${currentOrder[index]}`;
      });
    }

    const MOTION_INTERVAL = 2400;
    rotateClasses();
    setInterval(rotateClasses, MOTION_INTERVAL);
  })();

  })();
