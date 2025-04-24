import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Star,
  Languages,
  CheckCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ServicePackageCard } from '../components/ServicePackageCard';
import { BookingModal } from '../components/BookingModal';
import { supabase } from '../lib/supabase';
import type { Advisor, Review, ServicePackage } from '../types';

export function AdvisorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch advisor data
        const { data: advisorData, error: advisorError } = await supabase
          .from('advisor_profiles')
          .select('*')
          .eq('advisor_id', id)
          .single();

          // .from('advisors')
          // .select(`
          //   *,
          //   users (
          //     id,
          //     email,
          //     full_name,
          //     phone
          //   )
          // `)
          // .eq('id', id)
          // .single();

        if (advisorError) {
          throw advisorError;
        }

        if (!advisorData) {
          throw new Error('Advisor not found');
        }

        // Fetch advisor packages
        const { data: packagesData, error: packagesError } = await supabase
          .from('advisor_packages')
          .select('*')
          .eq('advisor_id', id)
          .order('price');

        if (packagesError) {
          throw packagesError;
        }

        // Fetch advisor reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('advisor_review_details')
          .select('*')
          .eq('advisor_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          throw reviewsError;
        }

        const formattedAdvisor: Advisor = {
          id: advisorData.advisor_id,
          name: advisorData?.full_name || 'Unknown Advisor',
          type: advisorData.registration_type === 'SEBI' ? 'analyst' : 'distributor',
          yearsOfExperience: advisorData.years_of_experience || 0,
          languages: advisorData.languages || [],
          imageUrl: advisorData.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          rating: reviewsData.length > 0 
            ? reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length 
            : 0,
          reviewCount: reviewsData.length,
          about: advisorData.about_me || '',
          sebiNumber: advisorData.registration_type === 'SEBI' ? advisorData.registration_number : undefined,
          arnNumber: advisorData.registration_type === 'MFD' ? advisorData.registration_number : undefined,
          verifications: ['KYC', advisorData.registration_type],
          longBio: advisorData.about_me || '',
        };

        const formattedPackages: ServicePackage[] = packagesData.map(pkg => ({
          id: pkg.id,
          title: pkg.title,
          description: pkg.subtitle || '',
          duration: pkg.duration,
          price: pkg.price,
          features: pkg.features || [],
        }));

        const formattedReviews: Review[] = reviewsData.map(review => ({
          id: review.id,
          advisorId: review.advisor_id,
          userName: review.reviewer_name || 'Anonymous',
          rating: review.rating,
          comment: review.comment || '',
          date: review.created_at || '',
        }));

        setAdvisor(formattedAdvisor);
        setPackages(formattedPackages);
        setReviews(formattedReviews);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load advisor profile');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    } else {
      setError('Advisor ID is required');
      setLoading(false);
    }
  }, [id]);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const handlePackageSelect = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading advisor profile...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !advisor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Failed to load advisor profile'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Return to Home
            </button>
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
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center space-x-4">
                <img
                  src={advisor.imageUrl}
                  alt={advisor.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold">{advisor.name}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{advisor.rating.toFixed(1)} ({advisor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>
                    {advisor.type === 'analyst'
                      ? `SEBI Registered (${advisor.sebiNumber})`
                      : `ARN Registered (${advisor.arnNumber})`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Languages className="h-5 w-5 text-gray-600" />
                  <span>{advisor.languages.join(', ')}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {advisor.verifications.map((verification) => (
                    <span
                      key={verification}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      ✓ {verification}
                    </span>
                  ))}
                </div>

                <p className="text-gray-600">{advisor.about}</p>
              </div>
            </div>

            {/* About Me Section */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">About Me</h2>
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showFullBio ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className={`mt-4 overflow-hidden transition-all duration-300 ${
                showFullBio ? 'max-h-none' : 'max-h-32'
              }`}>
                <p className="text-gray-600">{advisor.longBio}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Service Packages */}
          <div>
            <h2 className="mb-6 text-2xl font-bold">Book a Session</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {packages.map((pkg) => (
                <ServicePackageCard
                  key={pkg.id}
                  package={pkg}
                  onSelect={() => handlePackageSelect(pkg)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold">Customer Reviews</h2>
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.userName}</span>
                    <div className="flex items-center text-yellow-400">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              {showAllReviews ? 'Show Less' : 'Show More Reviews'}
            </button>
          )}
        </div>
      </main>

      {selectedPackage && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedPackage(null);
          }}
          packageTitle={selectedPackage.title}
          packagePrice={selectedPackage.price}
          duration={selectedPackage.duration}
        />
      )}

      <Footer />
    </div>
  );
}