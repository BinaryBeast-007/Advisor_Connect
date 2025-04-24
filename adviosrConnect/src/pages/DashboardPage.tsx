import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AdvisorCard } from '../components/AdvisorCard';
import { supabase } from '../lib/supabase';
import type { Advisor } from '../types';

export function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [bookmarkedAdvisors, setBookmarkedAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        setUserName(userData.full_name);
      }
    }

    async function fetchBookmarkedAdvisors() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      try {
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('advisor_bookmarks')
          .select(`
            advisor_id,
            advisors (
              *,
              users (
                full_name,
                email,
                phone
              )
            )
          `)
          .eq('user_id', session.session.user.id);

        if (bookmarksError) throw bookmarksError;

        // Get reviews for rating calculation
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('advisor_reviews')
          .select('advisor_id, rating');

        if (reviewsError) throw reviewsError;

        // Calculate average ratings
        const ratings = reviewsData.reduce((acc, review) => {
          acc[review.advisor_id] = acc[review.advisor_id] || { sum: 0, count: 0 };
          acc[review.advisor_id].sum += review.rating;
          acc[review.advisor_id].count += 1;
          return acc;
        }, {} as Record<string, { sum: number; count: number }>);

        const formattedAdvisors: Advisor[] = bookmarks
          .filter(bookmark => bookmark.advisors)
          .map(bookmark => {
            const advisor = bookmark.advisors;
            return {
              id: advisor.id,
              name: advisor.users?.full_name || 'Unknown Advisor',
              type: advisor.registration_type === 'SEBI' ? 'analyst' : 'distributor',
              yearsOfExperience: advisor.years_of_experience || 0,
              languages: advisor.languages || [],
              imageUrl: advisor.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
              rating: ratings[advisor.id] 
                ? ratings[advisor.id].sum / ratings[advisor.id].count 
                : 0,
              reviewCount: ratings[advisor.id]?.count || 0,
              about: advisor.about_me || '',
              sebiNumber: advisor.registration_type === 'SEBI' ? advisor.registration_number : undefined,
              arnNumber: advisor.registration_type === 'MFD' ? advisor.registration_number : undefined,
              verifications: ['KYC', advisor.registration_type],
            };
          });

        setBookmarkedAdvisors(formattedAdvisors);
      } catch (error) {
        console.error('Error fetching bookmarked advisors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
    fetchBookmarkedAdvisors();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userName || 'User'}!</h1>
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
                <p className="text-2xl font-bold">3</p>
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
                <p className="text-2xl font-bold">12</p>
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
          <h2 className="mb-6 text-lg font-semibold">Bookmarked Advisors</h2>
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
    </DashboardLayout>
  );
}