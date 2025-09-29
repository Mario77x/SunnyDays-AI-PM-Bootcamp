import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name'>>) => Promise<boolean>;
  isLoading: boolean;
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
    // Check for stored user session
    const storedUser = localStorage.getItem('sunnydays_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in frontend-only mode, we'll accept any valid email/password
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('sunnydays_users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('sunnydays_user', JSON.stringify(existingUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('sunnydays_users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);
    
    if (existingUser) {
      setIsLoading(false);
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
    setIsLoading(false);
    return true;
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name'>>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Update user object
      const updatedUser = { ...user, ...updates };
      
      // Update in users list
      const users = JSON.parse(localStorage.getItem('sunnydays_users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        localStorage.setItem('sunnydays_users', JSON.stringify(users));
      }
      
      // Update current user session
      localStorage.setItem('sunnydays_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sunnydays_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};