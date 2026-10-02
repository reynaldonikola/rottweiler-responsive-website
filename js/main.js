// Rottweiler World: header state, mobile nav, scroll reveal, stat counters, lightbox.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky header gets a border once the page scrolls.
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('stuck', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile navigation.
const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  mobileNav.classList.toggle('open', !open);
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
}));

// Reveal elements as they enter the viewport.
const revealables = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach(el => el.classList.add('in'));
} else {
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px' });
  revealables.forEach(el => revealer.observe(el));
}

// Count the stat numbers up once, when the band first shows.
const counters = document.querySelectorAll('[data-count]');
const runCount = el => {
  const target = Number(el.dataset.count);
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  const duration = 1100;
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if ('IntersectionObserver' in window) {
  const counterWatch = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      runCount(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterWatch.observe(el));
} else {
  counters.forEach(el => { el.textContent = el.dataset.count; });
}

// Highlight the nav link for the section on screen.
const sections = [...document.querySelectorAll('main section[id], section#home')];
const links = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { threshold: 0.4 });
  sections.forEach(s => spy.observe(s));
}

// Lightbox for the gallery.
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxCap = lightbox.querySelector('figcaption');
let lastFocus = null;

const openLightbox = button => {
  lastFocus = button;
  lightboxImg.src = button.dataset.full;
  lightboxImg.alt = button.querySelector('img').alt;
  lightboxCap.textContent = button.dataset.caption || '';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.close').focus();
};

const closeLightbox = () => {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
};

document.querySelectorAll('.shot').forEach(btn => btn.addEventListener('click', () => openLightbox(btn)));
lightbox.querySelector('.close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });
