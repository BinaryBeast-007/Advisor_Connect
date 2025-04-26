import React, { useState, useEffect } from 'react';
import { AdvisorCard } from './AdvisorCard';
import { supabase } from '../lib/supabase';
import type { Advisor } from '../types';

export function BookmarkedAdvisors() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarkedAdvisors() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      try {
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('advisor_bookmarks')
          .select('advisor_id')
          .eq('user_id', session.session.user.id);

        if (bookmarksError) throw bookmarksError;

        if (!bookmarks || bookmarks.length === 0) {
          setAdvisors([]);
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

        setAdvisors(formattedAdvisors);
      } catch (error) {
        console.error('Error fetching bookmarked advisors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarkedAdvisors();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
        ))}
      </div>
    );
  }

  if (advisors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You haven't bookmarked any advisors yet.</p>
        <a href="/analysts" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Browse Advisors
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {advisors.map((advisor) => (
        <AdvisorCard key={advisor.id} advisor={advisor} />
      ))}
    </div>
  );
}