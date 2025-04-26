import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  scheduled_at: string;
  status: 'completed' | 'cancelled' | 'booked';
  advisor: {
    id: string;
    full_name: string;
    profile_picture_url: string;
  };
  package: {
    title: string;
    duration: number;
  };
  review?: {
    rating: number;
    comment: string | null;
  };
}

export function CallHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        // Fetch bookings with advisor, package, and review details
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_at,
            status,
            advisor_id,
            advisor:advisor_profiles!bookings_advisor_id_fkey(
              advisor_id,
              full_name,
              profile_picture_url
            ),
            package:advisor_packages!inner(
              title,
              duration
            ),
            advisor_reviews(
              rating,
              comment
            )
          `)
          .eq('customer_id', session.user.id)
          .lt('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          return;
        }

        // Format the bookings data
        const formattedBookings = (bookingsData || []).map(booking => ({
          id: booking.id,
          scheduled_at: booking.scheduled_at,
          status: booking.status,
          advisor: {
            id: booking.advisor_id,
            full_name: booking.advisor?.full_name || 'Unknown Advisor',
            profile_picture_url: booking.advisor?.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          },
          package: {
            title: booking.package.title,
            duration: booking.package.duration,
          },
          review: booking.advisor_reviews?.[0] ? {
            rating: booking.advisor_reviews[0].rating,
            comment: booking.advisor_reviews[0].comment
          } : undefined
        }));

        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleSubmitReview = async (bookingId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    try {
      // Upsert the review into advisor_reviews table
      const { error } = await supabase
        .from('advisor_reviews')
        .upsert({
          advisor_id: booking.advisor.id,
          customer_id: session.user.id,
          rating,
          comment,
          booking_id: bookingId  // Add booking_id reference
        }, {
          onConflict: 'advisor_id,customer_id,booking_id'
        });

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            review: {
              rating,
              comment
            }
          };
        }
        return b;
      }));

      setReviewingBookingId(null);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

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
        <p className="text-gray-600">No call history available.</p>
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
                src={booking.advisor.profile_picture_url}
                alt={booking.advisor.full_name}
                className="h-12 w-12 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
                }}
              />
              <div>
                <h3 className="font-medium">{booking.advisor.full_name}</h3>
                <p className="text-sm text-gray-600">{booking.package.title} ({booking.package.duration} mins)</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      booking.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(booking.scheduled_at), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {booking.status === 'completed' && !booking.review && reviewingBookingId !== booking.id && (
            <div className="mt-4">
              <button
                onClick={() => setReviewingBookingId(booking.id)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5"
                      fill="none"
                    />
                  ))}
                </div>
                <span>Rate this consultation</span>
              </button>
            </div>
          )}

          {reviewingBookingId === booking.id && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className="h-6 w-6 text-yellow-400"
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none focus:ring"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setReviewingBookingId(null);
                    setRating(0);
                    setComment('');
                  }}
                  className="rounded-lg px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReview(booking.id)}
                  disabled={!rating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}

          {booking.review && (
            <div className="mt-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-yellow-400"
                    fill={star <= booking.review!.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              {booking.review.comment && (
                <p className="mt-2 text-sm text-gray-600">{booking.review.comment}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import { Star } from 'lucide-react';
// import { supabase } from '../lib/supabase';

// interface Booking {
//   id: string;
//   scheduled_at: string;
//   status: 'completed' | 'cancelled' | 'booked';
//   advisor: {
//     id: string;
//     full_name: string;
//     profile_picture_url: string;
//   };
//   package: {
//     title: string;
//     duration: number;
//   };
//   review?: {
//     rating: number;
//     comment: string;
//   };
// }

// export function CallHistory() {
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState('');

//   useEffect(() => {
//     async function fetchBookings() {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session?.user) return;

//       try {
//         // First, fetch the bookings with advisor and package details
//         const { data: bookingsData, error: bookingsError } = await supabase
//           .from('bookings')
//           .select(`
//             id,
//             scheduled_at,
//             status,
//             advisor_id,
//             advisor:advisor_profiles!inner(
//               advisor_id,
//               full_name,
//               profile_picture_url
//             ),
//             package:advisor_packages!inner(
//               title,
//               duration
//             )
//           `)
//           .eq('customer_id', session.user.id)
//           .lt('scheduled_at', new Date().toISOString())
//           .order('scheduled_at', { ascending: false });

//         if (bookingsError) {
//           console.error('Error fetching bookings:', bookingsError);
//           return;
//         }

//         if (!bookingsData) {
//           setBookings([]);
//           setLoading(false);
//           return;
//         }

//         // Then, fetch reviews for these bookings
//         const { data: reviewsData, error: reviewsError } = await supabase
//           .from('advisor_reviews')
//           .select('advisor_id, rating, comment')
//           .eq('customer_id', session.user.id)
//           .in('advisor_id', bookingsData.map(b => b.advisor_id));

