/**
 * Email Sender Service
 * Uses Resend for reliable email delivery
 */

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailSenderService {
  private resendApiKey: string | undefined;
  private fromEmail = 'WashBizHub <noreply@washbizhub.com>';

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.resendApiKey;
  }

  /**
   * Send OTP code via email
   */
  async sendOtpEmail(email: string, code: string): Promise<EmailResult> {
    if (!this.resendApiKey) {
      console.log(`📧 [DEV MODE] OTP for ${email}: ${code}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: email,
          subject: `Your WashBizHub Login Code: ${code}`,
          html: this.getOtpEmailTemplate(code),
          text: `Your WashBizHub login code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        return { success: false, error };
      }

      const data = await response.json();
      console.log(`📧 OTP email sent to ${email}, ID: ${data.id}`);
      return { success: true, messageId: data.id };

    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * HTML email template for OTP
   */
  private getOtpEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a2332 0%, #2d3748 100%); padding: 32px; text-align: center;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 700;">WashBizHub</h1>
      <p style="color: #a0aec0; margin: 8px 0 0 0; font-size: 14px;">The #1 Laundromat Resource Hub</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #1a2332; margin: 0 0 16px 0; font-size: 22px;">Your Login Code</h2>
      <p style="color: #4a5568; margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">
        Enter this code to sign in to your account:
      </p>
      
      <!-- OTP Code -->
      <div style="background: #f7fafc; border: 2px dashed #d4af37; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a2332; font-family: 'Monaco', 'Consolas', monospace;">${code}</span>
      </div>
      
      <p style="color: #718096; margin: 0; font-size: 14px;">
        This code expires in <strong>10 minutes</strong>.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f7fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #a0aec0; margin: 0; font-size: 12px;">
        If you didn't request this code, you can safely ignore this email.
      </p>
      <p style="color: #a0aec0; margin: 8px 0 0 0; font-size: 12px;">
        &copy; 2024 WashBizHub. All rights reserved.
      </p>
    </div>
    
  </div>
</body>
</html>`;
  }
}

export const emailSender = new EmailSenderService();
