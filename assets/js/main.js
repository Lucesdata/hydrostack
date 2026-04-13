/**
 * HydroStack — main.js
 * Navigation scroll effects, mobile menu, reveal animations,
 * skill bars, active section highlighting, project filter.
 */

(function () {
  'use strict';

  /* ── Nav scroll effect ───────────────────────────────── */
  var nav = document.querySelector('.nav');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }

  /* ── Mobile menu toggle ──────────────────────────────── */
  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks   = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    /* Close menu on link click */
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ── Active nav link by scroll position ─────────────── */
  function updateActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinkEls = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinkEls.length) return;

    var scrollY = window.scrollY + 120;
    var current = '';

    sections.forEach(function (sec) {
      if (scrollY >= sec.offsetTop) {
        current = sec.getAttribute('id');
      }
    });

    navLinkEls.forEach(function (a) {
      a.classList.remove('active');
      var href = a.getAttribute('href') || '';
      if (href === '#' + current) {
        a.classList.add('active');
      }
    });
  }

  /* ── Reveal on scroll (IntersectionObserver) ─────────── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ── Skill bars animation ────────────────────────────── */
  function initSkillBars() {
    var fills = document.querySelectorAll('.skill-fill');
    if (!fills.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el  = entry.target;
            var pct = el.getAttribute('data-pct') || '0';
            el.style.width = pct + '%';
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    fills.forEach(function (fill) { observer.observe(fill); });
  }

  /* ── Project filter ──────────────────────────────────── */
  function initProjectFilter() {
    var btns  = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');
    if (!btns.length || !cards.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        /* Active button */
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');

        cards.forEach(function (card) {
          if (filter === 'all') {
            card.style.display = 'flex';
          } else {
            var cat = card.getAttribute('data-category');
            card.style.display = (cat === filter) ? 'flex' : 'none';
          }
        });
      });
    });
  }

  /* ── Smooth scroll for anchor links ──────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var offset = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Animated counter for hero stats ─────────────────── */
  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('.hero-stat-num[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            animateCounter(el, parseInt(el.getAttribute('data-count')), 1400);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ── Contact form (placeholder) ──────────────────────── */
  function initContactForm() {
    var form = document.querySelector('.contact-form form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.textContent = '✓ Enviado';
      btn.disabled = true;
      btn.style.background = '#26a69a';

      setTimeout(function () {
        btn.textContent = origText;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3200);
    });
  }

  /* ── Init all ─────────────────────────────────────────── */
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
    initReveal();
    initSkillBars();
    initProjectFilter();
    initSmoothScroll();
    initCounters();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
