import { google, calendar_v3 } from 'googleapis';

let connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

async function getCalendarClient(): Promise<calendar_v3.Calendar> {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface ConsultationSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface ConsultationBooking {
  packageType: 'quick_call' | 'strategy_session' | 'vip_annual' | 'enterprise';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  notes?: string;
}

export const CONSULTATION_PACKAGES = {
  quick_call: {
    name: 'Quick Call',
    duration: 30,
    price: 19700,
    priceDisplay: '$197',
    description: '30-minute focused advice session',
    features: [
      'Quick questions answered',
      'Focused advice on specific topic',
      'Email follow-up summary',
    ]
  },
  strategy_session: {
    name: 'Strategy Session',
    duration: 60,
    price: 39700,
    priceDisplay: '$397',
    description: '1-hour deep dive consultation',
    features: [
      'Comprehensive analysis',
      'Due diligence review',
      'Market & location insights',
      'Email follow-up with recommendations',
    ]
  },
  vip_annual: {
    name: 'VIP Annual',
    duration: 60,
    price: 199700,
    priceDisplay: '$1,997/year',
    description: 'Unlimited questions for 12 months',
    features: [
      'Unlimited email questions',
      'Priority phone access',
      '4 one-hour strategy sessions included',
      'Quarterly business reviews',
      'Direct access to Larry',
    ]
  },
  enterprise: {
    name: 'Enterprise Retainer',
    duration: 60,
    price: 499700,
    priceDisplay: '$4,997/year',
    description: 'Full advisory relationship',
    features: [
      'Everything in VIP Annual',
      'Monthly 1-hour sessions',
      'Site visit (within California)',
      'Priority expert witness services',
      'Multi-store consultation',
      'Investment opportunity alerts',
    ]
  }
};

export async function getAvailableSlots(date: string): Promise<ConsultationSlot[]> {
  try {
    const calendar = await getCalendarClient();
    
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0);
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    const slots: ConsultationSlot[] = [];
    
    for (let hour = 9; hour < 17; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.start!);
        const busyEnd = new Date(busy.end!);
        return slotStart < busyEnd && slotEnd > busyStart;
      });
      
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: !isBusy,
      });
    }
    
    return slots;
  } catch (error) {
    console.error('Error fetching calendar slots:', error);
    throw error;
  }
}

export async function createConsultationEvent(booking: ConsultationBooking): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = await getCalendarClient();
    const pkg = CONSULTATION_PACKAGES[booking.packageType];
    
    const event: calendar_v3.Schema$Event = {
      summary: `${pkg.name} - ${booking.clientName}`,
      description: `
Consultation Type: ${booking.consultationType}
Package: ${pkg.name} (${pkg.priceDisplay})
Client: ${booking.clientName}
Email: ${booking.clientEmail}
Phone: ${booking.clientPhone || 'Not provided'}

Notes:
${booking.notes || 'None'}

Booked via WashBizHub.com
      `.trim(),
      start: {
        dateTime: booking.startTime,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: booking.endTime,
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: booking.clientEmail, displayName: booking.clientName },
        { email: 'consult@washbizhub.com', displayName: 'WashBizHub Consulting' },
        { email: 'laundromat123@aol.com', displayName: 'Larry Larsen' },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: `washbizhub-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function listUpcomingConsultations(maxResults: number = 10): Promise<calendar_v3.Schema$Event[]> {
  try {
    const calendar = await getCalendarClient();
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'WashBizHub',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error listing consultations:', error);
    throw error;
  }
}

export async function cancelConsultation(eventId: string): Promise<void> {
  try {
    const calendar = await getCalendarClient();
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  } catch (error) {
    console.error('Error canceling consultation:', error);
    throw error;
  }
}

export async function rescheduleConsultation(
  eventId: string,
  newStartTime: string,
  newEndTime: string
): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = await getCalendarClient();
    
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: {
        start: {
          dateTime: newStartTime,
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: newEndTime,
          timeZone: 'America/Los_Angeles',
        },
      },
      sendUpdates: 'all',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error rescheduling consultation:', error);
    throw error;
  }
}
