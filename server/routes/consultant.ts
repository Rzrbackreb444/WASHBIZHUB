import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const inquirySchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  businessName: z.string().min(3),
  inquiryType: z.enum(['new-business', 'expansion', 'optimization', 'troubleshooting', 'financing', 'other']),
  message: z.string().min(20),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

// Submit consultant inquiry - routes to consult@washbizhub.com
router.post('/inquiry', async (req, res) => {
  try {
    const data = inquirySchema.parse(req.body);
    
    // In production: use Resend or SendGrid to send to consult@washbizhub.com
    const emailContent = `
New Consultant Inquiry from ${data.firstName} ${data.lastName}

Contact Information:
- Email: ${data.email}
- Phone: ${data.phone}
- Business: ${data.businessName}

Inquiry Type: ${data.inquiryType}
Budget: ${data.budget || 'Not specified'}
Timeline: ${data.timeline || 'Not specified'}

Message:
${data.message}
    `;

    console.log('Consultant Inquiry:', emailContent);
    
    // TODO: Integrate with Resend/SendGrid to send to consult@washbizhub.com
    // For now, just log and return success
    
    res.json({
      success: true,
      message: 'Inquiry received. We will contact you within 24 hours.',
      inquiryId: 'inquiry-' + Date.now(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Failed to process inquiry' });
  }
});

export default router;
