/**
 * Listing Parser - Extract data from BizBuySell, LoopNet, and other listing sites
 * Parses listing URLs to extract address, price, revenue, and other financial data
 */

export interface ParsedListing {
  source: 'bizbuysell' | 'loopnet' | 'businessbroker' | 'unknown';
  url: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fullAddress?: string;
  askingPrice?: number;
  annualRevenue?: number;
  cashFlow?: number;
  inventory?: number;
  realEstate?: string;
  sqft?: number;
  employees?: number;
  established?: number;
  description?: string;
  brokerName?: string;
  brokerPhone?: string;
  listingId?: string;
  imageUrl?: string;
  confidence: number;
  rawData?: Record<string, string>;
  error?: string;
}

function cleanPrice(priceStr: string | undefined): number | undefined {
  if (!priceStr) return undefined;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function extractAddressFromText(text: string): { city?: string; state?: string; zipCode?: string } {
  const stateAbbrevs = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];
  
  const statePattern = new RegExp(`\\b(${stateAbbrevs.join('|')})\\b`, 'i');
  const zipPattern = /\b(\d{5}(?:-\d{4})?)\b/;
  const cityStatePattern = /([A-Za-z\s]+),?\s*([A-Z]{2})/i;
  
  let city: string | undefined;
  let state: string | undefined;
  let zipCode: string | undefined;
  
  const zipMatch = text.match(zipPattern);
  if (zipMatch) zipCode = zipMatch[1];
  
  const cityStateMatch = text.match(cityStatePattern);
  if (cityStateMatch) {
    city = cityStateMatch[1].trim();
    state = cityStateMatch[2].toUpperCase();
  } else {
    const stateMatch = text.match(statePattern);
    if (stateMatch) state = stateMatch[1].toUpperCase();
  }
  
  return { city, state, zipCode };
}

