"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CategoryService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function NewCategory() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Redirect non-admin users
  useEffect(() => {
    if (!user) {
      router.push("/innskraning");
      return;
    }
    
    if (user && !user.isAdmin) {
      router.push("/ekki-heimild");
    }
  }, [user, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError("Nafn flokks verður að vera útfyllt");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      await CategoryService.create({
        name,
        description,
      });
      
      router.push("/flokkar");
    } catch (err: any) {
      console.error("Villa við að búa til flokk:", err);
      setError(err.message || "Villa kom upp við að búa til flokk");
    } finally {
      setSaving(false);
    }
  };
  
  if (!user || !user.isAdmin) {
    return null;
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nýr flokkur</h1>
        <Link 
          href="/flokkar"
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
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Nafn flokks
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Lýsing (valkvæmt)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {saving ? "Vistar..." : "Vista flokk"}
          </button>
        </div>
      </form>
    </div>
  );
}
