import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'alerts@washbizhub.com';
const ADMIN_EMAIL = 'nick@washbizhub.com';

interface PriceDropAlert {
  email: string;
  productTitle: string;
  productASIN: string;
  oldPrice: number;
  newPrice: number;
  savings: number;
  savingsPercent: number;
  productUrl: string;
}

interface BackInStockAlert {
  email: string;
  productTitle: string;
  productASIN: string;
  productUrl: string;
}

interface NewProductAlert {
  email: string;
  category: string;
  products: Array<{
    title: string;
    asin: string;
    price: number;
    url: string;
  }>;
}

interface DealAlert {
  email: string;
  deals: Array<{
    title: string;
    asin: string;
    originalPrice: number;
    salePrice: number;
    discount: number;
    url: string;
  }>;
}

interface BrowseAbandonmentReminder {
  email: string;
  products: Array<{
    title: string;
    asin: string;
    price: number;
    url: string;
  }>;
}

// Send price drop alert
export async function sendPriceDropAlert(data: PriceDropAlert) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `🔥 Price Drop Alert: ${data.productTitle} - Save $${data.savings.toFixed(2)}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a2332;">Price Drop Alert! 🎉</h1>
          <p>Great news! The price on <strong>${data.productTitle}</strong> has dropped!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Was: <span style="text-decoration: line-through;">$${data.oldPrice.toFixed(2)}</span></p>
            <p style="font-size: 28px; color: #C8A661; font-weight: bold; margin: 10px 0;">Now: $${data.newPrice.toFixed(2)}</p>
            <p style="font-size: 18px; color: #22c55e; font-weight: bold; margin: 0;">Save ${data.savingsPercent.toFixed(0)}% ($${data.savings.toFixed(2)})</p>
          </div>
          
          <a href="${data.productUrl}" style="display: inline-block; background: #C8A661; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            View Product →
          </a>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            This price was checked on ${new Date().toLocaleDateString()}. Prices may change.
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Price drop alert sent to ${data.email} for ${data.productASIN}`);
  } catch (error) {
    console.error('❌ Failed to send price drop alert:', error);
    throw error;
  }
}

// Send back-in-stock alert
export async function sendBackInStockAlert(data: BackInStockAlert) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `✅ Back in Stock: ${data.productTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a2332;">It's Back! ✅</h1>
          <p><strong>${data.productTitle}</strong> is now back in stock!</p>
          
          <p style="margin: 30px 0;">Don't miss out - items sell fast!</p>
          
          <a href="${data.productUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Get It Now →
          </a>
        </div>
      `,
    });
    
    console.log(`✅ Back-in-stock alert sent to ${data.email} for ${data.productASIN}`);
  } catch (error) {
    console.error('❌ Failed to send back-in-stock alert:', error);
    throw error;
  }
}

// Send new product alert
export async function sendNewProductAlert(data: NewProductAlert) {
  try {
    const productList = data.products.map(p => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3 style="margin: 0 0 10px 0;">${p.title}</h3>
        <p style="font-size: 20px; color: #C8A661; font-weight: bold; margin: 10px 0;">$${p.price.toFixed(2)}</p>
        <a href="${p.url}" style="color: #1a2332; text-decoration: none;">View Details →</a>
      </div>
    `).join('');
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `🆕 New ${data.category} Products Added!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a2332;">New Products Just Added! 🆕</h1>
          <p>Check out the latest additions to our <strong>${data.category}</strong> collection:</p>
          
          ${productList}
          
          <a href="https://washbizhub.com/superstore?category=${data.category}" style="display: inline-block; background: #1a2332; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            Browse All ${data.category} →
          </a>
        </div>
      `,
    });
    
    console.log(`✅ New product alert sent to ${data.email} for category ${data.category}`);
  } catch (error) {
    console.error('❌ Failed to send new product alert:', error);
    throw error;
  }
}

// Send deal alert
export async function sendDealAlert(data: DealAlert) {
  try {
    const dealsList = data.deals.map(d => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3 style="margin: 0 0 10px 0;">${d.title}</h3>
        <p style="font-size: 14px; color: #666;">Was: <span style="text-decoration: line-through;">$${d.originalPrice.toFixed(2)}</span></p>
        <p style="font-size: 24px; color: #22c55e; font-weight: bold; margin: 5px 0;">Now: $${d.salePrice.toFixed(2)}</p>
        <p style="color: #ef4444; font-weight: bold;">${d.discount.toFixed(0)}% OFF!</p>
        <a href="${d.url}" style="color: #1a2332; text-decoration: none;">Grab This Deal →</a>
      </div>
    `).join('');
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `🔥 Hot Deals Alert - Save Big on Equipment!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a2332;">Hot Deals Alert! 🔥</h1>
          <p>Limited-time deals matching your preferences:</p>
          
          ${dealsList}
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Hurry - deals end soon! Prices may change without notice.
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Deal alert sent to ${data.email}`);
  } catch (error) {
    console.error('❌ Failed to send deal alert:', error);
    throw error;
  }
}

// Send browse abandonment reminder
export async function sendBrowseAbandonmentReminder(data: BrowseAbandonmentReminder) {
  try {
    const productList = data.products.map(p => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3 style="margin: 0 0 10px 0;">${p.title}</h3>
        <p style="font-size: 20px; color: #C8A661; font-weight: bold; margin: 10px 0;">$${p.price.toFixed(2)}</p>
        <a href="${p.url}" style="color: #1a2332; text-decoration: none;">Continue Shopping →</a>
      </div>
    `).join('');
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Don't Forget! Products You Were Looking At`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a2332;">Still Interested? 👀</h1>
          <p>You were checking out these products earlier:</p>
          
          ${productList}
          
          <p style="margin: 30px 0;">Questions? Our equipment experts are here to help!</p>
          
          <a href="https://washbizhub.com/consultation" style="display: inline-block; background: #C8A661; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Get Expert Advice →
          </a>
        </div>
      `,
    });
    
    console.log(`✅ Browse abandonment reminder sent to ${data.email}`);
  } catch (error) {
    console.error('❌ Failed to send browse abandonment reminder:', error);
    throw error;
  }
}

// Notify admin of new alert subscription
export async function notifyAdminNewAlert(type: string, email: string, details: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 New ${type} Alert Subscription`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Alert Subscription</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Details:</strong> ${details}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Failed to notify admin:', error);
  }
}
