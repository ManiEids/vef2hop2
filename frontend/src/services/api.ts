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
  
  // Uppfært til að sækja myndir beint frá Cloudinary þegar hægt er
  getImages: async (folder?: string) => {
    const cloudName = "dojqamm7u";
    
    try {
      // Try to get all images directly from Cloudinary API using next_cursor for pagination
      const getAllImages = async () => {
        let allResources: any[] = [];
        let hasMore = true;
        let nextCursor = undefined;
        
        while (hasMore) {
          try {
            // Build the URL with cursor if available
            let url = `https://res.cloudinary.com/${cloudName}/image/list/${folder || 'verkefnalisti-mana'}.json`;
            if (nextCursor) {
              url += `?next_cursor=${nextCursor}`;
            }
            
            const response = await fetch(url);
            
            if (response.ok) {
              const data = await response.json();
              allResources = [...allResources, ...data.resources];
              
              // Check if there are more pages
              if (data.next_cursor) {
                nextCursor = data.next_cursor;
              } else {
                hasMore = false;
              }
            } else {
              // If we get an error, stop trying to fetch more
              hasMore = false;
            }
          } catch (error) {
            console.log("Error fetching images page:", error);
            hasMore = false;
          }
        }
        
        return allResources;
      };
      
      try {
        const allResources = await getAllImages();
        
        if (allResources.length > 0) {
          console.log(`Fetched ${allResources.length} images from Cloudinary`);
          
          // Format for consistency
          return {
            resources: allResources.map((resource: any) => ({
              public_id: resource.public_id,
              secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/${resource.public_id}.${resource.format}`,
              format: resource.format,
              created_at: resource.created_at || new Date().toISOString()
            }))
          };
        }
      } catch (error) {
        console.log("Failed to fetch images directly from Cloudinary, using mock");
      }
      
      // If Cloudinary API fails, use mock
      // Collect all possible images and remove duplicates
      const allImages = new Map<string, CloudinaryImage>();
      
      // Sækja verkefni sem innihalda myndir
      const tasks = storage.get(STORAGE_KEYS.TASKS) || [];
      const imagesFromTasks = tasks
        .filter((task: any) => task.image_url)
        .map((task: any) => {
          const url = task.image_url;
          return {
            public_id: url.split('/').pop().split('.')[0],
            secure_url: url,
            format: url.split('.').pop(),
            created_at: task.created_at || new Date().toISOString()
          } as CloudinaryImage;
        });
        
      // Bæta myndum við Map eftir URL til að koma í veg fyrir tvítekningar
      imagesFromTasks.forEach((img: CloudinaryImage) => {
        allImages.set(img.secure_url, img);
      });
      
      // Sample myndir - alltaf sýna fyrir dæmi
      const sampleCreationDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      const sampleImages: CloudinaryImage[] = [
        {
          public_id: 'sample1',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993767/verkefnalisti-mana/image-1741993765602-424312021_u7zbns.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'sample2',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993836/verkefnalisti-mana/image-1741993835136-360129464_rdkyjm.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'sample3',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741993873/verkefnalisti-mana/image-1741993872277-918612344_akdzd0.png',
          format: 'png',
          created_at: sampleCreationDate
        },
        {
          public_id: 'cld-sample',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'cld-sample-2',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-2.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'cld-sample-3',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-3.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'cld-sample-4',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-4.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'cld-sample-5',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/cld-sample-5.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        }
      ];
      
      // Bæta við sample myndum líka
      sampleImages.forEach((img: CloudinaryImage) => {
        if (!allImages.has(img.secure_url)) {
          allImages.set(img.secure_url, img);
        }
      });
      
      // Fleiri myndir til að fylla upp í
      const additionalImages: CloudinaryImage[] = [
        {
          public_id: 'coffee',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/coffee.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'woman-on-a-football-field',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988207/samples/woman-on-a-football-field.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'upscale-face-1',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/samples/upscale-face-1.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        },
        {
          public_id: 'logo',
          secure_url: 'https://res.cloudinary.com/dojqamm7u/image/upload/v1741988208/samples/logo.jpg',
          format: 'jpg',
          created_at: sampleCreationDate
        }
      ];
      
      // Bæta við viðbótarmyndum ef ekki til nú þegar
      additionalImages.forEach((img: CloudinaryImage) => {
        if (!allImages.has(img.secure_url)) {
          allImages.set(img.secure_url, img);
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
