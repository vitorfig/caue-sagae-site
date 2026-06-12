(function () {
  const home = location.pathname.endsWith('index.html')
    || location.pathname === '/'
    || /\/caue-sagae-site\/?$/.test(location.pathname);
  const base = home ? '' : 'index.html';

  // Main nav links (Contato moved outside ul)
  const links = [
    { href: base + '#sobre',    label: 'Sobre' },
    { href: 'trevos.html',      label: 'Trevos do Amor' },
    { href: base + '#terapias', label: 'Serviços' },
    { href: 'meditacoes.html',  label: 'Meditações Gratuitas' },
  ];

  const ul = document.getElementById('navLinks');
  if (!ul) return;

  ul.innerHTML = links
    .map(l => `<li><a href="${l.href}">${l.label}</a></li>`)
    .join('');

  // Contato inside mobile hamburger menu (hidden on desktop)
  const mobileLi = document.createElement('li');
  mobileLi.className = 'nav-mobile-cta';
  mobileLi.innerHTML = `<a href="${base}#contato" class="nav-cta">Contato</a>`;
  ul.appendChild(mobileLi);

  // Right-side group: i18n.js will prepend the lang-switcher here, then Contato
  const hamburger = document.getElementById('hamburger');
  const navEl = document.querySelector('nav');
  if (navEl) {
    const navRight = document.createElement('div');
    navRight.id = 'navRight';
    navRight.className = 'nav-right';

    const cta = document.createElement('a');
    cta.href = base + '#contato';
    cta.className = 'nav-cta nav-cta-standalone';
    cta.id = 'nav-contato';
    cta.textContent = 'Contato';
    navRight.appendChild(cta);

    if (hamburger) navEl.insertBefore(navRight, hamburger);
    else navEl.appendChild(navRight);
  }

  // CSS: desktop shows standalone Contato, mobile shows it in dropdown
  const style = document.createElement('style');
  style.textContent = [
    '.nav-right{display:flex;align-items:center;gap:.6rem;}',
    '.nav-cta-standalone{text-decoration:none!important;}',
    '.nav-mobile-cta{display:none;}',
    '@media(max-width:800px){',
    '.nav-right .nav-cta-standalone{display:none!important;}',
    '.nav-mobile-cta{display:block;}',
    '}'
  ].join('');
  document.head.appendChild(style);

  if (hamburger) {
    hamburger.addEventListener('click', () => ul.classList.toggle('open'));
    ul.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ul.classList.remove('open')));
  }
})();
