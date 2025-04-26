import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AdvisorCard } from './AdvisorCard';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Advisor } from '../types';

interface AdvisorSectionProps {
  title: string;
  type: 'SEBI' | 'MFD';
}

export function AdvisorSection({ title, type }: AdvisorSectionProps) {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdvisors() {
      try {
        const { data: advisorData, error: advisorError } = await supabase
          .from('advisor_profiles')
          .select('*')
          .eq('registration_type', type)
          .eq('is_verified', true)
          .limit(6);
        // .from('advisors')
        // .select(`
        //   *,
        //   users (
        //     full_name,
        //     email,
        //     phone
        //   )
        // `)
        // .eq('registration_type', type)
        // .eq('is_verified', true)
        // .limit(6);

        if (advisorError) {
          console.error('Error fetching advisors:', advisorError);
          return;
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
            ? ratings[advisor.advisor_id].sum / ratings[advisor.advisor_id].count
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
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvisors();
  }, [type]);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <a
            href={`/${type === 'SEBI' ? 'analysts' : 'distributors'}`}
            className="group flex items-center text-blue-600 hover:text-blue-700"
          >
            See All
            <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisors.map((advisor) => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
