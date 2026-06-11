/**
 * i18n.js — Language detection, selector UI, and DOM translation engine.
 * Depends on translations.js (must be loaded first).
 */
(function () {
  'use strict';

  var LANGS = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' }
  ];

  // ── Detect Language ─────────────────────────────────
  function detectLang() {
    var saved = localStorage.getItem('lang');
    if (saved && ['pt', 'en', 'es', 'fr'].indexOf(saved) !== -1) return saved;

    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (nav.indexOf('pt') === 0) return 'pt';
    if (nav.indexOf('es') === 0) return 'es';
    if (nav.indexOf('fr') === 0) return 'fr';
    return 'en';
  }

  var currentLang = detectLang();

  // ── Apply Translations ──────────────────────────────
  function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;

    // Translate elements with data-i18n
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
        els[i].innerHTML = TRANSLATIONS[key][lang];
      }
    }

    // Translate href attributes with data-i18n-href
    var links = document.querySelectorAll('[data-i18n-href]');
    for (var j = 0; j < links.length; j++) {
      var hkey = links[j].getAttribute('data-i18n-href');
      if (TRANSLATIONS[hkey] && TRANSLATIONS[hkey][lang]) {
        links[j].href = TRANSLATIONS[hkey][lang];
      }
    }

    // Translate placeholder attributes
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var p = 0; p < phs.length; p++) {
      var pkey = phs[p].getAttribute('data-i18n-placeholder');
      if (TRANSLATIONS[pkey] && TRANSLATIONS[pkey][lang]) {
        phs[p].placeholder = TRANSLATIONS[pkey][lang];
      }
    }

    // Translate page title
    var titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey && TRANSLATIONS[titleKey] && TRANSLATIONS[titleKey][lang]) {
      document.title = TRANSLATIONS[titleKey][lang];
    }

    // Update selector label
    updateSelectorLabel(lang);
  }

  // ── Inject CSS ──────────────────────────────────────
  function injectStyles() {
    var css = [
      '.lang-selector { position: relative; display: flex; align-items: center; margin-left: .75rem; }',
      '.lang-btn { display: flex; align-items: center; gap: .35rem; background: none; border: 1px solid rgba(255,255,255,.35); color: rgba(255,255,255,.9); padding: .3rem .75rem; border-radius: 2rem; font-size: .78rem; font-weight: 600; cursor: pointer; transition: all .3s; font-family: inherit; letter-spacing: .04em; text-transform: uppercase; }',
      'nav.scrolled .lang-btn { border-color: rgba(45,80,22,.25); color: var(--dark, #2d5016); }',
      '.lang-btn:hover { background: rgba(255,255,255,.15); }',
      'nav.scrolled .lang-btn:hover { background: rgba(45,80,22,.08); }',
      '.lang-btn svg { width: 12px; height: 12px; fill: currentColor; transition: transform .2s; }',
      '.lang-btn.open svg { transform: rotate(180deg); }',
      '.lang-dropdown { position: absolute; top: calc(100% + .5rem); right: 0; background: #fff; border-radius: .75rem; box-shadow: 0 8px 30px rgba(0,0,0,.15); overflow: hidden; opacity: 0; visibility: hidden; transform: translateY(-6px); transition: all .25s ease; min-width: 140px; z-index: 300; }',
      '.lang-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }',
      '.lang-option { display: block; width: 100%; padding: .65rem 1rem; border: none; background: none; text-align: left; font-size: .85rem; color: #3a3a3a; cursor: pointer; transition: background .15s; font-family: inherit; }',
      '.lang-option:hover { background: #f0f0f0; }',
      '.lang-option.active { color: #2d5016; font-weight: 600; background: rgba(127,176,105,.1); }',
      /* For dark-bg navs (leitura-aura, empresas) */
      'nav:not(.scrolled) .lang-btn { border-color: rgba(255,255,255,.35); color: rgba(255,255,255,.9); }',
      '@media (max-width: 800px) {',
      '  .lang-selector { margin-left: 0; margin-top: .5rem; }',
      '  .lang-dropdown { right: auto; left: 0; }',
      '}'
    ].join('\n');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Build Selector Widget ───────────────────────────
  function buildSelector() {
    var container = document.createElement('div');
    container.className = 'lang-selector';
    container.id = 'langSelector';

    // Button
    var btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.id = 'langBtn';
    btn.setAttribute('aria-label', 'Select language');
    btn.innerHTML = '<span id="langLabel">' + currentLang.toUpperCase() + '</span>' +
      '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';

    // Dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';
    dropdown.id = 'langDropdown';

    for (var i = 0; i < LANGS.length; i++) {
      var opt = document.createElement('button');
      opt.className = 'lang-option' + (LANGS[i].code === currentLang ? ' active' : '');
      opt.setAttribute('data-lang', LANGS[i].code);
      opt.textContent = LANGS[i].label;
      dropdown.appendChild(opt);
    }

    container.appendChild(btn);
    container.appendChild(dropdown);

    // Insert into nav — find <nav> and place selector before hamburger
    var nav = document.querySelector('nav');
    if (nav) {
      var hamburger = nav.querySelector('.hamburger');
      if (hamburger) {
        nav.insertBefore(container, hamburger);
      } else {
        nav.appendChild(container);
      }
    }

    // Also add to mobile menu if nav-links exists
    var navLinks = document.getElementById('navLinks');
    if (navLinks) {
      var mobileLi = document.createElement('li');
      mobileLi.className = 'lang-mobile-item';
      mobileLi.style.cssText = 'display:none;';

      var mobileContainer = container.cloneNode(true);
      mobileContainer.id = 'langSelectorMobile';
      mobileContainer.querySelector('.lang-btn').id = 'langBtnMobile';
      mobileContainer.querySelector('.lang-dropdown').id = 'langDropdownMobile';
      mobileLi.appendChild(mobileContainer);
      navLinks.appendChild(mobileLi);

      // Add responsive CSS for mobile
      var mobileCSS = document.createElement('style');
      mobileCSS.textContent = '@media (max-width: 800px) { #langSelector { display: none; } .lang-mobile-item { display: block !important; } }' +
        '@media (min-width: 801px) { .lang-mobile-item { display: none !important; } }';
      document.head.appendChild(mobileCSS);
    }

    // Events
    setupEvents('langBtn', 'langDropdown');
    if (document.getElementById('langBtnMobile')) {
      setupEvents('langBtnMobile', 'langDropdownMobile');
    }
  }

  function setupEvents(btnId, dropId) {
    var btn = document.getElementById(btnId);
    var dropdown = document.getElementById(dropId);
    if (!btn || !dropdown) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
        btn.classList.add('open');
      }
    });

    var options = dropdown.querySelectorAll('.lang-option');
    for (var i = 0; i < options.length; i++) {
      options[i].addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        applyTranslations(lang);

        // Update active states in ALL selectors
        var allOptions = document.querySelectorAll('.lang-option');
        for (var j = 0; j < allOptions.length; j++) {
          allOptions[j].classList.toggle('active', allOptions[j].getAttribute('data-lang') === lang);
        }

        closeAllDropdowns();
      });
    }
  }

  function closeAllDropdowns() {
    var dropdowns = document.querySelectorAll('.lang-dropdown');
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < dropdowns.length; i++) dropdowns[i].classList.remove('open');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('open');
  }

  function updateSelectorLabel(lang) {
    var labels = document.querySelectorAll('#langLabel, #langSelectorMobile #langLabel');
    // Also update any span with id langLabel inside mobile clone
    var allLabels = document.querySelectorAll('.lang-btn span:first-child');
    for (var i = 0; i < allLabels.length; i++) {
      allLabels[i].textContent = lang.toUpperCase();
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function () {
    closeAllDropdowns();
  });

  // ── Init ────────────────────────────────────────────
  function init() {
    injectStyles();
    buildSelector();
    applyTranslations(currentLang);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