export async function parseBizBuySellListing(url: string): Promise<ParsedListing> {
  const result: ParsedListing = {
    source: 'bizbuysell',
    url,
    confidence: 0,
    rawData: {}
  };
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      result.error = `Failed to fetch: ${response.status}`;
      return result;
    }
    
    const html = await response.text();
    
    const listingIdMatch = url.match(/\/(\d+)\/?$/);
    if (listingIdMatch) result.listingId = listingIdMatch[1];
    
    const titleMatch = html.match(/<h1[^>]*class="[^"]*bfsTitle[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<h1[^>]*>([^<]+(?:laundromat|laundry|coin)[^<]*)<\/h1>/i) ||
                       html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim().replace(/\s*-\s*BizBuySell.*$/i, '');
    }
    
    const locationPatterns = [
      /<span[^>]*class="[^"]*listing-location[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<div[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/div>/i,
      /Location:\s*<[^>]+>([^<]+)</i,
      /<meta[^>]*property="og:locality"[^>]*content="([^"]+)"/i,
    ];
    
    for (const pattern of locationPatterns) {
      const match = html.match(pattern);
      if (match) {
        const locationText = match[1].trim();
        const extracted = extractAddressFromText(locationText);
        if (extracted.city) result.city = extracted.city;
        if (extracted.state) result.state = extracted.state;
        if (extracted.zipCode) result.zipCode = extracted.zipCode;
        result.rawData!['location'] = locationText;
        break;
      }
    }
    
    const metaLocality = html.match(/<meta[^>]*property="og:locality"[^>]*content="([^"]+)"/i);
    const metaRegion = html.match(/<meta[^>]*property="og:region"[^>]*content="([^"]+)"/i);
    if (metaLocality) result.city = metaLocality[1];
    if (metaRegion) result.state = metaRegion[1];
    
    const pricePatterns = [
      /Asking\s*Price[:\s]*\$?([\d,]+)/i,
      /<span[^>]*class="[^"]*price[^"]*"[^>]*>\$?([\d,]+)/i,
      /\$\s*([\d,]+)\s*(?:asking|price)/i,
      /<meta[^>]*property="product:price:amount"[^>]*content="([\d.]+)"/i,
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        result.askingPrice = cleanPrice(match[1]);
        result.rawData!['askingPrice'] = match[1];
        break;
      }
    }
    
    const revenuePatterns = [
      /Gross\s*(?:Revenue|Sales|Income)[:\s]*\$?([\d,]+)/i,
      /Annual\s*Revenue[:\s]*\$?([\d,]+)/i,
      /Revenue[:\s]*\$?([\d,]+)/i,
    ];
    
    for (const pattern of revenuePatterns) {
      const match = html.match(pattern);
      if (match) {
        result.annualRevenue = cleanPrice(match[1]);
        result.rawData!['revenue'] = match[1];
        break;
      }
    }
    
    const cashFlowPatterns = [
      /Cash\s*Flow[:\s]*\$?([\d,]+)/i,
      /Discretionary\s*(?:Cash\s*Flow|Earnings)[:\s]*\$?([\d,]+)/i,
      /SDE[:\s]*\$?([\d,]+)/i,
      /EBITDA[:\s]*\$?([\d,]+)/i,
      /Net\s*(?:Income|Profit)[:\s]*\$?([\d,]+)/i,
    ];
    
    for (const pattern of cashFlowPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.cashFlow = cleanPrice(match[1]);
        result.rawData!['cashFlow'] = match[1];
        break;
      }
    }
    
    const sqftMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft\.?|square\s*feet)/i);
    if (sqftMatch) result.sqft = cleanPrice(sqftMatch[1]);
    
    const employeesMatch = html.match(/(\d+)\s*(?:employees?|staff|workers)/i);
    if (employeesMatch) result.employees = parseInt(employeesMatch[1]);
    
    const establishedMatch = html.match(/(?:established|founded|since)[:\s]*(\d{4})/i);
    if (establishedMatch) result.established = parseInt(establishedMatch[1]);
    
    const realEstateMatch = html.match(/Real\s*Estate[:\s]*([^<\n]+)/i);
    if (realEstateMatch) result.realEstate = realEstateMatch[1].trim();
    
    const inventoryMatch = html.match(/Inventory[:\s]*\$?([\d,]+)/i);
    if (inventoryMatch) result.inventory = cleanPrice(inventoryMatch[1]);
    
    const descPatterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    ];
    
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.description = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);
        break;
      }
    }
    
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (imageMatch) result.imageUrl = imageMatch[1];
    
    let confidenceScore = 0;
    if (result.title) confidenceScore += 15;
    if (result.city || result.state) confidenceScore += 25;
    if (result.askingPrice) confidenceScore += 20;
    if (result.annualRevenue) confidenceScore += 20;
    if (result.cashFlow) confidenceScore += 10;
    if (result.description) confidenceScore += 10;
    
    result.confidence = Math.min(100, confidenceScore);
    
    if (result.city && result.state) {
      result.fullAddress = `${result.city}, ${result.state}${result.zipCode ? ' ' + result.zipCode : ''}`;
    }
    
  } catch (error: any) {
    result.error = error.message;
  }
  
  return result;
}

export async function parseLoopNetListing(url: string): Promise<ParsedListing> {
  const result: ParsedListing = {
    source: 'loopnet',
    url,
    confidence: 0,
    rawData: {}
  };
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      result.error = `Failed to fetch: ${response.status}`;
      return result;
    }
    
    const html = await response.text();
    
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim().replace(/\s*\|.*$/i, '');
    }
    
    const addressPatterns = [
      /<span[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<h2[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/h2>/i,
      /property-address[^>]*>([^<]+)</i,
    ];
    
    for (const pattern of addressPatterns) {
      const match = html.match(pattern);
      if (match) {
        const addressText = match[1].trim();
        result.address = addressText;
        const extracted = extractAddressFromText(addressText);
        if (extracted.city) result.city = extracted.city;
        if (extracted.state) result.state = extracted.state;
        if (extracted.zipCode) result.zipCode = extracted.zipCode;
        break;
      }
    }
    
    const pricePatterns = [
      /Price[:\s]*\$?([\d,]+)/i,
      /Sale\s*Price[:\s]*\$?([\d,]+)/i,
      /\$\s*([\d,]+(?:,\d{3})*)/,
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const price = cleanPrice(match[1]);
        if (price && price > 10000) {
          result.askingPrice = price;
          break;
        }
      }
    }
    
    const sqftMatch = html.match(/([\d,]+)\s*SF/i) || html.match(/([\d,]+)\s*sq\.?\s*ft/i);
    if (sqftMatch) result.sqft = cleanPrice(sqftMatch[1]);
    
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (imageMatch) result.imageUrl = imageMatch[1];
    
    let confidenceScore = 0;
    if (result.title) confidenceScore += 15;
    if (result.address || result.city) confidenceScore += 30;
    if (result.askingPrice) confidenceScore += 25;
    if (result.sqft) confidenceScore += 15;
    if (result.description) confidenceScore += 15;
    
    result.confidence = Math.min(100, confidenceScore);
    
    if (result.city && result.state) {
      result.fullAddress = `${result.city}, ${result.state}${result.zipCode ? ' ' + result.zipCode : ''}`;
    } else if (result.address) {
      result.fullAddress = result.address;
    }
    
  } catch (error: any) {
    result.error = error.message;
  }
  
  return result;
}

