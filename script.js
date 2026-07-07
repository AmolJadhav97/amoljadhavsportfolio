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

  const PROMPT_LOG = '[14:02:11] Stage "EIS-Release" completed. 3 pre-checks passed, 1 regression warning (non-blocking), deployment sequence: DEV → SIT → UAT. Approvals: 2/2. Duration: 6m42s.';
  const RESPONSE_TEXT = 'Today\u2019s EIS release deployed successfully through all environments with both required approvals in place. One minor, non-blocking regression warning was flagged for review \u2014 no action required before go-live.';

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

  /* ============ AMBIENT PARTICLE CANVAS ============ */
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const DENSITY = 14000; // px^2 per particle

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((w * h) / DENSITY));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    }

    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(79,195,247,0.55)';

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        const dx = p.x - mouseX, dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const boost = dist < 140 ? (140 - dist) / 140 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + boost * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // subtle connecting lines
      ctx.strokeStyle = 'rgba(79,195,247,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
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

  /* ============ INFINITY TRAVELING GLOW ============ */
  (function setupInfinityGlow(){
    const wrap = document.querySelector('.infinity-wrap');
    if (!wrap) return;
    // Respect reduced motion
    if (reduceMotion) return;
    if (typeof gsap === 'undefined') return;

    let glow = wrap.querySelector('.inf-travel-glow');
    if (!glow){
      glow = document.createElement('div');
      glow.className = 'inf-travel-glow';
      wrap.insertBefore(glow, wrap.firstChild);
    }

    const getIcons = () => Array.from(wrap.querySelectorAll('.inf-icon'));
    let points = [];

    function computePoints(){
      const rect = wrap.getBoundingClientRect();
      points = getIcons().map(ic => {
        const r = ic.getBoundingClientRect();
        return { x: (r.left - rect.left) + (r.width/2), y: (r.top - rect.top) + (r.height/2) };
      });
    }

    function setGlowSize(){
      const icons = getIcons();
      if (!icons.length) return;
      const r = icons[0].getBoundingClientRect();
      const size = Math.max(160, r.width * 2.8);
      glow.style.width = size + 'px';
      glow.style.height = size + 'px';
    }

    computePoints(); setGlowSize();

    let tl;
    function popIcon(idx){
      const icons = getIcons();
      const icon = icons[idx];
      if (!icon) return;
      gsap.killTweensOf(icon);
      const tlp = gsap.timeline();
      tlp.to(icon, { duration: 0.16, scale: 1.14, ease: 'power2.out' });
      tlp.to(icon, { duration: 0.28, scale: 1, ease: 'power2.in' });
    }

    function start(){
      if (!points.length) return;
      if (tl) tl.kill();
      tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power1.inOut' } });
      const total = 10; // full loop seconds (user requested)
      const step = total / Math.max(1, points.length);
      gsap.set(glow, { x: points[0].x, y: points[0].y, opacity:1, transformOrigin:'50% 50%' });
      // animate through points and trigger pop at each arrival
      for (let i=1;i<points.length;i++){
        const idx = i;
        tl.to(glow, { duration: step, x: points[i].x, y: points[i].y, onStart: () => popIcon(idx) }, '>' );
      }
      // return to start and pop
      tl.to(glow, { duration: step, x: points[0].x, y: points[0].y, onStart: () => popIcon(0) }, '>' );
    }

    start();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { computePoints(); setGlowSize(); start(); }, 120);
    });
  })();

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
      currentOrder.unshift(currentOrder.pop());
      icons.forEach((icon, index) => {
        icon.className = `inf-icon ${currentOrder[index]}`;
      });
    }

    const MOTION_INTERVAL = 2400;
    rotateClasses();
    setInterval(rotateClasses, MOTION_INTERVAL);
  })();

  })();
