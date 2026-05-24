// ============================================================
// Aficionados Nantes — Script principal
// Lenis (smooth scroll) + GSAP/ScrollTrigger + particules hero
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

// ----- Age gate -----
(function ageGate(){
  const gate = document.getElementById('ageGate');
  const yes = document.getElementById('ageYes');
  const no = document.getElementById('ageNo');
  const remember = document.getElementById('ageRemember');
  const KEY = 'aficionados.age.ok';

  const stored = localStorage.getItem(KEY) === '1' || sessionStorage.getItem(KEY) === '1';
  if (stored) { gate.remove(); return; }

  document.body.classList.add('locked');
  requestAnimationFrame(() => gate.classList.add('visible'));

  yes.addEventListener('click', () => {
    (remember.checked ? localStorage : sessionStorage).setItem(KEY, '1');
    gate.classList.remove('visible');
    gate.classList.add('hide');
    document.body.classList.remove('locked');
    setTimeout(() => gate.remove(), 500);
  });
  no.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });
})();

// ----- Lenis smooth scroll -----
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if (!prefersReduced && window.Lenis) {
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // GSAP ScrollTrigger sync
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Liens internes via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: -40, duration: 1.4 });
      }
    });
  });
}

// ----- Nav scrolled state -----
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ----- Burger menu mobile -----
(function burgerMenu(){
  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  const backdrop = document.querySelector('.nav-backdrop');
  if (!burger || !links || !backdrop) return;

  function open(){
    links.classList.add('open');
    backdrop.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('locked');
    if (lenis) lenis.stop();
  }
  function close(){
    links.classList.remove('open');
    backdrop.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('locked');
    if (lenis) lenis.start();
  }
  function toggle(){
    if (links.classList.contains('open')) close();
    else open();
  }

  burger.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Sécurité : fermer si on dépasse le breakpoint
  const mq = matchMedia('(min-width:901px)');
  mq.addEventListener('change', e => { if (e.matches) close(); });
})();

// ----- Animations GSAP / Fallback IntersectionObserver -----
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  // Reveal universel
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { autoAlpha: 0, y: 36 },
      {
        autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // Hero title : effet d'apparition lettre par mot
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    gsap.from(heroTitle, { autoAlpha: 0, y: 60, duration: 1.4, ease: 'power4.out', delay: .2 });
  }

  // Parallax hero-bg
  gsap.to('.hero-bg', {
    yPercent: 30, scale: 1.08, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Cards blog : stagger
  gsap.from('.blog-grid .post', {
    autoAlpha: 0, y: 50, duration: 1, stagger: .12, ease: 'power3.out',
    scrollTrigger: { trigger: '.blog-grid', start: 'top 80%' }
  });

  // Pillars : stagger doré
  gsap.from('.pillars li', {
    autoAlpha: 0, x: -30, duration: .9, stagger: .15, ease: 'power3.out',
    scrollTrigger: { trigger: '.pillars', start: 'top 80%' }
  });

  // Agenda : stagger latéral
  gsap.from('.agenda li', {
    autoAlpha: 0, x: 40, duration: .9, stagger: .12, ease: 'power3.out',
    scrollTrigger: { trigger: '.agenda', start: 'top 80%' }
  });

} else {
  // Fallback IntersectionObserver
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ----- Hero canvas : particules dorées (embers) -----
(function heroParticles(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles, running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    const count = Math.floor(Math.min(w, 1200) / 18); // ~60-70 particules
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: h + Math.random() * h * .3,
      r: Math.random() * 1.4 + .3,
      vy: -(Math.random() * .35 + .15),
      vx: (Math.random() - .5) * .12,
      a: Math.random() * .6 + .2,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * .02 + .01,
      hue: Math.random() < .82 ? 'gold' : 'ember',
    }));
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.tw) * .15;
      p.tw += p.tws;
      const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));

      // Halo
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      if (p.hue === 'gold') {
        g.addColorStop(0, `rgba(200,169,106,${alpha})`);
        g.addColorStop(1, 'rgba(200,169,106,0)');
      } else {
        g.addColorStop(0, `rgba(220,120,60,${alpha * 0.9})`);
        g.addColorStop(1, 'rgba(220,120,60,0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();

      // Cœur
      ctx.fillStyle = p.hue === 'gold' ? `rgba(245,220,160,${alpha})` : `rgba(255,180,120,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (p.y < -10 || p.x < -10 || p.x > w + 10) {
        p.x = Math.random() * w;
        p.y = h + 10;
      }
    }
    requestAnimationFrame(draw);
  }

  function start() { resize(); spawn(); draw(); }
  start();
  window.addEventListener('resize', () => { resize(); spawn(); });

  // Pause hors viewport (perf)
  const io = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) draw();
  }, { threshold: 0 });
  io.observe(canvas);
})();

// ----- Formulaires Formspree (AJAX) -----
function bindForm(formId, okId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = document.getElementById(okId);
    const action = form.getAttribute('action');
    const data = new FormData(form);

    // Tant que Formspree n'est pas configuré, on confirme localement
    if (!action || action.includes('YOUR_FORM_ID')) {
      ok.hidden = false;
      form.reset();
      console.warn('[Aficionados] Formulaire non branché — remplacer YOUR_FORM_ID par votre ID Formspree.');
      return;
    }

    try {
      const res = await fetch(action, {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' }
      });
      if (res.ok) { ok.hidden = false; form.reset(); }
      else { alert('Erreur lors de l\'envoi. Réessayez ou écrivez-nous directement.'); }
    } catch (err) {
      alert('Erreur réseau. Réessayez plus tard.');
    }
  });
}
bindForm('signupForm', 'signupOk');
bindForm('contactForm', 'contactOk');

// ----- Counters animés (stats) -----
(function counters(){
  const nums = document.querySelectorAll('.stat-num');
  if (!nums.length) return;
  const ease = t => 1 - Math.pow(1 - t, 3);
  function animate(el){
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * ease(t)).toLocaleString('fr-FR');
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('fr-FR');
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));
})();

// ----- Magnetic buttons -----
(function magnetic(){
  if (prefersReduced || matchMedia('(max-width:900px)').matches) return;
  const targets = document.querySelectorAll('.btn-primary, .agenda-cta');
  targets.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ----- Cursor light (desktop only) -----
(function cursorLight(){
  if (prefersReduced || matchMedia('(max-width:900px)').matches) return;
  const light = document.querySelector('.cursor-light');
  if (!light) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  let active = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!active) { active = true; light.classList.add('active'); }
  });
  document.addEventListener('mouseleave', () => {
    active = false; light.classList.remove('active');
  });
  function loop(){
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    light.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();
})();
