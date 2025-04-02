// Manages tasks CRUD operations, filtering, sorting
import { loadInitialData, saveToLocalStorage, syncWithLocalStorage } from './localStorageManager.js';

let data = {
  items: [],
  categories: [],
};

let initialized = false;

// Initialize the todo manager with data
export async function initialize() {
  if (initialized) {
    return data;
  }

  try {
    // Load initial data from local storage or data.json
    data = await loadInitialData();

    initialized = true;
    return data;
  } catch (error) {
    console.error('Failed to initialize todo manager:', error);
    throw error;
  }
}

// Get all categories
export function getCategories() {
  return data.categories;
}

// Get all unique tags from tasks
export function getAllTags() {
  const tagsSet = new Set();

  data.items.forEach((item) => {
    if (item.tags && Array.isArray(item.tags) && !item.deleted) {
      item.tags.forEach((tag) => tagsSet.add(tag));
    }
  });

  return Array.from(tagsSet);
}

// Get filtered and sorted tasks
export function getTasks(options = {}) {
  const {
    filter = 'all',
    category = null,
    tag = null,
    sortBy = 'title',
    sortOrder = 'asc',
  } = options;

  // Filter tasks
  const filteredTasks = data.items.filter((task) => {
    // Skip deleted tasks
    if (task.deleted) return false;

    // Filter by completion status
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'all' && task.completed) return false;

    // Filter by category if specified
    if (category && task.category !== category) return false;

    // Filter by tag if specified
    if (tag && (!task.tags || !task.tags.includes(tag))) return false;

    return true;
  });

  // Sort tasks
  filteredTasks.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'due') {
      // Handle null due dates (null values should come last)
      if (a.due === null && b.due === null) {
        comparison = 0;
      } else if (a.due === null) {
        comparison = 1;
      } else if (b.due === null) {
        comparison = -1;
      } else {
        comparison = a.due - b.due;
      }
    } else if (sortBy === 'priority') {
      // Priority first, then by due date
      if (a.priority !== b.priority) {
        comparison = a.priority ? -1 : 1; // true comes before false
      } else if (a.due === null && b.due === null) {
        comparison = 0;
      } else if (a.due === null) {
        comparison = 1;
      } else if (b.due === null) {
        comparison = -1;
      } else {
        comparison = a.due - b.due;
      }
    }

    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredTasks;
}

// Get tasks counts for navigation display
export function getTaskCounts() {
  const counts = {
    all: 0,
    completed: 0,
    categories: {},
    tags: {},
  };

  data.items.forEach((task) => {
    if (task.deleted) return;

    if (task.completed) {
      counts.completed += 1; // Changed from counts.completed++
    } else {
      counts.all += 1; // Changed from counts.all++
    }

    // Count by category
    if (task.category) {
      counts.categories[task.category] = (counts.categories[task.category] || 0) + 1;
    }

    // Count by tags
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach((tag) => {
        counts.tags[tag] = (counts.tags[tag] || 0) + 1;
      });
    }
  });

  return counts;
}

// Get a single task by ID
export function getTaskById(id) {
  // Convert id to string for consistent comparison
  const taskId = id.toString();
  return data.items.find((task) => task.id.toString() === taskId && !task.deleted) || null;
}

// Add a new task
export function addTask(taskData) {
  const now = new Date().getTime();

  // Create new task with defaults
  const newTask = {
    id: now.toString(), // Use timestamp as ID
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    category: taskData.category || '',
    tags: taskData.tags || [],
    priority: taskData.priority || false,
    completed: false,
    due: taskData.due || null,
    modified: now,
    deleted: false,
  };

  // Add to data and save
  data.items.push(newTask);
  saveToLocalStorage(data);

  return newTask;
}

// Update an existing task
export function updateTask(id, updates) {
  // Convert id to string for consistent comparison
  const taskId = id.toString();
  const taskIndex = data.items.findIndex((task) => task.id.toString() === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // Create updated task
  const updatedTask = {
    ...data.items[taskIndex],
    ...updates,
    modified: new Date().getTime(),
  };

  // Update data and save
  data.items[taskIndex] = updatedTask;
  saveToLocalStorage(data);

  return updatedTask;
}

// Mark a task as completed
export function completeTask(id) {
  return updateTask(id, { completed: true });
}

// Delete a task (soft delete)
export function deleteTask(id) {
  // Convert id to string for consistent comparison
  const taskId = id.toString();
  const taskIndex = data.items.findIndex((task) => task.id.toString() === taskId);

  if (taskIndex === -1) {
    return false;
  }

  // Mark as deleted and update modified time
  data.items[taskIndex] = {
    ...data.items[taskIndex],
    deleted: true,
    modified: new Date().getTime(),
  };

  saveToLocalStorage(data);
  return true;
}

// Format date for display
export function formatDate(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  // Return in format "10. nóv" or similar
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ágú', 'sep', 'okt', 'nóv', 'des'];
  return `${day}. ${monthNames[month - 1]}`;
}
