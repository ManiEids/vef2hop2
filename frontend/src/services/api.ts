// Grunnur fyrir API köll
import { MockAuthService, MockTaskService, MockCategoryService, MockTagService } from './mockApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Færanlegt flag til að stýra hvaða virkni er möckuð
const MOCKED_FEATURES = {
  AUTH: false,      // Nota raunverulega innskráningu
  TASKS: false,     // Nota raunverulega verkefnavirkni
  CATEGORIES: false, // Nota raunverulega flokkavirkni
  TAGS: true,       // Möcka tags - líklega ekki til í bakenda
  CLOUDINARY: true  // Nota beina Cloudinary upphleðslu í framenda
};

// Hjálparfall fyrir API köll
export async function fetchApi(
  endpoint: string, 
  options: RequestInit = {}
) {
  // Athugum hvort endapunktur sé hluti af möckuðum features
  if (shouldUseMock(endpoint, options.method || 'GET')) {
    console.log(`Using mock API for ${endpoint}`);
    return handleMockApi(endpoint, options);
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  try {
    console.log(`Calling real API: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Ef svar er 404, þá er endapunkturinn ekki til - prófum mock
    if (response.status === 404) {
      console.warn(`Endpoint not found in backend: ${endpoint}, trying mock`);
      return handleMockApi(endpoint, options);
    }
    
    // Ef svar er 401 eða 403, þá er notandi ekki með aðgang
    if (response.status === 401 || response.status === 403) {
      throw new Error("Ekki heimild");
    }
    
    // Ef svar er ekki 2xx, köstum villu
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    // Ef response er tómur, skilum tómu JSON
    if (response.status === 204) {
      return null;
    }
    
    // Reynum að lesa JSON, ef það er ekki JSON þá skilum við svari
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Ekki JSON svar:", text);
      throw new Error("Óvænt svar frá vefþjón");
    }
    
  } catch (error) {
    // Ef um er að ræða 'Network Error', þá er bakendi líklega niðri - notum mock
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn("Network error, falling back to mock API");
      return handleMockApi(endpoint, options);
    }
    
    console.error("API villa:", error);
    throw error;
  }
}

// Helper to determine if we should use mock for this endpoint/method
function shouldUseMock(endpoint: string, method: string): boolean {
  // Auth endpoints
  if (endpoint.startsWith('/users/') && MOCKED_FEATURES.AUTH) {
    return true;
  }
  
  // Tags - if we need to mock them
  if (endpoint.startsWith('/tags') && MOCKED_FEATURES.TAGS) {
    return true;
  }
  
  // Add more conditions as needed
  return false;
}

// Hjálparfall til að meðhöndla mock API köll
async function handleMockApi(endpoint: string, options: RequestInit) {
  const method = options.method || 'GET';
  
  // Notendavirkni
  if (endpoint.startsWith('/users/login') && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockAuthService.login(body.email || body.username, body.password);
  }
  
  if (endpoint.startsWith('/users/register') && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockAuthService.register(body);
  }
  
  if (endpoint === '/users/me') {
    const token = localStorage.getItem("token");
    return MockAuthService.getCurrentUser(token);
  }
  
  // Verkefnavirkni
  if (endpoint.startsWith('/tasks') && !endpoint.includes('/')) {
    // Sækja öll verkefni
    const url = new URL(`http://localhost${endpoint}`);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const category = url.searchParams.get('category') || '';
    const tag = url.searchParams.get('tag') || '';
    
    return MockTaskService.getAll(page, limit, category, tag);
  }
  
  if (endpoint.startsWith('/tasks/') && method === 'GET') {
    const id = endpoint.replace('/tasks/', '');
    return MockTaskService.getById(id);
  }
  
  if (endpoint.startsWith('/tasks') && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockTaskService.create(body);
  }
  
  if (endpoint.startsWith('/tasks/') && method === 'PUT') {
    const id = endpoint.replace('/tasks/', '');
    const body = JSON.parse(options.body as string);
    return MockTaskService.update(id, body);
  }
  
  if (endpoint.startsWith('/tasks/') && method === 'DELETE') {
    const id = endpoint.replace('/tasks/', '');
    return MockTaskService.delete(id);
  }
  
  // Flokkavirkni
  if (endpoint === '/categories' && method === 'GET') {
    return MockCategoryService.getAll();
  }
  
  if (endpoint.startsWith('/categories/') && method === 'GET') {
    const id = endpoint.replace('/categories/', '');
    return MockCategoryService.getById(id);
  }
  
  if (endpoint === '/categories' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockCategoryService.create(body);
  }
  
  if (endpoint.startsWith('/categories/') && method === 'PUT') {
    const id = endpoint.replace('/categories/', '');
    const body = JSON.parse(options.body as string);
    return MockCategoryService.update(id, body);
  }
  
  if (endpoint.startsWith('/categories/') && method === 'DELETE') {
    const id = endpoint.replace('/categories/', '');
    return MockCategoryService.delete(id);
  }
  
  // Taga virkni
  if (endpoint === '/tags' && method === 'GET') {
    return MockTagService.getAll();
  }
  
  throw new Error(`Endpoint ekki studdur í mock API: ${endpoint}`);
}

// Verkefna þjónusta
export const TaskService = {
  getAll: async (page = 1, limit = 10, category?: string, tag?: string) => {
    let query = `?page=${page}&limit=${limit}`;
    if (category) query += `&category=${category}`;
    if (tag) query += `&tag=${tag}`;
    
    return fetchApi(`/tasks${query}`);
  },
  
  getById: async (id: string) => {
    return fetchApi(`/tasks/${id}`);
  },
  
  create: async (taskData: any) => {
    return fetchApi("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },
  
  update: async (id: string, taskData: any) => {
    return fetchApi(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  },
  
  delete: async (id: string) => {
    return fetchApi(`/tasks/${id}`, {
      method: "DELETE",
    });
  }
};

// Flokka þjónusta
export const CategoryService = {
  getAll: async () => {
    return fetchApi("/categories");
  },
  
  getById: async (id: string) => {
    return fetchApi(`/categories/${id}`);
  },
  
  create: async (categoryData: any) => {
    return fetchApi("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },
  
  update: async (id: string, categoryData: any) => {
    return fetchApi(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },
  
  delete: async (id: string) => {
    return fetchApi(`/categories/${id}`, {
      method: "DELETE",
    });
  }
};

// Bætum við taga þjónustu
export const TagService = {
  getAll: async () => {
    return fetchApi("/tags");
  }
};
