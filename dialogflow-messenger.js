(() => {
  const BOOTSTRAP_SRC = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
  const AGENT_ID = "8ec917ff-fff9-42d6-a617-4ae4201ebd05";
  const CHAT_TITLE = "Asistente PPCate";
  const HOST_STYLE_ID = "ppcate-dialogflow-host-style";
  const SHADOW_STYLE_ID = "ppcate-dialogflow-shadow-style";

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

    @media (max-width: 680px) {
      df-messenger {
        right: 14px;
        bottom: 108px;
        --df-messenger-minimized-chat-bubble-size: 54px;
        --df-messenger-chat-window-width: calc(100vw - 20px);
        --df-messenger-chat-window-height: min(72vh, calc(100vh - 120px));
      }
    }
  `;

  const shadowCss = `
    .message-list,
    .message-list *,
    .message-bubble,
    .message-bubble *,
    .message-content,
    .message-content *,
    .message-text,
    .message-text *,
    .bot-message,
    .bot-message *,
    .agent-message,
    .agent-message *,
    .response-message,
    .response-message *,
    .text,
    .text *,
    .message,
    .message *,
    p,
    span,
    div {
      white-space: pre-line !important;
      line-height: 1.5 !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
    }

    ul,
    ol {
      margin: 0.45rem 0 !important;
      padding-left: 1.25rem !important;
    }

    li {
      margin: 0 0 0.4rem !important;
    }
  `;

  function ensureHostStyle() {
    if (document.getElementById(HOST_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = HOST_STYLE_ID;
    style.textContent = hostCss;
    document.head.appendChild(style);
  }

  function injectShadowStyle(shadowRoot) {
    if (!shadowRoot || shadowRoot.getElementById(SHADOW_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = SHADOW_STYLE_ID;
    style.textContent = shadowCss;
    shadowRoot.appendChild(style);
  }

  function walkShadowRoots(root) {
    if (!root) return;
    const nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];
    nodes.forEach((node) => {
      if (node.shadowRoot) {
        injectShadowStyle(node.shadowRoot);
        walkShadowRoots(node.shadowRoot);
      }
    });
  }

  function formatMessenger() {
    const messenger = document.querySelector("df-messenger");
    if (!messenger || !messenger.shadowRoot) return;
    injectShadowStyle(messenger.shadowRoot);
    walkShadowRoots(messenger.shadowRoot);
  }

  function ensureMessenger() {
    if (document.querySelector("df-messenger")) return;
    const messenger = document.createElement("df-messenger");
    messenger.setAttribute("intent", "WELCOME");
    messenger.setAttribute("chat-title", CHAT_TITLE);
    messenger.setAttribute("agent-id", AGENT_ID);
    messenger.setAttribute("language-code", "es");
    document.body.appendChild(messenger);
  }

  function ensureBootstrap() {
    return new Promise((resolve) => {
      const existing = Array.from(document.scripts).find((script) => script.src === BOOTSTRAP_SRC);
      if (existing) {
        if (window.customElements && window.customElements.get("df-messenger")) {
          resolve();
        } else {
          existing.addEventListener("load", () => resolve(), { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = BOOTSTRAP_SRC;
      script.async = true;
      script.addEventListener("load", () => resolve(), { once: true });
      document.body.appendChild(script);
    });
  }

  function startFormattingLoop() {
    formatMessenger();
    const observer = new MutationObserver(() => formatMessenger());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setInterval(formatMessenger, 1200);
  }

  async function init() {
    ensureHostStyle();
    await ensureBootstrap();
    ensureMessenger();
    startFormattingLoop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
