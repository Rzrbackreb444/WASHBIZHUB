/**
 * SUBSCRIPTION EMAIL SERVICE
 * 
 * Branded transactional emails for subscription lifecycle events:
 * - Welcome emails on new subscription
 * - Upgrade confirmation emails
 * - Payment failed reminder emails
 * - Refund confirmation emails
 * 
 * All emails feature WashBizHub branding (Navy #0A1628, Gold #C8A661)
 * and emphasize the 30-day money-back guarantee for B2B confidence.
 */

import { sendEmail } from './resend-client';

const BRAND_COLORS = {
  navy: '#0A1628',
  gold: '#C8A661',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
};

const TIER_FEATURES: Record<string, string[]> = {
  starter: [
    'Unlimited CLEANBI location analyses',
    'Full Calculator Hub access (50+ tools)',
    'The Laundromat Bible digital book',
    'All video courses & certifications',
    'Community forum posting privileges',
    'Email support',
  ],
  pro: [
    'Everything in Starter, plus:',
    'Monte Carlo simulation for risk analysis',
    'API access for automation',
    'PDF report exports',
    'Advanced ROI calculators',
    'Bulk location analysis',
    'Priority support',
  ],
  enterprise: [
    'Everything in Pro, plus:',
    'Ownership data access',
    'Team collaboration features',
    'White-label options',
    'Dedicated account manager',
    '24/7 priority support',
    'Custom integrations',
  ],
};

function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WashBizHub</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${BRAND_COLORS.lightGray};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.lightGray};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLORS.navy} 0%, #1a2d4a 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: ${BRAND_COLORS.gold}; font-size: 28px; font-weight: bold; letter-spacing: 1px;">WashBizHub</h1>
              <p style="margin: 8px 0 0 0; color: ${BRAND_COLORS.white}; font-size: 14px; opacity: 0.9;">The #1 Laundromat Intelligence Platform</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_COLORS.lightGray}; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px;">
                <strong>Questions?</strong> Reply to this email or contact <a href="mailto:support@washbizhub.com" style="color: ${BRAND_COLORS.gold};">support@washbizhub.com</a>
              </p>
              <p style="margin: 0; color: #888; font-size: 12px;">
                WashBizHub, Inc. | <a href="https://washbizhub.com" style="color: ${BRAND_COLORS.gold};">washbizhub.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getFeaturesList(tier: string): string {
  const features = TIER_FEATURES[tier.toLowerCase()] || TIER_FEATURES.starter;
  return features.map(f => `
    <tr>
      <td style="padding: 8px 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px;">
        <span style="color: ${BRAND_COLORS.gold}; margin-right: 8px;">✓</span> ${f}
      </td>
    </tr>
  `).join('');
}

/**
 * Send welcome email when a new subscription is created
 */
export async function sendWelcomeEmail(params: {
  email: string;
  firstName?: string;
  tier: string;
  amount: number;
  interval: string;
}): Promise<{ success: boolean; error?: string }> {
  const tierDisplay = params.tier.charAt(0).toUpperCase() + params.tier.slice(1);
  const name = params.firstName || 'there';
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.navy}; font-size: 24px;">Welcome to WashBizHub ${tierDisplay}!</h2>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Hey ${name},
    </p>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Thank you for joining WashBizHub ${tierDisplay}! You now have access to the industry's most powerful laundromat intelligence tools.
    </p>
    
    <!-- Guarantee Badge -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0; color: white; font-size: 18px; font-weight: bold;">
            🛡️ 30-Day Money-Back Guarantee
          </p>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            Not satisfied? Contact us within 30 days for a full refund. No questions asked.
          </p>
        </td>
      </tr>
    </table>
    
    <h3 style="margin: 30px 0 15px 0; color: ${BRAND_COLORS.navy}; font-size: 18px;">Your ${tierDisplay} Features:</h3>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.lightGray}; border-radius: 8px; padding: 20px;">
      ${getFeaturesList(params.tier)}
    </table>
    
    <h3 style="margin: 30px 0 15px 0; color: ${BRAND_COLORS.navy}; font-size: 18px;">Get Started Now:</h3>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      <tr>
        <td style="background-color: ${BRAND_COLORS.gold}; border-radius: 6px;">
          <a href="https://washbizhub.com/cleanbi-explorer" style="display: inline-block; padding: 14px 28px; color: ${BRAND_COLORS.navy}; text-decoration: none; font-weight: bold; font-size: 16px;">
            Launch CLEANBI Explorer →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 30px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px; line-height: 1.6;">
      <strong>Your investment:</strong> $${(params.amount / 100).toFixed(2)}/${params.interval}<br>
      <strong>Next billing date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
    </p>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Welcome to the community,<br>
      <strong style="color: ${BRAND_COLORS.gold};">The WashBizHub Team</strong>
    </p>
  `;
  
  return sendEmail({
    to: params.email,
    subject: `🎉 Welcome to WashBizHub ${tierDisplay}!`,
    html: getEmailTemplate(content),
    text: `Welcome to WashBizHub ${tierDisplay}!\n\nThank you for subscribing. You now have access to all ${tierDisplay} features.\n\nYour investment: $${(params.amount / 100).toFixed(2)}/${params.interval}\n\n30-Day Money-Back Guarantee: Not satisfied? Contact support@washbizhub.com within 30 days for a full refund.\n\nGet started: https://washbizhub.com/cleanbi-explorer\n\nWelcome to the community!\nThe WashBizHub Team`,
  });
}

