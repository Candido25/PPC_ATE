(() => {
  const suspicious = /(?:Ã|Â|â|ð|�)/;
  const cp1252 = new Map([
    [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
    [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
    [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
    [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
    [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
    [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]
  ]);

  function legacyBytes(value) {
    const bytes = [];
    for (const char of value) {
      const code = char.codePointAt(0);
      if (code <= 0xff) bytes.push(code);
      else if (cp1252.has(code)) bytes.push(cp1252.get(code));
      else return null;
    }
    return new Uint8Array(bytes);
  }

  function corruptionScore(value) {
    return (value.match(/Ã|Â|â|ð|�/g) || []).length;
  }

  function repairText(value) {
    if (!value || !suspicious.test(value)) return value;
    let current = value;
    for (let pass = 0; pass < 4; pass += 1) {
      const bytes = legacyBytes(current);
      if (!bytes) break;
      const candidate = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      if (corruptionScore(candidate) >= corruptionScore(current)) break;
      current = candidate;
    }
    return current;
  }

  function repairVisibleContent() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return suspicious.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { node.nodeValue = repairText(node.nodeValue); });

    document.querySelectorAll('[title],[alt],[aria-label],[placeholder]').forEach(element => {
      ['title', 'alt', 'aria-label', 'placeholder'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const value = element.getAttribute(attribute);
        const fixed = repairText(value);
        if (fixed !== value) element.setAttribute(attribute, fixed);
      });
    });

    document.querySelectorAll('meta[content]').forEach(meta => {
      const value = meta.getAttribute('content');
      const fixed = repairText(value);
      if (fixed !== value) meta.setAttribute('content', fixed);
    });
    document.title = repairText(document.title);
  }

  repairVisibleContent();

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