//         if (reviewsError) {
//           console.error('Error fetching reviews:', reviewsError);
//           return;
//         }

//         // Create a map of advisor_id to review
//         const reviewMap = new Map(
//           reviewsData?.map(review => [review.advisor_id, review]) || []
//         );

//         // Combine bookings with their reviews
//         const bookingsWithReviews = bookingsData.map(booking => ({
//           id: booking.id,
//           scheduled_at: booking.scheduled_at,
//           status: booking.status,
//           advisor: {
//             id: booking.advisor_id,
//             full_name: booking.advisor.full_name,
//             profile_picture_url: booking.advisor.profile_picture_url,
//           },
//           package: {
//             title: booking.package.title,
//             duration: booking.package.duration,
//           },
//           review: reviewMap.get(booking.advisor_id) ? {
//             rating: reviewMap.get(booking.advisor_id)!.rating,
//             comment: reviewMap.get(booking.advisor_id)!.comment,
//           } : undefined,
//         }));

//         setBookings(bookingsWithReviews);
//       } catch (error) {
//         console.error('Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchBookings();
//   }, []);

//   const handleSubmitReview = async (bookingId: string) => {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session?.user) return;

//     const booking = bookings.find(b => b.id === bookingId);
//     if (!booking) return;

//     try {
//       const { error } = await supabase
//         .from('advisor_reviews')
//         .insert({
//           advisor_id: booking.advisor.id,
//           customer_id: session.user.id,
//           rating,
//           comment,
//         });

//       if (error) throw error;

//       // Update local state
//       setBookings(bookings.map(b => {
//         if (b.id === bookingId) {
//           return {
//             ...b,
//             review: {
//               rating,
//               comment,
//             },
//           };
//         }
//         return b;
//       }));

//       setReviewingBookingId(null);
//       setRating(0);
//       setComment('');
//     } catch (error) {
//       console.error('Error submitting review:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="animate-pulse space-y-4">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
//         ))}
//       </div>
//     );
//   }

//   if (bookings.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-600">No call history available.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {bookings.map((booking) => (
//         <div key={booking.id} className="rounded-lg bg-white p-6 shadow-md">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <img
//                 src={booking.advisor.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
//                 alt={booking.advisor.full_name}
//                 className="h-12 w-12 rounded-full object-cover"
//               />
//               <div>
//                 <h3 className="font-medium">{booking.advisor.full_name}</h3>
//                 <p className="text-sm text-gray-600">{booking.package.title}</p>
//                 <div className="mt-1 flex items-center space-x-2">
//                   <span
//                     className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
//                       booking.status === 'completed'
//                         ? 'bg-green-100 text-green-800'
//                         : booking.status === 'cancelled'
//                         ? 'bg-red-100 text-red-800'
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}
//                   >
//                     {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     {format(new Date(booking.scheduled_at), 'MMM d, yyyy • h:mm a')}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {booking.status === 'completed' && !booking.review && reviewingBookingId !== booking.id && (
//             <div className="mt-4">
//               <button
//                 onClick={() => setReviewingBookingId(booking.id)}
//                 className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
//               >
//                 <div className="flex">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <Star
//                       key={star}
//                       className="h-5 w-5"
//                       fill="none"
//                     />
//                   ))}
//                 </div>
//                 <span>Rate this consultation</span>
//               </button>
//             </div>
//           )}

//           {reviewingBookingId === booking.id && (
//             <div className="mt-4 space-y-4">
//               <div className="flex items-center space-x-1">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <button
//                     key={star}
//                     onClick={() => setRating(star)}
//                     className="focus:outline-none"
//                   >
//                     <Star
//                       className="h-6 w-6 text-yellow-400"
//                       fill={star <= rating ? 'currentColor' : 'none'}
//                     />
//                   </button>
//                 ))}
//               </div>
//               <textarea
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Write your review..."
//                 className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none focus:ring"
//                 rows={3}
//               />
//               <div className="flex justify-end space-x-2">
//                 <button
//                   onClick={() => {
//                     setReviewingBookingId(null);
//                     setRating(0);
//                     setComment('');
//                   }}
//                   className="rounded-lg px-4 py-2 text-gray-600 hover:text-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleSubmitReview(booking.id)}
//                   disabled={!rating}
//                   className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   Submit Review
//                 </button>
//               </div>
//             </div>
//           )}

//           {booking.review && (
//             <div className="mt-4">
//               <div className="flex items-center space-x-1">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <Star
//                     key={star}
//                     className="h-5 w-5 text-yellow-400"
//                     fill={star <= booking.review.rating ? 'currentColor' : 'none'}
//                   />
//                 ))}
//               </div>
//               {booking.review.comment && (
//                 <p className="mt-2 text-sm text-gray-600">{booking.review.comment}</p>
//               )}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }