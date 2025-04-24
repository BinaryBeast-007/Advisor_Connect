
import { calendar_v3, google } from '@googleapis/calendar';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;

  constructor() {
    const auth = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      process.env.VITE_GOOGLE_CLIENT_SECRET,
      `${window.location.origin}/oauth2callback`
    );

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getAvailableSlots(date: Date): Promise<Array<{ start: string; end: string }>> {
    try {
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      // Process response and return available slots
      const busySlots = response.data.calendars?.primary?.busy || [];
      return this.calculateAvailableSlots(startTime, endTime, busySlots);
    } catch (error) {
      console.error('Error fetching calendar slots:', error);
      return [];
    }
  }

  async createBooking(startTime: string, endTime: string, details: any) {
    try {
      await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `Advisor Booking: ${details.packageTitle}`,
          description: `Duration: ${details.duration} minutes`,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
        },
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  private calculateAvailableSlots(
    startTime: Date,
    endTime: Date,
    busySlots: Array<{ start: string; end: string }>
  ) {
    // Implementation to calculate available slots based on busy periods
    // This is a simplified version
    const availableSlots = [];
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(currentTime.getMinutes() + 60);

      const isSlotAvailable = !busySlots.some(
        busy =>
          new Date(busy.start) < slotEnd && new Date(busy.end) > currentTime
      );

      if (isSlotAvailable) {
        availableSlots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      currentTime = slotEnd;
    }

    return availableSlots;
  }
}
