import fetch from 'node-fetch';
import { AwsClient } from 'aws4fetch';

/**
 * Amazon Product Advertising API 5.0 Integration - PRODUCTION READY
 * Storefront: nicholaskreme-20
 * Features: Proper AWS SigV4, Rate Limiting, Error Handling, Security
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

// Rate limiting
const requestQueue: Array<() => Promise<any>> = [];
let isProcessing = false;
const MIN_REQUEST_INTERVAL = 1000; // 1 request per second (PA-API limit)
let lastRequestTime = 0;

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  
  while (requestQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    const request = requestQueue.shift();
    if (request) {
      lastRequestTime = Date.now();
      await request();
    }
  }
  
  isProcessing = false;
}

function queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

export class AmazonProductAPI {
  private config: AmazonConfig;
  private awsClient: AwsClient | null = null;

  constructor() {
    this.config = {
      accessKey: process.env.AMAZON_ACCESS_KEY_ID || '',
      secretKey: process.env.AMAZON_SECRET_ACCESS_KEY || '',
      associateTag: process.env.AMAZON_ASSOCIATE_TAG || 'nicholaskreme-20',
      region: 'us-east-1',
      host: 'webservices.amazon.com',
    };

    // Initialize AWS client if credentials are available
    if (this.config.accessKey && this.config.secretKey) {
      this.awsClient = new AwsClient({
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
        region: this.config.region,
        service: 'ProductAdvertisingAPI',
      });
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!(this.config.accessKey && this.config.secretKey && this.awsClient);
  }

  /**
   * Make signed request to Amazon PA-API with retry logic
   */
  private async makeRequest<T>(
    path: string,
    target: string,
    payload: any,
    retries = 3
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Amazon API credentials not configured');
    }

    const url = `https://${this.config.host}${path}`;
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Encoding': 'amz-1.0',
      'X-Amz-Target': target,
      'Host': this.config.host,
    };

    const body = JSON.stringify(payload);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const signedRequest = await this.awsClient!.sign(url, {
          method: 'POST',
          headers,
          body,
        });

        const response = await fetch(url, {
          method: 'POST',
          headers: signedRequest.headers as any,
          body,
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Handle rate limiting
          if (response.status === 429) {
            if (attempt < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
              continue;
            }
            throw new Error('Amazon API rate limit exceeded. Please try again later.');
          }

          // Handle other errors
          throw new Error(`Amazon API error (${response.status}): ${errorText.slice(0, 200)}`);
        }

        return await response.json() as T;
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
      }
    }

    throw new Error('Amazon API request failed after retries');
  }

  /**
   * Search for products with rate limiting
   */
  async searchProducts(params: ProductSearchParams): Promise<AmazonProduct[]> {
    if (!this.isConfigured()) {
      console.warn('Amazon API credentials not configured');
      return [];
    }

    return queueRequest(async () => {
      try {
        const requestPayload = {
          PartnerTag: this.config.associateTag,
          PartnerType: 'Associates',
          Keywords: params.keywords,
          SearchIndex: params.category || 'All',
          ItemCount: Math.min(params.itemCount || 10, 10), // Max 10 per request
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
          (requestPayload as any).MinPrice = Math.floor(params.minPrice * 100);
        }
        if (params.maxPrice) {
          (requestPayload as any).MaxPrice = Math.floor(params.maxPrice * 100);
        }
        if (params.brand) {
          (requestPayload as any).Brand = params.brand;
        }

        const data = await this.makeRequest<any>(
          '/paapi5/searchitems',
          'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
          requestPayload
        );

        if (!data.SearchResult?.Items) {
          return [];
        }

        return data.SearchResult.Items.map((item: any) => this.parseProduct(item));
      } catch (error) {
        console.error('Amazon search error:', error);
        return [];
      }
    });
  }

  /**
   * Get product details by ASIN
   */
  async getProductDetails(asin: string): Promise<AmazonProduct | null> {
    if (!this.isConfigured()) {
      console.warn('Amazon API credentials not configured');
      return null;
    }

    // Validate ASIN format
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      throw new Error('Invalid ASIN format');
    }

    return queueRequest(async () => {
      try {
        const requestPayload = {
          PartnerTag: this.config.associateTag,
          PartnerType: 'Associates',
          ItemIds: [asin],
          Resources: [
            'Images.Primary.Large',
            'ItemInfo.Title',
            'ItemInfo.ByLineInfo',
            'ItemInfo.Features',
            'Offers.Listings.Price',
            'Offers.Listings.ProgramEligibility.IsPrimeExclusive',
            'Offers.Listings.Availability.Message',
            'CustomerReviews.StarRating',
            'CustomerReviews.Count',
          ],
        };

        const data = await this.makeRequest<any>(
          '/paapi5/getitems',
          'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
          requestPayload
        );

        const item = data.ItemsResult?.Items?.[0];
        return item ? this.parseProduct(item) : null;
      } catch (error) {
        console.error('Amazon product fetch error:', error);
        return null;
      }
    });
  }

  /**
   * Parse Amazon API product response
   */
  private parseProduct(item: any): AmazonProduct {
    // Sanitize URL to prevent open redirects
    let productUrl = item.DetailPageURL || `https://www.amazon.com/dp/${item.ASIN}`;
    
    // Ensure URL is from Amazon domain
    try {
      const url = new URL(productUrl);
      if (!url.hostname.endsWith('amazon.com')) {
        productUrl = `https://www.amazon.com/dp/${item.ASIN}`;
      }
      // Add affiliate tag if not present
      if (!url.searchParams.has('tag')) {
        url.searchParams.set('tag', this.config.associateTag);
        productUrl = url.toString();
      }
    } catch {
      productUrl = `https://www.amazon.com/dp/${item.ASIN}/?tag=${this.config.associateTag}`;
    }

    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
      price: item.Offers?.Listings?.[0]?.Price ? {
        amount: item.Offers.Listings[0].Price.Amount,
        currency: item.Offers.Listings[0].Price.Currency,
        displayAmount: item.Offers.Listings[0].Price.DisplayAmount,
      } : undefined,
      image: item.Images?.Primary?.Large?.URL,
      rating: item.CustomerReviews?.StarRating?.Value,
      reviewCount: item.CustomerReviews?.Count,
      url: productUrl,
      isPrimeEligible: item.Offers?.Listings?.[0]?.ProgramEligibility?.IsPrimeExclusive,
      availability: item.Offers?.Listings?.[0]?.Availability?.Message,
    };
  }

  /**
   * Generate safe affiliate link
   */
  generateAffiliateLink(asin: string): string {
    // Validate ASIN
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      throw new Error('Invalid ASIN format');
    }
    
    return `https://www.amazon.com/dp/${asin}/?tag=${encodeURIComponent(this.config.associateTag)}`;
  }
}

