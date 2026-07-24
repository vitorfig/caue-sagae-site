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

    // Prepend inside #navRight so order is [lang-switcher][Contato]
    var navRight = qs('#navRight', nav);
    if (navRight) navRight.insertBefore(div, navRight.firstChild);
    else {
      var hamburger = qs('.hamburger', nav);
      if (hamburger) nav.insertBefore(div, hamburger);
      else nav.appendChild(div);
    }

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
    var links = qsa('#navLinks li:not(.nav-mobile-cta) a');
    var keys  = ['nav.sobre', 'nav.trevos', 'nav.servicos', 'nav.meditacoes'];
    links.forEach(function (a, i) { if (keys[i]) set(a, t(keys[i])); });
    var contato = t('nav.contato');
    set(qs('#nav-contato'), contato);
    set(qs('.nav-mobile-cta a'), contato);
  }

  function translateFooter() {
    var ps = qsa('footer p');
    if (ps[0]) set(ps[0], t('footer.made'), true);
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
      set(qs('.parceiros-label', corp), t('corp.parceiros_label'));
    }

    // ── Meditações CTA
    var mCta = qs('#meditacoes-cta');
    if (mCta) {
      set(qs('.medit-cta-badge', mCta), t('medit_cta.badge'));
      set(qs('.medit-cta-title', mCta), t('medit_cta.title'));
      var mCtaPs = qsa('.medit-cta-body p', mCta);
      set(mCtaPs[0], t('medit_cta.p1'), true);
      set(mCtaPs[1], t('medit_cta.p2'));
      set(mCtaPs[2], t('medit_cta.p3'));
      var mCtaBtn = qs('a.btn-green', mCta);
      if (mCtaBtn) mCtaBtn.textContent = t('medit_cta.btn') || mCtaBtn.textContent;
    }

    // ── Serviços / Pricing
    set(qs('#servicos .section-tag'),   t('pricing.tag'));
    set(qs('#servicos .section-title'), t('pricing.title'));
    set(qs('.ph-name'),  t('pricing.col_service'));
    set(qs('.ph-type'),  t('pricing.col_type'));
    set(qs('.ph-dur'),   t('pricing.col_duration'));
    set(qs('.ph-price'), t('pricing.col_price'));
    set(qs('#servicos .services-cta .btn-wa'), t('pricing.btn'));

    var svcKeys   = ['svc.aura','svc.massagem','svc.meditacao','svc.rebirthing','svc.wellness','svc.ritual','svc.intuicao'];
    var typeKeys  = ['pricing.type_individual','pricing.type_individual','pricing.type_ind_group','pricing.type_individual','pricing.type_ind_group','pricing.type_individual','pricing.type_ind_group'];
    var durFixed  = ['1h','1h','5h','1h','3h',null,null];
    var durKeys   = [null,null,null,null,null,'pricing.personalized','pricing.personalized'];
    var priceKeys = ['price.aura','price.massagem','price.meditacao','price.rebirthing','price.wellness','price.ritual','price.intuicao'];

    qsa('#servicos .price-row').forEach(function (row, i) {
      var nameEl = qs('.pr-name', row);
      if (nameEl && svcKeys[i]) {
        var icon = qs('.pr-icon', nameEl);
        var iconHtml = icon ? icon.outerHTML : '';
        var name = t(svcKeys[i]);
        if (name) {
          var sub = i === 2 ? ' <span style="font-size:.78rem;color:var(--muted);">' + (t('svc.meditacao.sub') || '') + '</span>' : '';
          nameEl.innerHTML = iconHtml + ' ' + name + sub;
        }
      }
      set(qs('.pr-type', row), typeKeys[i] ? t(typeKeys[i]) : null);
      var durEl = qs('.pr-dur', row);
      if (durEl) set(durEl, durFixed[i] !== null ? durFixed[i] : (durKeys[i] ? t(durKeys[i]) : null));
      var priceEl = qs('.pr-price', row);
      if (priceEl) set(priceEl, t(priceKeys[i]));
    });

    // ── Depoimentos
    set(qs('#depoimentos .section-tag'),   t('depoimentos.tag'));
    set(qs('#depoimentos .section-title'), t('depoimentos.title'));
    set(qs('#depoimentos .section-body'),  t('depoimentos.desc'));
    var depoTagKeys = ['depoimentos.tag_mentoria', 'depoimentos.tag_aura', 'depoimentos.tag_massagem', 'depoimentos.tag_depoimento'];
    qsa('.depo-tag').forEach(function (el, i) { if (depoTagKeys[i]) set(el, t(depoTagKeys[i])); });

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

    // ── Cursos
    set(qs('.cursos-tag'),   t('cursos.tag'));
    set(qs('.cursos-title'), t('cursos.title'));
    set(qs('.cursos-desc'),  t('cursos.desc'));
    qsa('.curso-buy-lbl').forEach(function (el) { set(el, t('cursos.buy')); });
    qsa('.curso-more-lbl').forEach(function (el) { set(el, t('cursos.more')); });
    qsa('.curso-cat-medit').forEach(function (el) { set(el, t('cursos.cat.medit')); });
    set(qs('.curso-cat-ritual'),   t('cursos.cat.ritual'));
    set(qs('.curso-cat-intuicao'), t('cursos.cat.curso'));
    qsa('.curso-lv1').forEach(function (el) { set(el, t('cursos.lv1')); });
    qsa('.curso-lv2').forEach(function (el) { set(el, t('cursos.lv2')); });
    qsa('.curso-lv3').forEach(function (el) { set(el, t('cursos.lv3')); });
    qsa('.curso-medit-title').forEach(function (el) { set(el, t('cursos.medit.title')); });
    set(qs('.curso-ritual-title'),    t('cursos.ritual.title'));
    set(qs('.curso-intuicao-title'),  t('cursos.intuicao.title'));
    set(qs('.curso-medit1-desc'),     t('cursos.medit1.desc'));
    set(qs('.curso-medit2-desc'),     t('cursos.medit2.desc'));
    set(qs('.curso-medit3-desc'),     t('cursos.medit3.desc'));
    set(qs('.curso-ritual-desc'),     t('cursos.ritual.desc'));
    set(qs('.curso-intuicao-desc'),   t('cursos.intuicao.desc'));
    qsa('.curso-medit1-price,.curso-medit2-price,.curso-medit3-price').forEach(function (el) { set(el, t('cursos.medit.price')); });
    set(qs('.curso-ritual-price'),    t('cursos.ritual.price'));
    set(qs('.curso-intuicao-price'),  t('cursos.intuicao.price'));

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

    // ── Hero
    set(qs('#hero .hero-tag'),   t('meditacoes.hero_tag'));
    set(qs('#hero .hero-title'), t('meditacoes.hero_title'));
    set(qs('#hero .hero-desc'),  t('meditacoes.hero_desc'));

    // ── Intro video
    set(qs('#intro-video .intro-tag'),   t('meditacoes.intro_tag'));
    set(qs('#intro-video .intro-title'), t('meditacoes.intro_title'));
    var introBps = qsa('#intro-video .intro-body p');
    set(introBps[0], t('meditacoes.intro_p1'));
    set(introBps[1], t('meditacoes.intro_p2'), true);
    set(introBps[2], t('meditacoes.intro_p3'), true);
    set(introBps[3], t('meditacoes.intro_p4'));

    // ── Videos section
    set(qs('#videos .section-tag'),   t('meditacoes.section_tag'));
    set(qs('#videos .section-title'), t('meditacoes.section_title'));
    var vTitles = qsa('.video-title');
    set(vTitles[0], t('meditacoes.vt1'));
    set(vTitles[1], t('meditacoes.vt2'));
    set(vTitles[2], t('meditacoes.vt3'));
    set(vTitles[3], t('meditacoes.vt4'));
    set(vTitles[4], t('meditacoes.vt5'));
    set(vTitles[5], t('meditacoes.vt6'));
    set(vTitles[6], t('meditacoes.vt7'));

    // ── Sobre meditação
    set(qs('#sobre-medit .section-tag'), t('meditacoes.about_tag'));
    set(qs('#sobre-medit .sobre-title'), t('meditacoes.about_title'));
    var aboutPs = qsa('#sobre-medit .sobre-body p');
    set(aboutPs[0], t('meditacoes.about_p1'), true);
    set(aboutPs[1], t('meditacoes.about_p2'));
    set(aboutPs[2], t('meditacoes.about_p3'), true);
    set(qs('#sobre-medit .sobre-card h3'), t('meditacoes.levels_title'));
    var levItems = qsa('#sobre-medit .nivel-list li');
    setLastText(levItems[0], t('meditacoes.level1'));
    setLastText(levItems[1], t('meditacoes.level2'));
    setLastText(levItems[2], t('meditacoes.level3'));

    // ── CTA
    set(qs('#cta .cta-title'), t('meditacoes.cta_title'));
    set(qs('#cta .cta-desc'),  t('meditacoes.cta_desc'));
    var ctaBtns = qsa('#cta a.btn');
    setLastText(ctaBtns[0], t('meditacoes.btn_agendar'));
    if (ctaBtns[1]) ctaBtns[1].textContent = t('meditacoes.btn_back') || ctaBtns[1].textContent;
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
    set(qs('.btn-back'), t('aurapage.btn_back'));
  }

  /* ═══════════════════════════════════════════════════════
     EMPRESAS PAGE
  ═══════════════════════════════════════════════════════ */
  function applyEmpresas() {
    document.title = t('title.empresas') || document.title;
    set(qs('.hero-tag'),  t('empresas.hero_tag'));
    set(qs('.hero-title'), t('empresas.hero_title'));
    set(qs('.hero-desc'),  t('empresas.hero_desc'));
    var heroWa = qs('#hero .btn-wa');
    if (heroWa) heroWa.textContent = t('empresas.btn_wa') || heroWa.textContent;

    // ── Exp blocks
    var expBlocks = qsa('.exp-block');
    var eb;

    // Exp 1 (Agrivalle)
    eb = expBlocks[0];
    if (eb) {
      set(qs('.exp-tag', eb),   t('empresas.exp1_tag'));
      set(qs('.exp-title', eb), t('empresas.exp1_title'));
      var eb1ps = qsa('.exp-body p', eb);
      set(eb1ps[0], t('empresas.exp1_p1'), true);
      set(eb1ps[1], t('empresas.exp1_p2'));
      set(eb1ps[2], t('empresas.exp1_p3'));
      set(eb1ps[3], t('empresas.exp1_p4'), true);
      set(qs('.btn-wa', eb), t('empresas.btn_team'));
    }

    // Exp 3 (Wellness) — second block
    eb = expBlocks[1];
    if (eb) {
      set(qs('.exp-tag', eb),   t('empresas.exp3_tag'));
      set(qs('.exp-title', eb), t('empresas.exp3_title'));
      var eb3ps = qsa('.exp-body > p', eb);
      set(eb3ps[0], t('empresas.exp3_p1'));
      var eb3lis = qsa('.exp-list li', eb);
      setLastText(eb3lis[0], t('empresas.exp3_li1'));
      setLastText(eb3lis[1], t('empresas.exp3_li2'));
      setLastText(eb3lis[2], t('empresas.exp3_li3'));
      set(eb3ps[1], t('empresas.exp3_p2'));
      set(eb3ps[2], t('empresas.exp3_p3'), true);
      set(qs('.exp-contact', eb), t('empresas.exp3_contact'), true);
      set(qs('.btn-wa', eb), t('empresas.btn_team'));
    }

    // Exp 2 (Janeiro Branco) — third block
    eb = expBlocks[2];
    if (eb) {
      set(qs('.exp-tag', eb),   t('empresas.exp2_tag'));
      set(qs('.exp-title', eb), t('empresas.exp2_title'));
      var eb2ps = qsa('.exp-body p', eb);
      set(eb2ps[0], t('empresas.exp2_p1'), true);
      set(eb2ps[1], t('empresas.exp2_p2'));
      var eb2lis = qsa('.exp-list li', eb);
      setLastText(eb2lis[0], t('empresas.exp2_li1'));
      setLastText(eb2lis[1], t('empresas.exp2_li2'));
      setLastText(eb2lis[2], t('empresas.exp2_li3'));
      setLastText(eb2lis[3], t('empresas.exp2_li4'));
      setLastText(eb2lis[4], t('empresas.exp2_li5'));
      set(eb2ps[2], t('empresas.exp2_p3'), true);
      set(eb2ps[3], t('empresas.exp2_p4'), true);
      set(qs('.exp-contact', eb), t('empresas.exp2_contact'), true);
      set(qs('.btn-wa', eb), t('empresas.btn_team'));
    }

    // Allianz Parque — fourth block
    eb = expBlocks[3];
    if (eb) {
      set(qs('.exp-tag', eb),   t('empresas.allianz_tag'));
      set(qs('.exp-title', eb), t('empresas.allianz_title'));
      var ebAps = qsa('.exp-body > p', eb);
      set(ebAps[0], t('empresas.allianz_p1'), true);
      var ebAlis = qsa('.exp-list li', eb);
      setLastText(ebAlis[0], t('empresas.allianz_li1'));
      setLastText(ebAlis[1], t('empresas.allianz_li2'));
      setLastText(ebAlis[2], t('empresas.allianz_li3'));
      setLastText(ebAlis[3], t('empresas.allianz_li4'));
      setLastText(ebAlis[4], t('empresas.allianz_li5'));
      set(ebAps[1], t('empresas.allianz_p2'));
      set(qs('.exp-contact', eb), t('empresas.allianz_contact'), true);
      set(qs('.btn-wa', eb), t('empresas.btn_team'));
    }

    // Kontrast Club — fifth block
    eb = expBlocks[4];
    if (eb) {
      set(qs('.exp-tag', eb),   t('empresas.kontrast_tag'));
      set(qs('.exp-title', eb), t('empresas.kontrast_title'));
      var ebKps = qsa('.exp-body p', eb);
      set(ebKps[0], t('empresas.kontrast_p1'), true);
      set(ebKps[1], t('empresas.kontrast_p2'));
      set(ebKps[2], t('empresas.kontrast_p3'));
      set(ebKps[3], t('empresas.kontrast_p4'));
      var ebKlis = qsa('.exp-list li', eb);
      setLastText(ebKlis[0], t('empresas.kontrast_li1'));
      setLastText(ebKlis[1], t('empresas.kontrast_li2'));
      setLastText(ebKlis[2], t('empresas.kontrast_li3'));
      setLastText(ebKlis[3], t('empresas.kontrast_li4'));
      setLastText(ebKlis[4], t('empresas.kontrast_li5'));
      set(qs('.btn-wa', eb), t('empresas.btn_team'));
    }

    // ── CTA final
    set(qs('#cta .cta-title'), t('empresas.cta_title'));
    set(qs('#cta .cta-desc'),  t('empresas.cta_desc'));
    var ctaWa = qs('#cta .btn-wa');
    if (ctaWa) ctaWa.textContent = t('empresas.cta_btn') || ctaWa.textContent;
    var ctaBack = qs('#cta .btn-corp');
    if (ctaBack) ctaBack.textContent = t('empresas.cta_back') || ctaBack.textContent;
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
    set(qs('.btn-back'), t('livro.btn_back'));
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
    set(qs('.svc-tag'),      t('medit.tag'));
    set(qs('.svc-title'),    t('medit.title'));
    set(qs('.svc-subtitle'), t('medit.subtitle'));
    set(qs('.badge-dim'),    t('medit.badge'));
    set(qs('.badge-price'),  t('medit.badge_price'));
    set(qs('.medit-intro'),  t('medit.p1'), true);

    var lvlTitles = qsa('.level-title');
    set(lvlTitles[0], t('medit.level1.title'));
    set(lvlTitles[1], t('medit.level2.title'));
    set(lvlTitles[2], t('medit.level3.title'));

    var prereqs = qsa('.level-prereq');
    set(prereqs[0], t('medit.level2.prereq'));
    set(prereqs[1], t('medit.level3.prereq'));

    var lists = qsa('.level-list');
    if (lists[0] && t('medit.level1.items')) lists[0].innerHTML = t('medit.level1.items');
    if (lists[1] && t('medit.level2.items')) lists[1].innerHTML = t('medit.level2.items');
    if (lists[2] && t('medit.level3.items')) lists[2].innerHTML = t('medit.level3.items');

    set(qs('.investment-title'), t('medit.invest.title'));
    var inv = qsa('.investment-item');
    set(inv[0], t('medit.invest.l1'), true);
    set(inv[1], t('medit.invest.l2'), true);
    set(inv[2], t('medit.invest.l3'), true);
    set(inv[3], t('medit.invest.bundle'), true);
    set(qs('.investment-note'), t('medit.invest.note'));

    set(qs('.btn-wa'),    t('medit.btn'));
    set(qs('.cta-label'), t('label.schedule'));
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
