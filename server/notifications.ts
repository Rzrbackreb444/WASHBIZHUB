/**
 * ADMIN NOTIFICATION SERVICE
 * 
 * Sends instant SMS + Email notifications to admin (Nick)
 * when important events happen (new subscriptions, purchases, etc.)
 */

interface NotificationParams {
  to: string[];
  subject: string;
  message: string;
  priority?: 'high' | 'normal';
}

/**
 * Send notification via Resend to email + SMS gateway
 */
export async function sendAdminNotification(params: NotificationParams): Promise<{
  success: boolean;
  sentTo: string[];
  errors: string[];
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Resend API key not configured');
    return {
      success: false,
      sentTo: [],
      errors: ['Resend API key not configured'],
    };
  }

  const sentTo: string[] = [];
  const errors: string[] = [];

  for (const recipient of params.to) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WashBizHub Alerts <alerts@washbizhub.com>',
          to: recipient,
          subject: params.subject,
          text: params.message,
          html: `<div style="font-family: system-ui, -apple-system, sans-serif;">
            <h2 style="color: #C8A661; margin-bottom: 16px;">${params.subject}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              ${params.message.replace(/\n/g, '<br>')}
            </p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e5e5;">
            <p style="font-size: 12px; color: #666;">
              WashBizHub Admin Notification System
            </p>
          </div>`,
        }),
      });

      if (response.ok) {
        sentTo.push(recipient);
        console.log(`✅ Notification sent to ${recipient}`);
      } else {
        const error = await response.text();
        errors.push(`Failed to send to ${recipient}: ${error}`);
        console.error(`❌ Failed to send to ${recipient}:`, error);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Error sending to ${recipient}: ${errorMsg}`);
      console.error(`❌ Error sending to ${recipient}:`, errorMsg);
    }
  }

  return {
    success: sentTo.length > 0,
    sentTo,
    errors,
  };
}

/**
 * Notify admin of new newsletter subscription
 */
export async function notifyNewSubscription(params: {
  email: string;
  firstName?: string;
  source?: string;
}): Promise<void> {
  const message = `
🎉 NEW SUBSCRIBER!

Email: ${params.email}
Name: ${params.firstName || 'Not provided'}
Source: ${params.source || 'Unknown'}
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}

Total subscribers are growing! 🚀
`.trim();

  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net',  // AT&T SMS gateway
      'nick@washbizhub.com',     // Email backup
    ],
    subject: '🚨 New WashBizHub Subscriber!',
    message,
    priority: 'high',
  });
}

/**
 * Notify admin of new Pro subscription purchase
 */
export async function notifyNewProSubscription(params: {
  email: string;
  plan: string;
  amount: number;
}): Promise<void> {
  const message = `
💰 NEW PRO SUBSCRIPTION!

Plan: ${params.plan}
Amount: $${params.amount}
Customer: ${params.email}
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}

CHA-CHING! 💸
`.trim();

  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net',
      'nick@washbizhub.com',
    ],
    subject: '💰 New Pro Subscription - WashBizHub',
    message,
    priority: 'high',
  });
}

/**
 * Notify admin of new course enrollment
 */
export async function notifyNewEnrollment(params: {
  email: string;
  courseName: string;
  amount: number;
}): Promise<void> {
  const message = `
📚 NEW COURSE ENROLLMENT!

Course: ${params.courseName}
Amount: $${params.amount}
Student: ${params.email}
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
`.trim();

  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net',
      'nick@washbizhub.com',
    ],
    subject: '📚 New Course Enrollment',
    message,
    priority: 'normal',
  });
}

/**
 * Notify admin of new consultation request
 */
export async function notifyConsultationRequest(params: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  const message = `
📞 NEW CONSULTATION REQUEST!

Name: ${params.name}
Email: ${params.email}
Phone: ${params.phone || 'Not provided'}

Message:
${params.message}

Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
`.trim();

  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net',
      'nick@washbizhub.com',
    ],
    subject: '📞 New Consultation Request',
    message,
    priority: 'high',
  });
}

/**
 * Notify insurance team of new insurance quote request
 */
export async function notifyInsuranceLeadRequest(params: {
  name: string;
  email: string;
  phone: string;
  location?: string;
  businessType: string;
  message?: string;
}): Promise<void> {
  const emailMessage = `
🛡️ NEW INSURANCE QUOTE REQUEST!

Name: ${params.name}
Email: ${params.email}
Phone: ${params.phone}
Location: ${params.location || 'Not provided'}
Business Type: ${params.businessType}
Additional Details: ${params.message || 'No additional details'}
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}

📍 ROUTING INSTRUCTIONS:
- California leads → Forward to Larry Larsen (Laundromat123.com)
- Other states → Use multi-carrier partners (Tivly, Next Insurance, etc.)

🚀 Respond within 24 hours for best conversion!
`.trim();

  await sendAdminNotification({
    to: [
      'insurance@washbizhub.com',  // Primary insurance inbox
      'nick@washbizhub.com',        // CC admin
    ],
    subject: '🛡️ New Insurance Quote Request - WashBizHub',
    message: emailMessage,
    priority: 'high',
  });
}
