(() => {
  // Retira elementos editoriales descontinuados, aunque permanezcan en páginas antiguas.
  document.querySelectorAll('.vote-float, df-messenger, #ppcate-assistant-guide').forEach(element => element.remove());

  const header = document.querySelector('header');
  const navwrap = document.querySelector('.navwrap');
  const nav = navwrap?.querySelector('nav');
  if (navwrap && nav) {
    let button = navwrap.querySelector('.mobile-menu-toggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'mobile-menu-toggle';
      button.setAttribute('aria-label', 'Abrir menú principal');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'main-navigation');
      button.innerHTML = '<span aria-hidden="true">☰</span>';
      nav.id = nav.id || 'main-navigation';
      navwrap.appendChild(button);
    }
    const close = () => {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menú principal');
      button.innerHTML = '<span aria-hidden="true">☰</span>';
    };
    button.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Cerrar menú principal' : 'Abrir menú principal');
      button.innerHTML = `<span aria-hidden="true">${open ? '×' : '☰'}</span>`;
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', e => {
      if (nav.classList.contains('is-open') && !navwrap.contains(e.target)) close();
    });
  }

  if (!document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#contenido-principal';
    skip.textContent = 'Saltar al contenido principal';
    document.body.prepend(skip);
  }
  const main = document.querySelector('main') || document.querySelector('.hero') || document.querySelector('.section');
  if (main && !main.id) main.id = 'contenido-principal';

  document.querySelectorAll('a[href]').forEach(link => {
    try {
      const target = new URL(link.href, location.href);
      const current = new URL(location.href);
      if (target.origin === current.origin && target.pathname === current.pathname) {
        link.setAttribute('aria-current', 'page');
      }
    } catch (_) {}
  });

  document.querySelectorAll('img:not([width])').forEach(img => {
    img.addEventListener('load', () => {
      if (img.naturalWidth && img.naturalHeight) {
        img.setAttribute('width', String(img.naturalWidth));
        img.setAttribute('height', String(img.naturalHeight));
      }
    }, { once: true });
  });

  if (header) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.style.boxShadow = y > 15 ? '0 8px 22px rgba(0,0,0,.16)' : '';
    }, { passive: true });
  }
})();