export async function parseListingUrl(url: string): Promise<ParsedListing> {
  if (!url || typeof url !== 'string') {
    return {
      source: 'unknown',
      url: url || '',
      confidence: 0,
      error: 'Invalid URL provided'
    };
  }
  
  const normalizedUrl = url.trim().toLowerCase();
  
  if (normalizedUrl.includes('bizbuysell.com')) {
    return parseBizBuySellListing(url);
  }
  
  if (normalizedUrl.includes('loopnet.com')) {
    return parseLoopNetListing(url);
  }
  
  if (normalizedUrl.includes('businessbroker.net')) {
    return parseBizBuySellListing(url);
  }
  
  if (normalizedUrl.includes('businessesforsale.com')) {
    return parseBizBuySellListing(url);
  }
  
  return {
    source: 'unknown',
    url,
    confidence: 0,
    error: 'Unsupported listing site. Currently supports: BizBuySell, LoopNet, BusinessBroker.net'
  };
}

export function calculateDealMetrics(listing: ParsedListing): {
  priceToRevenueMultiple?: number;
  priceToCashFlowMultiple?: number;
  verdict?: 'great_deal' | 'fair_price' | 'premium' | 'overpriced';
  verdictLabel?: string;
  verdictColor?: string;
  analysis?: string;
} {
  const result: ReturnType<typeof calculateDealMetrics> = {};
  
  if (listing.askingPrice && listing.annualRevenue) {
    result.priceToRevenueMultiple = Number((listing.askingPrice / listing.annualRevenue).toFixed(2));
  }
  
  if (listing.askingPrice && listing.cashFlow) {
    result.priceToCashFlowMultiple = Number((listing.askingPrice / listing.cashFlow).toFixed(2));
  }
  
  if (result.priceToRevenueMultiple !== undefined) {
    const multiple = result.priceToRevenueMultiple;
    
    if (multiple < 1.2) {
      result.verdict = 'great_deal';
      result.verdictLabel = 'Great Deal';
      result.verdictColor = '#22C55E';
      result.analysis = `At ${multiple.toFixed(2)}x revenue, this is significantly below market. Industry average is 1.5-2.5x. Investigate why it's priced low.`;
    } else if (multiple < 1.8) {
      result.verdict = 'fair_price';
      result.verdictLabel = 'Fair Price';
      result.verdictColor = '#A3E635';
      result.analysis = `At ${multiple.toFixed(2)}x revenue, this is fairly priced for the laundromat market. Good opportunity if fundamentals check out.`;
    } else if (multiple < 2.5) {
      result.verdict = 'premium';
      result.verdictLabel = 'Premium Pricing';
      result.verdictColor = '#FBBF24';
      result.analysis = `At ${multiple.toFixed(2)}x revenue, this is on the higher end. Ensure equipment is modern and location is prime to justify the premium.`;
    } else {
      result.verdict = 'overpriced';
      result.verdictLabel = 'Overpriced';
      result.verdictColor = '#EF4444';
      result.analysis = `At ${multiple.toFixed(2)}x revenue, this exceeds typical market multiples. Negotiate aggressively or look elsewhere.`;
    }
  }
  
  return result;
}
