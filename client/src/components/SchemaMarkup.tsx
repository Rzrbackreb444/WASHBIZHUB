import { Helmet } from "react-helmet-async";

function sanitizeSchemaData<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => 
    value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0) ? undefined : value
  ));
}

interface LocalBusinessSchemaProps {
  name: string;
  description?: string;
  businessType?: 'Laundromat' | 'DryCleaningOrLaundry' | 'LocalBusiness';
  image?: string | string[];
  url: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  priceRange?: string;
  openingHours?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string | string[];
  url: string;
  sku?: string;
  brand?: string;
  category?: string;
  price?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'SoldOut';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  seller?: {
    name: string;
    url?: string;
  };
}

interface EquipmentSchemaProps {
  name: string;
  description: string;
  image?: string | string[];
  url: string;
  brand?: string;
  model?: string;
  category?: string;
  price?: number;
  priceCurrency?: string;
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  seller?: {
    name: string;
    url?: string;
  };
  specifications?: Record<string, string | number>;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function LocalBusinessSchema({
  name,
  description,
  businessType = 'Laundromat',
  image,
  url,
  address,
  geo,
  telephone,
  email,
  priceRange,
  openingHours,
  aggregateRating,
}: LocalBusinessSchemaProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const schema = sanitizeSchemaData({
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", businessType],
    "@id": fullUrl,
    "name": name,
    "description": description,
    "url": fullUrl,
    "image": image ? (Array.isArray(image) ? image : [image]) : undefined,
    ...(address && (address.addressLocality || address.addressRegion) ? {
      "address": {
        "@type": "PostalAddress",
        ...(address.streetAddress && { "streetAddress": address.streetAddress }),
        ...(address.addressLocality && { "addressLocality": address.addressLocality }),
        ...(address.addressRegion && { "addressRegion": address.addressRegion }),
        ...(address.postalCode && { "postalCode": address.postalCode }),
        "addressCountry": address.addressCountry || "US"
      }
    } : {}),
    ...(geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": geo.latitude,
        "longitude": geo.longitude
      }
    }),
    ...(telephone && { "telephone": telephone }),
    ...(email && { "email": email }),
    ...(priceRange && { "priceRange": priceRange }),
    ...(openingHours && openingHours.length > 0 && { "openingHours": openingHours }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    "potentialAction": {
      "@type": "ViewAction",
      "target": fullUrl
    }
  });

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function ProductSchema({
  name,
  description,
  image,
  url,
  sku,
  brand,
  category,
  price,
  priceCurrency = 'USD',
  availability = 'InStock',
  condition = 'UsedCondition',
  seller,
}: ProductSchemaProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const availabilityUrl = `https://schema.org/${availability}`;
  const conditionUrl = `https://schema.org/${condition}`;

  const schema = sanitizeSchemaData({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": fullUrl,
    "image": image ? (Array.isArray(image) ? image : [image]) : undefined,
    ...(sku && { "sku": sku }),
    ...(brand && {
      "brand": {
        "@type": "Brand",
        "name": brand
      }
    }),
    ...(category && { "category": category }),
    ...(price !== undefined && {
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": priceCurrency,
        "availability": availabilityUrl,
        "itemCondition": conditionUrl,
        "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...(seller && {
          "seller": {
            "@type": "Organization",
            "name": seller.name,
            ...(seller.url && { "url": seller.url })
          }
        })
      }
    })
  });

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function EquipmentSchema({
  name,
  description,
  image,
  url,
  brand,
  model,
  category,
  price,
  priceCurrency = 'USD',
  condition = 'UsedCondition',
  availability = 'InStock',
  seller,
  specifications,
}: EquipmentSchemaProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const availabilityUrl = `https://schema.org/${availability}`;
  const conditionUrl = `https://schema.org/${condition}`;

  const additionalProperties = specifications 
    ? Object.entries(specifications).map(([name, value]) => ({
        "@type": "PropertyValue",
        "name": name,
        "value": value
      }))
    : undefined;

  const schema = sanitizeSchemaData({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": fullUrl,
    "image": image ? (Array.isArray(image) ? image : [image]) : undefined,
    ...(brand && {
      "brand": {
        "@type": "Brand",
        "name": brand
      }
    }),
    ...(model && { "model": model }),
    ...(category && { "category": category }),
    ...(additionalProperties && { "additionalProperty": additionalProperties }),
    ...(price !== undefined && {
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": priceCurrency,
        "availability": availabilityUrl,
        "itemCondition": conditionUrl,
        "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...(seller && {
          "seller": {
            "@type": "Organization",
            "name": seller.name,
            ...(seller.url && { "url": seller.url })
          }
        })
      }
    })
  });

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function generateLocalBusinessSchemaData(props: LocalBusinessSchemaProps): object {
  const baseUrl = 'https://washbizhub.com';
  const fullUrl = props.url.startsWith('http') ? props.url : `${baseUrl}${props.url}`;

  return sanitizeSchemaData({
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", props.businessType || 'Laundromat'],
    "@id": fullUrl,
    "name": props.name,
    "description": props.description,
    "url": fullUrl,
    "image": props.image ? (Array.isArray(props.image) ? props.image : [props.image]) : undefined,
    ...(props.address && (props.address.addressLocality || props.address.addressRegion) ? {
      "address": {
        "@type": "PostalAddress",
        ...(props.address.streetAddress && { "streetAddress": props.address.streetAddress }),
        ...(props.address.addressLocality && { "addressLocality": props.address.addressLocality }),
        ...(props.address.addressRegion && { "addressRegion": props.address.addressRegion }),
        ...(props.address.postalCode && { "postalCode": props.address.postalCode }),
        "addressCountry": props.address.addressCountry || "US"
      }
    } : {}),
    ...(props.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": props.geo.latitude,
        "longitude": props.geo.longitude
      }
    }),
    ...(props.telephone && { "telephone": props.telephone }),
    ...(props.email && { "email": props.email }),
    ...(props.priceRange && { "priceRange": props.priceRange }),
    "potentialAction": {
      "@type": "ViewAction",
      "target": fullUrl
    }
  });
}

export function generateProductSchemaData(props: ProductSchemaProps): object {
  const baseUrl = 'https://washbizhub.com';
  const fullUrl = props.url.startsWith('http') ? props.url : `${baseUrl}${props.url}`;

  return sanitizeSchemaData({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": props.name,
    "description": props.description,
    "url": fullUrl,
    "image": props.image ? (Array.isArray(props.image) ? props.image : [props.image]) : undefined,
    ...(props.sku && { "sku": props.sku }),
    ...(props.brand && {
      "brand": {
        "@type": "Brand",
        "name": props.brand
      }
    }),
    ...(props.category && { "category": props.category }),
    ...(props.price !== undefined && {
      "offers": {
        "@type": "Offer",
        "price": props.price,
        "priceCurrency": props.priceCurrency || 'USD',
        "availability": `https://schema.org/${props.availability || 'InStock'}`,
        "itemCondition": `https://schema.org/${props.condition || 'UsedCondition'}`,
        "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...(props.seller && {
          "seller": {
            "@type": "Organization",
            "name": props.seller.name,
            ...(props.seller.url && { "url": props.seller.url })
          }
        })
      }
    })
  });
}
