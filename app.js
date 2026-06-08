/* =========================================
   TaskManager — app.js
   ========================================= */

// ─── Estado ───────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('tm_tasks') || '[]');
let filter = 'all';
let search = '';

// ─── Persistencia ─────────────────────────────
function save() {
  localStorage.setItem('tm_tasks', JSON.stringify(tasks));
}

// ─── Agregar tarea ─────────────────────────────
function addTask(text, priority) {
  if (!text.trim()) return;
  tasks.unshift({
    id: Date.now(),
    text: text.trim(),
    priority,
    done: false,
    createdAt: new Date().toISOString(),
  });
  save();
  render();
}

// ─── Togglear completada ───────────────────────
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

// ─── Eliminar tarea ────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ─── Limpiar completadas ───────────────────────
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

// ─── Filtrar tareas ────────────────────────────
function getFiltered() {
  return tasks.filter(t => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'pending' ? !t.done :
      t.done;
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
}

// ─── Actualizar contadores ─────────────────────
function updateCounts() {
  document.getElementById('count-all').textContent     = tasks.length;
  document.getElementById('count-pending').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('count-done').textContent    = tasks.filter(t => t.done).length;
}

// ─── Renderizar lista ──────────────────────────
function render() {
  const list      = document.getElementById('task-list');
  const empty     = document.getElementById('empty-state');
  const filtered  = getFiltered();

  updateCounts();

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.add('visible');
    return;
  }
  empty.classList.remove('visible');

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="task-check" aria-label="Completar">${task.done ? '✓' : ''}</button>
      <span class="priority-dot ${task.priority}"></span>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="btn-delete" aria-label="Eliminar">✕</button>
    `;

    // Eventos
    li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
    li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

    list.appendChild(li);
  });
}

// ─── Escape HTML ───────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Eventos UI ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Agregar tarea
  const input    = document.getElementById('task-input');
  const select   = document.getElementById('priority-select');
  const btnAdd   = document.getElementById('btn-add');

  function handleAdd() {
    addTask(input.value, select.value);
    input.value = '';
    input.focus();
  }

  btnAdd.addEventListener('click', handleAdd);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAdd(); });

  // Filtros sidebar
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;

      const titles = { all: 'Todas las tareas', pending: 'Pendientes', done: 'Completadas' };
      document.getElementById('page-title').textContent = titles[filter];

      render();
    });
  });

  // Búsqueda
  document.getElementById('search').addEventListener('input', e => {
    search = e.target.value;
    render();
  });

  // Limpiar completadas
  document.getElementById('btn-clear-done').addEventListener('click', clearDone);

  // Render inicial
  render();
});
