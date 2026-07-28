(() => {
  const BOOTSTRAP_SRC = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
  const AGENT_ID = "8ec917ff-fff9-42d6-a617-4ae4201ebd05";
  const CHAT_TITLE = "Asistente ciudadano PPC Ate";
  const HOST_STYLE_ID = "ppcate-dialogflow-host-style";
  const SHADOW_STYLE_ID = "ppcate-dialogflow-shadow-style";
  const GUIDE_ID = "ppcate-assistant-guide";
  const AUTO_OPEN_KEY = "ppcate_assistant_opened";

  const quickLinks = [
    ["Problemas de Ate", "problemas-ate.html"],
    ["Propuestas", "propuestas.html"],
    ["Conoce al candidato", "candidato-jose-luis-hurtado.html"],
    ["Reportar un problema", "index.html#fiscalizacion"],
    ["Ser voluntario", "index.html#voluntarios"],
    ["Ideario del PPC", "ideario.html"]
  ];

  const hostCss = `
    df-messenger {
      position: fixed;
      right: 20px;
      bottom: 146px;
      z-index: 1300;
      --df-messenger-button-titlebar-color: #117a3b;
      --df-messenger-chat-background-color: #f6f8f6;
      --df-messenger-font-color: #1f2b22;
      --df-messenger-send-icon: #117a3b;
      --df-messenger-user-message: #117a3b;
      --df-messenger-bot-message: #ffffff;
      --df-messenger-input-box-color: #ffffff;
      --df-messenger-input-font-color: #1f2b22;
      --df-messenger-minimized-chat-close-icon-color: #ffffff;
      --df-messenger-chip-color: #0d5b2d;
      --df-messenger-chip-font-color: #ffffff;
      --df-messenger-minimized-chat-bubble-size: 60px;
      --df-messenger-message-border-radius: 16px;
      --df-messenger-input-padding: 14px;
      --df-messenger-chat-window-width: min(420px, calc(100vw - 28px));
      --df-messenger-chat-window-height: min(640px, calc(100vh - 170px));
      --df-messenger-titlebar-font-color: #ffffff;
      --df-messenger-titlebar-title-font-size: 16px;
      --df-messenger-titlebar-subtitle-font-size: 13px;
    }

    #${GUIDE_ID} {
      position: fixed;
      right: 92px;
      bottom: 156px;
      z-index: 1299;
      width: min(290px, calc(100vw - 130px));
      background: #fff;
      border: 1px solid #dce7df;
      border-radius: 18px;
      box-shadow: 0 14px 38px rgba(0,0,0,.16);
      padding: 14px;
      color: #1f2b22;
      font-family: Arial, Helvetica, sans-serif;
      transition: opacity .2s ease, transform .2s ease;
    }

    #${GUIDE_ID}[hidden] { display: none; }
    #${GUIDE_ID} .assistant-guide-head { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
    #${GUIDE_ID} strong { display:block; color:#0d5b2d; font-size:.95rem; margin-bottom:4px; }
    #${GUIDE_ID} p { margin:0; color:#5f6d63; font-size:.82rem; line-height:1.45; }
    #${GUIDE_ID} button { border:0; background:transparent; color:#5f6d63; cursor:pointer; font-size:1.15rem; line-height:1; padding:2px; }
    #${GUIDE_ID} .assistant-quick-links { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:11px; }
    #${GUIDE_ID} a { display:flex; align-items:center; min-height:38px; padding:8px 9px; border-radius:10px; background:#f3f8f4; color:#0d5b2d; text-decoration:none; font-size:.76rem; font-weight:700; line-height:1.2; }
    #${GUIDE_ID} a:hover, #${GUIDE_ID} a:focus-visible { background:#e5f1e8; outline:2px solid #c9a23a; outline-offset:2px; }

    @media (max-width: 680px) {
      df-messenger {
        right: 14px;
        bottom: 108px;
        --df-messenger-minimized-chat-bubble-size: 54px;
        --df-messenger-chat-window-width: calc(100vw - 20px);
        --df-messenger-chat-window-height: min(72vh, calc(100vh - 120px));
      }
      #${GUIDE_ID} { right: 72px; bottom: 116px; width:min(270px, calc(100vw - 92px)); }
      #${GUIDE_ID} .assistant-quick-links { grid-template-columns:1fr; }
    }
  `;

  const shadowCss = `
    .message-list, .message-list *, .message-bubble, .message-bubble *,
    .message-content, .message-content *, .message-text, .message-text *,
    .bot-message, .bot-message *, .agent-message, .agent-message *,
    .response-message, .response-message *, .text, .text *, .message, .message *,
    p, span, div {
      white-space: pre-line !important;
      line-height: 1.5 !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
    }
    ul, ol { margin: .45rem 0 !important; padding-left: 1.25rem !important; }
    li { margin: 0 0 .4rem !important; }
  `;

  function ensureHostStyle() {
    if (document.getElementById(HOST_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = HOST_STYLE_ID;
    style.textContent = hostCss;
    document.head.appendChild(style);
  }

  function createGuide() {
    if (document.getElementById(GUIDE_ID)) return;
    const aside = document.createElement("aside");
    aside.id = GUIDE_ID;
    aside.setAttribute("aria-label", "Accesos rápidos del asistente ciudadano");
    aside.innerHTML = `
      <div class="assistant-guide-head">
        <div><strong>¿En qué podemos orientarte?</strong><p>Consulta al asistente o entra directamente a una sección.</p></div>
        <button type="button" aria-label="Cerrar accesos rápidos">×</button>
      </div>
      <div class="assistant-quick-links">
        ${quickLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
      </div>`;
    aside.querySelector("button").addEventListener("click", () => { aside.hidden = true; });
    document.body.appendChild(aside);
    window.setTimeout(() => { aside.hidden = true; }, 12000);
  }

  function injectShadowStyle(shadowRoot) {
    if (!shadowRoot || shadowRoot.getElementById(SHADOW_STYLE_ID)) return false;
    const style = document.createElement("style");
    style.id = SHADOW_STYLE_ID;
    style.textContent = shadowCss;
    shadowRoot.appendChild(style);
    return true;
  }

  function walkShadowRoots(root) {
    if (!root) return 0;
    let injected = 0;
    const nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];
    nodes.forEach((node) => {
      if (node.shadowRoot) {
        if (injectShadowStyle(node.shadowRoot)) injected += 1;
        injected += walkShadowRoots(node.shadowRoot);
      }
    });
    return injected;
  }

  function formatMessenger() {
    const messenger = document.querySelector("df-messenger");
    if (!messenger || !messenger.shadowRoot) return false;
    injectShadowStyle(messenger.shadowRoot);
    walkShadowRoots(messenger.shadowRoot);
    return true;
  }

  function ensureMessenger() {
    let messenger = document.querySelector("df-messenger");
    if (messenger) return messenger;
    messenger = document.createElement("df-messenger");
    messenger.setAttribute("intent", "WELCOME");
    messenger.setAttribute("chat-title", CHAT_TITLE);
    messenger.setAttribute("agent-id", AGENT_ID);
    messenger.setAttribute("language-code", "es");
    messenger.setAttribute("aria-label", "Abrir asistente ciudadano PPC Ate");
    document.body.appendChild(messenger);
    return messenger;
  }

  function ensureBootstrap() {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find((script) => script.src === BOOTSTRAP_SRC);
      if (existing) {
        if (window.customElements && window.customElements.get("df-messenger")) return resolve();
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = BOOTSTRAP_SRC;
      script.async = true;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.body.appendChild(script);
    });
  }

  function formatUntilReady() {
    let attempts = 0;
    const maxAttempts = 20;
    const timer = window.setInterval(() => {
      attempts += 1;
      const ready = formatMessenger();
      if (ready || attempts >= maxAttempts) window.clearInterval(timer);
    }, 400);
  }

  function autoOpenOnce(messenger) {
    try {
      if (sessionStorage.getItem(AUTO_OPEN_KEY)) return;
      sessionStorage.setItem(AUTO_OPEN_KEY, "1");
      window.setTimeout(() => {
        if (window.matchMedia("(max-width: 680px)").matches) return;
        messenger.setAttribute("expand", "true");
        window.setTimeout(() => messenger.removeAttribute("expand"), 6500);
      }, 1800);
    } catch (_) {
      // El asistente sigue funcionando aunque el almacenamiento esté bloqueado.
    }
  }

  async function init() {
    ensureHostStyle();
    createGuide();
    try {
      await ensureBootstrap();
      const messenger = ensureMessenger();
      formatUntilReady();
      autoOpenOnce(messenger);
    } catch (error) {
      console.warn("No se pudo cargar el asistente ciudadano:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();