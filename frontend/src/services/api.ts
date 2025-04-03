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
    const uploadPreset = preset || localStorage.getItem("cloudinary_upload_preset") || "verkefnalisti-mana";
    
    const cloudName = "dojqamm7u";
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "verkefnalisti-mana");
    
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      console.log("Starting upload to Cloudinary...");
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
      console.log("Successfully uploaded to Cloudinary:", data.secure_url);
      
      // Store the image URL in localStorage to ensure we can display it immediately
      try {
        // Create a specific key for uploaded images to make them easier to track
        const uploadedImages = JSON.parse(localStorage.getItem('cloudinary_uploaded_images') || '[]');
        uploadedImages.unshift({
          public_id: data.public_id,
          secure_url: data.secure_url,
          format: data.format || 'jpg',
          created_at: new Date().toISOString()
        });
        localStorage.set('cloudinary_uploaded_images', JSON.stringify(uploadedImages));
        
        // Also add to tasks for backward compatibility
        const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
        const mockTask = {
          id: `upload-${Date.now()}`,
          title: "Ný mynd",
          description: `Mynd hlaðið upp ${new Date().toLocaleString('is-IS')}`,
          completed: false,
          image_url: data.secure_url,
          created_at: new Date().toISOString()
        };
        tasks.unshift(mockTask);
        storage.set(STORAGE_KEYS.TASKS, tasks);
      } catch (err) {
        console.warn("Could not update local storage with image:", err);
      }
      
      return data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  },
  
  getImages: async (folder = 'verkefnalisti-mana', timestamp?: number) => {
    const cloudName = "dojqamm7u";
    console.log(`Fetching images from folder ${folder} at ${new Date().toISOString()}`);
    
    try {
      // Add cache-busting parameter to all API calls
      const cacheBuster = `cb=${Date.now()}`;
      
      // Try direct Cloudinary API first with improved parameters
      try {
        console.log("Trying Cloudinary Search API with sorting...");
        const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
        
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "747457427514895";
        const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "WaVUT_hAaVFNcvvfWuTKxuVDO9o";
        
        const headers = new Headers();
        headers.append("Authorization", `Basic ${btoa(`${apiKey}:${apiSecret}`)}`);
        headers.append("Content-Type", "application/json");
        
        // Improved search expression to target exactly your folder
        const searchParams = {
          expression: `folder="${folder}"`,
          max_results: 100,
          sort_by: [{ created_at: "desc" }]
        };
        
        const response = await fetch(`${searchUrl}?${cacheBuster}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(searchParams),
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched ${data.resources.length} images from Search API`);
          
          if (data.resources.length > 0) {
            return {
              resources: data.resources.map((resource: any) => ({
                public_id: resource.public_id,
                secure_url: resource.secure_url,
                format: resource.format || resource.public_id.split('.').pop(),
                created_at: resource.created_at || new Date().toISOString()
              }))
            };
          }
        }
      } catch (error) {
        console.warn("Error using Search API:", error);
      }
      
      // Try Admin API as fallback
      try {
        console.log("Trying Admin API...");
        const adminUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=${folder}&max_results=500`;
        
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "747457427514895";
        const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "WaVUT_hAaVFNcvvfWuTKxuVDO9o";
        
        const headers = new Headers();
        headers.append("Authorization", `Basic ${btoa(`${apiKey}:${apiSecret}`)}`);
        
        const response = await fetch(`${adminUrl}&${cacheBuster}`, { 
          method: 'GET',
          headers: headers,
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched ${data.resources.length} images from Admin API`);
          
          return {
            resources: data.resources.map((resource: any) => ({
              public_id: resource.public_id,
              secure_url: resource.secure_url,
              format: resource.format,
              created_at: resource.created_at || new Date().toISOString()
            }))
          };
        }
      } catch (error) {
        console.warn("Error using Admin API:", error);
      }
      
      // Fall back to stored images if API calls fail
      console.log("API calls failed, using locally stored uploaded images");
      const allImages = new Map<string, CloudinaryImage>();
      
      // First check our dedicated uploaded images storage
      try {
        const uploadedImages = JSON.parse(localStorage.getItem('cloudinary_uploaded_images') || '[]');
        console.log(`Found ${uploadedImages.length} locally stored uploaded images`);
        uploadedImages.forEach((img: CloudinaryImage) => {
          if (img.secure_url.includes(folder)) {
            allImages.set(img.secure_url, img);
          }
        });
      } catch (err) {
        console.warn("Error accessing local uploaded images:", err);
      }
      
      // Also get from tasks for backward compatibility
      const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
      tasks.filter((task: any) => task.image_url && task.image_url.includes(folder))
        .forEach((task: any) => {
          const url = task.image_url;
          if (url && !allImages.has(url)) {
            const publicId = url.includes('/') 
              ? url.split('/').pop().split('.')[0] 
              : url;
              
            allImages.set(url, {
              public_id: publicId || `image-${Date.now()}`,
              secure_url: url,
              format: url.split('.').pop() || 'jpg',
              created_at: task.created_at || new Date().toISOString()
            });
          }
        });
      
      // Add sample images from your Cloudinary account
      [
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1743696142/verkefnalisti-mana/tur5pavlseq8m8j4zkz1.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1743691358/verkefnalisti-mana/fbngksneerhz6osnjgax.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1743690856/verkefnalisti-mana/rqsdvkutpjepoq93n8ig.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1743688515/verkefnalisti-mana/xllclaw1ksih8eh6fv90.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1743688169/verkefnalisti-mana/se2txlxof990k6l7dzhr.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1743686684/verkefnalisti-mana/zgx3f0nmtzroqccfsu2i.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1742167971/verkefnalisti-mana/image-1742167970741-94081365_kxv3pp.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993873/verkefnalisti-mana/image-1741993872277-918612344_akdzd0.png',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993836/verkefnalisti-mana/image-1741993835136-360129464_rdkyjm.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993767/verkefnalisti-mana/image-1741993765602-424312021_u7zbns.jpg',
        'https://res.cloudinary.com/dojqamm7u/image/upload/v1741989602/verkefnalisti-mana/image-1741989601198-771876460_yz6rad.jpg'
      ].forEach(url => {
        if (!allImages.has(url)) {
          const publicId = url.split('/').pop()?.split('.')[0] || '';
          const format = url.split('.').pop() || 'jpg';
          
          allImages.set(url, {
            public_id: publicId,
            secure_url: url,
            format: format,
            created_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
          });
        }
      });
      
      const imageArray = Array.from(allImages.values());
      // Sort by created_at date, newest first
      imageArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`Returning ${imageArray.length} images from local storage`);
      return {
        resources: imageArray
      };
    } catch (error) {
      console.error("Failed to fetch images:", error);
      throw error;
    }
  }
};
