import React, { useState, useEffect } from 'react';
import { format, parse, isSameDay } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string;
  packagePrice: number;
  duration: number;
  advisorId: string;
  packageId: string; // Added packageId prop
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Availability {
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Booking {
  scheduled_at: string;
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  packageTitle, 
  packagePrice, 
  duration,
  advisorId,
  packageId // Added packageId parameter
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);
      try {
        // Get day of week in lowercase
        const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();

        // Fetch advisor's availability for the selected day
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('advisor_availability')
          .select('start_time, end_time, is_active')
          .eq('advisor_id', advisorId)
          .eq('day_of_week', dayOfWeek)
          .maybeSingle();

        if (availabilityError) throw availabilityError;

        if (!availabilityData || !availabilityData.is_active) {
          setTimeSlots([]);
          return;
        }

        // Fetch existing bookings for the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('scheduled_at')
          .eq('advisor_id', advisorId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString());

        if (bookingsError) throw bookingsError;

        // Generate time slots
        const slots: TimeSlot[] = [];
        const startTime = parse(availabilityData.start_time, 'HH:mm:ss', new Date());
        const endTime = parse(availabilityData.end_time, 'HH:mm:ss', new Date());
        
        let currentTime = startTime;
        while (currentTime < endTime) {
          const timeString = format(currentTime, 'HH:mm');
          const isBooked = bookingsData.some(booking => 
            format(new Date(booking.scheduled_at), 'HH:mm') === timeString
          );

          slots.push({
            time: timeString,
            available: !isBooked
          });

          // Add duration minutes to current time
          currentTime = new Date(currentTime.getTime() + duration * 60000);
        }

        setTimeSlots(slots);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load available time slots');
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && advisorId) {
      fetchAvailability();
    }
  }, [selectedDate, advisorId, duration, isOpen]);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);
      
      // Get current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/login';
        return;
      }

      // Create the booking
      const bookingDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.split(':');
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          advisor_id: advisorId,
          customer_id: session.user.id,
          package_id: packageId, // Added package_id
          scheduled_at: bookingDateTime.toISOString(),
          status: 'booked'
        });

      if (bookingError) throw bookingError;

      // Close modal and refresh availability
      onClose();
      window.location.href = '/dashboard/upcoming';
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-2xl font-bold">{packageTitle}</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium">
              {format(selectedDate, 'EEEE, MMMM d')}
            </span>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 font-medium">Available Time Slots</h3>
          {loading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`flex items-center justify-center space-x-2 rounded-lg border p-3 ${
                    !slot.available
                      ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                      : selectedSlot === slot.time
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{slot.time}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No available slots for this day</p>
          )}
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Duration</p>
              <p className="text-sm text-gray-600">{duration} minutes</p>
            </div>
            <p className="text-xl font-bold">₹{packagePrice}</p>
          </div>
        </div>

        <button
          disabled={!selectedSlot || loading}
          onClick={handleBooking}
          className="w-full rounded-full bg-blue-600 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400 enabled:hover:bg-blue-700"
        >
          {loading ? 'Confirming booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}