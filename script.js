// ============================================================
// Aficionados Nantes — Script principal
// Lenis (smooth scroll) + GSAP/ScrollTrigger + particules hero
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

// ----- Anti pinch-zoom (iOS Safari ne respecte pas user-scalable=no seul) -----
['gesturestart','gesturechange','gestureend'].forEach(ev => {
  document.addEventListener(ev, e => e.preventDefault(), { passive: false });
});
// Anti double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 320) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

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

    if (!action){
      ok.hidden = false; form.reset(); return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const btnLabel = btn ? btn.textContent : '';
    if (btn){ btn.disabled = true; btn.textContent = 'Envoi…'; }

    try {
      const res = await fetch(action, {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success === 'true' || json.success === true || res.status === 200)) {
        ok.hidden = false; form.reset();
      } else {
        alert('Erreur lors de l\'envoi. Vous pouvez aussi nous écrire directement sur WhatsApp : 06 37 70 18 95.');
      }
    } catch (err) {
      alert('Erreur réseau. Vous pouvez aussi nous écrire directement sur WhatsApp : 06 37 70 18 95.');
    } finally {
      if (btn){ btn.disabled = false; btn.textContent = btnLabel; }
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

// ============================================================
// Sanity CMS hydration — récupère les contenus dynamiques
// ============================================================
const SANITY = { projectId: '7022jmvv', dataset: 'production', apiVersion: '2024-01-01' };

const MONTHS_FR = ['Janv.','Févr.','Mars','Avr.','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'];

function escapeHtml(str){
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function formatDay(iso){
  const d = new Date(iso);
  return { day: String(d.getDate()).padStart(2, '0'), month: MONTHS_FR[d.getMonth()] };
}
function formatDateFr(iso){
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function sanityImageUrl(ref, w = 800){
  // ref ex: image-AbC...-1600x900-jpg
  const m = /^image-([^-]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  if (!m) return null;
  return `https://cdn.sanity.io/images/${SANITY.projectId}/${SANITY.dataset}/${m[1]}-${m[2]}.${m[3]}?w=${w}&auto=format&fit=crop`;
}

async function fetchSanity(){
  const query = `{
    "settings": *[_type == "siteSettings"][0],
    "stats": *[_type == "stat"] | order(order asc),
    "partners": *[_type == "partner"] | order(order asc),
    "events": *[_type == "event"] | order(date asc)[0...6],
    "articles": *[_type == "article"] | order(date desc)[0...6],
    "testimonials": *[_type == "testimonial"] | order(order asc)[0...3]
  }`;
  const url = `https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return (await res.json()).result;
  } catch (err){
    console.warn('[Sanity] Fallback statique :', err.message);
    return null;
  }
}

function hydrateStats(stats){
  if (!stats || !stats.length) return;
  const inner = document.querySelector('.stats-inner');
  if (!inner) return;
  inner.innerHTML = stats.map(s =>
    `<div class="stat"><span class="stat-num" data-count="${s.value}">0</span><span class="stat-label">${escapeHtml(s.label)}</span></div>`
  ).join('');
  // Relance les compteurs sur les nouveaux éléments
  inner.querySelectorAll('.stat-num').forEach(el => animateCounter(el));
}

function hydratePartners(partners){
  if (!partners || !partners.length) return;
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const block = partners.map(p => `<span>${escapeHtml(p.name)}</span><span class="dot">·</span>`).join('');
  track.innerHTML = block + block; // boucle fluide
}

function hydrateEvents(events){
  if (!events || !events.length) return;
  const list = document.querySelector('.agenda');
  if (!list) return;
  list.innerHTML = events.map(e => {
    const d = formatDay(e.date);
    const meta = [
      e.location ? `<i class="ph ph-map-pin"></i> ${escapeHtml(e.location)}` : '',
      e.time ? `<i class="ph ph-clock"></i> ${escapeHtml(e.time)}` : '',
      e.access ? `<i class="ph ph-envelope-simple"></i> ${escapeHtml(e.access)}` : ''
    ].filter(Boolean).join(' ');
    return `
      <li>
        <div class="agenda-date"><span class="day">${d.day}</span><span class="month">${d.month}</span></div>
        <div class="agenda-body">
          <h3>${escapeHtml(e.title)}</h3>
          <p>${escapeHtml(e.description || '')}</p>
          <span class="agenda-meta">${meta}</span>
        </div>
        <a href="#rejoindre" class="agenda-cta">Réserver</a>
      </li>`;
  }).join('');
}

function hydrateArticles(articles){
  if (!articles || !articles.length) return;
  const grid = document.querySelector('.blog-grid');
  if (!grid) return;
  const fallbackImages = [
    'https://images.pexels.com/photos/10343917/pexels-photo-10343917.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/10343915/pexels-photo-10343915.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5944420/pexels-photo-5944420.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/31332328/pexels-photo-31332328.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];
  grid.innerHTML = articles.map((a, i) => {
    let imgUrl = fallbackImages[i % fallbackImages.length];
    if (a.image && a.image.asset && a.image.asset._ref) {
      const url = sanityImageUrl(a.image.asset._ref);
      if (url) imgUrl = url;
    }
    return `
      <article class="post">
        <div class="post-img post-img-${(i % 4) + 1}">
          <img class="post-photo" src="${imgUrl}" alt="${escapeHtml(a.title)}" loading="lazy" />
          <span class="post-cat">${escapeHtml(a.category || 'Article')}</span>
        </div>
        <div class="post-body">
          <span class="post-date"><i class="ph ph-calendar-blank"></i> ${formatDateFr(a.date)}</span>
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.excerpt || '')}</p>
          <a href="#" class="link-arrow">Lire <span>→</span></a>
        </div>
      </article>`;
  }).join('');
}

function hydrateTestimonials(testimonials){
  if (!testimonials || !testimonials.length) return;
  const list = document.querySelector('.testimonials');
  if (!list) return;
  list.innerHTML = testimonials.map(t => `
    <figure class="testimonial">
      <div class="quote-mark" aria-hidden="true">"</div>
      <blockquote>${escapeHtml(t.quote)}</blockquote>
      <figcaption>
        <span class="initials">${escapeHtml(t.initials || '')}</span>
        <div>
          <strong>${escapeHtml(t.name)}</strong>
          <span>${t.memberSince ? 'Membre depuis ' + escapeHtml(String(t.memberSince)) : ''}</span>
        </div>
      </figcaption>
    </figure>`).join('');
}

function hydrateSettings(s){
  if (!s) return;
  if (s.heroTitle){
    const h1 = document.querySelector('.hero h1');
    if (h1){
      // Conserve l'italique sur le mot "cigare" si présent
      const safe = escapeHtml(s.heroTitle).replace(/cigare/i, '<em>cigare</em>');
      h1.innerHTML = safe;
    }
  }
  if (s.tagline){
    const lead = document.querySelector('.hero .lead');
    if (lead) lead.textContent = s.tagline;
  }
  if (s.heroEyebrow){
    const eb = document.querySelector('.hero .eyebrow');
    if (eb) eb.textContent = s.heroEyebrow;
  }
  if (s.aboutTitle){
    const h2 = document.querySelector('#cercle h2');
    if (h2){
      const safe = escapeHtml(s.aboutTitle).replace(/temps/i, '<em>temps</em>');
      h2.innerHTML = safe;
    }
  }
}

function animateCounter(el){
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  function step(now){
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(target * ease(t)).toLocaleString('fr-FR');
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('fr-FR');
  }
  requestAnimationFrame(step);
}

(async function loadFromSanity(){
  const data = await fetchSanity();
  if (!data) return;
  hydrateSettings(data.settings);
  hydrateStats(data.stats);
  hydratePartners(data.partners);
  hydrateEvents(data.events);
  hydrateArticles(data.articles);
  hydrateTestimonials(data.testimonials);
  // Refresh ScrollTrigger pour recalibrer après remplacement du DOM
  if (window.ScrollTrigger) {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
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
