const columns = [
  { id: 'backlog', title: 'Backlog', hint: 'Ideas' },
  { id: 'todo', title: 'To Do', hint: 'Ready' },
  { id: 'doing', title: 'In Progress', hint: 'Active' },
  { id: 'done', title: 'Done', hint: 'Complete' },
];

const seedTasks = [
  { id: crypto.randomUUID(), title: 'Define weekly priorities', details: 'Choose the top three outcomes for this week.', priority: 'High', due: '', status: 'todo', createdAt: Date.now() },
  { id: crypto.randomUUID(), title: 'Review open follow-ups', details: 'Move stale items back to Backlog or close them.', priority: 'Medium', due: '', status: 'doing', createdAt: Date.now() - 1 },
  { id: crypto.randomUUID(), title: 'Capture new requests', details: 'Add incoming work here before triage.', priority: 'Low', due: '', status: 'backlog', createdAt: Date.now() - 2 },
];

const storageKey = 'open-task-kanban.tasks';
const board = document.querySelector('#board');
const form = document.querySelector('#taskForm');
const searchInput = document.querySelector('#searchInput');
const clearDoneButton = document.querySelector('#clearDone');
const columnTemplate = document.querySelector('#columnTemplate');
const taskTemplate = document.querySelector('#taskTemplate');
let tasks = loadTasks();
let draggedTaskId = null;

function loadTasks() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : seedTasks;
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function render() {
  board.innerHTML = '';
  const query = searchInput.value.trim().toLowerCase();
  const visibleTasks = tasks.filter((task) => `${task.title} ${task.details}`.toLowerCase().includes(query));

  columns.forEach((column) => {
    const columnNode = columnTemplate.content.firstElementChild.cloneNode(true);
    const list = columnNode.querySelector('.task-list');
    const columnTasks = visibleTasks.filter((task) => task.status === column.id);

    columnNode.dataset.status = column.id;
    columnNode.querySelector('.eyebrow').textContent = column.hint;
    columnNode.querySelector('h2').textContent = column.title;
    columnNode.querySelector('.count').textContent = columnTasks.length;

    columnTasks.forEach((task) => list.appendChild(renderTask(task)));
    if (!columnTasks.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = query ? 'No matching tasks here.' : 'Drop a task here.';
      list.appendChild(empty);
    }

    list.addEventListener('dragover', (event) => {
      event.preventDefault();
      list.classList.add('drag-over');
    });
    list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
    list.addEventListener('drop', () => moveTask(draggedTaskId, column.id));
    board.appendChild(columnNode);
  });

  updateStats();
}

function renderTask(task) {
  const node = taskTemplate.content.firstElementChild.cloneNode(true);
  const priority = node.querySelector('.priority');

  node.dataset.id = task.id;
  node.querySelector('h3').textContent = task.title;
  node.querySelector('.details').textContent = task.details || 'No details added.';
  priority.textContent = task.priority;
  priority.classList.add(task.priority.toLowerCase());
  node.querySelector('.task-meta').textContent = task.due ? `Due ${formatDate(task.due)}` : 'No due date';
  node.querySelector('.delete-task').addEventListener('click', () => deleteTask(task.id));

  columns.forEach((column) => {
    if (column.id === task.status) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = column.title;
    button.addEventListener('click', () => moveTask(task.id, column.id));
    node.querySelector('.task-actions').appendChild(button);
  });

  node.addEventListener('dragstart', () => {
    draggedTaskId = task.id;
    node.classList.add('dragging');
  });
  node.addEventListener('dragend', () => {
    draggedTaskId = null;
    node.classList.remove('dragging');
  });

  return node;
}

function addTask(event) {
  event.preventDefault();
  const formData = new FormData(form);
  tasks.unshift({
    id: crypto.randomUUID(),
    title: formData.get('title').trim(),
    details: formData.get('details').trim(),
    priority: formData.get('priority'),
    due: formData.get('due'),
    status: 'backlog',
    createdAt: Date.now(),
  });
  form.reset();
  saveTasks();
  render();
}

function moveTask(taskId, status) {
  if (!taskId) return;
  tasks = tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
  saveTasks();
  render();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  render();
}

function clearDoneTasks() {
  tasks = tasks.filter((task) => task.status !== 'done');
  saveTasks();
  render();
}

function updateStats() {
  document.querySelector('#totalTasks').textContent = tasks.length;
  document.querySelector('#openTasks').textContent = tasks.filter((task) => task.status !== 'done').length;
  document.querySelector('#doneTasks').textContent = tasks.filter((task) => task.status === 'done').length;
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

form.addEventListener('submit', addTask);
searchInput.addEventListener('input', render);
clearDoneButton.addEventListener('click', clearDoneTasks);
render();
