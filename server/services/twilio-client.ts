/**
 * Twilio SMS Service for WashBizHub
 * Handles SMS notifications for consultations, lead capture, and alerts
 * Uses Replit connector when available, falls back to direct credentials
 */

let connectionSettings: any;

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

async function getConnectorCredentials(): Promise<TwilioCredentials | null> {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken || !hostname) {
      console.log('[Twilio] Connector credentials not available (no token or hostname)');
      return null;
    }

    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings?.account_sid) {
      console.log('[Twilio] Connector available but not configured');
      return null;
    }
    
    console.log('[Twilio] Using Replit connector credentials');
    return {
      accountSid: connectionSettings.settings.account_sid,
      authToken: connectionSettings.settings.auth_token,
      fromNumber: connectionSettings.settings.phone_number || process.env.TWILIO_PHONE_NUMBER || ''
    };
  } catch (error) {
    console.error('[Twilio] Connector fetch failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

function getDirectCredentials(): TwilioCredentials | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken) {
    console.log('[Twilio] Direct credentials not configured');
    return null;
  }
  
  console.log('[Twilio] Using direct environment variables');
  return { accountSid, authToken, fromNumber: fromNumber || '' };
}

async function getCredentials(): Promise<TwilioCredentials | null> {
  const connectorCreds = await getConnectorCredentials();
  if (connectorCreds) return connectorCreds;
  
  return getDirectCredentials();
}

export async function sendSMS(options: {
  to: string;
  body: string;
}): Promise<{ success: boolean; error?: string; messageSid?: string }> {
  try {
    const creds = await getCredentials();
    
    if (!creds) {
      console.log('[Twilio] SMS not sent - Twilio not configured');
      return { success: false, error: 'Twilio not configured' };
    }

    if (!creds.fromNumber) {
      console.log('[Twilio] SMS not sent - No from number configured');
      return { success: false, error: 'No Twilio phone number configured' };
    }

    const toNumber = options.to.replace(/\D/g, '');
    if (toNumber.length < 10) {
      return { success: false, error: 'Invalid phone number' };
    }

    const formattedTo = toNumber.startsWith('1') ? `+${toNumber}` : `+1${toNumber}`;

    console.log(`[Twilio] Sending SMS to ${formattedTo}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: creds.fromNumber,
          Body: options.body
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('[Twilio] Send failed:', result);
      return { success: false, error: result.message || 'Failed to send SMS' };
    }

    console.log(`[Twilio] SMS sent successfully, SID: ${result.sid}`);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Twilio] SMS send error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function isTwilioConfigured(): Promise<boolean> {
  const creds = await getCredentials();
  return creds !== null && !!creds.fromNumber;
}

/**
 * Send SMS via AT&T Email-to-SMS Gateway
 * Bypasses Twilio entirely for owner notifications
 * Format: phonenumber@txt.att.net
 */
export async function sendSMSViaEmailGateway(options: {
  to: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Format phone number and create email address
    const phoneNumber = options.to.replace(/\D/g, '');
    const emailAddress = `${phoneNumber}@txt.att.net`;
    
    console.log(`[SMS Gateway] Sending via email to ${emailAddress}`);
    
    const result = await resend.emails.send({
      from: 'WashBizHub <alerts@washbizhub.com>',
      to: emailAddress,
      subject: '', // SMS doesn't show subject
      text: options.body,
    });
    
    if (result.error) {
      console.error('[SMS Gateway] Send failed:', result.error);
      return { success: false, error: result.error.message };
    }
    
    console.log(`[SMS Gateway] SMS sent successfully via email gateway`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SMS Gateway] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendOwnerAlert(message: string): Promise<void> {
  // Use direct email-to-SMS gateway for owner notifications (AT&T)
  // Nick's phone: 4798834314@txt.att.net
  const ownerPhone = process.env.NICK_PHONE || '4798834314';
  
  // Try email gateway first (more reliable, no Twilio dependency)
  const emailResult = await sendSMSViaEmailGateway({ to: ownerPhone, body: message });
  
  if (!emailResult.success) {
    console.log('[Owner Alert] Email gateway failed, trying Twilio fallback');
    await sendSMS({ to: ownerPhone, body: message });
  }
}

export async function sendConsultationBookedSMS(options: {
  clientPhone: string;
  clientName: string;
  consultationType: string;
  scheduledDate: string;
  scheduledTime: string;
}): Promise<{ success: boolean; error?: string }> {
  const message = `Hi ${options.clientName}! Your ${options.consultationType} consultation with Larry Larsen is confirmed for ${options.scheduledDate} at ${options.scheduledTime}. Looking forward to helping you succeed! - WashBizHub`;
  
  return sendSMS({ to: options.clientPhone, body: message });
}

export async function sendLeadWelcomeSMS(options: {
  phone: string;
  name: string;
}): Promise<{ success: boolean; error?: string }> {
  const message = `Welcome ${options.name}! You're now subscribed to WashBizHub - the #1 laundromat resource. Get expert insights from Larry Larsen with 50+ years experience. Reply STOP to unsubscribe.`;
  
  return sendSMS({ to: options.phone, body: message });
}

export async function sendReminderSMS(options: {
  phone: string;
  name: string;
  consultationType: string;
  timeUntil: string;
}): Promise<{ success: boolean; error?: string }> {
  const message = `Hi ${options.name}! Reminder: Your ${options.consultationType} with Larry Larsen is in ${options.timeUntil}. See you soon! - WashBizHub`;
  
  return sendSMS({ to: options.phone, body: message });
}
