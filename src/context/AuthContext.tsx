"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, user: User) => void;
    logout: () => void;
    register: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('hydrostack_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (email: string, mockUser: User) => {
        // In a real app, we would validate credentials against a backend.
        // Here we just set the user state.
        setUser(mockUser);
        localStorage.setItem('hydrostack_user', JSON.stringify(mockUser));
        router.push('/dashboard');
    };

    const register = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('hydrostack_user', JSON.stringify(newUser));
        router.push('/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hydrostack_user');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
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
