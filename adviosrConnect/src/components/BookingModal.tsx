import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { TimeSlot } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string;
  packagePrice: number;
  duration: number;
}

export function BookingModal({ isOpen, onClose, packageTitle, packagePrice, duration }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const advisorId = packageTitle.split(':')[0]; // Assuming advisor ID is part of package title

  useEffect(() => {
    async function fetchAvailability() {
      setIsLoading(true);
      try {
        // Get the day of week (0-6, where 0 is Sunday)
        const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
        
        // Fetch advisor's availability for the selected day
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('advisor_availability')
          .select('*')
          .eq('advisor_id', advisorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_active', true);

        if (availabilityError) throw availabilityError;

        // Fetch existing bookings for the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('scheduled_at')
          .eq('advisor_id', advisorId)
          .eq('status', 'booked')
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString());

        if (bookingsError) throw bookingsError;

        // Generate available time slots
        const slots: TimeSlot[] = [];
        availabilityData?.forEach(availability => {
          const [startHour, startMinute] = availability.start_time.split(':');
          const [endHour, endMinute] = availability.end_time.split(':');
          const startTime = new Date(selectedDate);
          startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
          const endTime = new Date(selectedDate);
          endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

          // Generate slots with duration intervals
          while (startTime < endTime) {
            const slotTime = format(startTime, 'HH:mm');
            const isBooked = bookingsData?.some(booking => 
              format(new Date(booking.scheduled_at), 'HH:mm') === slotTime
            );

            slots.push({
              id: startTime.toISOString(),
              time: slotTime,
              available: !isBooked
            });

            startTime.setMinutes(startTime.getMinutes() + duration);
          }
        });

        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen && advisorId) {
      fetchAvailability();
    }
  }, [selectedDate, advisorId, duration, isOpen]);

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
          onClick={async () => {
            try {
              const { data: session } = await supabase.auth.getSession();
              if (!session?.session?.user) {
                window.location.href = '/login';
                return;
              }

              const scheduledAt = new Date(selectedSlot!);
              const { error } = await supabase.from('bookings').insert({
                customer_id: session.session.user.id,
                advisor_id: advisorId,
                package_id: packageTitle, // Use the full package ID
                scheduled_at: scheduledAt.toISOString(),
                status: 'booked'
              });

              if (error) throw error;
              
              // Show success message and redirect to dashboard
              alert('Booking confirmed successfully!');
              window.location.href = '/dashboard';
            } catch (error) {
              console.error('Error creating booking:', error);
              alert('Failed to create booking. Please try again.');
            }
          }}
          className="w-full rounded-full bg-blue-600 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400 enabled:hover:bg-blue-700"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}