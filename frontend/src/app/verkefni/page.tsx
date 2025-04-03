"use client";

import { useState, useEffect, Suspense } from "react";
import { TaskService, CategoryService } from "@/services/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  category_id?: string;
  category_name?: string;
  image_url?: string; // Added image_url property
  tags?: string[]; // Added tags property
}

interface Category {
  id: string;
  name: string;
}

// This component uses searchParams, so it needs to be wrapped in Suspense
function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get categories first
        const categoriesData = await CategoryService.getAll();
        setCategories(categoriesData || []);

        // Then get tasks, filtered by category if specified
        const response = await TaskService.getAll(
          page,
          10,
          categoryFilter || undefined
        );

        setTasks(response.items || []);
        setTotalPages(Math.ceil((response.count || 0) / 10));
      } catch (err) {
        setError("Villa kom upp við að sækja gögn");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, categoryFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Enginn lokadagur";
    const date = new Date(dateString);
    return date.toLocaleDateString("is-IS");
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Verkefnalisti</h1>
        <div className="flex gap-4">
          {user && (
            <Link
              href="/verkefni/nyr"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Nýtt verkefni
            </Link>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/verkefni"
          className={`px-3 py-1 rounded-full ${
            !categoryFilter ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Allt
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/verkefni?category=${category.id}`}
            className={`px-3 py-1 rounded-full ${
              categoryFilter === category.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {category.name}
          </Link>
        ))}
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">
            {categoryFilter
              ? "Engin verkefni fundust í þessum flokki"
              : "Engin verkefni fundust"}
          </p>
          {user && (
            <Link
              href="/verkefni/nyr"
              className="text-blue-500 underline mt-2 inline-block"
            >
              Búa til nýtt verkefni
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task, index) => (
              <Link key={task.id} href={`/verkefni/${task.id}`}>
                <div 
                  className={`task-item rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-5px] border-l-4 ${
                    task.completed 
                      ? "border-green-500" 
                      : task.due_date && new Date(task.due_date) < new Date() 
                        ? "border-red-500" 
                        : "border-blue-500"
                  }`}
                  style={{ "--animation-order": index % 6 } as any}
                >
                  {/* Task Image - If available */}
                  {task.image_url && (
                    <div className="relative h-40 w-full bg-gray-100">
                      <Image
                        src={task.image_url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                      {/* Status badge - absolute positioned over the image */}
                      <div className="absolute top-2 right-2">
                        {task.completed ? (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Lokið
                          </span>
                        ) : task.due_date && new Date(task.due_date) < new Date() ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Útrunnið
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 
                        className={`text-lg font-medium mb-1 ${
                          task.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      
                      {/* Only show status badge if no image (otherwise shown over image) */}
                      {!task.image_url && task.completed && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Lokið
                        </span>
                      )}
                      {!task.image_url && !task.completed && task.due_date && new Date(task.due_date) < new Date() && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Útrunnið
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 text-sm">
                      {task.category_name && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {task.category_name}
                        </span>
                      )}
                      
                      {task.due_date && (
                        <span className={`flex items-center ${
                          !task.completed && new Date(task.due_date) < new Date() 
                            ? "text-red-500" 
                            : "text-gray-500"
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{task.tags.length - 3} fleiri
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center bg-white px-4 py-3 rounded-md shadow">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md mr-2 bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                >
                  Fyrri
                </button>
                <div className="flex items-center">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 mx-1 rounded-full ${
                        page === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                >
                  Næsta
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Main Tasks Page component with Suspense
export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
        <div className="flex gap-2 mb-6">
          <div className="h-8 bg-gray-300 rounded-full w-16"></div>
          <div className="h-8 bg-gray-300 rounded-full w-20"></div>
          <div className="h-8 bg-gray-300 rounded-full w-24"></div>
        </div>
        <div className="h-20 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-20 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-20 bg-gray-300 rounded w-full mb-4"></div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
