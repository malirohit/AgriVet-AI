import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import axios from 'axios';
// import { authenticate } from '@/data/mockData';

interface AuthContextType {

  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: 'farmer' | 'doctor', city: string, district: string, village: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

}

const AuthContext = createContext<AuthContextType | null>(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL + "/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // const login = useCallback((email: string, password: string) => {
  //   const found = authenticate(email, password);
  //   if (found) {
  //     setUser(found);
  //     localStorage.setItem('vetai_user', JSON.stringify(found));
  //     return true;
  //   }
  //   return false;
  // }, []);

  // const signup = useCallback((name: string, email: string, _password: string, role: 'farmer' | 'doctor') => {
  //   const newUser: User = {
  //     id: `user-${Date.now()}`,
  //     name,
  //     email,
  //     role,
  //   };
  //   setUser(newUser);
  //   localStorage.setItem('vetai_user', JSON.stringify(newUser));
  //   return true;
  // }, []);

  // const logout = useCallback(() => {
  //   setUser(null);
  //   localStorage.removeItem('vetai_user');
  // }, []);

  // Restore auth on refresh
  useEffect(() => {

    const storedToken = localStorage.getItem("userToken");
    const storedUser = localStorage.getItem("userData");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

      // axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {

    try {

      const res = await axios.post(`${backendUrl}/auth/login`, { email, password });

      if (!res.data.success) {
        return { success: false, error: res.data.message };
      }

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);

      return { success: true };

    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Login failed" };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string,
    village: string,
    city: string,
    district: string,
    ) => {
    try {

      const res = await axios.post(`${backendUrl}/auth/register`, {
        name,
        email,
        password,
        role,
        village,
        city,
        district
      });

      if (!res.data.success) {
        return { success: false, error: res.data.message };
      }

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);

      return { success: true };

    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Signup failed" };
    }
  };

  const logout = () => {

    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, signup, logout, }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {

  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used within AuthProvider');

  return ctx;

};
