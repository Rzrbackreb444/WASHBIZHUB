import { Resend } from 'resend';

let connectionSettings: any;

async function getConnectorCredentials(): Promise<{ apiKey: string; fromEmail: string } | null> {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken || !hostname) {
      console.log('[Resend] Connector credentials not available (no token or hostname)');
      return null;
    }

    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings?.api_key) {
      console.log('[Resend] Connector available but no API key configured');
      return null;
    }
    
    console.log('[Resend] Using Replit connector credentials');
    return {
      apiKey: connectionSettings.settings.api_key, 
      fromEmail: connectionSettings.settings.from_email || 'info@washbizhub.com'
    };
  } catch (error) {
    console.error('[Resend] Connector fetch failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

function getDirectApiCredentials(): { apiKey: string; fromEmail: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Resend] Direct API key (RESEND_API_KEY) not configured');
    return null;
  }
  
  console.log('[Resend] Using direct RESEND_API_KEY environment variable');
  return {
    apiKey,
    fromEmail: 'info@washbizhub.com'
  };
}

export async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  // First try: Replit connector (preferred for managed credentials)
  const connectorCreds = await getConnectorCredentials();
  if (connectorCreds) {
    return {
      client: new Resend(connectorCreds.apiKey),
      fromEmail: connectorCreds.fromEmail
    };
  }

  // Fallback: Direct API key from environment
  const directCreds = getDirectApiCredentials();
  if (directCreds) {
    return {
      client: new Resend(directCreds.apiKey),
      fromEmail: directCreds.fromEmail
    };
  }

  // Neither method available
  throw new Error('Email service not configured. Set up Resend connector or RESEND_API_KEY environment variable.');
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    console.log(`[Resend] Sending email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to} - Subject: ${options.subject}`);
    
    const result = await client.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo
    });

    if (result.error) {
      console.error('[Resend] Send failed:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Resend] Email sent successfully, ID: ${result.data?.id}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Resend] Email send error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
