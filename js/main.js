// Main app file - handles UI interaction and rendering
import {
  initialize,
  getCategories,
  getAllTags,
  getTasks,
  getTaskCounts,
  getTaskById,
  addTask,
  updateTask,
  completeTask,
  deleteTask,
  formatDate,
} from './todoManager.js';

// UI State
const state = {
  currentFilter: 'all',
  currentCategory: null,
  currentTag: null,
  currentSort: 'title',
  currentSortOrder: 'asc',
  isLoading: true,
  hasError: false,
};

// DOM Elements
const elements = {
  tasksList: document.getElementById('tasks-list'),
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  emptyState: document.getElementById('empty-state'),
  retryButton: document.getElementById('retry-button'),
  addTaskButton: document.getElementById('add-task-button'),
  taskModal: document.getElementById('task-modal'),
  taskForm: document.getElementById('task-form'),
  modalTitle: document.getElementById('modal-title'),
  closeModal: document.getElementById('close-modal'),
  cancelEdit: document.getElementById('cancel-edit'),
  deleteTaskButton: document.getElementById('delete-task'),
  sortSelect: document.getElementById('sort-select'),
  categoriesList: document.getElementById('categories-list'),
  tagsList: document.getElementById('tags-list'),
  countElements: {
    all: document.getElementById('all-count'),
    completed: document.getElementById('completed-count'),
  },
  loginForm: document.getElementById('login-form'),
  userInfo: document.getElementById('user-info'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  loginButton: document.getElementById('login-button'),
  logoutButton: document.getElementById('logout-button')
};

// Form fields
const formFields = {
  id: document.getElementById('task-id'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  dueDate: document.getElementById('due-date'),
  category: document.getElementById('category'),
  tags: document.getElementById('tags'),
  priority: document.getElementById('priority'),
};

// Show loading state
function showLoading() {
  state.isLoading = true;
  elements.loadingState.classList.remove('hidden');
  elements.errorState.classList.add('hidden');
  elements.emptyState.classList.add('hidden');
  elements.tasksList.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
  state.isLoading = false;
  elements.loadingState.classList.add('hidden');
}

// Show error state
function showError() {
  state.hasError = true;
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');
  elements.tasksList.classList.add('hidden');
}

// Get category name by ID
function getCategoryName(categoryId) {
  const category = getCategories().find((cat) => cat.id === categoryId);
  return category ? category.title : categoryId;
}

// Render tags for a task
function renderTags(tags) {
  if (!tags || !tags.length) return '';

  const tagsHtml = tags.map((tag) => `<span class="tag">${tag}</span>`).join('');
  return `<div class="tags">${tagsHtml}</div>`;
}

// Populate category dropdown
function populateCategoryDropdown() {
  const categorySelect = formFields.category;

  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }

  getCategories().forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.title;
    categorySelect.appendChild(option);
  });
}

// Close the task modal
function closeTaskModal() {
  // Hide the modal
  elements.taskModal.classList.add('hidden');
}

// Open the task modal for adding or editing
function openTaskModal(taskId = null) {
  elements.modalTitle.textContent = taskId ? 'Breyta verkefni' : 'Nýtt verkefni';
  elements.taskForm.reset();
  populateCategoryDropdown();

  if (taskId) {
    const task = getTaskById(taskId);

    if (task) {
      formFields.id.value = task.id;
      formFields.title.value = task.title;
      formFields.description.value = task.description || '';
      formFields.category.value = task.category || '';
      formFields.priority.checked = task.priority;
      formFields.tags.value = Array.isArray(task.tags) ? task.tags.join(' ') : '';

      if (task.due) {
        const dueDate = new Date(task.due);
        [formFields.dueDate.value] = dueDate.toISOString().split('T');
      }

      elements.deleteTaskButton.style.display = 'block';
    }
  } else {
    formFields.id.value = '';
    elements.deleteTaskButton.style.display = 'none';
  }

  // Show the modal
  elements.taskModal.classList.remove('hidden');
}

// Handle task deletion
function handleDeleteTask() {
  const taskId = formFields.id.value;

  if (taskId) {
    showConfirmationModal('Ertu viss um að þú viljir eyða þessu verkefni?', () => {
      deleteTask(taskId);
      closeTaskModal();
      renderNavigation();
      renderTasks();
    });
  }
}

// Handle task form submission (add or update)
function handleTaskFormSubmit(event) {
  event.preventDefault();

  const taskData = {
    title: formFields.title.value.trim(),
    description: formFields.description.value.trim(),
    category: formFields.category.value,
    tags: formFields.tags.value.trim().split(/\s+/).filter((tag) => tag !== ''),
    priority: formFields.priority.checked,
  };

  if (formFields.dueDate.value) {
    taskData.due = new Date(formFields.dueDate.value).getTime();
  }

  const taskId = formFields.id.value;

  if (taskId) {
    updateTask(taskId, taskData);
  } else {
    addTask(taskData);
  }

  closeTaskModal();
  renderNavigation();
  renderTasks();
}

