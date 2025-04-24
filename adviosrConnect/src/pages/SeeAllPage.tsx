import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SearchBar } from '../components/SearchBar';
import { FilterSection } from '../components/FilterSection';
import { AdvisorCard } from '../components/AdvisorCard';
import { supabase } from '../lib/supabase';
import type { Advisor } from '../types';

interface SeeAllPageProps {
  type: 'analyst' | 'distributor';
}

export function SeeAllPage({ type }: SeeAllPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdvisors() {
      try {
        const { data: advisorData, error: advisorError } = await supabase
          .from('advisor_profiles')
          .select('*')
          .eq('registration_type', type === 'analyst' ? 'SEBI' : 'MFD')
          .eq('is_verified', true);
        // .from('advisors')
        // .select(`
        //   *,
        //   users (
        //     full_name,
        //     email,
        //     phone
        //   )
        // `)
        // .eq('registration_type', type === 'analyst' ? 'SEBI' : 'MFD')
        // .eq('is_verified', true);

        if (advisorError) {
          throw advisorError;
        }

        // Get reviews for rating calculation
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('advisor_reviews')
          .select('advisor_id, rating');

        if (reviewsError) {
          throw reviewsError;
        }

        // Calculate average ratings
        const ratings = reviewsData.reduce((acc, review) => {
          acc[review.advisor_id] = acc[review.advisor_id] || {
            sum: 0,
            count: 0,
          };
          acc[review.advisor_id].sum += review.rating;
          acc[review.advisor_id].count += 1;
          return acc;
        }, {} as Record<string, { sum: number; count: number }>);

        const formattedAdvisors: Advisor[] = advisorData.map((advisor) => ({
          id: advisor.advisor_id,
          name: advisor?.full_name || 'Unknown Advisor',
          type:
            advisor.registration_type === 'SEBI' ? 'analyst' : 'distributor',
          yearsOfExperience: advisor.years_of_experience || 0,
          languages: advisor.languages || [],
          imageUrl:
            advisor.profile_picture_url ||
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          rating: ratings[advisor.advisor_id]
            ? ratings[advisor.advisor_id].sum /
              ratings[advisor.advisor_id].count
            : 0,
          reviewCount: ratings[advisor.advisor_id]?.count || 0,
          about: advisor.about_me || '',
          sebiNumber:
            advisor.registration_type === 'SEBI'
              ? advisor.registration_number
              : undefined,
          arnNumber:
            advisor.registration_type === 'MFD'
              ? advisor.registration_number
              : undefined,
          verifications: ['KYC', advisor.registration_type],
        }));

        setAdvisors(formattedAdvisors);
      } catch (err) {
        console.error('Error fetching advisors:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load advisors'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAdvisors();
  }, [type]);

  const filteredAdvisors = useMemo(() => {
    return advisors.filter((advisor) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        advisor.name.toLowerCase().includes(searchLower) ||
        (advisor.type === 'analyst' &&
          advisor.sebiNumber?.toLowerCase().includes(searchLower)) ||
        (advisor.type === 'distributor' &&
          advisor.arnNumber?.toLowerCase().includes(searchLower));

      // Language filter
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.some((lang) => advisor.languages.includes(lang));

      // Experience filter
      const matchesExperience =
        selectedExperience.length === 0 ||
        selectedExperience.some((exp) => {
          if (exp === '0-5') return advisor.yearsOfExperience <= 5;
          if (exp === '5-10')
            return (
              advisor.yearsOfExperience > 5 && advisor.yearsOfExperience <= 10
            );
          return advisor.yearsOfExperience > 10;
        });

      return matchesSearch && matchesLanguage && matchesExperience;
    });
  }, [advisors, searchQuery, selectedLanguages, selectedExperience]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-12 w-full bg-gray-200 rounded"></div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">
            {type === 'analyst'
              ? 'SEBI Registered Analysts'
              : 'Mutual Fund Distributors'}
          </h1>
          <p className="text-gray-600">
            Find and connect with verified financial experts for personalized
            guidance
          </p>
        </div>

        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search by name or ${
              type === 'analyst' ? 'SEBI registration number' : 'ARN number'
            }`}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <FilterSection
              selectedLanguages={selectedLanguages}
              selectedExperience={selectedExperience}
              onLanguageChange={setSelectedLanguages}
              onExperienceChange={setSelectedExperience}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 text-gray-600">
              {filteredAdvisors.length}{' '}
              {filteredAdvisors.length === 1 ? 'result' : 'results'} found
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAdvisors.map((advisor) => (
                <AdvisorCard key={advisor.id} advisor={advisor} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