/**
 * Send upgrade confirmation email
 */
export async function sendUpgradeConfirmationEmail(params: {
  email: string;
  firstName?: string;
  oldTier: string;
  newTier: string;
  amount: number;
  interval: string;
}): Promise<{ success: boolean; error?: string }> {
  const oldTierDisplay = params.oldTier.charAt(0).toUpperCase() + params.oldTier.slice(1);
  const newTierDisplay = params.newTier.charAt(0).toUpperCase() + params.newTier.slice(1);
  const name = params.firstName || 'there';
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.navy}; font-size: 24px;">🚀 Upgrade Confirmed!</h2>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Hey ${name},
    </p>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Great news! Your WashBizHub account has been upgraded from <strong>${oldTierDisplay}</strong> to <strong style="color: ${BRAND_COLORS.gold};">${newTierDisplay}</strong>.
    </p>
    
    <h3 style="margin: 30px 0 15px 0; color: ${BRAND_COLORS.navy}; font-size: 18px;">Your New ${newTierDisplay} Features:</h3>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.lightGray}; border-radius: 8px; padding: 20px;">
      ${getFeaturesList(params.newTier)}
    </table>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: ${BRAND_COLORS.gold}; border-radius: 6px;">
          <a href="https://washbizhub.com/cleanbi-explorer" style="display: inline-block; padding: 14px 28px; color: ${BRAND_COLORS.navy}; text-decoration: none; font-weight: bold; font-size: 16px;">
            Explore Your New Features →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px;">
      <strong>New rate:</strong> $${(params.amount / 100).toFixed(2)}/${params.interval}
    </p>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Thank you for your continued trust in WashBizHub!<br>
      <strong style="color: ${BRAND_COLORS.gold};">The WashBizHub Team</strong>
    </p>
  `;
  
  return sendEmail({
    to: params.email,
    subject: `🚀 Upgraded to WashBizHub ${newTierDisplay}!`,
    html: getEmailTemplate(content),
    text: `Upgrade Confirmed!\n\nYour account has been upgraded from ${oldTierDisplay} to ${newTierDisplay}.\n\nNew rate: $${(params.amount / 100).toFixed(2)}/${params.interval}\n\nExplore your new features: https://washbizhub.com/cleanbi-explorer\n\nThank you for your trust!\nThe WashBizHub Team`,
  });
}

/**
 * Send payment failed reminder email
 */
export async function sendPaymentFailedEmail(params: {
  email: string;
  firstName?: string;
  tier: string;
  amount: number;
  retryDate?: string;
}): Promise<{ success: boolean; error?: string }> {
  const tierDisplay = params.tier.charAt(0).toUpperCase() + params.tier.slice(1);
  const name = params.firstName || 'there';
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #dc2626; font-size: 24px;">⚠️ Payment Issue - Action Required</h2>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Hey ${name},
    </p>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      We tried to process your WashBizHub ${tierDisplay} subscription payment of <strong>$${(params.amount / 100).toFixed(2)}</strong>, but it didn't go through.
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0; background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #dc2626;">
      <tr>
        <td>
          <p style="margin: 0 0 10px 0; color: #dc2626; font-weight: bold;">What happens next?</p>
          <p style="margin: 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px;">
            • We'll automatically retry the payment in a few days<br>
            • Your ${tierDisplay} access remains active during this period<br>
            • If payment continues to fail, your account will revert to Free tier
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      <strong>Common reasons for payment failure:</strong>
    </p>
    <ul style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px; line-height: 1.8;">
      <li>Expired card</li>
      <li>Insufficient funds</li>
      <li>Card blocked by bank</li>
    </ul>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: ${BRAND_COLORS.gold}; border-radius: 6px;">
          <a href="https://washbizhub.com/account" style="display: inline-block; padding: 14px 28px; color: ${BRAND_COLORS.navy}; text-decoration: none; font-weight: bold; font-size: 16px;">
            Update Payment Method →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px; line-height: 1.6;">
      Need help? Reply to this email or contact <a href="mailto:support@washbizhub.com" style="color: ${BRAND_COLORS.gold};">support@washbizhub.com</a>
    </p>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      We're here to help,<br>
      <strong style="color: ${BRAND_COLORS.gold};">The WashBizHub Team</strong>
    </p>
  `;
  
  return sendEmail({
    to: params.email,
    subject: `⚠️ Payment Failed - Update Your WashBizHub ${tierDisplay} Subscription`,
    html: getEmailTemplate(content),
    text: `Payment Issue - Action Required\n\nWe tried to process your WashBizHub ${tierDisplay} subscription payment of $${(params.amount / 100).toFixed(2)}, but it didn't go through.\n\nWhat happens next:\n- We'll automatically retry the payment in a few days\n- Your access remains active during this period\n- If payment continues to fail, your account will revert to Free tier\n\nUpdate your payment method: https://washbizhub.com/account\n\nNeed help? Contact support@washbizhub.com\n\nThe WashBizHub Team`,
  });
}

