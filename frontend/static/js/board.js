/**
 * Tablero Scrumban — drag & drop con validación WIP.
 * Soporta mouse (HTML5 DnD) y táctil (iOS/Android).
 */

const Board = (() => {
  const COLUMN_STATES = {
    'col-todo':        'TODO',
    'col-in-progress': 'IN_PROGRESS',
    'col-done':        'DONE',
  };

  let draggedCard = null;
  let wipLimit = 3;
  let wipActual = 0;

  // ── Touch drag state ─────────────────────────────
  let touchGhost   = null;
  let touchCard    = null;
  let touchOffsetX = 0;
  let touchOffsetY = 0;

  function init(limit) {
    wipLimit = limit;
    setupDropZones();
  }

  // ── Mouse drag & drop ────────────────────────────
  function setupDropZones() {
    document.querySelectorAll('.column-cards').forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (draggedCard) handleDrop(zone, draggedCard);
      });
    });
  }

  // ── Touch drag & drop (iOS / Android) ────────────
  function onTouchStart(e) {
    const card  = e.currentTarget;
    const touch = e.touches[0];
    const rect  = card.getBoundingClientRect();

    touchCard    = card;
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    touchGhost = card.cloneNode(true);
    Object.assign(touchGhost.style, {
      position:      'fixed',
      width:         rect.width + 'px',
      opacity:       '0.85',
      pointerEvents: 'none',
      zIndex:        '9999',
      left:          (touch.clientX - touchOffsetX) + 'px',
      top:           (touch.clientY - touchOffsetY) + 'px',
      boxShadow:     '0 8px 24px rgba(0,0,0,0.18)',
      borderRadius:  '10px',
      transform:     'rotate(1.5deg)',
    });
    document.body.appendChild(touchGhost);
    card.style.opacity = '0.3';
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!touchGhost) return;

    const touch = e.touches[0];
    touchGhost.style.left = (touch.clientX - touchOffsetX) + 'px';
    touchGhost.style.top  = (touch.clientY - touchOffsetY) + 'px';

    document.querySelectorAll('.column-cards').forEach(z => z.classList.remove('drag-over'));
    const el   = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = el?.closest('.column-cards');
    if (zone) zone.classList.add('drag-over');
  }

  function onTouchEnd(e) {
    if (!touchCard || !touchGhost) return;

    const touch = e.changedTouches[0];
    const el    = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone  = el?.closest('.column-cards');

    touchGhost.remove();
    touchGhost = null;
    touchCard.style.opacity = '';
    document.querySelectorAll('.column-cards').forEach(z => z.classList.remove('drag-over'));

    if (zone) handleDrop(zone, touchCard);
    touchCard = null;
  }

  // ── Card factory ─────────────────────────────────
  function createCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.dataset.estado = task.estado;

    const dueDate  = new Date(task.fecha_entrega + 'T00:00:00');
    const today    = new Date();
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const urgentClass = diffDays <= 2 ? 'urgent' : '';

    card.innerHTML = `
      <div class="task-card-header">
        <span class="task-title">${escHtml(task.titulo)}</span>
        <div class="task-actions">
          <button class="btn-icon" onclick="TaskManager.openEdit(${task.id})" title="Editar">✏️</button>
          <button class="btn-icon" onclick="TaskManager.confirmDelete(${task.id})" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div class="task-subject">📚 ${escHtml(task.asignatura)}</div>
      <div class="task-meta">
        <span class="badge badge-priority-${task.prioridad}">${task.prioridad}</span>
        <span class="badge badge-difficulty">⚡ ${task.dificultad_estimada}/5</span>
        <span class="task-due ${urgentClass}">📅 ${task.fecha_entrega} (${diffDays}d)</span>
      </div>
    `;

    // Mouse drag
    card.addEventListener('dragstart', () => {
      draggedCard = card;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      draggedCard = null;
      card.classList.remove('dragging');
    });

    // Touch drag (iOS / Android)
    card.addEventListener('touchstart',  onTouchStart, { passive: false });
    card.addEventListener('touchmove',   onTouchMove,  { passive: false });
    card.addEventListener('touchend',    onTouchEnd);

    return card;
  }

  // ── Drop handler (shared by mouse & touch) ───────
  async function handleDrop(targetZone, card) {
    const columnId   = targetZone.closest('.board-column').id;
    const newEstado  = COLUMN_STATES[columnId];
    const taskId     = parseInt(card.dataset.taskId);
    const currentEstado = card.dataset.estado;

    if (!newEstado || newEstado === currentEstado) return;

    try {
      const res = await WipMindAPI.Tasks.changeStatus(taskId, newEstado);
      card.dataset.estado = newEstado;
      targetZone.appendChild(card);
      wipActual = res.wip_actual;
      updateWipCounter(res.wip_actual, res.wip_limit);
      DensityWidget.update(res.densidad_actualizada);
      Toast.success(`Tarea movida a "${columnLabel(newEstado)}"`);
    } catch (err) {
      Toast.error(err.message);
    }
  }

  function updateWipCounter(actual, limit) {
    const counter = document.getElementById('wip-counter');
    if (!counter) return;
    counter.textContent = `${actual}/${limit}`;
    counter.classList.toggle('at-limit', actual >= limit);
  }

  function columnLabel(estado) {
    return { TODO: 'Por Hacer', IN_PROGRESS: 'En Proceso', DONE: 'Terminado' }[estado] ?? estado;
  }

  function renderTasks(tasks) {
    const cols = {
      TODO:        document.querySelector('#col-todo .column-cards'),
      IN_PROGRESS: document.querySelector('#col-in-progress .column-cards'),
      DONE:        document.querySelector('#col-done .column-cards'),
    };
    Object.values(cols).forEach(c => { if (c) c.innerHTML = ''; });

    tasks.forEach(task => {
      const col = cols[task.estado];
      if (col) col.appendChild(createCard(task));
    });

    wipActual = tasks.filter(t => t.estado === 'IN_PROGRESS').length;
    updateWipCounter(wipActual, wipLimit);
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { init, renderTasks, createCard };
})();

window.Board = Board;
