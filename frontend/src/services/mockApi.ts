// Mocks sem herma eftir bakenda
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for our data types
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: number;
  due_date?: string;
  category_id?: string;
  category_name?: string;
  tags?: string[];
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  task_count?: number;
}

interface Tag {
  id: string;
  name: string;
}

// Geymum gögn í localStorage
const STORAGE_KEYS = {
  USERS: 'verkefnalisti_users',
  TASKS: 'verkefnalisti_tasks',
  CATEGORIES: 'verkefnalisti_categories',
  TAGS: 'verkefnalisti_tags',
};

// Upphafsgögn ef localStorage er tómt
const initialData = {
  users: [
    { id: '1', username: 'admin', email: 'admin@example.com', password: 'admin', name: 'Admin', isAdmin: true },
    { id: '2', username: 'user', email: 'user@example.com', password: 'user', name: 'Venjulegur notandi', isAdmin: false },
  ],
  tasks: [
    {
      id: '1',
      title: 'Læra JavaScript',
      description: 'Study JavaScript fundamentals',
      completed: false,
      priority: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: '2', 
      title: 'Byggja verkefni',
      description: 'Create a basic todo application',
      completed: false,
      priority: 2, 
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Setja upp á Render',
      description: 'Deploy the todo application to Render',
      completed: false,
      priority: 2,
      created_at: new Date().toISOString(), 
    },
    {
      id: '5',
      title: 'Skila Hópaverkefni 1 solo',
      description: 'Máni græjar hópaverkefni 1, solo, heima með 2mánaða + 2 ára, næturvinna, lofa engu',
      category_id: '3',
      category_name: 'Nám',
      tags: ['Bíður'],
      due_date: '2025-03-14',
      priority: 1,
      completed: false,
      image_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993767/verkefnalisti-mana/image-1741993765602-424312021_u7zbns.jpg',
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'eitthvað annað',
      description: 'jebbs, þetta er eitthvað annað',
      category_id: '2',
      category_name: 'Persónulegt',
      tags: ['Lágt forgangsstig'],
      due_date: '2025-03-22',
      priority: 3,
      completed: false,
      image_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993836/verkefnalisti-mana/image-1741993835136-360129464_rdkyjm.jpg',
      created_at: new Date().toISOString(),
    },
    {
      id: '7',
      title: 'meira af dóti',
      description: 'blabla nota það sem ég finn',
      category_id: '1',
      category_name: 'Vinna',
      tags: ['Fundur'],
      due_date: '2025-03-19',
      priority: 2,
      completed: true,
      image_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993873/verkefnalisti-mana/image-1741993872277-918612344_akdzd0.png',
      created_at: new Date().toISOString(),
    },
    {
      id: '8',
      title: 'elda mat',
      description: 'pakkasúpa',
      category_id: '5',
      category_name: 'Heimili',
      tags: ['Lágt forgangsstig'],
      due_date: '2025-03-13',
      priority: 3,
      completed: true,
      created_at: new Date().toISOString(),
    }
  ],
  categories: [
    { id: '1', name: 'Vinna' },
    { id: '2', name: 'Persónulegt' },
    { id: '3', name: 'Nám' },
    { id: '4', name: 'Heilsa' },
    { id: '5', name: 'Heimili' }
  ],
  tags: [
    { id: '1', name: 'Mikilvægt' },
    { id: '2', name: 'Fundur' },
    { id: '3', name: 'Lágt forgangsstig' },
    { id: '4', name: 'Frestur' },
    { id: '5', name: 'Bíður' }
  ]
};

