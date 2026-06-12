(function () {
  const home = location.pathname.endsWith('index.html')
    || location.pathname === '/'
    || /\/caue-sagae-site\/?$/.test(location.pathname);
  const base = home ? '' : 'index.html';

  const links = [
    { href: base + '#sobre',     label: 'Sobre' },
    { href: 'trevos.html',       label: 'Trevos do Amor' },
    { href: base + '#terapias',  label: 'Serviços' },
    { href: 'meditacoes.html',   label: 'Meditações Gratuitas' },
    { href: base + '#contato',   label: 'Contato', cta: true },
  ];

  const ul = document.getElementById('navLinks');
  if (!ul) return;
  ul.innerHTML = links
    .map(l => `<li><a href="${l.href}"${l.cta ? ' class="nav-cta"' : ''}>${l.label}</a></li>`)
    .join('');

  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => ul.classList.toggle('open'));
    ul.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ul.classList.remove('open')));
  }
})();
