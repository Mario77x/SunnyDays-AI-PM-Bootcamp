import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api, API_ENDPOINTS, getAuthToken, setAuthToken, removeAuthToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name'>>) => Promise<boolean>;
  isLoading: boolean;
}

// Backend API types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface TokenResponse {
  token: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate it
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // Validate token by fetching user info
          const userResponse = await api.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
          const userData: User = {
            id: userResponse.id,
            email: userResponse.email,
            name: userResponse.name,
            createdAt: new Date(), // We don't get this from backend yet
            language: 'nl' // Default language, could be stored in backend later
          };
          setUser(userData);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Remove invalid token
          removeAuthToken();
          // Also clear localStorage fallback
          localStorage.removeItem('sunnydays_user');
        }
      } else {
        // Fallback: check for stored user session in localStorage
        const storedUser = localStorage.getItem('sunnydays_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const loginData: LoginRequest = { email, password };
      const response = await api.post<TokenResponse>(API_ENDPOINTS.AUTH.LOGIN, loginData);
      
      // Store the token
      setAuthToken(response.token);
      
      // Fetch user info
      const userResponse = await api.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
      const userData: User = {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        createdAt: new Date(),
        language: 'nl'
      };
      
      setUser(userData);
      
      // Also store in localStorage as backup
      localStorage.setItem('sunnydays_user', JSON.stringify(userData));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      
      // Fallback to localStorage authentication
      return loginWithLocalStorage(email, password);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const registerData: RegisterRequest = { email, password, name };
      const response = await api.post<TokenResponse>(API_ENDPOINTS.AUTH.SIGNUP, registerData);
      
      // Store the token
      setAuthToken(response.token);
      
      // Fetch user info
      const userResponse = await api.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
      const userData: User = {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        createdAt: new Date(),
        language: 'nl'
      };
      
      setUser(userData);
      
      // Also store in localStorage as backup
      localStorage.setItem('sunnydays_user', JSON.stringify(userData));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      setIsLoading(false);
      
      // Fallback to localStorage registration
      return registerWithLocalStorage(email, password, name);
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name'>>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      // Note: Backend doesn't have profile update endpoint yet
      // For now, we'll update locally and sync later when endpoint is available
      const updatedUser = { ...user, ...updates };
      
      setUser(updatedUser);
      localStorage.setItem('sunnydays_user', JSON.stringify(updatedUser));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if we have a token
      const token = getAuthToken();
      if (token) {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear all auth data
    setUser(null);
    removeAuthToken();
    localStorage.removeItem('sunnydays_user');
  };

  // Fallback localStorage functions (keeping original logic as backup)
  const loginWithLocalStorage = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('sunnydays_users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('sunnydays_user', JSON.stringify(existingUser));
      return true;
    }
    
    return false;
  };

  const registerWithLocalStorage = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('sunnydays_users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);
    
    if (existingUser) {
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date(),
      language: 'nl'
    };
    
    users.push(newUser);
    localStorage.setItem('sunnydays_users', JSON.stringify(users));
    localStorage.setItem('sunnydays_user', JSON.stringify(newUser));
    
    setUser(newUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};