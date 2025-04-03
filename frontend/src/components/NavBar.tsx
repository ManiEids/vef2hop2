"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Velur virkan tengil
  const isActive = (path: string) => {
    return pathname === path ? "font-bold text-blue-400" : "";
  };

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-400">
            Verkefnalisti
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className={`hover:text-blue-400 ${isActive("/")}`}>
              Forsíða
            </Link>
            <Link href="/verkefni" className={`hover:text-blue-400 ${isActive("/verkefni")}`}>
              Verkefni
            </Link>
            <Link href="/flokkar" className={`hover:text-blue-400 ${isActive("/flokkar")}`}>
              Flokkar
            </Link>
            
            {user ? (
              <>
                <Link href="/myndir" className={`hover:text-blue-400 ${isActive("/myndir")}`}>
                  Myndir
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className={`hover:text-blue-400 ${isActive("/admin")}`}>
                    Stjórnborð
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm">{user.name}</span>
                  <button 
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Útskrá
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/innskraning"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Innskráning
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
