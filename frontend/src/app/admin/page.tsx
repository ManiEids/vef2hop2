"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Bíða eftir að gögn um notanda séu til staðar
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/innskraning");
    } else if (!authLoading && user && !user.isAdmin) {
      router.push("/ekki-heimild");
    }
  }, [authLoading, user, router]);
  
  if (authLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-64"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }
  
  // Ef notandi er ekki admin eða er ekki innskráður, ekki birta neitt
  if (!user || !user.isAdmin) {
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Stjórnborð</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Verkefni</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/verkefni" 
                className="text-blue-500 hover:underline"
              >
                Skoða öll verkefni
              </Link>
            </li>
            <li>
              <Link 
                href="/verkefni/nyr" 
                className="text-blue-500 hover:underline"
              >
                Bæta við nýju verkefni
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Flokkar</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/flokkar" 
                className="text-blue-500 hover:underline"
              >
                Skoða alla flokka
              </Link>
            </li>
            <li>
              <Link 
                href="/flokkar/nyr" 
                className="text-blue-500 hover:underline"
              >
                Bæta við nýjum flokki
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Myndir</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/myndir" 
                className="text-blue-500 hover:underline"
              >
                Myndasíða
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Notendur</h2>
          <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet</p>
          <div className="text-sm text-gray-500">
            <p>Lorem ipsum: {user.name}</p>
            <p>Lorem ipsum: {user.email}</p>
            <p>Lorem ipsum: Stjórnandi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
