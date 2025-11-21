import crypto from 'crypto';
import fetch from 'node-fetch';

/**
 * Amazon Product Advertising API 5.0 Integration
 * Storefront: nicholaskreme-20
 * One-click parts ordering for laundromat equipment
 */

interface AmazonConfig {
  accessKey: string;
  secretKey: string;
  associateTag: string;
  region: string;
  host: string;
}

interface ProductSearchParams {
  keywords: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  itemCount?: number;
}

interface AmazonProduct {
  asin: string;
  title: string;
  brand?: string;
  price?: {
    amount: number;
    currency: string;
    displayAmount: string;
  };
  image?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  isPrimeEligible?: boolean;
  availability?: string;
}

export class AmazonProductAPI {
  private config: AmazonConfig;
  private serviceName = 'ProductAdvertisingAPI';
  private version = 'paapi5';

  constructor() {
    this.config = {
      accessKey: process.env.AMAZON_ACCESS_KEY_ID || '',
      secretKey: process.env.AMAZON_SECRET_ACCESS_KEY || '',
      associateTag: process.env.AMAZON_ASSOCIATE_TAG || 'nicholaskreme-20',
      region: 'us-east-1',
      host: 'webservices.amazon.com',
    };
  }

  /**
   * Generate AWS Signature Version 4
   */
  private generateSignature(
    method: string,
    path: string,
    queryString: string,
    headers: Record<string, string>,
    payload: string,
    timestamp: string
  ): string {
    const dateStamp = timestamp.slice(0, 8);
    
    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
      .join('');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = [
      method,
      path,
      queryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');
    
    // Create string to sign
    const credentialScope = `${dateStamp}/${this.config.region}/${this.serviceName}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');
    
    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${this.config.secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.config.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(this.serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
    
    return signature;
  }

  /**
   * Search for products (parts, equipment, supplies)
   */
  async searchProducts(params: ProductSearchParams): Promise<AmazonProduct[]> {
    if (!this.config.accessKey || !this.config.secretKey) {
      console.warn('Amazon API credentials not configured');
      return [];
    }

    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const path = '/paapi5/searchitems';
    
    const requestPayload = {
      PartnerTag: this.config.associateTag,
      PartnerType: 'Associates',
      Keywords: params.keywords,
      SearchIndex: params.category || 'All',
      ItemCount: params.itemCount || 10,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'Offers.Listings.Price',
        'Offers.Listings.ProgramEligibility.IsPrimeExclusive',
        'Offers.Listings.Availability.Message',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count',
      ],
    };

    if (params.minPrice) {
      (requestPayload as any).MinPrice = params.minPrice * 100;
    }
    if (params.maxPrice) {
      (requestPayload as any).MaxPrice = params.maxPrice * 100;
    }
    if (params.brand) {
      (requestPayload as any).Brand = params.brand;
    }

    const payload = JSON.stringify(requestPayload);
    
    const headers = {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      'host': this.config.host,
      'x-amz-date': timestamp,
      'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
    };

    const signature = this.generateSignature('POST', path, '', headers, payload, timestamp);
    
    const authHeader = `AWS4-HMAC-SHA256 Credential=${this.config.accessKey}/${timestamp.slice(0, 8)}/${this.config.region}/${this.serviceName}/aws4_request, SignedHeaders=${Object.keys(headers).map(k => k.toLowerCase()).sort().join(';')}, Signature=${signature}`;

    try {
      const response = await fetch(`https://${this.config.host}${path}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': authHeader,
        },
        body: payload,
      });

      if (!response.ok) {
        console.error('Amazon API error:', response.status, await response.text());
        return [];
      }

      const data = await response.json();
      
      return (data.SearchResult?.Items || []).map((item: any) => ({
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || '',
        brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
        price: item.Offers?.Listings?.[0]?.Price ? {
          amount: item.Offers.Listings[0].Price.Amount,
          currency: item.Offers.Listings[0].Price.Currency,
          displayAmount: item.Offers.Listings[0].Price.DisplayAmount,
        } : undefined,
        image: item.Images?.Primary?.Large?.URL,
        rating: item.CustomerReviews?.StarRating?.Value,
        reviewCount: item.CustomerReviews?.Count,
        url: item.DetailPageURL || `https://www.amazon.com/dp/${item.ASIN}/?tag=${this.config.associateTag}`,
        isPrimeEligible: item.Offers?.Listings?.[0]?.ProgramEligibility?.IsPrimeExclusive,
        availability: item.Offers?.Listings?.[0]?.Availability?.Message,
      }));
    } catch (error) {
      console.error('Amazon API request failed:', error);
      return [];
    }
  }

  /**
   * Get product details by ASIN
   */
  async getProductDetails(asin: string): Promise<AmazonProduct | null> {
    if (!this.config.accessKey || !this.config.secretKey) {
      console.warn('Amazon API credentials not configured');
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const path = '/paapi5/getitems';
    
    const requestPayload = {
      PartnerTag: this.config.associateTag,
      PartnerType: 'Associates',
      ItemIds: [asin],
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'Offers.Listings.ProgramEligibility.IsPrimeExclusive',
        'Offers.Listings.Availability.Message',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count',
      ],
    };

    const payload = JSON.stringify(requestPayload);
    
    const headers = {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      'host': this.config.host,
      'x-amz-date': timestamp,
      'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
    };

    const signature = this.generateSignature('POST', path, '', headers, payload, timestamp);
    
    const authHeader = `AWS4-HMAC-SHA256 Credential=${this.config.accessKey}/${timestamp.slice(0, 8)}/${this.config.region}/${this.serviceName}/aws4_request, SignedHeaders=${Object.keys(headers).map(k => k.toLowerCase()).sort().join(';')}, Signature=${signature}`;

    try {
      const response = await fetch(`https://${this.config.host}${path}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': authHeader,
        },
        body: payload,
      });

      if (!response.ok) {
        console.error('Amazon API error:', response.status, await response.text());
        return null;
      }

      const data = await response.json();
      const item = data.ItemsResult?.Items?.[0];
      
      if (!item) return null;

      return {
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || '',
        brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
        price: item.Offers?.Listings?.[0]?.Price ? {
          amount: item.Offers.Listings[0].Price.Amount,
          currency: item.Offers.Listings[0].Price.Currency,
          displayAmount: item.Offers.Listings[0].Price.DisplayAmount,
        } : undefined,
        image: item.Images?.Primary?.Large?.URL,
        rating: item.CustomerReviews?.StarRating?.Value,
        reviewCount: item.CustomerReviews?.Count,
        url: item.DetailPageURL || `https://www.amazon.com/dp/${item.ASIN}/?tag=${this.config.associateTag}`,
        isPrimeEligible: item.Offers?.Listings?.[0]?.ProgramEligibility?.IsPrimeExclusive,
        availability: item.Offers?.Listings?.[0]?.Availability?.Message,
      };
    } catch (error) {
      console.error('Amazon API request failed:', error);
      return null;
    }
  }

  /**
   * Generate affiliate link for a product
   */
  generateAffiliateLink(asin: string): string {
    return `https://www.amazon.com/dp/${asin}/?tag=${this.config.associateTag}`;
  }
}

