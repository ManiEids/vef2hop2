"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// fyrir search parametra
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, loading } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Vinsamlegast fylltu út alla reiti");
      return;
    }
    
    const success = await login(email, password);
    
    if (success) {
      router.push("/verkefni");
    } else {
      setError("Rangt notandanafn eða lykilorð");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Innskráning</h1>
      
      {registered && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Nýskráning tókst! Þú getur nú skráð þig inn.
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Prófunaraðgangur upplýsingar */}
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
        <h2 className="font-semibold mb-2">Prófunaraðgangar fyrir verkefnið:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Stjórnandi:</strong> notandanafn: <code className="bg-gray-200 px-1">admin</code>, 
            lykilorð: <code className="bg-gray-200 px-1">admin</code>
            <div className="text-sm mt-1">Hefur fullan aðgang að öllum aðgerðum kerfisins, þ.m.t. stjórnborð og umsjón með flokkum</div>
          </li>
          <li>
            <strong>Venjulegur notandi:</strong> notandanafn: <code className="bg-gray-200 px-1">user</code>, 
            lykilorð: <code className="bg-gray-200 px-1">user</code>
            <div className="text-sm mt-1">Hefur takmarkaðan aðgang - getur skoðað og búið til verkefni en hefur ekki aðgang að stjórnborði og getur ekki búið til nýja flokka</div>
          </li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Netfang / Notandanafn
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Lykilorð
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {loading ? "Hleður..." : "Skrá inn"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Ekki með aðgang?{" "}
          <Link href="/nyskraning" className="text-blue-500 hover:underline">
            Nýskrá
          </Link>
        </p>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function Login() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-6"></div>
          <div className="h-24 bg-gray-300 rounded mb-4"></div>
          <div className="h-10 bg-gray-300 rounded mb-4"></div>
          <div className="h-10 bg-gray-300 rounded mb-6"></div>
          <div className="h-12 bg-gray-300 rounded"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
