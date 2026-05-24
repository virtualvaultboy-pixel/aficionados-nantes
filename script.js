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
const burger = document.querySelector('.burger');
const links = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

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
