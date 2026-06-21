/**
 * Gestor de tareas — CRUD con modal y validaciones.
 */

const TaskManager = (() => {
  let currentEditId = null;
  let allTasks = [];

  // ── Modal ────────────────────────────────────────
  function openCreate() {
    currentEditId = null;
    resetForm();
    document.getElementById('task-modal-title').textContent = 'Nueva Tarea';
    document.getElementById('task-modal').classList.add('open');
  }

  function openEdit(id) {
    currentEditId = id;
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('task-modal-title').textContent = 'Editar Tarea';
    fillForm(task);
    document.getElementById('task-modal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('task-modal').classList.remove('open');
    resetForm();
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input, .form-select, .form-textarea')
      .forEach(el => el.classList.remove('error'));
  }

  function resetForm() {
    document.getElementById('task-form').reset();
    clearErrors();
  }

  function fillForm(task) {
    document.getElementById('field-titulo').value = task.titulo;
    document.getElementById('field-asignatura').value = task.asignatura;
    document.getElementById('field-descripcion').value = task.descripcion ?? '';
    document.getElementById('field-fecha').value = task.fecha_entrega;
    document.getElementById('field-prioridad').value = task.prioridad;
    document.getElementById('field-dificultad').value = task.dificultad_estimada;
    document.getElementById('field-horas').value = task.tiempo_estimado_horas ?? '';
  }

  function getFormData() {
    return {
      titulo: document.getElementById('field-titulo').value.trim(),
      asignatura: document.getElementById('field-asignatura').value.trim(),
      descripcion: document.getElementById('field-descripcion').value.trim(),
      fecha_entrega: document.getElementById('field-fecha').value,
      prioridad: document.getElementById('field-prioridad').value,
      dificultad_estimada: parseInt(document.getElementById('field-dificultad').value),
      tiempo_estimado_horas: parseFloat(document.getElementById('field-horas').value) || null,
    };
  }

  function showFieldErrors(errors) {
    Object.entries(errors).forEach(([field, msgs]) => {
      const map = {
        titulo: 'field-titulo', asignatura: 'field-asignatura',
        fecha_entrega: 'field-fecha', dificultad_estimada: 'field-dificultad',
      };
      const inputId = map[field];
      if (inputId) {
        const input = document.getElementById(inputId);
        if (input) input.classList.add('error');
      }
      const errEl = document.getElementById(`err-${field}`);
      if (errEl) errEl.textContent = Array.isArray(msgs) ? msgs[0] : msgs;
    });
  }

  // ── CRUD ─────────────────────────────────────────
  async function submitForm(e) {
    e.preventDefault();
    clearErrors();
    const data = getFormData();

    try {
      let result;
      if (currentEditId) {
        result = await WipMindAPI.Tasks.update(currentEditId, data);
        Toast.success('Tarea actualizada.');
      } else {
        result = await WipMindAPI.Tasks.create(data);
        Toast.success('Tarea creada.');
      }

      closeModal();
      await loadAndRender();

      if (result.densidad_actualizada) {
        DensityWidget.update(result.densidad_actualizada);
      }
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        showFieldErrors(err.data);
      } else {
        Toast.error(err.message);
      }
    }
  }

  function confirmDelete(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    if (!confirm(`¿Eliminar "${task.titulo}"? Esta acción no se puede deshacer.`)) return;
    deleteTask(id);
  }

  async function deleteTask(id) {
    try {
      const result = await WipMindAPI.Tasks.delete(id);
      Toast.success('Tarea eliminada.');
      await loadAndRender();
      if (result.densidad_actualizada) {
        DensityWidget.update(result.densidad_actualizada);
      }
    } catch (err) {
      Toast.error(err.message);
    }
  }

  // ── Load & Render ─────────────────────────────────
  async function loadAndRender() {
    try {
      allTasks = await WipMindAPI.Tasks.list();
      if (window.Board) Board.renderTasks(allTasks);
      if (window.renderTaskList) renderTaskList(allTasks);
      updateWipStats();
    } catch (err) {
      Toast.error('Error al cargar tareas: ' + err.message);
    }
  }

  function updateWipStats() {
    const todo = allTasks.filter(t => t.estado === 'TODO').length;
    const inProgress = allTasks.filter(t => t.estado === 'IN_PROGRESS').length;
    const done = allTasks.filter(t => t.estado === 'DONE').length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('stat-todo', todo);
    set('stat-in-progress', inProgress);
    set('stat-done', done);
  }

  function init() {
    const form = document.getElementById('task-form');
    if (form) form.addEventListener('submit', submitForm);

    document.getElementById('btn-new-task')?.addEventListener('click', openCreate);
    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('task-modal')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  return { init, openCreate, openEdit, confirmDelete, loadAndRender };
})();

window.TaskManager = TaskManager;