/**
 * Laundromat-specific parts catalog
 */
export const LAUNDROMAT_PARTS_CATALOG = {
  washer: {
    motors: ['washer motor', 'washing machine motor replacement'],
    belts: ['washer belt', 'washing machine drive belt'],
    pumps: ['washer drain pump', 'washing machine water pump'],
    valves: ['washer inlet valve', 'washing machine water valve'],
    controls: ['washer control board', 'washing machine timer'],
    doors: ['washer door seal', 'washing machine door boot'],
  },
  dryer: {
    motors: ['dryer motor', 'clothes dryer motor replacement'],
    belts: ['dryer belt', 'clothes dryer drive belt'],
    heating: ['dryer heating element', 'dryer thermal fuse'],
    rollers: ['dryer drum roller', 'dryer support wheel'],
    controls: ['dryer control board', 'dryer timer knob'],
    venting: ['dryer vent hose', 'dryer vent cleaning kit'],
  },
  commercial: {
    coins: ['commercial coin box', 'laundromat coin mechanism'],
    payment: ['coin acceptor', 'card reader laundromat'],
    supplies: ['laundry detergent commercial', 'fabric softener bulk'],
    carts: ['laundry cart commercial', 'rolling laundry basket'],
    signage: ['laundromat signage', 'out of order sign'],
  },
  maintenance: {
    tools: ['appliance repair tool kit', 'multimeter digital'],
    cleaning: ['washing machine cleaner', 'dryer lint brush'],
    lubricants: ['appliance grease', 'silicone lubricant spray'],
    fasteners: ['washer screw kit', 'dryer mounting hardware'],
  },
};

export const amazonAPI = new AmazonProductAPI();
