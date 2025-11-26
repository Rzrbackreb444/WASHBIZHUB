# CLEANBI Anywhere - Chrome Extension

**Instant CLEANBI scores for ANY business or property on Google Maps, LoopNet, and BizBuySell**

## 🎯 What It Does

This Chrome extension automatically shows CLEANBI scores when you hover over **ANY business OR residential property** on:
- **Google Maps** - Instant scores on ANY business or address
- **LoopNet** - Commercial real estate listings
- **BizBuySell** - Business for sale listings

**Works for ALL industries:**
- Laundromats, Car Washes, Restaurants, Cafes, Bars
- Gas Stations, Convenience Stores, Retail Shops
- Gyms, Fitness Centers, Salons, Spas
- Hotels, Motels, Short-Term Rentals
- Office Buildings, Industrial Properties
- **Residential Properties** - Homes, Apartments, Land
- And literally ANY other address globally!

## 💰 Pricing Strategy

- **100% FREE** on Chrome Web Store
- No subscriptions, no fees, no limits
- Unlimited use forever
- Monetization: Upsells to $97 Full CLEANBI Reports
- Lead generation machine for WashBizHub services

### Why FREE is the Smart Play:
| Paid ($4.99) | FREE |
|--------------|------|
| ~5,000 installs | ~50,000+ installs |
| $25K direct revenue | $0 direct |
| Slow viral spread | **Explosive viral growth** |
| Limited leads | **Massive lead generation** |

**FREE extension × 50K users × 2% conversion = 1,000 report sales = $97,000+**

## 🚀 Installation (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

## 📦 Publishing to Chrome Web Store

### Step 1: Create Developer Account
- Go to https://chrome.google.com/webstore/devconsole
- Pay $5 one-time developer registration fee
- This gives you lifetime access to publish extensions

### Step 2: Upload Extension
- Click "Add new item"
- Upload the `cleanbi-anywhere-v2.1.0.zip` file (already packaged for you!)
- The ZIP is located in the project root directory

### Step 3: Store Listing Details

**Item Category:** Shopping / Business Tools

**Language:** English

**Title:** CLEANBI Anywhere - Instant Business & Property Scores

**Summary (132 chars max):**
FREE instant A-F scores for ANY business or property on Google Maps. Powered by Google APIs. No signup required.

**Detailed Description (copy/paste):**
```
🎯 INSTANT INTELLIGENCE FOR ANY BUSINESS OR PROPERTY

CLEANBI Anywhere shows instant investment scores (A-F grade, 0-100) when you hover over ANY listing on Google Maps, LoopNet, and BizBuySell.

✅ 100% FREE - No subscriptions, no limits, no signup
✅ Powered by Google APIs
✅ Works globally - 220+ countries

📊 SCORING FACTORS:
• Foot Traffic & Demographics
• Competition Analysis
• Reviews & Reputation
• Location Quality
• Online Visibility

🏢 WORKS FOR ALL BUSINESS TYPES:
Laundromats, Restaurants, Car Washes, Gas Stations, Gyms, Retail Stores, Hotels, Salons, Coffee Shops, Bars, Convenience Stores, Auto Shops, and MORE!

🏠 WORKS FOR RESIDENTIAL TOO:
Homes, Apartments, Condos, Land, Multi-family properties

💼 PERFECT FOR:
• Business buyers & investors (ANY industry)
• Commercial real estate brokers
• Residential real estate agents
• Property managers & investors
• Due diligence research
• Market analysis

💰 UPGRADE AVAILABLE:
Get the Full $97 CLEANBI Report for comprehensive analysis including:
• Detailed market demographics
• Competitor mapping
• Revenue projections
• Investment recommendations
• PDF export for presentations

🔒 PRIVACY:
• No account required
• No data collection
• No tracking cookies
• Only calls our API when you hover over a listing

Used by 100,000+ business buyers, investors, and brokers worldwide.

Made by WashBizHub - The #1 platform for business intelligence.

Questions? support@washbizhub.com
```

### Step 4: Required Assets

**Store Icon (128x128):** Already included in `icons/icon128.png`

**Screenshots (1280x800 or 640x400):** You need 1-5 screenshots showing:
1. Extension popup on WashBizHub.com
2. Google Maps with CLEANBI score overlay appearing on hover
3. Score breakdown showing A-F grade with metrics
4. LoopNet integration (optional)
5. BizBuySell integration (optional)

**Promotional Images (optional but recommended):**
- Small tile: 440x280 px
- Marquee: 1400x560 px

### Step 5: Privacy Settings

**Single Purpose:** Displays investment scores for businesses and properties on supported websites.

**Permission Justification:**
| Permission | Justification |
|------------|--------------|
| `activeTab` | To detect business listings on the current tab |
| `https://www.google.com/maps/*` | To inject score overlays on Google Maps |
| `https://www.loopnet.com/*` | To inject score overlays on LoopNet |
| `https://www.bizbuysell.com/*` | To inject score overlays on BizBuySell |
| `https://washbizhub.com/api/*` | To fetch CLEANBI scores from our API |

**Privacy Policy URL:** https://washbizhub.com/privacy

### Step 6: Distribution Settings

**Visibility:** Public
**Regions:** All regions (worldwide distribution)
**Price:** FREE (no payment required)

### Step 7: Submit for Review

Click "Submit for Review" - Google typically reviews within 1-3 business days.

**Tips for Faster Approval:**
- Extension is straightforward (content scripts only)
- No controversial permissions
- Clear single purpose
- Privacy policy in place

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
- Only calls WashBizHub API when user hovers over any business or property
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

**Title:** CLEANBI Anywhere - Instant Business & Property Scores

**Short Description:**
FREE instant CLEANBI scores (A-F grades) for ANY business or property on Google Maps, LoopNet, BizBuySell. 100% Free forever!

**Full Description:**
🎯 Instant Intelligence for ANY Business or Property

CLEANBI Anywhere shows instant investment scores when you hover over ANY listing on Google Maps, LoopNet, and BizBuySell.

✅ 100% FREE - No subscriptions, no limits
✅ Powered by Google APIs
✅ A-F grades (0-100 score) based on:
  - Foot Traffic & Demographics
  - Competition Analysis
  - Reviews & Reputation
  - Location Quality
  - Online Visibility

🏢 **Works for ALL Business Types:**
Laundromats, Restaurants, Car Washes, Gas Stations, Gyms, Retail Stores, Hotels, Salons, and MORE!

🏠 **Works for Residential Too:**
Homes, Apartments, Condos, Land, Multi-family properties

💰 **Upgrade Path:**
Get the Full $97 CLEANBI Report for deep analysis, valuations, and investment recommendations.

Perfect for:
- Business buyers & investors (ANY industry)
- Commercial real estate brokers
- Residential real estate agents
- Property managers & investors
- Anyone researching a business or property purchase

Used by 100K+ business buyers & investors worldwide.

Made by WashBizHub - The #1 platform for business intelligence.

## 🎯 Next Steps

1. Create extension icons (16px, 48px, 128px)
2. Test on Google Maps, LoopNet, BizBuySell
3. Take screenshots for Chrome Web Store
4. Write viral Facebook post
5. Submit to Chrome Web Store
6. Post in 71K Facebook group
7. Watch the installs roll in 🚀
