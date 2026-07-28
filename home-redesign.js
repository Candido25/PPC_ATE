(() => {
  const hero = document.querySelector('.hero#inicio');
  const problems = document.querySelector('#problemas');
  if (!hero || !problems) return;

  hero.classList.add('campaign-hero');
  hero.innerHTML = `
    <div class="container campaign-hero-grid">
      <div class="campaign-portrait">
        <a href="candidato-jose-luis-hurtado.html" aria-label="Conocer el perfil de José Luis Hurtado Apaico">
          <img src="assets/jose-luis-hurtado.jpg" alt="José Luis Hurtado Apaico, candidato del PPC para Ate">
        </a>
      </div>
      <div class="campaign-message">
        <p class="campaign-name"><a href="candidato-jose-luis-hurtado.html">José Luis Hurtado Apaico</a></p>
        <h1>Un nuevo comienzo<br>para <span>Ate</span></h1>
        <p class="campaign-lead">Honestidad, capacidad y compromiso para construir el distrito que merecemos.</p>
        <div class="campaign-priorities" aria-label="Prioridades de la propuesta">
          <a href="seguridad.html"><strong>Seguridad</strong><span>Protección para las familias</span></a>
          <a href="salud.html"><strong>Salud y educación</strong><span>Servicios con calidad</span></a>
          <a href="infraestructura.html"><strong>Obras y servicios</strong><span>Resultados que funcionen</span></a>
        </div>
        <div class="campaign-actions">
          <a class="campaign-primary" href="propuestas.html">Conoce nuestras propuestas</a>
          <a class="campaign-secondary" href="#voluntarios">Únete al equipo</a>
        </div>
        <p class="campaign-claim"><strong>Ate</strong> puede más. <strong>Ate</strong> merece más. <strong>Ate</strong> lo cambiamos todos.</p>
        <div class="campaign-socials" aria-label="Redes sociales">
          <a href="https://www.facebook.com/Ateconjoseluishurtado" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.instagram.com/joseluishurtado.ate" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@soyjoseluishurtado" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://www.youtube.com/@JoseLuisHurtado.oficial" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </div>
    </div>`;

  problems.classList.add('campaign-problems');
  problems.innerHTML = `
    <div class="container campaign-problems-grid">
      <div class="campaign-problems-intro">
        <p class="campaign-eyebrow">Diagnóstico ciudadano</p>
        <h2>¿Cuáles son los principales <span>problemas de Ate?</span></h2>
        <p>Escuchamos a los vecinos y recorremos cada zona del distrito. Estos son los problemas que más preocupan y que enfrentaremos con decisión.</p>
      </div>
      <div class="campaign-problem-cards">
        <a href="diagnostico-seguridad.html"><strong>Inseguridad</strong><span>Delincuencia, extorsión y temor vecinal.</span></a>
        <a href="diagnostico-basura.html"><strong>Basura y limpieza</strong><span>Residuos, puntos críticos y abandono.</span></a>
        <a href="diagnostico-pistas.html"><strong>Pistas y veredas</strong><span>Vías deterioradas y movilidad insegura.</span></a>
        <a href="problemas-ate.html"><strong>Abandono urbano</strong><span>Espacios públicos sin mantenimiento.</span></a>
      </div>
      <a class="campaign-diagnosis" href="problemas-ate.html">Ver diagnóstico completo de Ate</a>
    </div>`;
})();
