/**
 * Cloudflare for SaaS Integration
 * Documentation: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/
 * 
 * Pricing: First 100 domains FREE, then $0.10/domain/month
 */

interface CloudflareCustomHostname {
  id: string;
  hostname: string;
  status: string;
  ssl: {
    status: string;
    method: string;
    type: string;
    validation_records?: Array<{
      txt_name: string;
      txt_value: string;
    }>;
  };
  verification_errors?: string[];
  created_at: string;
}

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

export class CloudflareSaaSService {
  private apiToken: string;
  private zoneId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';
  
  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
  }
  
  isConfigured(): boolean {
    return !!(this.apiToken && this.zoneId);
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json() as CloudflareResponse<T>;
    
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Cloudflare API error');
    }
    
    return data.result;
  }
  
  async addCustomHostname(domain: string): Promise<CloudflareCustomHostname> {
    return this.request<CloudflareCustomHostname>(
      `/zones/${this.zoneId}/custom_hostnames`,
      {
        method: 'POST',
        body: JSON.stringify({
          hostname: domain,
          ssl: {
            method: 'txt',
            type: 'dv',
            settings: {
              min_tls_version: '1.2',
            },
          },
        }),
      }
    );
  }
  
  async getCustomHostname(hostnameId: string): Promise<CloudflareCustomHostname> {
    return this.request<CloudflareCustomHostname>(
      `/zones/${this.zoneId}/custom_hostnames/${hostnameId}`
    );
  }
  
  async deleteCustomHostname(hostnameId: string): Promise<void> {
    await this.request(
      `/zones/${this.zoneId}/custom_hostnames/${hostnameId}`,
      { method: 'DELETE' }
    );
  }
  
  async listCustomHostnames(): Promise<CloudflareCustomHostname[]> {
    return this.request<CloudflareCustomHostname[]>(
      `/zones/${this.zoneId}/custom_hostnames`
    );
  }
  
  async refreshVerification(hostnameId: string): Promise<CloudflareCustomHostname> {
    return this.request<CloudflareCustomHostname>(
      `/zones/${this.zoneId}/custom_hostnames/${hostnameId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          ssl: { method: 'txt', type: 'dv' }
        }),
      }
    );
  }
}

export const cloudflareSaaS = new CloudflareSaaSService();
