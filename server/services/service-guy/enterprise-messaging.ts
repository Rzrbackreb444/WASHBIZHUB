import { sendEmail } from '../../resend-client';
import { db } from '../../db';
import { enterpriseMessagingTemplates, enterpriseMessageLogs, distributorBranding, enterpriseDistributors } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface MessageOptions {
  distributorId: string;
  templateSlug: string;
  recipient: string;
  recipientName?: string;
  variables: Record<string, string>;
  relatedType?: string;
  relatedId?: string;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

export async function getDistributorBranding(distributorId: string) {
  const [branding] = await db
    .select()
    .from(distributorBranding)
    .where(eq(distributorBranding.distributorId, distributorId))
    .limit(1);
  
  const [distributor] = await db
    .select()
    .from(enterpriseDistributors)
    .where(eq(enterpriseDistributors.id, distributorId))
    .limit(1);
  
  return { branding, distributor };
}

export async function sendEnterpriseEmail(options: MessageOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const [template] = await db
      .select()
      .from(enterpriseMessagingTemplates)
      .where(
        and(
          eq(enterpriseMessagingTemplates.distributorId, options.distributorId),
          eq(enterpriseMessagingTemplates.slug, options.templateSlug),
          eq(enterpriseMessagingTemplates.isActive, true)
        )
      )
      .limit(1);
    
    if (!template && options.templateSlug) {
      const [defaultTemplate] = await db
        .select()
        .from(enterpriseMessagingTemplates)
        .where(
          and(
            eq(enterpriseMessagingTemplates.slug, options.templateSlug),
            eq(enterpriseMessagingTemplates.isDefault, true)
          )
        )
        .limit(1);
      
      if (!defaultTemplate) {
        return { success: false, error: `Template '${options.templateSlug}' not found` };
      }
    }
    
    const { branding, distributor } = await getDistributorBranding(options.distributorId);
    
    const fromName = template?.fromName || branding?.emailFromName || distributor?.companyName || 'Service Guy AI';
    const subject = template?.emailSubject 
      ? replaceVariables(template.emailSubject, options.variables)
      : options.variables.subject || 'Notification';
    const htmlBody = template?.emailHtml
      ? replaceVariables(template.emailHtml, options.variables)
      : generateDefaultEmailHtml(options.variables, branding, distributor);
    
    const [logEntry] = await db
      .insert(enterpriseMessageLogs)
      .values({
        distributorId: options.distributorId,
        templateId: template?.id,
        channel: 'email',
        recipient: options.recipient,
        recipientName: options.recipientName,
        subject,
        body: htmlBody,
        relatedType: options.relatedType,
        relatedId: options.relatedId,
        status: 'pending',
      })
      .returning();
    
    const result = await sendEmail({
      to: options.recipient,
      subject: `${fromName}: ${subject}`,
      html: htmlBody,
      replyTo: template?.replyTo || branding?.supportEmail,
    });
    
    await db
      .update(enterpriseMessageLogs)
      .set({
        status: result.success ? 'sent' : 'failed',
        externalId: result.messageId,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : null,
      })
      .where(eq(enterpriseMessageLogs.id, logEntry.id));
    
    return result;
  } catch (error) {
    console.error('[EnterpriseMessaging] Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendEnterpriseSms(options: MessageOptions): Promise<{
  success: boolean;
  messageSid?: string;
  error?: string;
}> {
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      console.log('[EnterpriseMessaging] Twilio not configured - SMS disabled');
      return { success: false, error: 'SMS service not configured' };
    }
    
    const [template] = await db
      .select()
      .from(enterpriseMessagingTemplates)
      .where(
        and(
          eq(enterpriseMessagingTemplates.distributorId, options.distributorId),
          eq(enterpriseMessagingTemplates.slug, options.templateSlug),
          eq(enterpriseMessagingTemplates.isActive, true)
        )
      )
      .limit(1);
    
    const smsBody = template?.smsBody
      ? replaceVariables(template.smsBody, options.variables)
      : options.variables.message || 'Service Guy AI notification';
    
    const [logEntry] = await db
      .insert(enterpriseMessageLogs)
      .values({
        distributorId: options.distributorId,
        templateId: template?.id,
        channel: 'sms',
        recipient: options.recipient,
        recipientName: options.recipientName,
        body: smsBody,
        relatedType: options.relatedType,
        relatedId: options.relatedId,
        status: 'pending',
      })
      .returning();
    
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: options.recipient,
        From: twilioFromNumber,
        Body: smsBody,
      }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      await db
        .update(enterpriseMessageLogs)
        .set({
          status: 'sent',
          externalId: result.sid,
          sentAt: new Date(),
        })
        .where(eq(enterpriseMessageLogs.id, logEntry.id));
      
      return { success: true, messageSid: result.sid };
    } else {
      await db
        .update(enterpriseMessageLogs)
        .set({
          status: 'failed',
          errorMessage: result.message || 'SMS send failed',
        })
        .where(eq(enterpriseMessageLogs.id, logEntry.id));
      
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('[EnterpriseMessaging] SMS send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generateDefaultEmailHtml(
  variables: Record<string, string>,
  branding: any,
  distributor: any
): string {
  const primaryColor = branding?.primaryColor || '#C8A661';
  const companyName = distributor?.companyName || 'Service Guy AI';
  const logoUrl = branding?.logoUrl || '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1628 0%, #16213e 100%); padding: 30px; text-align: center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 50px; margin-bottom: 10px;">` : ''}
              <h1 style="color: ${primaryColor}; margin: 0; font-size: 24px; font-weight: bold;">${companyName}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${variables.title ? `<h2 style="color: #0A1628; margin: 0 0 20px 0; font-size: 20px;">${variables.title}</h2>` : ''}
              <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                ${variables.message || variables.body || 'You have a new notification.'}
              </p>
              ${variables.cta_url ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${variables.cta_url}" style="background-color: ${primaryColor}; color: #0A1628; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${variables.cta_text || 'View Details'}</a>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0A1628; padding: 20px 30px; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
                ${branding?.supportEmail ? `Support: ${branding.supportEmail}` : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendJobNotification(
  distributorId: string,
  jobId: string,
  eventType: 'created' | 'assigned' | 'started' | 'completed',
  recipients: { email?: string; phone?: string; name?: string }[]
) {
  const templateSlug = `job_${eventType}`;
  const variables = {
    job_id: jobId,
    event_type: eventType,
    title: `Job ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
    message: `Service job #${jobId} has been ${eventType}.`,
    cta_url: `https://app.serviceguyai.com/jobs/${jobId}`,
    cta_text: 'View Job Details',
  };
  
  const results = [];
  
  for (const recipient of recipients) {
    if (recipient.email) {
      const emailResult = await sendEnterpriseEmail({
        distributorId,
        templateSlug,
        recipient: recipient.email,
        recipientName: recipient.name,
        variables,
        relatedType: 'job',
        relatedId: jobId,
      });
      results.push({ channel: 'email', ...emailResult });
    }
    
    if (recipient.phone) {
      const smsResult = await sendEnterpriseSms({
        distributorId,
        templateSlug,
        recipient: recipient.phone,
        recipientName: recipient.name,
        variables: {
          message: `[${variables.title}] Job #${jobId} - ${variables.message}`,
        },
        relatedType: 'job',
        relatedId: jobId,
      });
      results.push({ channel: 'sms', ...smsResult });
    }
  }
  
  return results;
}

export async function getMessageLogs(distributorId: string, limit = 50) {
  return db
    .select()
    .from(enterpriseMessageLogs)
    .where(eq(enterpriseMessageLogs.distributorId, distributorId))
    .orderBy(enterpriseMessageLogs.createdAt)
    .limit(limit);
}
