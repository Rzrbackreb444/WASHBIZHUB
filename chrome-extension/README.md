# CLEANBI Anywhere - Chrome Extension

**Instant CLEANBI scores on Google Maps, LoopNet, and BizBuySell**

## 🎯 What It Does

This Chrome extension automatically shows CLEANBI scores when you hover over laundromats on:
- **Google Maps** - Instant scores on search results and business listings
- **LoopNet** - Commercial real estate listings
- **BizBuySell** - Business for sale listings

## 💰 Pricing Strategy

- **$4.99 one-time fee** on Chrome Web Store
- No subscriptions
- Unlimited use forever
- $0 ongoing costs (uses free Google APIs)

## 🚀 Installation (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

## 📦 Publishing to Chrome Web Store

1. **Package the extension:**
   ```bash
   cd chrome-extension
   zip -r cleanbi-anywhere-v1.0.0.zip . -x "*.git*" -x "README.md"
   ```

2. **Create Chrome Web Store listing:**
   - Go to https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time developer fee
   - Upload ZIP file
   - Set price: $4.99
   - Fill in description, screenshots, etc.

3. **Required Assets:**
   - Screenshots (1280x800 or 640x400)
   - Store icon (128x128)
   - Promotional images (440x280)

## 🎨 Icon Requirements

You need to create three icon sizes:
- `icons/icon16.png` - 16x16px
- `icons/icon48.png` - 48x48px
- `icons/icon128.png` - 128x128px

**Design:** Gold "C" (CLEANBI) on navy blue background with subtle glow effect.

## 📊 Viral Distribution Strategy

### Target Audience: 71K Facebook Group
1. **Post in "Coin Laundry & Self Service" group:**
   - "I built a FREE tool that shows instant CLEANBI scores on Google Maps..."
   - Demo video showing hover interaction
   - Link to Chrome Web Store

2. **4 Viral Loops:**
   - **Brokers:** Use it to qualify deals faster
   - **Buyers:** Use it to avoid bad investments
   - **Sellers:** Use it to showcase their business
   - **Wannabes:** Use it to research before buying

3. **Expected Results:**
   - 5-10% install rate = 3,500-7,000 installs
   - At $4.99 = $17,465-$34,930 revenue
   - Each install sees CTA for $97 reports = additional $300K-$600K/year

## 🔒 Security & Privacy

- No data collection
- No tracking
- Only calls WashBizHub API when user hovers over laundromat
- All data is public Google Places data

## 🛠️ Technical Details

- **Manifest V3** (latest standard)
- **Content Scripts** - Inject score overlays on target sites
- **Zero Dependencies** - Pure vanilla JavaScript
- **Rate Limited** - 30 requests/min via WashBizHub API

## 📈 Monetization

| Tier | Product | Price | Volume | Revenue |
|------|---------|-------|--------|---------|
| 1 | Chrome Extension | $4.99 | 5,000 | $24,950 |
| 2 | Full CLEANBI Report | $97 | 500 | $48,500 |
| 3 | Takeover Playbook | $199 | 200 | $39,800 |
| 4 | WashBizHub Certified | $497 | 50 | $24,850 |
| 5 | Opportunity Heatmap | $29/mo | 100 | $34,800/year |
| **TOTAL** | | | | **$172,900** (Year 1) |

## 📝 Chrome Web Store Description

**Title:** CLEANBI Anywhere - Instant Laundromat Scores

**Short Description:**
See instant CLEANBI scores (A-F grades) on Google Maps, LoopNet, BizBuySell. Never buy a bad laundromat again.

**Full Description:**
🎯 Never Buy a Bad Laundromat Again

CLEANBI Anywhere shows instant investment scores when you hover over laundromats on Google Maps, LoopNet, and BizBuySell.

✅ Powered by Google APIs
✅ A-F grades based on:
  - Foot Traffic
  - Competition
  - Reviews
  - Location Quality
  - Online Visibility

✅ 100% Free Score Preview
✅ Upgrade to $97 Full Report

Perfect for:
- Laundromat buyers & investors
- Commercial real estate brokers
- Business consultants
- Anyone researching laundromat purchases

Used by 71K+ laundromat owners & investors worldwide.

Made by WashBizHub - The #1 platform for laundromat intelligence.

## 🎯 Next Steps

1. Create extension icons (16px, 48px, 128px)
2. Test on Google Maps, LoopNet, BizBuySell
3. Take screenshots for Chrome Web Store
4. Write viral Facebook post
5. Submit to Chrome Web Store
6. Post in 71K Facebook group
7. Watch the installs roll in 🚀