/**
 * Laundromat-specific parts catalog
 */
export const LAUNDROMAT_PARTS_CATALOG = {
  washer: {
    motors: ['washer motor commercial', 'washing machine motor replacement heavy duty'],
    belts: ['washer belt commercial', 'washing machine drive belt heavy duty'],
    pumps: ['washer drain pump commercial', 'washing machine water pump replacement'],
    valves: ['washer inlet valve commercial', 'washing machine water valve replacement'],
    controls: ['washer control board commercial', 'washing machine timer replacement'],
    doors: ['washer door seal commercial', 'washing machine door boot replacement'],
  },
  dryer: {
    motors: ['dryer motor commercial', 'clothes dryer motor replacement heavy duty'],
    belts: ['dryer belt commercial', 'clothes dryer drive belt heavy duty'],
    heating: ['dryer heating element commercial', 'dryer thermal fuse replacement'],
    rollers: ['dryer drum roller commercial', 'dryer support wheel replacement'],
    controls: ['dryer control board commercial', 'dryer timer knob replacement'],
    venting: ['dryer vent hose commercial', 'dryer vent cleaning kit'],
  },
  commercial: {
    coins: ['commercial coin box laundromat', 'laundromat coin mechanism'],
    payment: ['coin acceptor commercial', 'card reader laundromat payment system'],
    supplies: ['laundry detergent commercial bulk', 'fabric softener commercial gallon'],
    carts: ['laundry cart commercial heavy duty', 'rolling laundry basket commercial'],
    signage: ['laundromat signage LED', 'out of order sign laminated'],
  },
  maintenance: {
    tools: ['appliance repair tool kit professional', 'multimeter digital commercial'],
    cleaning: ['washing machine cleaner commercial', 'dryer lint brush industrial'],
    lubricants: ['appliance grease high temp', 'silicone lubricant spray food grade'],
    fasteners: ['washer screw kit stainless', 'dryer mounting hardware commercial'],
  },
};

export const amazonAPI = new AmazonProductAPI();
