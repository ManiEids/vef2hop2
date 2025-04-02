"use client";

import { useState, useEffect } from "react";
import { TaskService } from "@/services/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  category_id?: string;
  category_name?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await TaskService.getAll(page);
        setTasks(response.items || []);
        setTotalPages(Math.ceil((response.count || 0) / 10));
      } catch (err) {
        setError("Villa kom upp við að sækja verkefni");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page]);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Verkefnalisti</h1>
        {user && (
          <Link
            href="/verkefni/nyr"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Nýtt verkefni
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Engin verkefni fundust</p>
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
                <li key={task.id}>
                  <Link href={`/verkefni/${task.id}`}>
                    <div className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <span className={`${task.completed ? "line-through text-gray-500" : "font-medium"}`}>
                            {task.title}
                          </span>
                          {task.completed && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Lokið
                            </span>
                          )}
                        </div>
                        {task.category_name && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mt-1 inline-block">
                            {task.category_name}
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
