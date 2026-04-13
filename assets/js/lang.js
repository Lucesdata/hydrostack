/**
 * HydroStack — lang.js
 * Language detection and switcher.
 * Detects current lang from URL path, sets active state,
 * and redirects on language button click.
 *
 * URL structure:
 *   ES (default) : /hydrostack/index.html  (or /hydrostack/)
 *   EN           : /hydrostack/en/index.html
 *   FR           : /hydrostack/fr/index.html
 */

(function () {
  'use strict';

  /* ── Detect current language ─────────────────────────── */
  function getCurrentLang() {
    var path = window.location.pathname.replace(/\\/g, '/');
    if (/\/en\/|\/en$/.test(path)) return 'en';
    if (/\/fr\/|\/fr$/.test(path)) return 'fr';
    return 'es';
  }

  /* ── Build redirect URLs ─────────────────────────────── */
  function getLangUrls(currentLang) {
    var urls = {};
    if (currentLang === 'es') {
      urls.es = 'index.html';
      urls.en = 'en/index.html';
      urls.fr = 'fr/index.html';
    } else if (currentLang === 'en') {
      urls.es = '../index.html';
      urls.en = 'index.html';
      urls.fr = '../fr/index.html';
    } else {
      // fr
      urls.es = '../index.html';
      urls.en = '../en/index.html';
      urls.fr = 'index.html';
    }
    return urls;
  }

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    var currentLang = getCurrentLang();
    var urls        = getLangUrls(currentLang);

    /* Set html lang attribute */
    document.documentElement.lang = currentLang;

    /* Handle every [data-lang] element */
    var buttons = document.querySelectorAll('[data-lang]');
    buttons.forEach(function (el) {
      var lang = el.getAttribute('data-lang');

      /* Active state */
      if (lang === currentLang) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }

      /* Click → navigate */
      el.addEventListener('click', function () {
        if (lang !== currentLang) {
          window.location.href = urls[lang];
        }
      });
    });

    /* Expose current language globally for other scripts */
    window.HYDRO_LANG = currentLang;
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
