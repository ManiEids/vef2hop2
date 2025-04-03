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
  completed_count?: number;
  todo_count?: number;
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
              
              <div className="text-sm">
                {(category.task_count ?? 0) > 0 ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium">{category.task_count}</span>
                      <span className="ml-1">verkefni samtals</span>
                    </div>
                    
                    <div className="flex gap-3">
                      {(category.todo_count ?? 0) > 0 && (
                        <div className="flex items-center text-amber-600">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                          <span>{category.todo_count} óklárað</span>
                        </div>
                      )}
                      
                      {(category.completed_count ?? 0) > 0 && (
                        <div className="flex items-center text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                          <span>{category.completed_count} lokið</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Engin verkefni</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
