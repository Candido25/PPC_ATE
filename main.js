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
    icon: "👤",
    kicker: "La persona al centro",
    accent: "#117a3b",
    title: "Dignidad de la persona humana",
    text: "La politica existe para servir a la persona, no para utilizarla. Cada vecino vale por si mismo y merece seguridad, respeto y oportunidades reales.",
    quote: "\"Todo hombre es verdaderamente persona.\"",
    meta: "San Juan XXIII · Pacem in Terris, 9"
  },
  {
    icon: "🏛",
    kicker: "Gobernar para todos",
    accent: "#1a5276",
    title: "Bien comun",
    text: "Gobernar no es repartir favores. Es ordenar la ciudad para que el progreso, la seguridad y los servicios lleguen a todos y no solo a unos cuantos.",
    quote: "\"La realizacion del bien comun es la unica razon de ser de las autoridades civiles.\"",
    meta: "San Juan XXIII · Pacem in Terris, 54"
  },
  {
    icon: "🤝",
    kicker: "Comunidad fuerte, Estado que apoya",
    accent: "#8a6a12",
    title: "Subsidiariedad",
    text: "Lo que la familia, el barrio o la comunidad pueden hacer bien, no debe ser absorbido por un Estado torpe. La municipalidad debe apoyar y fortalecer, no reemplazar.",
    quote: "\"Es injusto y, al mismo tiempo, un grave mal quitar a las comunidades menores lo que ellas pueden realizar.\"",
    meta: "Pio XI · Quadragesimo Anno, 79"
  },
  {
    icon: "❤️",
    kicker: "Nadie se salva solo",
    accent: "#b03020",
    title: "Solidaridad",
    text: "Nadie se salva solo. Una ciudad justa es la que protege al mas vulnerable y convierte la fuerza colectiva en apoyo concreto para quien mas lo necesita.",
    quote: "\"La solidaridad es sin duda una virtud cristiana.\"",
    meta: "San Juan Pablo II · Sollicitudo Rei Socialis, 40"
  },
  {
    icon: "⚖️",
    kicker: "Crecimiento con justicia",
    accent: "#7d3c98",
    title: "Justicia social",
    text: "No basta con crecer. Hay que corregir desigualdades, cerrar brechas y asegurar que el desarrollo llegue tambien a los barrios olvidados de Ate.",
    quote: "\"La autoridad civil no debe servir al interes de un individuo o de unos pocos.\"",
    meta: "Leon XIII, citado por San Juan XXIII · Pacem in Terris, 56"
  },
  {
    icon: "🗣️",
    kicker: "Vecinos protagonistas",
    accent: "#0f6f62",
    title: "Participacion",
    text: "El vecino no debe ser espectador de la gestion municipal. Debe ser protagonista, fiscalizador y constructor del desarrollo de su propia comunidad.",
    quote: "\"El hombre tiene derecho a tomar parte activa en la vida publica.\"",
    meta: "San Juan XXIII · Pacem in Terris, 26"
  },
  {
    icon: "🌍",
    kicker: "La economia tiene funcion social",
    accent: "#6b4f1d",
    title: "Destino universal de los bienes",
    text: "La propiedad y la economia tienen una funcion social. La riqueza, los servicios y las oportunidades no pueden organizarse de espaldas a la comunidad.",
    quote: "\"Dios ha destinado la tierra y cuanto ella contiene para uso de todos los hombres y pueblos.\"",
    meta: "Concilio Vaticano II · Gaudium et Spes, 69"
  },
  {
    icon: "🛠️",
    kicker: "Trabajo que dignifica",
    accent: "#0d5b2d",
    title: "Trabajo con dignidad",
    text: "El trabajo no es solo ingreso. Es dignidad, realizacion personal y camino de progreso para la familia y la comunidad.",
    quote: "\"El trabajo es un bien del hombre... mediante el trabajo el hombre se hace mas hombre.\"",
    meta: "San Juan Pablo II · Laborem Exercens, 9"
  }
];

const doctrineModal = document.getElementById("doctrineModal");
const doctrineTitle = document.getElementById("doctrineTitle");
const doctrineText = document.getElementById("doctrineText");
const doctrineQuote = document.getElementById("doctrineQuote");
const doctrineMeta = document.getElementById("doctrineMeta");
const doctrineIcon = document.getElementById("doctrineIcon");
const doctrineKicker = document.getElementById("doctrineKicker");
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
  const dialog = doctrineModal.querySelector(".doctrine-modal__dialog");
  doctrineTitle.textContent = doctrine.title || "Dignidad de la persona humana";
  doctrineText.textContent = doctrine.text || "La politica existe para servir a la persona, no para utilizarla.";
  if (doctrineQuote) doctrineQuote.textContent = doctrine.quote || "\"Cada ser humano es verdaderamente persona.\"";
  doctrineMeta.textContent = doctrine.meta || "San Juan XXIII · Pacem in Terris, 9";
  if (doctrineIcon) doctrineIcon.textContent = doctrine.icon || "✝";
  if (doctrineKicker) doctrineKicker.textContent = doctrine.kicker || "Doctrina social cristiana";
  if (dialog && doctrine.accent) dialog.style.setProperty("--doctrine-accent", doctrine.accent);
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
sr.reveal(".sec-head h2, .section h2, .final-claim h2", { origin: "left", distance: "28px" });
sr.reveal(".hero-card", { origin: "right", scale: 0.92, duration: 1100 });
sr.reveal(".ideario-card", { origin: "bottom", interval: 100 });

