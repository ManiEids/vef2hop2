"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskService, CategoryService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";

interface Category {
  id: string;
  name: string;
}

export default function NewTask() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!user) {
      router.push("/innskraning");
      return;
    }
    
    // Sækja flokka
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoryService.getAll();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Villa við að sækja flokka:", err);
        setError("Villa kom upp við að sækja flokka");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [router, user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      setError("Titill verður að vera útfylltur");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      // Umbreyta tags í fylki
      const tagArray = tags
        ? tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
        : [];
        
      const createdTask = await TaskService.create({
        title,
        description,
        due_date: dueDate || null,
        completed,
        category_id: categoryId || null,
        tags: tagArray,
        image_url: imageUrl || null,
      });
      
      router.push(`/verkefni/${createdTask.id}`);
    } catch (err) {
      console.error("Villa við að búa til verkefni:", err);
      setError("Villa kom upp við að búa til verkefni");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="h-32 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nýtt verkefni</h1>
        <Link 
          href="/verkefni"
          className="text-blue-500 hover:underline"
        >
          Hætta við
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Titill
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Lýsing
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">
            Lokadagur
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
            Flokkur
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Veldu flokk</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Mynd
          </label>
          <ImageUploader initialImageUrl={imageUrl} onImageSelected={setImageUrl} />
        </div>
        
        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
            eða slóð á mynd
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
            Merki (aðgreind með kommu)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="t.d. mikilvægt, skóli, verkefni"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="completed" className="ml-2 block text-gray-700">
              Verkefni lokið
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {saving ? "Býr til..." : "Búa til verkefni"}
          </button>
        </div>
      </form>
    </div>
  );
}
