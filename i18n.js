(function () {
  'use strict';

  var LANGS = ['pt', 'en', 'es', 'fr'];
  var T = window.TRANSLATIONS || {};

  /* ── Language detection ──────────────────────────────── */
  function detectLang() {
    var s = localStorage.getItem('caue_lang');
    if (s && LANGS.indexOf(s) !== -1) return s;
    var nav = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (nav === 'pt') return 'pt';
    if (nav === 'fr') return 'fr';
    if (nav === 'es') return 'es';
    return 'en';
  }

  var lang = detectLang();

  function t(key) {
    var e = T[key];
    if (!e) return null;
    return (e[lang] !== undefined && e[lang] !== null) ? e[lang] : (e['en'] || null);
  }

  /* ── DOM helpers ─────────────────────────────────────── */
  var qs  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qsa = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };

  function set(el, val, asHtml) {
    if (!el || val === null || val === undefined) return;
    if (asHtml) el.innerHTML = val;
    else el.textContent = val;
  }

  function setN(sel, idx, val, asHtml, ctx) {
    set(qsa(sel, ctx)[idx] || null, val, asHtml);
  }

  /* Replace the last non-empty text node (for SVG+text buttons) */
  function setLastText(el, val) {
    if (!el || !val) return;
    var last = null;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim()) last = node;
    }
    if (last) last.textContent = ' ' + val;
  }

  /* ── Language switcher ───────────────────────────────── */
  var LABELS = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR' };

  function injectSwitcher() {
    var nav = qs('nav');
    if (!nav || qs('.lang-switcher')) return;

    var div = document.createElement('div');
    div.className = 'lang-switcher';
    div.innerHTML =
      '<button class="ls-btn">' + LABELS[lang] + ' <span class="ls-arrow">&#9660;</span></button>' +
      '<ul class="ls-menu">' +
      LANGS.map(function (l) {
        return '<li><button class="ls-opt' + (l === lang ? ' ls-active' : '') + '" data-l="' + l + '">' + LABELS[l] + '</button></li>';
      }).join('') +
      '</ul>';

    var hamburger = qs('.hamburger', nav);
    if (hamburger) nav.insertBefore(div, hamburger);
    else nav.appendChild(div);

    var menu = qs('.ls-menu', div);
    qs('.ls-btn', div).addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('ls-open');
    });
    document.addEventListener('click', function () { menu.classList.remove('ls-open'); });

    qsa('.ls-opt', div).forEach(function (opt) {
      opt.addEventListener('click', function () {
        localStorage.setItem('caue_lang', opt.getAttribute('data-l'));
        location.reload();
      });
    });
  }

  function addStyles() {
    if (qs('#i18n-styles')) return;
    var s = document.createElement('style');
    s.id = 'i18n-styles';
    s.textContent = [
      '.lang-switcher{position:relative;margin-left:.4rem;}',
      '.ls-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4);color:#fff;',
      'font:600 .78rem "Poppins",sans-serif;padding:.32rem .75rem;border-radius:2rem;cursor:pointer;',
      'letter-spacing:.04em;transition:background .3s,border-color .3s,color .3s;',
      'display:inline-flex;align-items:center;gap:.2rem;}',
      'nav.scrolled .ls-btn{background:rgba(45,80,22,.1);border-color:rgba(45,80,22,.3);color:#2d5016;}',
      '.ls-btn:hover{background:rgba(255,255,255,.28);}',
      'nav.scrolled .ls-btn:hover{background:rgba(45,80,22,.18);}',
      '.ls-arrow{font-size:.6rem;opacity:.7;}',
      '.ls-menu{display:none;position:absolute;top:calc(100% + .4rem);right:0;',
      'background:#fff;border-radius:.75rem;list-style:none;',
      'box-shadow:0 6px 24px rgba(0,0,0,.15);padding:.3rem;min-width:72px;z-index:600;}',
      '.ls-menu.ls-open{display:block;}',
      '.ls-opt{width:100%;background:none;border:none;cursor:pointer;',
      'font:500 .85rem "Poppins",sans-serif;color:#3a3a3a;',
      'padding:.42rem .7rem;border-radius:.45rem;text-align:left;transition:background .15s;}',
      '.ls-opt:hover{background:rgba(127,176,105,.15);}',
      '.ls-opt.ls-active{color:#2d5016;font-weight:700;}',
      '@media(max-width:800px){.lang-switcher{margin-left:0;margin-right:.4rem;}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Nav & footer ────────────────────────────────────── */
  function translateNav() {
    var links = qsa('#navLinks li a');
    var keys  = ['nav.sobre', 'nav.trevos', 'nav.servicos', 'nav.meditacoes', 'nav.contato'];
    links.forEach(function (a, i) { if (keys[i]) set(a, t(keys[i])); });
  }

  function translateFooter() {
    var ps = qsa('footer p');
    if (ps[0]) set(ps[0], t('footer.rights'));
    if (ps[1]) set(ps[1], t('footer.made'), true);
  }

  /* ── Page detection ──────────────────────────────────── */
  function getPage() {
    var p = location.pathname;
    if (p.indexOf('trevos.html')          !== -1) return 'trevos';
    if (p.indexOf('meditacoes.html')       !== -1) return 'meditacoes';
    if (p.indexOf('leitura-aura.html')    !== -1) return 'aura';
    if (p.indexOf('empresas.html')         !== -1) return 'empresas';
    if (p.indexOf('livro.html')            !== -1) return 'livro';
    if (p.indexOf('massagem.html')         !== -1) return 'massagem';
    if (p.indexOf('meditacao-rosas.html') !== -1) return 'meditacao-rosas';
    if (p.indexOf('renascimento.html')     !== -1) return 'renascimento';
    if (p.indexOf('wellness.html')         !== -1) return 'wellness';
    return 'index';
  }

  /* ═══════════════════════════════════════════════════════
     INDEX PAGE
  ═══════════════════════════════════════════════════════ */
  function applyIndex() {
    document.title = t('title.index') || document.title;

    // ── Hero
    set(qs('.hero-pretitle'), t('hero.pretitle'));
    set(qs('.hero-desc'),     t('hero.desc'));
    setLastText(qs('#hero .btn-wa'), t('hero.btn_wa'));
    set(qs('#hero a:not(.btn-wa)'), t('hero.btn_services'));
    setN('.stat-lbl', 0, t('hero.stat_years'));
    setN('.stat-lbl', 1, t('hero.stat_individual'));
    setN('.stat-lbl', 2, t('hero.stat_group'));

    // ── Sobre
    set(qs('#sobre .section-tag'),   t('sobre.tag'));
    set(qs('#sobre .section-title'), t('sobre.title'));
    setN('#sobre .section-body', 0, t('sobre.p1'), true);
    setN('#sobre .section-body', 1, t('sobre.p2'), true);
    setN('#sobre .section-body', 2, t('sobre.p3'), true);
    set(qs('#sobre .btn-green'), t('sobre.btn'));

    // ── Trevo Mundo
    set(qs('.trevo-mundo-tag'),   t('trevo.tag'));
    set(qs('.trevo-mundo-title'), t('trevo.title'));
    setN('.trevo-mundo-desc', 0, t('trevo.desc1'));
    setN('.trevo-mundo-desc', 1, t('trevo.desc'));
    setN('.tms-lbl', 0, t('trevo.stat_clovers'));
    setN('.tms-lbl', 1, t('trevo.stat_countries'));
    setN('.tms-lbl', 2, t('trevo.stat_stories'));
    var trevoAs = qsa('#trevo-mundo a.btn');
    if (trevoAs[0]) trevoAs[0].textContent = t('trevo.btn_history') || trevoAs[0].textContent;
    if (trevoAs[1]) trevoAs[1].textContent = t('trevo.btn_get')     || trevoAs[1].textContent;

    // ── Terapias header
    set(qsa('#terapias .massagem-tag')[0], t('terapias.tag'));
    var terapHeader = qs('#terapias .inner > div[style]') || qs('#terapias .inner > div:first-child');
    if (terapHeader) {
      var th2 = qs('h2', terapHeader); set(th2, t('terapias.title'));
      var tp  = qs('p',  terapHeader); set(tp,  t('terapias.desc'));
    }

    // ── Aura
    var ag = qs('.aura-grid');
    if (ag) {
      set(qs('.massagem-tag', ag),              t('aura.tag'));
      set(qs('.massagem-title', ag),             t('aura.tag'));
      set(qs('.massagem-title + p[style]', ag),  t('aura.title'));
      var agBps = qsa('.massagem-body p', ag);
      set(agBps[0], t('aura.p1'), true);
      set(agBps[1], t('aura.p2'));
      set(qs('.btn-wa', ag), t('aura.btn_schedule'));
      var agExtra = qsa('a.btn:not(.btn-wa)', ag);
      set(agExtra[agExtra.length - 1], t('btn.saber_mais'));
    }

    // ── Meditação das Rosas (first .massagem-grid in #terapias)
    var mg0 = qsa('#terapias .massagem-grid')[0];
    if (mg0) {
      set(qs('.massagem-tag', mg0),          t('medit.tag'));
      set(qs('.massagem-title', mg0),         t('medit.title'));
      set(qs('.massagem-title + p', mg0),     t('medit.subtitle'));
      var mg0ps = qsa('.massagem-body p', mg0);
      set(mg0ps[0], t('medit.p1'), true);
      set(mg0ps[1], t('medit.p2'), true);
      set(qs('.btn-wa', mg0), t('medit.btn'));
      var mg0More = qsa('a.btn:not(.btn-wa)', mg0);
      set(mg0More[mg0More.length - 1], t('btn.saber_mais'));
    }

    // ── Massagem Shiatsu (second .massagem-grid in #terapias)
    var mg1 = qsa('#terapias .massagem-grid')[1];
    if (mg1) {
      set(qs('.massagem-tag', mg1),   t('massagem.tag'));
      set(qs('.massagem-title', mg1),  t('massagem.title'));
      var mg1ps = qsa('.massagem-body p', mg1);
      set(mg1ps[0], t('massagem.p1'), true);
      set(mg1ps[1], t('massagem.p2'));
      set(mg1ps[2], t('massagem.p3'));
      set(qs('.btn-wa', mg1), t('massagem.btn'));
      var mg1More = qsa('a.btn:not(.btn-wa)', mg1);
      set(mg1More[mg1More.length - 1], t('btn.saber_mais'));
    }

    // ── Renascimento
    var ren = qs('#renascimento');
    if (ren) {
      set(qs('.massagem-tag', ren),          t('renasc.tag'));
      set(qs('.massagem-title', ren),         t('renasc.title'));
      set(qs('.massagem-title + p', ren),     t('renasc.subtitle'));
      var renPs = qsa('.massagem-body p', ren);
      set(renPs[0], t('renasc.p1'), true);
      set(renPs[1], t('renasc.p2'), true);
      set(renPs[2], t('renasc.p3'), true);
      set(renPs[3], t('renasc.p4'), true);
      set(qs('.btn-wa', ren), t('renasc.btn'));
      var renMore = qsa('a.btn:not(.btn-wa)', ren);
      set(renMore[renMore.length - 1], t('btn.saber_mais'));
    }

    // ── Wellness Experience
    var wel = qs('#wellness-experience');
    if (wel) {
      set(qs('.massagem-tag', wel),          t('wellness.tag'));
      set(qs('.massagem-title', wel),         t('wellness.title'));
      set(qs('.massagem-title + p', wel),     t('wellness.subtitle'));
      var welPs = qsa('.massagem-body > p', wel);
      set(welPs[0], t('wellness.p1'));
      set(welPs[1], t('wellness.practices_title'), true);
      set(welPs[2], t('wellness.group_note'), true);
      set(qs('.btn-wa', wel), t('wellness.btn'));
      var welMore = qsa('a.btn:not(.btn-wa)', wel);
      set(welMore[welMore.length - 1], t('btn.saber_mais'));
    }

    // ── Corporativo
    var corp = qs('#corporativo');
    if (corp) {
      set(qs('.corp-tag', corp),    t('corp.tag'));
      set(qs('.corp-title', corp),  t('corp.title'));
      var corpPs = qsa('.corp-body p', corp);
      set(corpPs[0], t('corp.p1'), true);
      set(corpPs[1], t('corp.p2'));
      set(corpPs[2], t('corp.p3'), true);
      set(qs('.corp-highlight', corp), t('corp.highlight'));
      set(qs('.btn-wa', corp), t('corp.btn_wa'));
      var corpMore = qsa('a.btn:not(.btn-wa)', corp);
      set(corpMore[corpMore.length - 1], t('btn.conhecer_mais'));
    }

    // ── Serviços / Pricing
    set(qs('#servicos .section-tag'),   t('pricing.tag'));
    set(qs('#servicos .section-title'), t('pricing.title'));
    set(qs('.ph-name'),  t('pricing.col_service'));
    set(qs('.ph-type'),  t('pricing.col_type'));
    set(qs('.ph-dur'),   t('pricing.col_duration'));
    set(qs('.ph-price'), t('pricing.col_price'));
    set(qs('#servicos .services-cta .btn-wa'), t('pricing.btn'));

    // ── Mídia
    set(qs('#midia .section-tag'),   t('midia.tag'));
    set(qs('#midia .section-title'), t('midia.title'));
    set(qs('#midia .section-body'),  t('midia.desc'));
    var midiaProgs = qsa('.midia-prog');
    set(midiaProgs[0], t('midia.globo_prog'));
    set(midiaProgs[1], t('midia.band_prog'));
    var midiaTitles = qsa('.midia-title');
    set(midiaTitles[0], t('midia.globo_prog'));
    set(midiaTitles[1], t('midia.band_prog'));

    // ── Trajetória
    set(qs('.traj-tag'),    t('traj.tag'));
    set(qs('.traj-title'),  t('traj.title'));
    set(qs('.traj-body'),   t('traj.body'));
    set(qs('.traj-quote p'),    t('traj.quote'));
    set(qs('.traj-quote cite'), t('traj.cite'));
    var tstatLbls = qsa('.tstat-lbl');
    set(tstatLbls[0], t('traj.stat_paises'));
    set(tstatLbls[1], t('traj.stat_trevos'));
    set(tstatLbls[2], t('traj.stat_anos'));
    set(tstatLbls[3], t('traj.stat_livro'));

    // ── Livro
    set(qs('.livro-badge'),          t('livro.tag'));
    set(qs('#livro .section-title'), t('livro.title'));
    set(qs('.livro-subtitle'),       t('livro.subtitle'));
    var livroBtns = qsa('#livro .livro-btns a');
    if (livroBtns[0]) livroBtns[0].textContent = t('livro.index_btn_buy') || livroBtns[0].textContent;
    if (livroBtns[1]) livroBtns[1].textContent = t('livro.index_btn_more') || livroBtns[1].textContent;
    var livroPs = qsa('#livro .livro-text > p:not(.livro-subtitle)');
    set(livroPs[0], t('livro.index_p1'), true);
    set(livroPs[1], t('livro.index_p2'));

    // ── Contato
    set(qs('.contato-title'), t('contato.title'));
    set(qs('.contato-desc'),  t('contato.desc'));
    setLastText(qs('#contato .btn-wa'), t('contato.btn_wa'));
  }

  /* ═══════════════════════════════════════════════════════
     TREVOS PAGE
  ═══════════════════════════════════════════════════════ */
  function applyTrevos() {
    document.title = t('title.trevos') || document.title;
    var tags = qsa('.section-tag');
    set(tags[0], t('trevos.hero_tag'));
    var titles = qsa('h1, .section-title');
    set(titles[0], t('trevos.hero_title'));
    set(qs('.hero-desc, .section-body'), t('trevos.hero_desc'));
    qsa('.watch-label').forEach(function (el) { set(el, t('trevos.watch')); });
    var ctaTitle = qs('.trevos-cta h2') || qs('.cta-title') || qsa('.section-title')[1];
    set(ctaTitle, t('trevos.cta_title'));
    var ctaDesc = qs('.trevos-cta p') || qs('.cta-desc') || qsa('.section-body')[1];
    set(ctaDesc, t('trevos.cta_desc'));
    var ctaBtns = qsa('.trevos-cta a, .cta-actions a');
    set(ctaBtns[0], t('trevos.btn_talk'));
    set(ctaBtns[1], t('trevos.btn_back'));
  }

  /* ═══════════════════════════════════════════════════════
     MEDITAÇÕES PAGE
  ═══════════════════════════════════════════════════════ */
  function applyMeditacoes() {
    document.title = t('title.meditacoes') || document.title;
    var tags = qsa('.section-tag');
    set(tags[0], t('meditacoes.hero_tag'));
    var titles = qsa('.section-title');
    set(titles[0], t('meditacoes.hero_title'));
    set(qs('.hero-desc, .section-body'), t('meditacoes.hero_desc'));
    var vidTitles = qsa('.vid-title');
    set(vidTitles[0], t('meditacoes.v1_title'));
    set(vidTitles[1], t('meditacoes.v2_title'));
    var vidDescs = qsa('.vid-desc');
    set(vidDescs[0], t('meditacoes.v1_desc'));
    set(vidDescs[1], t('meditacoes.v2_desc'));
    set(tags[1], t('meditacoes.about_tag'));
    set(titles[1], t('meditacoes.about_title'));
    var aboutPs = qsa('.about-body p, .med-about p');
    set(aboutPs[0], t('meditacoes.about_p1'), true);
    set(aboutPs[1], t('meditacoes.about_p2'));
    set(aboutPs[2], t('meditacoes.about_p3'), true);
    set(qs('.levels-title'), t('meditacoes.levels_title'));
    var levItems = qsa('.level-item, .levels-list li');
    set(levItems[0], t('meditacoes.level1'));
    set(levItems[1], t('meditacoes.level2'));
    set(levItems[2], t('meditacoes.level3'));
    var ctaTitle = titles[2] || qs('.med-cta h2');
    set(ctaTitle, t('meditacoes.cta_title'));
    var ctaDesc = qsa('.section-body')[1] || qs('.med-cta p');
    set(ctaDesc, t('meditacoes.cta_desc'));
    set(qs('.cta-section .btn, .med-cta .btn'), t('meditacoes.btn_agendar'));
  }

  /* ═══════════════════════════════════════════════════════
     LEITURA AURA PAGE
  ═══════════════════════════════════════════════════════ */
  function applyAura() {
    document.title = t('title.aura') || document.title;
    set(qs('.section-tag'), t('aurapage.tag'));
    set(qs('h1, .section-title'), t('aurapage.title'));
    var ps = qsa('.hero-text p, .aura-hero p, .aura-content p');
    set(ps[0], t('aurapage.p1'), true);
    set(ps[1], t('aurapage.p2'), true);
    set(ps[2], t('aurapage.p3'));
    var highlights = qsa('.highlight-item, .aura-theme');
    set(highlights[0], t('aurapage.highlight1'));
    set(highlights[1], t('aurapage.highlight2'));
    set(ps[3], t('aurapage.p4'), true);
    set(ps[4], t('aurapage.cta_p1'), true);
    set(ps[5], t('aurapage.cta_p2'), true);
    set(ps[6], t('aurapage.cta_p3'), true);
    set(qs('.btn-wa'), t('aurapage.btn_send'));
    set(qs('.btn-back, a[href="index.html"]'), t('aurapage.btn_back'));
  }

  /* ═══════════════════════════════════════════════════════
     EMPRESAS PAGE
  ═══════════════════════════════════════════════════════ */
  function applyEmpresas() {
    document.title = t('title.empresas') || document.title;
    set(qs('.section-tag'), t('empresas.hero_tag'));
    set(qs('h1, .section-title'), t('empresas.hero_title'));
    set(qs('.section-body, .hero-desc'), t('empresas.hero_desc'));
    set(qs('.btn-wa'), t('empresas.btn_wa'));
    set(qs('.btn-back, a[href="index.html"]'), t('empresas.btn_back'));
    set(qs('.cta-title, .empresas-cta h2'), t('empresas.cta_title'));
    set(qs('.cta-desc, .empresas-cta p'),   t('empresas.cta_desc'));
    set(qs('.cta-btn, .empresas-cta .btn-wa'), t('empresas.cta_btn'));
  }

  /* ═══════════════════════════════════════════════════════
     LIVRO PAGE
  ═══════════════════════════════════════════════════════ */
  function applyLivro() {
    document.title = t('title.livro') || document.title;
    set(qs('.section-tag, .livro-tag'), t('livro.tag'));
    set(qs('h1, .section-title'),       t('livro.title'));
    set(qs('.livro-subtitle, .book-subtitle'), t('livro.subtitle'));
    var heroPs = qsa('.hero-text p:not(.livro-subtitle), .livro-hero p:not(.livro-subtitle)');
    set(heroPs[0], t('livro.p1'), true);
    var heroBtns = qsa('.hero-btns a, .livro-hero-btns a');
    set(heroBtns[0], t('livro.btn_amazon'));
    set(heroBtns[1], t('livro.btn_talk'));
    set(qs('.dest-title, .historias-title'), t('livro.dest_title'));
    var destCards = qsa('.dest-card p, .historia-card p');
    set(destCards[0], t('livro.dest1'));
    set(destCards[1], t('livro.dest2'));
    set(destCards[2], t('livro.dest3'));
    set(destCards[3], t('livro.dest4'));
    set(qs('.autor-title, .sobre-autor h2'), t('livro.about_title'));
    var autorPs = qsa('.autor-body p, .sobre-autor p');
    set(autorPs[0], t('livro.about_p1'));
    set(autorPs[1], t('livro.about_p2'));
    set(qs('.autor-btns a, .sobre-autor .btn-wa'), t('livro.btn_talk'));
    set(qs('.btn-back, a[href="index.html"]'), t('livro.btn_back'));
  }

  /* ═══════════════════════════════════════════════════════
     MASSAGEM PAGE
  ═══════════════════════════════════════════════════════ */
  function applyMassagem() {
    set(qs('.section-tag'), t('massagem.tag'));
    set(qs('h1, .section-title'), t('massagem.title'));
    set(qs('.section-title + p, .massagem-subtitle'), t('massagem.p1'), true);
    var ps = qsa('.massagem-body p, .content-body p');
    set(ps[0], t('massagem.p2'));
    set(ps[1], t('massagem.p3'));
    set(qs('.btn-wa'), t('massagem.btn'));
  }

  /* ═══════════════════════════════════════════════════════
     MEDITAÇÃO DAS ROSAS PAGE
  ═══════════════════════════════════════════════════════ */
  function applyMeditacaoRosas() {
    set(qs('.section-tag'), t('medit.tag'));
    set(qs('h1, .section-title'), t('medit.title'));
    set(qs('.section-title + p, .section-subtitle'), t('medit.subtitle'));
    var ps = qsa('.content-body p, .massagem-body p');
    set(ps[0], t('medit.p1'), true);
    set(ps[1], t('medit.p2'), true);
    set(qs('.btn-wa'), t('medit.btn'));
  }

  /* ═══════════════════════════════════════════════════════
     RENASCIMENTO PAGE
  ═══════════════════════════════════════════════════════ */
  function applyRenascimento() {
    var v = t('renasc.title');
    if (v) document.title = v + ' — Cauê Sagae';
    set(qs('.section-tag'), t('renasc.tag'));
    set(qs('h1, .section-title'), t('renasc.title'));
    set(qs('.section-title + p, .section-subtitle'), t('renasc.subtitle'));
    var ps = qsa('.content-body p, .massagem-body p');
    set(ps[0], t('renasc.p1'), true);
    set(ps[1], t('renasc.p2'), true);
    set(ps[2], t('renasc.p3'), true);
    set(ps[3], t('renasc.p4'), true);
    set(qs('.btn-wa'), t('renasc.btn'));
  }

  /* ═══════════════════════════════════════════════════════
     WELLNESS PAGE
  ═══════════════════════════════════════════════════════ */
  function applyWellness() {
    var v = t('wellness.title');
    if (v) document.title = v + ' — Cauê Sagae';
    set(qs('.section-tag'), t('wellness.tag'));
    set(qs('h1, .section-title'), t('wellness.title'));
    set(qs('.section-title + p, .section-subtitle'), t('wellness.subtitle'));
    var ps = qsa('.content-body p, .massagem-body p');
    set(ps[0], t('wellness.p1'));
    set(ps[1], t('wellness.practices_title'), true);
    set(ps[2], t('wellness.group_note'), true);
    set(qs('.btn-wa'), t('wellness.btn'));
  }

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    addStyles();
    document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es', fr: 'fr' }[lang] || lang;

    translateNav();
    translateFooter();
    injectSwitcher();

    var page = getPage();
    switch (page) {
      case 'index':           applyIndex();          break;
      case 'trevos':          applyTrevos();         break;
      case 'meditacoes':      applyMeditacoes();     break;
      case 'aura':            applyAura();           break;
      case 'empresas':        applyEmpresas();       break;
      case 'livro':           applyLivro();          break;
      case 'massagem':        applyMassagem();       break;
      case 'meditacao-rosas': applyMeditacaoRosas(); break;
      case 'renascimento':    applyRenascimento();   break;
      case 'wellness':        applyWellness();       break;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
