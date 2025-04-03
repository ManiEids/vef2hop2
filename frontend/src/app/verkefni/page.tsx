"use client";

import { useState, useEffect, Suspense } from "react";
import { TaskService, CategoryService } from "@/services/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  category_id?: string;
  category_name?: string;
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
          <div className="bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="task-item"
                  style={{ "--animation-order": tasks.indexOf(task) } as any}
                >
                  <Link href={`/verkefni/${task.id}`}>
                    <div className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <span
                            className={`${
                              task.completed
                                ? "line-through text-gray-500"
                                : "font-medium"
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.completed && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Lokið
                            </span>
                          )}
                        </div>
                        {task.category_id && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mt-1 inline-block">
                            {task.category_name || getCategoryName(task.category_id)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(task.due_date)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md mr-2 bg-gray-200 disabled:opacity-50"
                >
                  Fyrri
                </button>
                <span className="mx-2">
                  Síða {page} af {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-gray-200 disabled:opacity-50"
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
