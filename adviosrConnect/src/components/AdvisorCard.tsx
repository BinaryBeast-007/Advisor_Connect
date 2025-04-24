import React, { useState, useEffect } from 'react';
import { Star, Languages, CheckCircle, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Advisor } from '../types';

interface AdvisorCardProps {
  advisor: Advisor;
}

export function AdvisorCard({ advisor }: AdvisorCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkBookmarkStatus() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data } = await supabase
        .from('advisor_bookmarks')
        .select('id')
        .eq('advisor_id', advisor.id)
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      setIsBookmarked(!!data);
    }

    checkBookmarkStatus();
  }, [advisor.id]);

  const handleBookmarkToggle = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        await supabase
          .from('advisor_bookmarks')
          .delete()
          .eq('advisor_id', advisor.id)
          .eq('user_id', session.session.user.id);
        setIsBookmarked(false);
      } else {
        // Check if user profile exists
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.session.user.id)
          .maybeSingle();

        if (userError || !userData) {
          // Redirect to signup page if user profile doesn't exist
          window.location.href = '/signup';
          return;
        }

        // If user profile exists, create the bookmark
        const { error: bookmarkError } = await supabase
          .from('advisor_bookmarks')
          .insert({
            advisor_id: advisor.id,
            user_id: session.session.user.id,
          });

        if (!bookmarkError) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="absolute right-4 top-4">
        <button
          onClick={handleBookmarkToggle}
          disabled={loading}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 disabled:cursor-not-allowed"
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current text-blue-600' : ''}`} />
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <img
          src={advisor.imageUrl}
          alt={advisor.name}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{advisor.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{advisor.rating.toFixed(1)} ({advisor.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{advisor.type === 'analyst' ? 'SEBI Registered' : 'ARN Registered'}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Languages className="h-4 w-4 text-gray-500" />
          <span>{advisor.languages.join(', ')}</span>
        </div>

        <div className="text-sm text-gray-600">
          {advisor.yearsOfExperience} years of experience
        </div>
      </div>

      <a 
        href={`/advisor/${advisor.id}`}
        className="mt-4 block w-full rounded-full bg-blue-600 py-2 text-center text-white transition-colors hover:bg-blue-700"
      >
        View Profile
      </a>
    </div>
  );
}