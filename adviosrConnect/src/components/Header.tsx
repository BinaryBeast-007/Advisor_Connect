import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">AdvisorConnect</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/analysts" className="text-gray-700 hover:text-blue-600">Analysts</Link>
            <Link to="/distributors" className="text-gray-700 hover:text-blue-600">Distributors</Link>
          </nav>

          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}