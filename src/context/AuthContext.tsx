import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'HEALTHCARE' | 'ENGINEER' | 'ADMIN' | null;

interface AuthContextType {
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  getAccentColor: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  const login = (newRole: UserRole) => {
    setRole(newRole);
  };

  const logout = () => {
    setRole(null);
  };

  const getAccentColor = () => {
    switch (role) {
      case 'HEALTHCARE': return 'clinical-green';
      case 'ENGINEER': return 'tech-navy';
      case 'ADMIN': return 'system-red';
      default: return 'primary';
    }
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, getAccentColor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
