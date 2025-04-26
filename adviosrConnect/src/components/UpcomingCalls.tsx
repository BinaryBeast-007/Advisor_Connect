import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Video, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  scheduled_at: string;
  advisor: {
    full_name: string;
    profile_picture_url: string;
  };
  package: {
    title: string;
    duration: number;
  };
}

export function UpcomingCalls() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_at,
          advisor:advisor_id(
            full_name:users!advisors_user_id_fkey(full_name),
            profile_picture_url
          ),
          package:package_id(
            title,
            duration
          )
        `)
        .eq('customer_id', session.user.id)
        .eq('status', 'booked')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at');

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      setBookings(data || []);
      setLoading(false);
    }

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No upcoming calls scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={booking.advisor.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                alt={booking.advisor.full_name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium">{booking.advisor.full_name}</h3>
                <p className="text-sm text-gray-600">{booking.package.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(booking.scheduled_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{format(new Date(booking.scheduled_at), 'h:mm a')}</span>
                <span>•</span>
                <span>{booking.package.duration} mins</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button className="flex w-full items-center justify-center space-x-2 rounded-full bg-blue-600 py-2 text-white hover:bg-blue-700">
              <Video className="h-4 w-4" />
              <span>Join Call</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}