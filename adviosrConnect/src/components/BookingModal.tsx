
import React, { useState, useEffect } from 'react';
import { GoogleCalendarService } from '../lib/googleCalendar';
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
  
  useEffect(() => {
    const calendarService = new GoogleCalendarService();
    
    async function fetchSlots() {
      const slots = await calendarService.getAvailableSlots(selectedDate);
      setTimeSlots(
        slots.map((slot, index) => ({
          id: String(index),
          time: new Date(slot.start).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          available: true,
          startTime: slot.start,
          endTime: slot.end,
        }))
      );
    }
    
    if (isOpen) {
      fetchSlots();
    }
  }, [selectedDate, isOpen]);

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
              const calendarService = new GoogleCalendarService();
              const slot = timeSlots.find(s => s.id === selectedSlot);
              if (!slot) return;
              
              await calendarService.createBooking(
                slot.startTime,
                slot.endTime,
                {
                  packageTitle,
                  duration
                }
              );
              
              onClose();
              alert('Booking confirmed successfully!');
            } catch (error) {
              console.error('Booking failed:', error);
              alert('Failed to confirm booking. Please try again.');
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
