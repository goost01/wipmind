/**
 * Módulo de densidad académica — actualiza la barra y score en el dashboard.
 */

const DensityWidget = (() => {
  const LABELS = { BAJO: 'Carga Baja', MEDIO: 'Atención', ALTO: 'Sobrecarga' };

  function update(data) {
    const scoreEl = document.getElementById('density-score');
    const barEl   = document.getElementById('density-bar');
    const levelEl = document.getElementById('density-level');
    const bannerEl = document.getElementById('density-banner');

    if (!scoreEl) return;

    const pct = Math.round(data.score_normalizado);
    const nivel = data.nivel;

    scoreEl.textContent = `${pct}%`;
    barEl.style.width = `${pct}%`;

    barEl.className = `density-bar-fill ${nivel}`;
    levelEl.className = `density-level ${nivel}`;
    levelEl.textContent = LABELS[nivel] ?? nivel;

    if (bannerEl) {
      if (nivel === 'ALTO') {
        bannerEl.classList.remove('hidden');
        bannerEl.querySelector('.banner-text').textContent =
          `Tu densidad académica es ${pct}%. Considera priorizar o eliminar tareas.`;
      } else {
        bannerEl.classList.add('hidden');
      }
    }
  }

  async function refresh() {
    try {
      const data = await WipMindAPI.Cognitive.density();
      update(data);
    } catch (err) {
      console.warn('No se pudo actualizar densidad:', err.message);
    }
  }

  return { update, refresh };
})();

window.DensityWidget = DensityWidget;
