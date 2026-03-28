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