// Handle clicks on task items
function handleTaskClick(event) {
  const taskItem = event.target.closest('.task-item');
  if (!taskItem) return;

  const taskId = taskItem.dataset.id;

  if (event.target.classList.contains('task-checkbox')) {
    completeTask(taskId);
    renderNavigation();
    renderTasks();
    return;
  }

  if (event.target.classList.contains('edit-btn')) {
    openTaskModal(taskId);
    return;
  }

  openTaskModal(taskId);
}

// Handle sort selection change
function handleSort(event) {
  state.currentSort = event.target.value;
  renderTasks();
}

// Handle navigation clicks
function handleNavigation(event) {
  event.preventDefault();

  const link = event.target.closest('a');
  if (!link) return;

  document.querySelectorAll('.navigation a').forEach((el) => el.classList.remove('active'));
  link.classList.add('active');

  state.currentCategory = null;
  state.currentTag = null;

  if (link.dataset.filter) {
    state.currentFilter = link.dataset.filter;
  } else if (link.dataset.category) {
    state.currentFilter = 'all';
    state.currentCategory = link.dataset.category;
  } else if (link.dataset.tag) {
    state.currentFilter = 'all';
    state.currentTag = link.dataset.tag;
  }

  renderTasks();
}

// Render navigation sidebar with categories and tags
function renderNavigation() {
  const counts = getTaskCounts();

  elements.countElements.all.textContent = counts.all;
  elements.countElements.completed.textContent = counts.completed;

  const categories = getCategories();
  elements.categoriesList.innerHTML = '';

  categories.forEach((category) => {
    const count = counts.categories[category.id] || 0;

    const li = document.createElement('li');
    li.innerHTML = `
      <a href="#" data-category="${category.id}" class="nav-link">
        ${category.title} <span class="count">${count}</span>
      </a>
    `;
    elements.categoriesList.appendChild(li);
  });

  const tags = getAllTags();
  elements.tagsList.innerHTML = '';

  tags.forEach((tag) => {
    const count = counts.tags[tag] || 0;

    const li = document.createElement('li');
    li.innerHTML = `
      <a href="#" data-tag="${tag}" class="nav-link">
        ${tag} <span class="count">${count}</span>
      </a>
    `;
    elements.tagsList.appendChild(li);
  });
}

// Render tasks based on current filter, category, tag, and sort
function renderTasks() {
  const tasks = getTasks({
    filter: state.currentFilter,
    category: state.currentCategory,
    tag: state.currentTag,
    sortBy: state.currentSort,
    sortOrder: state.currentSortOrder,
  });

  if (tasks.length === 0) {
    elements.tasksList.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.tasksList.classList.remove('hidden');
  elements.tasksList.innerHTML = '';

  tasks.forEach((task) => {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.priority ? 'priority' : ''}`;
    taskElement.dataset.id = task.id;

    const dueDate = task.due ? formatDate(task.due) : '';

    taskElement.innerHTML = `
      <div class="task-content">
        <div class="task-checkbox-wrapper">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        </div>
        <div class="task-info">
          <h3 class="task-title">${task.title}</h3>
          ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
          <div class="task-meta">
            ${dueDate ? `<span class="due-date">${dueDate}</span>` : ''}
            ${task.category ? `<span class="category">${getCategoryName(task.category)}</span>` : ''}
            ${renderTags(task.tags)}
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-btn">Breyta</button>
      </div>
    `;

    elements.tasksList.appendChild(taskElement);
  });
}

// Set up event listeners
function setupEventListeners() {
  if (this.eventListenersSetup) return; // Prevent multiple calls

  document.querySelector('.navigation').addEventListener('click', handleNavigation);
  elements.sortSelect.addEventListener('change', handleSort);
  elements.addTaskButton.addEventListener('click', () => openTaskModal());
  elements.closeModal.addEventListener('click', closeTaskModal);
  elements.cancelEdit.addEventListener('click', closeTaskModal);
  elements.taskForm.addEventListener('submit', handleTaskFormSubmit);
  elements.deleteTaskButton.addEventListener('click', handleDeleteTask);
  elements.retryButton.addEventListener('click', init);
  elements.tasksList.addEventListener('click', handleTaskClick);

  this.eventListenersSetup = true;
}

// Show confirmation modal
function showConfirmationModal(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button id="confirm-yes">Yes</button>
      <button id="confirm-no">No</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('confirm-yes').addEventListener('click', () => {
    onConfirm();
    document.body.removeChild(modal);
  });
  document.getElementById('confirm-no').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

// Initialize the app
async function init() {
  try {
    showLoading();

    await initialize();
    renderNavigation();
    renderTasks();
    setupEventListeners(); // Call setupEventListeners after data is loaded
    closeTaskModal(); // Ensure the modal is closed after setup

    hideLoading();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError();
  }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', init);
