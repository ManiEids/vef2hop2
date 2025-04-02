"use client";

import { useState, useEffect } from "react";
import { CategoryService } from "@/services/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Category {
  id: string;
  name: string;
  description?: string;
  task_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoryService.getAll();
        setCategories(response || []);
      } catch (err) {
        setError("Villa kom upp við að sækja flokka");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Flokkar</h1>
        {user?.isAdmin && (
          <Link
            href="/flokkar/nyr"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Nýr flokkur
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-6 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Engir flokkar fundust</p>
          {user?.isAdmin && (
            <Link
              href="/flokkar/nyr"
              className="text-blue-500 underline mt-2 inline-block"
            >
              Búa til nýjan flokk
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id} 
              href={`/verkefni?category=${category.id}`}
              className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">{category.description}</p>
              )}
              <div className="text-sm text-gray-500">
                {category.task_count !== undefined 
                  ? `${category.task_count} verkefni` 
                  : "Engin verkefni"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
