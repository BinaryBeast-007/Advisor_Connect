import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import {
  Calendar,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AdvisorCard } from '../components/AdvisorCard';
import { UpcomingCalls } from '../components/UpcomingCalls';
import { CallHistory } from '../components/CallHistory';
import { BookmarkedAdvisors } from '../components/BookmarkedAdvisors';
import { UserProfile } from '../components/UserProfile';
import { supabase } from '../lib/supabase';
import type { Advisor } from '../types';

function DashboardHome() {
  const [userName, setUserName] = useState('User');
  const [bookmarkedAdvisors, setBookmarkedAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingCalls: 0,
    totalConsultations: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate('/login');
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }

        if (userData?.full_name) {
          setUserName(userData.full_name);
        }

        // Fetch stats
        const { count: upcomingCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('customer_id', session.user.id)
          .eq('status', 'booked')
          .gte('scheduled_at', new Date().toISOString());

        const { count: totalCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('customer_id', session.user.id);

        setStats({
          upcomingCalls: upcomingCount || 0,
          totalConsultations: totalCount || 0,
        });

      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    }

    async function fetchBookmarkedAdvisors() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      try {
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('advisor_bookmarks')
          .select('advisor_id')
          .eq('user_id', session.session.user.id)
          .limit(6);

        if (bookmarksError) throw bookmarksError;

        if (!bookmarks || bookmarks.length === 0) {
          setBookmarkedAdvisors([]);
          setLoading(false);
          return;
        }

        const advisorIds = bookmarks.map(b => b.advisor_id);

        const { data: advisorData, error: advisorError } = await supabase
          .from('advisor_profiles')
          .select('*')
          .in('advisor_id', advisorIds);

        if (advisorError) throw advisorError;

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('advisor_reviews')
          .select('advisor_id, rating');

        if (reviewsError) throw reviewsError;

        const ratings = reviewsData.reduce((acc, review) => {
          acc[review.advisor_id] = acc[review.advisor_id] || { sum: 0, count: 0 };
          acc[review.advisor_id].sum += review.rating;
          acc[review.advisor_id].count += 1;
          return acc;
        }, {} as Record<string, { sum: number; count: number }>);

        const formattedAdvisors: Advisor[] = advisorData.map((advisor) => ({
          id: advisor.advisor_id,
          name: advisor?.full_name || 'Unknown Advisor',
          type: advisor.registration_type === 'SEBI' ? 'analyst' : 'distributor',
          yearsOfExperience: advisor.years_of_experience || 0,
          languages: advisor.languages || [],
          imageUrl: advisor.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          rating: ratings[advisor.advisor_id] 
            ? ratings[advisor.advisor_id].sum / ratings[advisor.advisor_id].count 
            : 0,
          reviewCount: ratings[advisor.advisor_id]?.count || 0,
          about: advisor.about_me || '',
          sebiNumber: advisor.registration_type === 'SEBI' ? advisor.registration_number : undefined,
          arnNumber: advisor.registration_type === 'MFD' ? advisor.registration_number : undefined,
          verifications: ['KYC', advisor.registration_type],
        }));

        setBookmarkedAdvisors(formattedAdvisors);
      } catch (error) {
        console.error('Error fetching bookmarked advisors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
    fetchBookmarkedAdvisors();
  }, [navigate]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-gray-600">Here's what's happening with your account.</p>
        </div>
        <Link
          to="/analysts"
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <span>Book New Call</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Calls</p>
              <p className="text-2xl font-bold">{stats.upcomingCalls}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Consultations</p>
              <p className="text-2xl font-bold">{stats.totalConsultations}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bookmarked Advisors</p>
              <p className="text-2xl font-bold">{bookmarkedAdvisors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Advisors Section */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bookmarked Advisors</h2>
          {bookmarkedAdvisors.length > 0 && (
            <Link
              to="/dashboard/bookmarks"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          )}
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
            ))}
          </div>
        ) : bookmarkedAdvisors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarkedAdvisors.map((advisor) => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No bookmarked advisors yet.</p>
            <Link
              to="/analysts"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Browse Advisors
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/upcoming" element={<UpcomingCalls />} />
        <Route path="/history" element={<CallHistory />} />
        <Route path="/bookmarks" element={<BookmarkedAdvisors />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </DashboardLayout>
  );
}