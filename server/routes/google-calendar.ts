import { Router, Request, Response } from 'express';
import { 
  getAvailableSlots, 
  createConsultationEvent, 
  listUpcomingConsultations,
  cancelConsultation,
  rescheduleConsultation,
  CONSULTATION_PACKAGES,
  ConsultationBooking
} from '../services/google-calendar';
import Stripe from 'stripe';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

router.get('/packages', (_req: Request, res: Response) => {
  res.json({
    success: true,
    packages: CONSULTATION_PACKAGES
  });
});

router.get('/availability/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }
    
    const slots = await getAvailableSlots(date);
    res.json({ success: true, slots });
  } catch (error) {
    console.error('Calendar availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

router.post('/book', async (req: Request, res: Response) => {
  try {
    const booking: ConsultationBooking = req.body;
    
    if (!booking.packageType || !CONSULTATION_PACKAGES[booking.packageType]) {
      res.status(400).json({ error: 'Invalid package type' });
      return;
    }
    
    if (!booking.clientName || !booking.clientEmail || !booking.startTime) {
      res.status(400).json({ error: 'Missing required fields: clientName, clientEmail, startTime' });
      return;
    }
    
    const pkg = CONSULTATION_PACKAGES[booking.packageType];
    const startDate = new Date(booking.startTime);
    const endDate = new Date(startDate.getTime() + pkg.duration * 60 * 1000);
    booking.endTime = endDate.toISOString();
    
    const event = await createConsultationEvent(booking);
    
    res.json({
      success: true,
      event: {
        id: event.id,
        link: event.htmlLink,
        meetLink: event.conferenceData?.entryPoints?.[0]?.uri,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
      },
      package: pkg
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { packageType, clientEmail, clientName } = req.body;
    
    if (!packageType || !CONSULTATION_PACKAGES[packageType as keyof typeof CONSULTATION_PACKAGES]) {
      res.status(400).json({ error: 'Invalid package type' });
      return;
    }
    
    const pkg = CONSULTATION_PACKAGES[packageType as keyof typeof CONSULTATION_PACKAGES];
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: 'usd',
      metadata: {
        packageType,
        clientEmail,
        clientName,
        productName: `WashBizHub Consultation - ${pkg.name}`,
      },
      receipt_email: clientEmail,
      description: `${pkg.name} Consultation with Larry Larsen - ${pkg.description}`,
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      package: pkg
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const events = await listUpcomingConsultations(20);
    res.json({
      success: true,
      consultations: events.map(e => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime,
        end: e.end?.dateTime,
        meetLink: e.conferenceData?.entryPoints?.[0]?.uri,
        attendees: e.attendees?.map(a => a.email),
      }))
    });
  } catch (error) {
    console.error('List consultations error:', error);
    res.status(500).json({ error: 'Failed to list consultations' });
  }
});

router.delete('/cancel/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    await cancelConsultation(eventId);
    res.json({ success: true, message: 'Consultation cancelled' });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel consultation' });
  }
});

router.patch('/reschedule/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { newStartTime, duration } = req.body;
    
    if (!newStartTime) {
      res.status(400).json({ error: 'newStartTime is required' });
      return;
    }
    
    const startDate = new Date(newStartTime);
    const endDate = new Date(startDate.getTime() + (duration || 60) * 60 * 1000);
    
    const event = await rescheduleConsultation(eventId, startDate.toISOString(), endDate.toISOString());
    
    res.json({
      success: true,
      event: {
        id: event.id,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
      }
    });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({ error: 'Failed to reschedule consultation' });
  }
});

export default router;
