"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Athugar með innskráningu við upphaf
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: userData.id,
              name: userData.name || userData.username,
              email: userData.email,
              isAdmin: userData.admin || false,
            });
          } else {
            // Token ekki lengur gildt
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Villa við að sækja notanda:", error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setLoading(false);
        return false;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      
      setUser({
        id: data.user.id,
        name: data.user.name || data.user.username,
        email: data.user.email,
        isAdmin: data.user.admin || false,
      });
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Innskráning mistókst:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth verður að vera notað innan AuthProvider");
  }
  return context;
};