// Hjálparfall til að sækja og vista gögn í localStorage
const storage = {
  get: (key: string): any => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  initializeIfEmpty: (): void => {
    if (typeof window === 'undefined') return;
    
    // Skoðum hvort gögn séu þegar til
    const users = storage.get(STORAGE_KEYS.USERS);
    const tasks = storage.get(STORAGE_KEYS.TASKS);
    const categories = storage.get(STORAGE_KEYS.CATEGORIES);
    const tags = storage.get(STORAGE_KEYS.TAGS);
    
    // Setjum inn upphafsgögn ef þarf
    if (!users) storage.set(STORAGE_KEYS.USERS, initialData.users);
    if (!tasks) storage.set(STORAGE_KEYS.TASKS, initialData.tasks);
    if (!categories) storage.set(STORAGE_KEYS.CATEGORIES, initialData.categories);
    if (!tags) storage.set(STORAGE_KEYS.TAGS, initialData.tags);
  }
};

// Notendavirkni
export const MockAuthService = {
  login: (email: string, password: string) => {
    storage.initializeIfEmpty();
    
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    const user = users.find((u: User) => (u.email === email || u.username === email) && u.password === password);
    
    if (user) {
      // Herma eftir JWT token
      const token = btoa(JSON.stringify({ 
        id: user.id, 
        email: user.email, 
        name: user.name,
        isAdmin: user.isAdmin 
      }));
      
      return { 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        }
      };
    }
    
    throw new Error('Rangt notandanafn eða lykilorð');
  },
  
  register: (userData: { email: string; username?: string; password: string; name: string }) => {
    storage.initializeIfEmpty();
    
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    
    // Athuga hvort notandi sé til
    if (users.some((u: User) => u.email === userData.email || u.username === userData.username)) {
      throw new Error('Notandi með þetta netfang er þegar til');
    }
    
    // Búa til nýjan notanda
    const newUser = {
      id: uuidv4(),
      username: userData.username || userData.email,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      isAdmin: false
    };
    
    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };
  },
  
  getCurrentUser: (token: string | null) => {
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token));
    } catch (error) {
      return null;
    }
  }
};

