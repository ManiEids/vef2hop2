"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  category_id?: string;
  category_name?: string;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  tags?: string[];
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskData = await TaskService.getById(params.id);
        setTask(taskData);
      } catch (err) {
        setError("Villa kom upp við að sækja verkefni");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Ertu viss um að þú viljir eyða þessu verkefni?")) {
      return;
    }

    try {
      setDeleting(true);
      await TaskService.delete(params.id);
      router.push("/verkefni");
    } catch (err) {
      setError("Villa kom upp við að eyða verkefni");
      console.error(err);
      setDeleting(false);
    }
  };

  const toggleComplete = async () => {
    if (!task) return;

    try {
      await TaskService.update(task.id, { 
        completed: !task.completed 
      });
      
      setTask({
        ...task,
        completed: !task.completed
      });
    } catch (err) {
      setError("Villa kom upp við að uppfæra verkefni");
      console.error(err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("is-IS");
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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <div className="mt-4">
          <Link 
            href="/verkefni"
            className="text-blue-500 underline"
          >
            Til baka í verkefnalista
          </Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-lg">Verkefni fannst ekki</p>
        <Link 
          href="/verkefni"
          className="text-blue-500 underline mt-2 inline-block"
        >
          Til baka í verkefnalista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <Link 
          href="/verkefni" 
          className="text-blue-500 hover:underline mb-4 inline-block"
        >
          ← Til baka
        </Link>
        
        {user && (
          <div className="flex gap-2">
            <button 
              onClick={toggleComplete}
              className={`px-4 py-2 rounded ${
                task.completed 
                  ? "bg-yellow-500 hover:bg-yellow-600" 
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {task.completed ? "Merkja ólokið" : "Merkja lokið"}
            </button>
            <Link 
              href={`/verkefni/${task.id}/breyta`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Breyta
            </Link>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-red-300"
            >
              {deleting ? "Eyðir..." : "Eyða"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <h1 className={`text-3xl font-bold ${task.completed ? "line-through text-gray-500" : ""}`}>
            {task.title}
          </h1>
          {task.completed && (
            <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              Lokið
            </span>
          )}
        </div>
        
        {task.category_name && (
          <div className="mb-4">
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              {task.category_name}
            </span>
          </div>
        )}
        
        {task.due_date && (
          <div className="mb-6 text-sm text-gray-600">
            <strong>Lokadagur:</strong> {formatDate(task.due_date)}
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {task.description && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Lýsing</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}
        
        {task.image_url && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Mynd</h2>
            <div className="relative h-60 w-full">
              <Image 
                src={task.image_url} 
                alt={task.title}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-md"
              />
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
          <p>Búið til: {formatDate(task.created_at)}</p>
          {task.updated_at && task.updated_at !== task.created_at && (
            <p>Síðast uppfært: {formatDate(task.updated_at)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
