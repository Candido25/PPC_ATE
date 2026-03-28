new Typed("#typed-text", {
  strings: [
    "Seguridad para tu familia",
    "Orden para nuestro distrito",
    "Tu voz en la municipalidad",
    "Ate que crece y se desarrolla"
  ],
  typeSpeed: 48,
  backSpeed: 28,
  backDelay: 2200,
  loop: true
});

const doctrineMessages = [
  {
    title: "Dignidad de la persona humana",
    text: "La politica existe para servir a la persona, no para utilizarla. Cada vecino vale por si mismo y merece seguridad, respeto y oportunidades reales.",
    meta: "La dignidad humana nos recuerda que ninguna gestion es buena si olvida a la persona concreta."
  },
  {
    title: "Bien comun",
    text: "Gobernar no es repartir favores. Es ordenar la ciudad para que el progreso, la seguridad y los servicios lleguen a todos y no solo a unos cuantos.",
    meta: "El bien comun busca que el desarrollo beneficie a la comunidad entera y no a intereses particulares."
  },
  {
    title: "Subsidiariedad",
    text: "Lo que la familia, el barrio o la comunidad pueden hacer bien, no debe ser absorbido por un Estado torpe. La municipalidad debe apoyar y fortalecer, no reemplazar.",
    meta: "La subsidiariedad promueve ciudadanos y comunidades mas fuertes, no vecinos dependientes."
  },
  {
    title: "Solidaridad",
    text: "Nadie se salva solo. Una ciudad justa es la que protege al mas vulnerable y convierte la fuerza colectiva en apoyo concreto para quien mas lo necesita.",
    meta: "La solidaridad convierte la politica en deber moral con el otro y no solo en administracion fria."
  },
  {
    title: "Justicia social",
    text: "No basta con crecer. Hay que corregir desigualdades, cerrar brechas y asegurar que el desarrollo llegue tambien a los barrios olvidados de Ate.",
    meta: "La justicia social exige que el progreso tenga rostro humano y llegue a quienes fueron postergados."
  },
  {
    title: "Participacion",
    text: "El vecino no debe ser espectador de la gestion municipal. Debe ser protagonista, fiscalizador y constructor del desarrollo de su propia comunidad.",
    meta: "La participacion fortalece la democracia local y mejora la calidad de las decisiones publicas."
  },
  {
    title: "Destino universal de los bienes",
    text: "La propiedad y la economia tienen una funcion social. La riqueza, los servicios y las oportunidades no pueden organizarse de espaldas a la comunidad.",
    meta: "Este principio recuerda que la economia debe estar al servicio de la persona y del bien comun."
  },
  {
    title: "Trabajo con dignidad",
    text: "El trabajo no es solo ingreso. Es dignidad, realizacion personal y camino de progreso para la familia y la comunidad.",
    meta: "Por eso defendemos empleo local, emprendimiento y desarrollo productivo con rostro humano."
  }
];

const doctrineModal = document.getElementById("doctrineModal");
const doctrineTitle = document.getElementById("doctrineTitle");
const doctrineText = document.getElementById("doctrineText");
const doctrineMeta = document.getElementById("doctrineMeta");
const closeDoctrineModal = document.getElementById("closeDoctrineModal");
const dismissDoctrineModal = document.getElementById("dismissDoctrineModal");

function getDoctrineKeyToday() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

function getDoctrineIndexToday() {
  const key = getDoctrineKeyToday().replaceAll("-", "");
  const number = Number(key);
  return number % doctrineMessages.length;
}

function shouldShowDoctrineToday() {
  try {
    return localStorage.getItem("ppc_ate_doctrine_seen") !== getDoctrineKeyToday();
  } catch (e) {
    return true;
  }
}

function markDoctrineSeenToday() {
  try {
    localStorage.setItem("ppc_ate_doctrine_seen", getDoctrineKeyToday());
  } catch (e) {
    // Ignore storage issues and keep the modal functional.
  }
}

function closeDoctrineWelcome() {
  if (!doctrineModal) return;
  doctrineModal.classList.remove("is-open");
  doctrineModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  markDoctrineSeenToday();
}

