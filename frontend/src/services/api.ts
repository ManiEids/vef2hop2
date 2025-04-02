// Grunnur fyrir API köll

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hjálparfall fyrir API köll
export async function fetchApi(
  endpoint: string, 
  options: RequestInit = {}
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  try {
    console.log(`Calling API: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Ef svar er 404, þá er endapunkturinn ekki til
    if (response.status === 404) {
      console.error(`Endapunktur fannst ekki: ${API_URL}${endpoint}`);
      throw new Error(`Endapunktur fannst ekki: ${endpoint}`);
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
    console.error("API villa:", error);
    throw error;
  }
}

// Verkefna þjónusta
export const TaskService = {
  // Sækja öll verkefni með síðuskiptingu
  getAll: async (page = 1, limit = 10, category?: string, tag?: string) => {
    let query = `?page=${page}&limit=${limit}`;
    if (category) query += `&category=${category}`;
    if (tag) query += `&tag=${tag}`;
    
    return fetchApi(`/tasks${query}`);
  },
  
  // Sækja eitt verkefni
  getById: async (id: string) => {
    return fetchApi(`/tasks/${id}`);
  },
  
  // Búa til nýtt verkefni
  create: async (taskData: any) => {
    return fetchApi("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },
  
  // Uppfæra verkefni
  update: async (id: string, taskData: any) => {
    return fetchApi(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  },
  
  // Eyða verkefni
  delete: async (id: string) => {
    return fetchApi(`/tasks/${id}`, {
      method: "DELETE",
    });
  }
};

// Flokka þjónusta
export const CategoryService = {
  // Sækja alla flokka
  getAll: async () => {
    return fetchApi("/categories");
  },
  
  // Sækja einn flokk
  getById: async (id: string) => {
    return fetchApi(`/categories/${id}`);
  },
  
  // Búa til nýjan flokk
  create: async (categoryData: any) => {
    return fetchApi("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },
  
  // Uppfæra flokk
  update: async (id: string, categoryData: any) => {
    return fetchApi(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },
  
  // Eyða flokki
  delete: async (id: string) => {
    return fetchApi(`/categories/${id}`, {
      method: "DELETE",
    });
  }
};
