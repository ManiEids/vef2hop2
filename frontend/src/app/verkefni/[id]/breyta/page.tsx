"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskService, CategoryService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

export default function EditTask({ params }: { params: { id: string } }) {
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
    
    // Sækja verkefni og flokka
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sækja verkefnið
        const task = await TaskService.getById(params.id);
        
        // Setja gögn í form
        setTitle(task.title || "");
        setDescription(task.description || "");
        setDueDate(task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "");
        setCompleted(task.completed || false);
        setCategoryId(task.category_id || "");
        setTags(task.tags ? task.tags.join(", ") : "");
        setImageUrl(task.image_url || "");
        
        // Sækja flokka
        const categoriesData = await CategoryService.getAll();
        setCategories(categoriesData || []);
        
      } catch (err) {
        console.error("Villa við að sækja gögn:", err);
        setError("Villa kom upp við að sækja gögn");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router, user]);
  
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
        
      await TaskService.update(params.id, {
        title,
        description,
        due_date: dueDate || null,
        completed,
        category_id: categoryId || null,
        tags: tagArray,
        image_url: imageUrl || null,
      });
      
      router.push(`/verkefni/${params.id}`);
    } catch (err) {
      console.error("Villa við að uppfæra verkefni:", err);
      setError("Villa kom upp við að uppfæra verkefni");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-32 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Breyta verkefni</h1>
        <Link 
          href={`/verkefni/${params.id}`}
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
        
        {imageUrl && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Núverandi mynd
            </label>
            <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt="Verkefnismynd"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              Fjarlægja mynd
            </button>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
            Slóð á mynd
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Veldu mynd í gegnum{" "}
            <Link href="/myndir" className="text-blue-500 hover:underline">myndasíðuna</Link>{" "}
            eða settu inn slóð á mynd
          </p>
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
            {saving ? "Vistar..." : "Vista breytingar"}
          </button>
        </div>
      </form>
    </div>
  );
}