// Verkefnavirkni
export const MockTaskService = {
  getAll: (page = 1, limit = 10, category = '', tag = '') => {
    storage.initializeIfEmpty();
    
    let tasks = storage.get(STORAGE_KEYS.TASKS) || [];
    
    // Sía eftir flokki
    if (category) {
      tasks = tasks.filter((task: Task) => task.category_id === category);
    }
    
    // Sía eftir tögi
    if (tag) {
      tasks = tasks.filter((task: Task) => task.tags && task.tags.includes(tag));
    }
    
    const totalCount = tasks.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    return {
      items: paginatedTasks,
      count: totalCount,
      pageCount: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  },
  
  getById: (id: string) => {
    storage.initializeIfEmpty();
    
    const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
    const task = tasks.find((t: Task) => t.id === id);
    
    if (!task) {
      throw new Error('Verkefni fannst ekki');
    }
    
    return task;
  },
  
  create: (taskData: Partial<Task>) => {
    storage.initializeIfEmpty();
    
    const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
    const categories = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    
    // Finnum flokkanafnið ef það er til
    let category_name = '';
    if (taskData.category_id) {
      const category = categories.find((c: Category) => c.id === taskData.category_id);
      category_name = category ? category.name : '';
    }
    
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || '',
      description: taskData.description || '',
      completed: taskData.completed || false,
      due_date: taskData.due_date || undefined,
      priority: taskData.priority || 2,
      category_id: taskData.category_id || undefined,
      category_name,
      tags: taskData.tags || [],
      image_url: taskData.image_url || undefined,
      created_at: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    storage.set(STORAGE_KEYS.TASKS, tasks);
    
    return newTask;
  },
  
  update: (id: string, taskData: Partial<Task>) => {
    storage.initializeIfEmpty();
    
    const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
    const categories = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    
    const taskIndex = tasks.findIndex((t: Task) => t.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Verkefni fannst ekki');
    }
    
    // Finnum flokkanafnið ef það er til
    let category_name = '';
    if (taskData.category_id) {
      const category = categories.find((c: Category) => c.id === taskData.category_id);
      category_name = category ? category.name : '';
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...taskData,
      category_name: category_name || tasks[taskIndex].category_name,
      updated_at: new Date().toISOString()
    };
    
    tasks[taskIndex] = updatedTask;
    storage.set(STORAGE_KEYS.TASKS, tasks);
    
    return updatedTask;
  },
  
  delete: (id: string) => {
    storage.initializeIfEmpty();
    
    const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
    const newTasks = tasks.filter((t: Task) => t.id !== id);
    
    if (tasks.length === newTasks.length) {
      throw new Error('Verkefni fannst ekki');
    }
    
    storage.set(STORAGE_KEYS.TASKS, newTasks);
    
    return { success: true };
  }
};

// Flokkavirkni
export const MockCategoryService = {
  getAll: () => {
    storage.initializeIfEmpty();
    return storage.get(STORAGE_KEYS.CATEGORIES) || [];
  },
  
  getById: (id: string) => {
    storage.initializeIfEmpty();
    
    const categories = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    const category = categories.find((c: Category) => c.id === id);
    
    if (!category) {
      throw new Error('Flokkur fannst ekki');
    }
    
    return category;
  },
  
  create: (categoryData: Partial<Category>) => {
    storage.initializeIfEmpty();
    
    // Get the current token and check if user is admin
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    try {
      if (token) {
        const userData = JSON.parse(atob(token));
        isAdmin = userData.isAdmin || false;
      }
    } catch (e) {
      // Invalid token format
    }
    
    // Only allow admins to create categories
    if (!isAdmin) {
      throw new Error('Aðeins stjórnendur geta búið til flokka');
    }
    
    const categories = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    
    // Athuga hvort flokkur með sama nafn sé til
    if (categories.some((c: Category) => c.name.toLowerCase() === categoryData.name?.toLowerCase())) {
      throw new Error('Flokkur með þessu nafni er þegar til');
    }
    
    const newCategory: Category = {
      id: uuidv4(),
      name: categoryData.name || '',
      description: categoryData.description || '',
    };
    
    categories.push(newCategory);
    storage.set(STORAGE_KEYS.CATEGORIES, categories);
    
    return newCategory;
  },
  
  update: (id: string, categoryData: Partial<Category>) => {
    storage.initializeIfEmpty();
    
    // Check admin status first
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    try {
      if (token) {
        const userData = JSON.parse(atob(token));
        isAdmin = userData.isAdmin || false;
      }
    } catch (e) {
      // Invalid token format
    }
    
    if (!isAdmin) {
      throw new Error('Aðeins stjórnendur geta breytt flokkum');
    }
    
    const categories = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    
    const categoryIndex = categories.findIndex((c: Category) => c.id === id);
    
    if (categoryIndex === -1) {
      throw new Error('Flokkur fannst ekki');
    }
    
    const updatedCategory = {
      ...categories[categoryIndex],
      ...categoryData,
    };
    
    categories[categoryIndex] = updatedCategory;
    storage.set(STORAGE_KEYS.CATEGORIES, categories);
    
    return updatedCategory;
  },
  
  delete: (id: string) => {
    storage.initializeIfEmpty();
    
    // Check admin status first
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    try {
      if (token) {
        const userData = JSON.parse(atob(token));
        isAdmin = userData.isAdmin || false;
      }
    } catch (e) {
      // Invalid token format
    }
    
    if (!isAdmin) {
      throw new Error('Aðeins stjórnendur geta eytt flokkum');
    }
    
    const categories = storage.get(STORAGE_KEYS.CATEGORIES) || [];
    const newCategories = categories.filter((c: Category) => c.id !== id);
    
    if (categories.length === newCategories.length) {
      throw new Error('Flokkur fannst ekki');
    }
    
    storage.set(STORAGE_KEYS.CATEGORIES, newCategories);
    
    return { success: true };
  }
};

// Taga virkni
export const MockTagService = {
  getAll: () => {
    storage.initializeIfEmpty();
    return storage.get(STORAGE_KEYS.TAGS) || [];
  }
};

// Mynda virkni - Nota beina tengingu við Cloudinary Widget í framenda