function openDoctrineWelcome() {
  if (!doctrineModal || !doctrineTitle || !doctrineText || !doctrineMeta) return;
  const doctrine = doctrineMessages[getDoctrineIndexToday()];
  doctrineTitle.textContent = doctrine.title;
  doctrineText.textContent = doctrine.text;
  doctrineMeta.textContent = doctrine.meta;
  doctrineModal.classList.add("is-open");
  doctrineModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

if (shouldShowDoctrineToday()) {
  window.addEventListener("load", function () {
    setTimeout(openDoctrineWelcome, 550);
  });
}

if (closeDoctrineModal) {
  closeDoctrineModal.addEventListener("click", closeDoctrineWelcome);
}

if (dismissDoctrineModal) {
  dismissDoctrineModal.addEventListener("click", closeDoctrineWelcome);
}

if (doctrineModal) {
  doctrineModal.addEventListener("click", function (e) {
    if (e.target instanceof HTMLElement && e.target.dataset.closeDoctrine === "true") {
      closeDoctrineWelcome();
    }
  });
}

const sr = ScrollReveal({ distance: "36px", duration: 900, delay: 150, reset: false });
sr.reveal(".card", { origin: "bottom", interval: 120 });
sr.reveal("h2", { origin: "left", distance: "28px" });
sr.reveal(".hero-card", { origin: "right", scale: 0.92, duration: 1100 });
sr.reveal(".ideario-card", { origin: "bottom", interval: 100 });

const APP = window.APP_CONFIG || {};
const API_URL = APP.apiUrl || "";
const PHONE = APP.whatsapp || "51968481482";

function abrirWhatsApp(msg) {
  window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg), "_blank");
}

function setStatus(id, ok, msg) {
  const el = document.getElementById(id);
  el.className = "status " + (ok ? "ok" : "err");
  el.textContent = msg;
}

async function postToApi(payload) {
  if (!API_URL) throw new Error("Falta configurar la URL del Apps Script en config.js");

  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  const res = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Respuesta invalida del servidor");
  }

  if (data.ok === false || data.status === "error") {
    throw new Error(data.error || "No se pudo enviar");
  }

  return data;
}

document.getElementById("volunteerForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(this).entries());
  const waMsg = "Nuevo voluntario\n" +
    "Nombre: " + (d.nombre || "") + "\n" +
    "Tel: " + (d.telefono || "") + "\n" +
    "Zona: " + (d.zona || "") + "\n" +
    "Interes: " + (d.interes || "") + "\n" +
    "Mensaje: " + (d.mensaje || "");

  try {
    await postToApi({ type: "voluntario", ...d });
    setStatus("volunteerStatus", true, "Gracias. Tu registro fue enviado correctamente.");
    this.reset();
  } catch (err) {
    setStatus("volunteerStatus", false, (err.message || "No se pudo enviar") + ". Se abrira WhatsApp como respaldo.");
    abrirWhatsApp(waMsg);
  }
});

document.getElementById("reportForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(this).entries());
  const waMsg = "Reporte ciudadano\n" +
    "Nombre: " + (d.nombre || "") + "\n" +
    "Tel: " + (d.telefono || "") + "\n" +
    "Categoria: " + (d.categoria || "") + "\n" +
    "Zona: " + (d.zona || "") + "\n" +
    "Detalle: " + (d.detalle || "");

  try {
    await postToApi({ type: "reporte", ...d });
    setStatus("reportStatus", true, "Reporte enviado correctamente. Gracias por fiscalizar.");
    this.reset();
  } catch (err) {
    setStatus("reportStatus", false, (err.message || "No se pudo enviar") + ". Se abrira WhatsApp como respaldo.");
    abrirWhatsApp(waMsg);
  }
});

const heroVideoModal = document.getElementById("heroVideoModal");
const heroVideoTrigger = document.getElementById("heroVideoTrigger");
const closeHeroVideo = document.getElementById("closeHeroVideo");

function openHeroVideo() {
  if (!heroVideoModal) return;
  heroVideoModal.classList.add("is-open");
  heroVideoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeVideoModal() {
  if (!heroVideoModal) return;
  heroVideoModal.classList.remove("is-open");
  heroVideoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (heroVideoTrigger) {
  heroVideoTrigger.addEventListener("click", openHeroVideo);
}

if (closeHeroVideo) {
  closeHeroVideo.addEventListener("click", closeVideoModal);
}

if (heroVideoModal) {
  heroVideoModal.addEventListener("click", function (e) {
    if (e.target instanceof HTMLElement && e.target.dataset.closeVideo === "true") {
      closeVideoModal();
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeDoctrineWelcome();
    closeVideoModal();
  }
});
