const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const contentInput = document.getElementById('task-content');
const statusInput = document.getElementById('task-status');
const urlInput = document.getElementById('task-url');
const columns = {
  todo: document.getElementById('todo-column'),
  inprogress: document.getElementById('inprogress-column'),
  done: document.getElementById('done-column'),
};

let tasks = [];
let dragSourceId = null;
let editingTaskId = null;

function saveTasks() {
  localStorage.setItem('dashboardTasks', JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem('dashboardTasks');
  if (!stored) return;
  try {
    tasks = JSON.parse(stored);
  } catch (error) {
    tasks = [];
  }
}

function createTicketElement(task) {
  const ticket = document.createElement('article');
  ticket.className = 'ticket';
  ticket.setAttribute('draggable', 'true');
  ticket.dataset.id = task.id;
  ticket.dataset.status = task.status;

  const title = document.createElement('h3');
  title.textContent = task.title;

  const content = document.createElement('p');
  content.textContent = task.content;

  const meta = document.createElement('div');
  meta.className = 'meta';

  const statusLabel = document.createElement('span');
  statusLabel.className = 'status-label';
  statusLabel.textContent = task.status === 'todo' ? 'ToDo' : task.status === 'inprogress' ? 'Inprogress' : 'Done';

  meta.appendChild(statusLabel);
  ticket.appendChild(title);
  ticket.appendChild(content);

  if (task.url && task.url.trim()) {
    const urlLink = document.createElement('a');
    urlLink.className = 'ticket-url';
    urlLink.href = task.url;
    urlLink.target = '_blank';
    urlLink.rel = 'noopener noreferrer';
    urlLink.textContent = '🔗 参照を開く';
    ticket.appendChild(urlLink);
  }

  ticket.appendChild(meta);

  ticket.addEventListener('dragstart', handleDragStart);
  ticket.addEventListener('dragend', handleDragEnd);
  ticket.addEventListener('click', () => openEditModal(task.id));

  return ticket;
}

function renderTasks() {
  Object.values(columns).forEach(column => column.innerHTML = '');
  tasks.forEach(task => {
    const ticket = createTicketElement(task);
    columns[task.status].appendChild(ticket);
  });
}

function addTask(task) {
  tasks.push(task);
  saveTasks();
  renderTasks();
}

function updateTaskStatus(id, newStatus) {
  const task = tasks.find(item => item.id === id);
  if (!task || task.status === newStatus) return;
  task.status = newStatus;
  saveTasks();
  renderTasks();
}

function openEditModal(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;
  
  editingTaskId = taskId;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-content').value = task.content;
  document.getElementById('edit-status').value = task.status;
  document.getElementById('edit-url').value = task.url || '';
  
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  editingTaskId = null;
}

function deleteTask(taskId) {
  if (confirm('本当に削除しますか？')) {
    tasks = tasks.filter(item => item.id !== taskId);
    saveTasks();
    renderTasks();
    closeEditModal();
  }
}

function handleDragStart(event) {
  const id = event.currentTarget.dataset.id;
  dragSourceId = id;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', id);
}

function handleDragEnd() {
  dragSourceId = null;
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  const status = event.currentTarget.closest('.column').dataset.status;
  const id = event.dataTransfer.getData('text/plain') || dragSourceId;
  if (id) {
    updateTaskStatus(id, status);
  }
}

Object.values(columns).forEach(column => {
  column.addEventListener('dragover', handleDragOver);
  column.addEventListener('dragleave', handleDragLeave);
  column.addEventListener('drop', handleDrop);
});

taskForm.addEventListener('submit', event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const status = statusInput.value;
  const url = urlInput.value.trim();

  if (!title || !content) return;

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    content,
    status,
    url,
  };

  addTask(newTask);
  taskForm.reset();
  statusInput.value = 'todo';
});

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalClose = document.getElementById('modal-close');
const editCancel = document.getElementById('edit-cancel');
const editDelete = document.getElementById('edit-delete');

modalClose.addEventListener('click', closeEditModal);
editCancel.addEventListener('click', closeEditModal);
editDelete.addEventListener('click', () => deleteTask(editingTaskId));

editForm.addEventListener('submit', event => {
  event.preventDefault();
  
  const task = tasks.find(item => item.id === editingTaskId);
  if (!task) return;
  
  task.title = document.getElementById('edit-title').value.trim();
  task.content = document.getElementById('edit-content').value.trim();
  task.status = document.getElementById('edit-status').value;
  task.url = document.getElementById('edit-url').value.trim();
  
  saveTasks();
  renderTasks();
  closeEditModal();
});

editModal.addEventListener('click', event => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

loadTasks();
renderTasks();
