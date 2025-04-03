"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchApi } from "@/services/api";

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
          const userData = await fetchApi(`/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (userData) {
            setUser({
              id: userData.id,
              name: userData.name || userData.username,
              email: userData.email,
              isAdmin: userData.isAdmin || false,
            });
          } else {
            // Token ekki lengur gildt
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Villa við að sækja notanda:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Búum til bæði endpoint format til að styðja mismunandi bakenda
      const payload = {
        email,
        password,
        username: email // Sum API nota username í staðinn fyrir email
      };
      
      const response = await fetchApi(`/users/login`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response && (response.token || response.accessToken)) {
        // Styðjum bæði token og accessToken format
        const token = response.token || response.accessToken;
        localStorage.setItem("token", token);
        
        // Styðjum mismunandi format á user object
        const userData = response.user || response;
        
        setUser({
          id: userData.id || userData.userId || userData._id,
          name: userData.name || userData.username || email,
          email: userData.email || email,
          isAdmin: userData.admin || userData.isAdmin || false,
        });
        
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
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