const APP = window.APP_CONFIG || {};
const API_URL = APP.apiUrl || "";
const PHONE = APP.whatsapp || "51968481482";
const REPORT_UPLOAD_MAX_FILES = Number(APP.reportUploadMaxFiles || 3);
const REPORT_UPLOAD_MAX_MB = Number(APP.reportUploadMaxMB || 5);
const REPORT_UPLOAD_MAX_BYTES = REPORT_UPLOAD_MAX_MB * 1024 * 1024;
const REPORT_UPLOAD_TOTAL_MAX_MB = Number(APP.reportUploadTotalMaxMB || 6);
const REPORT_UPLOAD_TOTAL_MAX_BYTES = REPORT_UPLOAD_TOTAL_MAX_MB * 1024 * 1024;

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

function getSelectedReportFiles() {
  const input = document.getElementById("reportFiles");
  if (!input || !input.files) return [];
  return Array.from(input.files);
}

function validateReportFiles(files) {
  if (files.length > REPORT_UPLOAD_MAX_FILES) {
    throw new Error("Solo puedes adjuntar hasta " + REPORT_UPLOAD_MAX_FILES + " archivos");
  }

  for (const file of files) {
    if (file.size > REPORT_UPLOAD_MAX_BYTES) {
      throw new Error("El archivo \"" + file.name + "\" supera el límite de " + REPORT_UPLOAD_MAX_MB + " MB");
    }
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > REPORT_UPLOAD_TOTAL_MAX_BYTES) {
    throw new Error("El total de adjuntos supera el máximo de " + REPORT_UPLOAD_TOTAL_MAX_MB + " MB por envío");
  }
}

function updateReportFilesHelp() {
  const files = getSelectedReportFiles();
  const help = document.getElementById("reportFilesHelp");
  if (!help) return;

  if (!files.length) {
    help.textContent = "Formatos permitidos: JPG, PNG, WEBP y PDF.";
    return;
  }

  const totalMB = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
  help.textContent = files.length + " archivo(s) seleccionados · " + totalMB.toFixed(2) + " MB en total";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        base64
      });
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo \"" + file.name + "\""));
    reader.readAsDataURL(file);
  });
}

async function buildAttachmentPayload(files) {
  const allowedPrefixes = ["image/"];
  const allowedTypes = ["application/pdf"];

  files.forEach(file => {
    const isAllowedPrefix = allowedPrefixes.some(prefix => (file.type || "").startsWith(prefix));
    const isAllowedType = allowedTypes.includes(file.type || "");
    if (!isAllowedPrefix && !isAllowedType) {
      throw new Error("El archivo \"" + file.name + "\" no tiene un formato permitido");
    }
  });

  return Promise.all(files.map(fileToBase64));
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
  const files = getSelectedReportFiles();
  const attachmentNote = files.length ? "\nAdjuntos: " + files.map(file => file.name).join(", ") : "";
  const waMsg = "Reporte ciudadano\n" +
    "Nombre: " + (d.nombre || "") + "\n" +
    "Tel: " + (d.telefono || "") + "\n" +
    "Categoria: " + (d.categoria || "") + "\n" +
    "Zona: " + (d.zona || "") + "\n" +
    "Detalle: " + (d.detalle || "") +
    attachmentNote;

  try {
    validateReportFiles(files);
    const attachments = await buildAttachmentPayload(files);
    await postToApi({ type: "reporte", ...d, attachments });
    setStatus("reportStatus", true, files.length ? "Reporte y adjuntos enviados correctamente. Gracias por fiscalizar." : "Reporte enviado correctamente. Gracias por fiscalizar.");
    this.reset();
    updateReportFilesHelp();
  } catch (err) {
    setStatus("reportStatus", false, (err.message || "No se pudo enviar") + ". Se abrira WhatsApp como respaldo.");
    abrirWhatsApp(waMsg);
  }
});

const reportFilesInput = document.getElementById("reportFiles");
if (reportFilesInput) {
  reportFilesInput.addEventListener("change", updateReportFilesHelp);
  updateReportFilesHelp();
}

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
