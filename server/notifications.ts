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

/**
 * Notify admin when someone uses AI Chat (WashBizHub Consultant)
 */
export async function notifyAIChatMessage(data: {
  userEmail: string;
  message: string;
  timestamp: string;
}): Promise<void> {
  // Send to AT&T SMS gateway + email
  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net', // AT&T SMS gateway for immediate SMS
      'nick@washbizhub.com',     // Email backup
    ],
    subject: '💬 WashBizHub Consultant Chat',
    message: `New chat from ${data.userEmail}:\n\n"${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}"\n\nTime: ${data.timestamp}`,
    priority: 'high',
  });
}

/**
 * Universal purchase notification - called for ANY purchase type
 * Sends SMS + Email instantly when money comes in
 */
export async function notifyPurchase(params: {
  type: 'subscription' | 'course' | 'book' | 'cleanbi' | 'report' | 'advertising' | 'other';
  productName: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  interval?: string; // 'month', 'year', 'one-time'
  metadata?: Record<string, any>;
}): Promise<void> {
  const currencySymbol = params.currency === 'USD' || !params.currency ? '$' : params.currency;
  const intervalText = params.interval === 'month' ? '/mo' : 
                       params.interval === 'year' ? '/yr' : 
                       '';
  
  const typeEmoji: Record<string, string> = {
    subscription: '🔄',
    course: '📚',
    book: '📖',
    cleanbi: '🏠',
    report: '📊',
    advertising: '📢',
    other: '💳',
  };
  
  const emoji = typeEmoji[params.type] || '💰';
  
  const message = `
${emoji} CHA-CHING! PAYMENT RECEIVED!

Type: ${params.type.toUpperCase()}
Product: ${params.productName}
Amount: ${currencySymbol}${(params.amount / 100).toFixed(2)}${intervalText}
Customer: ${params.customerEmail || 'Guest'}
${params.customerName ? `Name: ${params.customerName}` : ''}
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}

💸💸💸 MONEY IN THE BANK! 💸💸💸
`.trim();

  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net',
      'nick@washbizhub.com',
    ],
    subject: `${emoji} ${currencySymbol}${(params.amount / 100).toFixed(2)} - ${params.productName}`,
    message,
    priority: 'high',
  });
  
  console.log(`💰 Purchase notification sent: ${params.productName} - $${(params.amount / 100).toFixed(2)}`);
}

/**
 * Notify when a subscription is created or renewed
 */
export async function notifySubscriptionEvent(params: {
  event: 'created' | 'renewed' | 'cancelled' | 'failed';
  planName: string;
  amount: number;
  customerEmail?: string;
  subscriptionId?: string;
}): Promise<void> {
  const eventEmojis: Record<string, string> = {
    created: '🆕',
    renewed: '🔄',
    cancelled: '❌',
    failed: '⚠️',
  };
  
  const emoji = eventEmojis[params.event] || '📋';
  
  const message = `
${emoji} SUBSCRIPTION ${params.event.toUpperCase()}!

Plan: ${params.planName}
Amount: $${(params.amount / 100).toFixed(2)}
Customer: ${params.customerEmail || 'Unknown'}
Subscription ID: ${params.subscriptionId || 'N/A'}
Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
`.trim();

  await sendAdminNotification({
    to: [
      '4798834314@txt.att.net',
      'nick@washbizhub.com',
    ],
    subject: `${emoji} Subscription ${params.event}: ${params.planName}`,
    message,
    priority: params.event === 'failed' ? 'high' : 'normal',
  });
}
