import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Home,
  Calendar,
  Clock,
  Bookmark,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface SidebarLink {
  icon: React.ElementType;
  label: string;
  href: string;
}

const sidebarLinks: SidebarLink[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Upcoming Calls', href: '/dashboard/upcoming' },
  { icon: Clock, label: 'Call History', href: '/dashboard/history' },
  { icon: Bookmark, label: 'Bookmarked Advisors', href: '/dashboard/bookmarks' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        setUserName(userData.full_name);
      }
    }

    fetchUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">AdvisorConnect</span>
          </Link>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <div className="font-medium">{userName || 'User'}</div>
              <Link to="/dashboard/profile" className="text-sm text-blue-600 hover:text-blue-700">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border-t pt-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="container mx-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}