/**
 * Send refund confirmation email
 */
export async function sendRefundConfirmationEmail(params: {
  email: string;
  firstName?: string;
  tier: string;
  amount: number;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  const tierDisplay = params.tier.charAt(0).toUpperCase() + params.tier.slice(1);
  const name = params.firstName || 'there';
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.navy}; font-size: 24px;">Refund Processed</h2>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Hey ${name},
    </p>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Your refund of <strong>$${(params.amount / 100).toFixed(2)}</strong> for WashBizHub ${tierDisplay} has been processed. The funds should appear in your account within 5-10 business days.
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0; background-color: ${BRAND_COLORS.lightGray}; border-radius: 8px; padding: 20px;">
      <tr>
        <td>
          <p style="margin: 0 0 10px 0; color: ${BRAND_COLORS.navy}; font-weight: bold;">Refund Details</p>
          <p style="margin: 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px;">
            <strong>Amount:</strong> $${(params.amount / 100).toFixed(2)}<br>
            <strong>Plan:</strong> ${tierDisplay}<br>
            <strong>Status:</strong> Processed
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Your account has been reverted to the <strong>Free tier</strong>. You still have access to:
    </p>
    <ul style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px; line-height: 1.8;">
      <li>3 CLEANBI location analyses</li>
      <li>Basic calculators</li>
      <li>Community forum (read-only)</li>
      <li>Educational content</li>
    </ul>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      We're sorry to see you go. If there's anything we could have done better, we'd love to hear your feedback at <a href="mailto:feedback@washbizhub.com" style="color: ${BRAND_COLORS.gold};">feedback@washbizhub.com</a>.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: ${BRAND_COLORS.navy}; border-radius: 6px;">
          <a href="https://washbizhub.com/pricing" style="display: inline-block; padding: 14px 28px; color: ${BRAND_COLORS.gold}; text-decoration: none; font-weight: bold; font-size: 16px;">
            View Current Plans →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: ${BRAND_COLORS.gold};">The WashBizHub Team</strong>
    </p>
  `;
  
  return sendEmail({
    to: params.email,
    subject: `Refund Processed - $${(params.amount / 100).toFixed(2)}`,
    html: getEmailTemplate(content),
    text: `Refund Processed\n\nYour refund of $${(params.amount / 100).toFixed(2)} for WashBizHub ${tierDisplay} has been processed. The funds should appear in your account within 5-10 business days.\n\nYour account has been reverted to the Free tier.\n\nWe're sorry to see you go. If there's anything we could have done better, please email feedback@washbizhub.com.\n\nView current plans: https://washbizhub.com/pricing\n\nBest regards,\nThe WashBizHub Team`,
  });
}

/**
 * Send subscription cancellation email
 */
export async function sendCancellationEmail(params: {
  email: string;
  firstName?: string;
  tier: string;
  endDate: Date;
}): Promise<{ success: boolean; error?: string }> {
  const tierDisplay = params.tier.charAt(0).toUpperCase() + params.tier.slice(1);
  const name = params.firstName || 'there';
  const endDateFormatted = params.endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.navy}; font-size: 24px;">Subscription Canceled</h2>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Hey ${name},
    </p>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Your WashBizHub ${tierDisplay} subscription has been canceled as requested.
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0; background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid ${BRAND_COLORS.gold};">
      <tr>
        <td>
          <p style="margin: 0 0 10px 0; color: ${BRAND_COLORS.navy}; font-weight: bold;">You still have access until ${endDateFormatted}</p>
          <p style="margin: 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px;">
            After this date, your account will revert to the Free tier with limited features.
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Changed your mind? You can resubscribe anytime to regain full access.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: ${BRAND_COLORS.gold}; border-radius: 6px;">
          <a href="https://washbizhub.com/pricing" style="display: inline-block; padding: 14px 28px; color: ${BRAND_COLORS.navy}; text-decoration: none; font-weight: bold; font-size: 16px;">
            Resubscribe →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 14px; line-height: 1.6;">
      We'd love to know why you canceled. Your feedback helps us improve: <a href="mailto:feedback@washbizhub.com" style="color: ${BRAND_COLORS.gold};">feedback@washbizhub.com</a>
    </p>
    
    <p style="margin: 20px 0 0 0; color: ${BRAND_COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: ${BRAND_COLORS.gold};">The WashBizHub Team</strong>
    </p>
  `;
  
  return sendEmail({
    to: params.email,
    subject: `Your WashBizHub ${tierDisplay} subscription has been canceled`,
    html: getEmailTemplate(content),
    text: `Subscription Canceled\n\nYour WashBizHub ${tierDisplay} subscription has been canceled.\n\nYou still have access until ${endDateFormatted}. After this date, your account will revert to the Free tier.\n\nChanged your mind? Resubscribe anytime: https://washbizhub.com/pricing\n\nWe'd love to know why you canceled: feedback@washbizhub.com\n\nBest regards,\nThe WashBizHub Team`,
  });
}
