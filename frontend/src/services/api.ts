// Grunnur fyrir API köll
import { MockAuthService, MockTaskService, MockCategoryService, MockTagService } from './mockApi';

// Bæta við import frá mockApi.ts fyrir CloudinaryService
import { STORAGE_KEYS, storage } from './mockApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Færanlegt flag til að nota mökk í staðinn fyrir bakenda
const MOCKED_FEATURES = {
  AUTH: true,      // Use mock authentication
  TASKS: true,     // Use mock tasks
  CATEGORIES: true, // Use mock categories
  TAGS: true,       // Use mock tags
  CLOUDINARY: true  // Direct Cloudinary upload (always enabled for Vercel compatibility)
};

// Add this interface near the top of the file with other interfaces/types
interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  format: string;
  created_at: string;
}

// Hjálparfall fyrir API köll
export async function fetchApi(
  endpoint: string, 
  options: RequestInit = {}
) {
  // Hreinsa endapunkt af query params fyrir shouldUseMock til að forðast röng mökkun
  const baseEndpoint = endpoint.split('?')[0];
  
  // Athugum hvort endapunktur sé hluti af möckuðum features
  if (shouldUseMock(baseEndpoint, options.method || 'GET')) {
    console.log(`Nota mock API fyrir ${endpoint}`);
    return handleMockApi(endpoint, options);
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  try {
    console.log(`Kallar á raunverulegt API: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Ef svar er 404, þá er endapunkturinn ekki til - prófum mock
    if (response.status === 404) {
      console.warn(`Endapunktur fannst ekki í bakenda: ${endpoint}, reyni mock`);
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
    // Ef um er að ræða 'Network Error', þá er bakendi líklega niðri
    // Gæti einnig verið um að ræða CORS villu
    console.warn("Netvilla, nota mock gögn í staðinn");
    return handleMockApi(endpoint, options);
  }
}

// Hjálparfall til að ákveða hvort nota eigi mökk fyrir þennan endapunkt
function shouldUseMock(endpoint: string, method: string): boolean {
  // Auth endpoints
  if (endpoint.startsWith('/users/') && MOCKED_FEATURES.AUTH) {
    return true;
  }
  
  // Tasks endpoints
  if (endpoint.startsWith('/tasks') && MOCKED_FEATURES.TASKS) {
    return true;
  }
  
  // Categories endpoints
  if (endpoint.startsWith('/categories') && MOCKED_FEATURES.CATEGORIES) {
    return true;
  }
  
  // Tags endpoints
  if (endpoint.startsWith('/tags') && MOCKED_FEATURES.TAGS) {
    return true;
  }
  
  return false;
}

// Hjálparfall til að meðhöndla mock API köll
async function handleMockApi(endpoint: string, options: RequestInit) {
  const method = options.method || 'GET';
  
  // Hreinsa endapunkt af query params fyrir task endpoint
  const baseEndpoint = endpoint.split('?')[0];
  
  // Notendavirkni
  if (baseEndpoint.startsWith('/users/login') && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockAuthService.login(body.email || body.username, body.password);
  }
  
  if (baseEndpoint.startsWith('/users/register') && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockAuthService.register(body);
  }
  
  if (baseEndpoint === '/users/me') {
    const token = localStorage.getItem("token");
    return MockAuthService.getCurrentUser(token);
  }
  
  // Verkefnavirkni - lagað að styðja querystring
  if (baseEndpoint === '/tasks' && method === 'GET') {
    // Sækja öll verkefni
    try {
      const url = new URL(`http://localhost${endpoint}`);
      const page = Number(url.searchParams.get('page')) || 1;
      const limit = Number(url.searchParams.get('limit')) || 10;
      const category = url.searchParams.get('category') || '';
      const tag = url.searchParams.get('tag') || '';
      
      return MockTaskService.getAll(page, limit, category, tag);
    } catch (error) {
      // Ef URL parsing mistekst, reynum að nota sæmilega default gildi
      return MockTaskService.getAll(1, 10, '', '');
    }
  }
  
  if (baseEndpoint.startsWith('/tasks/') && method === 'GET') {
    const id = baseEndpoint.replace('/tasks/', '');
    return MockTaskService.getById(id);
  }
  
  if (baseEndpoint === '/tasks' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockTaskService.create(body);
  }
  
  if (baseEndpoint.startsWith('/tasks/') && method === 'PUT') {
    const id = baseEndpoint.replace('/tasks/', '');
    const body = JSON.parse(options.body as string);
    return MockTaskService.update(id, body);
  }
  
  if (baseEndpoint.startsWith('/tasks/') && method === 'DELETE') {
    const id = baseEndpoint.replace('/tasks/', '');
    return MockTaskService.delete(id);
  }
  
  // Flokkavirkni
  if (baseEndpoint === '/categories' && method === 'GET') {
    return MockCategoryService.getAll();
  }
  
  if (baseEndpoint.startsWith('/categories/') && method === 'GET') {
    const id = baseEndpoint.replace('/categories/', '');
    return MockCategoryService.getById(id);
  }
  
  if (baseEndpoint === '/categories' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockCategoryService.create(body);
  }
  
  if (baseEndpoint.startsWith('/categories/') && method === 'PUT') {
    const id = baseEndpoint.replace('/categories/', '');
    const body = JSON.parse(options.body as string);
    return MockCategoryService.update(id, body);
  }
  
  if (baseEndpoint.startsWith('/categories/') && method === 'DELETE') {
    const id = baseEndpoint.replace('/categories/', '');
    return MockCategoryService.delete(id);
  }
  
  // Taga virkni
  if (baseEndpoint === '/tags' && method === 'GET') {
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

// Provide a fallback mechanism for image uploads
export const CloudinaryService = {
  uploadImage: async (file: File, preset?: string) => {
    // Fallback preset - MUST be created in Cloudinary dashboard with "Unsigned" mode
    const uploadPreset = preset || localStorage.getItem("cloudinary_upload_preset") || "verkefnalisti-uploads";
    
    const cloudName = "dojqamm7u";
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "verkefnalisti-mana");
    
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary API error:", errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  },
  
  getImages: async (folder?: string) => {
    const cloudName = "dojqamm7u";
    
    try {
      console.log("Attempting to fetch Cloudinary images...");
      
      // ætti að nota bakenda en prófa 
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "747457427514895";
      
      // nota admin
      try {
        // admin api url
        const adminUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=${folder || 'verkefnalisti-mana'}&max_results=500`;
        
        const headers = new Headers();
        headers.append("Authorization", `Basic ${btoa(`${apiKey}:${process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || ''}`)}`);
        
        // ætti að vera server side call
        const response = await fetch(adminUrl, { 
          method: 'GET',
          headers: headers
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Successfully fetched from Cloudinary Admin API:", data.resources.length, "images");
          
          return {
            resources: data.resources.map((resource: any) => ({
              public_id: resource.public_id,
              secure_url: resource.secure_url,
              format: resource.format,
              created_at: resource.created_at || new Date().toISOString()
            }))
          };
        } else {
          console.log("Admin API failed, status:", response.status);
        }
      } catch (error) {
        console.log("Error using Admin API:", error);
      }
      
      // Second attempt: Try to get images directly from list API
      try {
        console.log("Trying Cloudinary list API...");
        const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${folder || 'verkefnalisti-mana'}.json?timestamp=${Date.now()}`;
        
        const response = await fetch(listUrl, { cache: 'no-store' });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Successfully fetched from List API:", data.resources.length, "images");
          
          return {
            resources: data.resources.map((resource: any) => ({
              public_id: resource.public_id,
              secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/${resource.public_id}.${resource.format}`,
              format: resource.format,
              created_at: resource.created_at || new Date().toISOString()
            }))
          };
        } else {
          console.log("List API failed, status:", response.status);
        }
      } catch (error) {
        console.log("Error using List API:", error);
      }
      
      // Last attempt: Try direct search API (won't work in browser due to CORS)
      try {
        console.log("Trying Cloudinary Search API...");
        const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
        
        const searchParams = {
          expression: `folder=${folder || "verkefnalisti-mana"}`,
          max_results: 500,
          sort_by: [{ created_at: "desc" }]
        };
        
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchParams)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Successfully fetched from Search API:", data.resources.length, "images");
          
          return {
            resources: data.resources.map((resource: any) => ({
              public_id: resource.public_id,
              secure_url: resource.secure_url,
              format: resource.format || resource.public_id.split('.').pop(),
              created_at: resource.created_at || new Date().toISOString()
            }))
          };
        }
      } catch (error) {
        console.log("Error using Search API:", error);
      }
      
      // Fallback to mock data if all other methods fail
      console.log("All API methods failed, using mock data");
      
      // Get basic list from localStorage for mock
      const allImages = new Map<string, CloudinaryImage>();
      
      // Add any task images first
      const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
      tasks.filter((task: any) => task.image_url)
        .forEach((task: any) => {
          const url = task.image_url;
          allImages.set(url, {
            public_id: url.split('/').pop().split('.')[0],
            secure_url: url,
            format: url.split('.').pop(),
            created_at: task.created_at || new Date().toISOString()
          });
        });
      
      // Add sample/demo images
      const sampleCreationDate = new Date(Date.now() - 86400000).toISOString();
      
      const demoImages = [
        // Manually add 20+ sample images to ensure we have enough for pagination testing
        // First add the existing sample images
        { public_id: 'sample1', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993767/verkefnalisti-mana/image-1741993765602-424312021_u7zbns.jpg' },
        { public_id: 'sample2', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993836/verkefnalisti-mana/image-1741993835136-360129464_rdkyjm.jpg' },
        { public_id: 'sample3', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993873/verkefnalisti-mana/image-1741993872277-918612344_akdzd0.png' },
        { public_id: 'cld-sample', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample.jpg' },
        { public_id: 'cld-sample-2', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-2.jpg' },
        { public_id: 'cld-sample-3', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-3.jpg' },
        { public_id: 'cld-sample-4', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-4.jpg' },
        { public_id: 'cld-sample-5', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-5.jpg' },
        { public_id: 'coffee', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/coffee.jpg' },
        { public_id: 'woman-on-a-football-field', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/woman-on-a-football-field.jpg' },
        { public_id: 'upscale-face-1', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/samples/upscale-face-1.jpg' },
        { public_id: 'logo', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/samples/logo.jpg' },
        
        // Add some additional sample images for testing pagination
        { public_id: 'extra-1', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/animals/cat.jpg' },
        { public_id: 'extra-2', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/animals/dog.jpg' },
        { public_id: 'extra-3', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/food/pot-mussels.jpg' },
        { public_id: 'extra-4', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/food/fish-vegetables.jpg' },
        { public_id: 'extra-5', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/food/dessert.jpg' },
        { public_id: 'extra-6', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/landscapes/beach-boat.jpg' },
        { public_id: 'extra-7', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/landscapes/nature-mountains.jpg' },
        { public_id: 'extra-8', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/people/kitchen-bar.jpg' },
        { public_id: 'extra-9', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/people/smiling-man.jpg' },
        { public_id: 'extra-10', secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/people/jazz.jpg' }
      ];
      
      demoImages.forEach((img) => {
        if (!allImages.has(img.secure_url)) {
          allImages.set(img.secure_url, {
            ...img,
            format: img.secure_url.split('.').pop() || 'jpg',
            created_at: sampleCreationDate
          });
        }
      });
      
      return {
        resources: Array.from(allImages.values())
      };
      
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    }
  }
};
