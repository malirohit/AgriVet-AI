import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { User } from '@/types';

import axios from 'axios';

type DoctorAvailability = {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
};

interface AuthContextType {

  user: User | null;

  token: string | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  signup: (


    profilePicture: File | null,

    name: string,

    email: string,

    contactNumber: string,

    password: string,

    role: 'farmer' | 'doctor',

    village: string,

    city: string,

    district: string,

    doctorAvailability?: DoctorAvailability,

  ) => Promise<{ success: boolean; error?: string }>;

  logout: () => void;

}

const AuthContext = createContext<AuthContextType | null>(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL + "/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const storedToken = localStorage.getItem("userToken");

    const storedUser = localStorage.getItem("userData");

    if (storedToken && storedUser) {

      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

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

    profilePicture: File | null,
    name: string,
    email: string,
    contactNumber: string,
    password: string,
    role: string, // 'farmer' | 'doctor',
    village: string,
    city: string,
    district: string,
    doctorAvailability?: DoctorAvailability,

  ) => {
    try {

      const formData = new FormData();

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      formData.append("name", name);
      formData.append("email", email);
      formData.append("contactNumber", contactNumber);
      formData.append("password", password);
      formData.append("role", role);
      formData.append("village", village);
      formData.append("city", city);
      formData.append("district", district);

      formData.append(
        "doctorAvailability",
        JSON.stringify(doctorAvailability || {})
      );

      const res = await axios.post(
        `${backendUrl}/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
