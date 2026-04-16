const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const contentInput = document.getElementById('task-content');
const statusInput = document.getElementById('task-status');
const columns = {
  todo: document.getElementById('todo-column'),
  inprogress: document.getElementById('inprogress-column'),
  done: document.getElementById('done-column'),
};

let tasks = [];
let dragSourceId = null;

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
  ticket.appendChild(meta);

  ticket.addEventListener('dragstart', handleDragStart);
  ticket.addEventListener('dragend', handleDragEnd);

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

  if (!title || !content) return;

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    content,
    status,
  };

  addTask(newTask);
  taskForm.reset();
  statusInput.value = 'todo';
});

loadTasks();
renderTasks();
