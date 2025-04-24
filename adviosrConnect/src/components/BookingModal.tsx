
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TimeSlot } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string;
  packagePrice: number;
  duration: number;
  advisorId: string;
}

export function BookingModal({ isOpen, onClose, packageTitle, packagePrice, duration, advisorId }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchAvailableSlots() {
      if (!selectedDate || !advisorId) return;
      
      setIsLoading(true);
      try {
        const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        // Get advisor's availability for the selected day
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('advisor_availability')
          .select('*')
          .eq('advisor_id', advisorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_active', true);

        if (availabilityError) throw availabilityError;

        // Get existing bookings for the selected date
        const startOfDay = new Date(dateStr);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59);

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('scheduled_at')
          .eq('advisor_id', advisorId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .eq('status', 'booked');

        if (bookingsError) throw bookingsError;

        // Create time slots based on availability
        const slots: TimeSlot[] = [];
        availabilityData?.forEach(availability => {
          const [startHour, startMinute] = availability.start_time.split(':');
          const [endHour, endMinute] = availability.end_time.split(':');
          
          let currentTime = new Date(dateStr);
          currentTime.setHours(parseInt(startHour), parseInt(startMinute));
          
          const endTime = new Date(dateStr);
          endTime.setHours(parseInt(endHour), parseInt(endMinute));

          while (currentTime < endTime) {
            const slotTime = format(currentTime, 'HH:mm');
            const isBooked = bookingsData?.some(booking => 
              format(new Date(booking.scheduled_at), 'HH:mm') === slotTime
            );

            slots.push({
              id: currentTime.toISOString(),
              time: slotTime,
              available: !isBooked
            });

            currentTime.setMinutes(currentTime.getMinutes() + duration);
          }
        });

        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailableSlots();
  }, [selectedDate, advisorId, duration]);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/login';
        return;
      }

      const [dateStr, timeStr] = selectedSlot.split('T');
      const scheduledAt = new Date(dateStr + 'T' + timeStr);

      const { error } = await supabase.from('bookings').insert({
        customer_id: session.user.id,
        advisor_id: advisorId,
        package_id: packageTitle,
        scheduled_at: scheduledAt.toISOString(),
        status: 'booked'
      });

      if (error) throw error;
      
      alert('Booking confirmed successfully!');
      onClose();
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-2xl font-bold">{packageTitle}</h2>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium">{format(selectedDate, 'EEEE, MMMM d')}</span>
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
          {isLoading ? (
            <div className="text-center py-4">Loading available slots...</div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-4">No slots available for this date</div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`flex items-center justify-center space-x-2 rounded-lg border p-3 ${
                    !slot.available
                      ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                      : selectedSlot === slot.id
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{slot.time}</span>
                </button>
              ))}
            </div>
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
          disabled={!selectedSlot}
          onClick={handleBooking}
          className="w-full rounded-full bg-blue-600 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400 enabled:hover:bg-blue-700"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
