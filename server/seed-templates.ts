import type { InsertWebsiteTemplate } from "@shared/schema";

/**
 * 5 Professional Laundromat Website Templates
 * Ready for one-click deployment with custom subdomain hosting
 */

export const laundromatTemplates: InsertWebsiteTemplate[] = [
  {
    name: "Modern Clean",
    description: "Sleek, minimalist design perfect for upscale laundromats. Features bold typography, clean lines, and a professional aesthetic that builds trust.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800",
    demoUrl: "/templates/modern-clean/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#2563eb", // Blue
        secondary: "#0ea5e9", // Sky Blue
        accent: "#3b82f6",
        background: "#ffffff",
        text: "#1e293b",
        muted: "#64748b",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
      spacing: "comfortable",
      borderRadius: "modern",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Your Neighborhood Laundromat",
            subtitle: "Clean clothes, friendly service, open 7 days a week",
            cta: { text: "View Our Services", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920",
          },
          {
            type: "features",
            heading: "Why Choose Us",
            items: [
              { icon: "Clock", title: "Open 24/7", description: "Wash anytime that works for you" },
              { icon: "Sparkles", title: "Brand New Machines", description: "State-of-the-art washers and dryers" },
              { icon: "DollarSign", title: "Best Prices", description: "Competitive rates with loyalty rewards" },
              { icon: "Shield", title: "Safe & Secure", description: "Well-lit, monitored premises" },
            ],
          },
          {
            type: "services",
            heading: "Our Services",
            items: [
              { name: "Self-Service Wash", price: "$3.50 - $6.50", description: "Various machine sizes available" },
              { name: "Wash & Fold", price: "$1.50/lb", description: "We'll wash, dry, and fold for you" },
              { name: "Dry Cleaning", price: "From $8", description: "Professional dry cleaning services" },
              { name: "Pickup & Delivery", price: "$25 minimum", description: "Free pickup and delivery" },
            ],
          },
          {
            type: "cta",
            heading: "Ready to Get Started?",
            text: "Visit us today or schedule a pickup",
            buttonText: "Contact Us",
            buttonLink: "#contact",
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "About Our Laundromat",
            text: "Family-owned and operated since 2010, we're proud to serve our community with the highest quality laundry services.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Get In Touch",
            address: "123 Main Street, Your City, ST 12345",
            phone: "(555) 123-4567",
            email: "info@yourlaundromat.com",
            hours: [
              { day: "Monday-Sunday", time: "Open 24 Hours" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Contact form",
      "Service pricing",
      "Hours display",
      "Google Maps integration",
      "SEO optimized",
    ],
  },
  
  {
    name: "Fresh & Clean",
    description: "Vibrant, friendly design with bright colors perfect for family-oriented laundromats. Welcoming atmosphere that emphasizes convenience and community.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=800",
    demoUrl: "/templates/fresh-clean/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#10b981", // Green
        secondary: "#34d399",
        accent: "#059669",
        background: "#ffffff",
        text: "#1f2937",
        muted: "#6b7280",
      },
      fonts: {
        heading: "Poppins, sans-serif",
        body: "Open Sans, sans-serif",
      },
      spacing: "relaxed",
      borderRadius: "rounded",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Fresh, Clean Laundry Every Time",
            subtitle: "Your trusted neighborhood laundromat with the best equipment and service",
            cta: { text: "See Our Prices", link: "#pricing" },
            backgroundImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1920",
          },
          {
            type: "services",
            heading: "What We Offer",
            items: [
              { name: "Self-Serve Laundry", price: "$3-$7", description: "Top-load and front-load machines" },
              { name: "Wash, Dry & Fold", price: "$1.25/lb", description: "Same-day service available" },
              { name: "Commercial Laundry", price: "Custom pricing", description: "For businesses and bulk orders" },
            ],
          },
          {
            type: "testimonials",
            heading: "What Our Customers Say",
            items: [
              { name: "Sarah M.", text: "Best laundromat in town! Always clean and machines work great.", rating: 5 },
              { name: "John D.", text: "Friendly staff and very affordable. Highly recommend!", rating: 5 },
            ],
          },
        ],
      },
      {
        name: "Services",
        slug: "/services",
        sections: [
          {
            type: "content",
            heading: "Our Services",
            text: "From self-service to full-service wash and fold, we have options for everyone.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Visit Us Today",
            address: "456 Oak Avenue, Your Town, ST 12345",
            phone: "(555) 987-6543",
            email: "hello@freshcleanlaundry.com",
            hours: [
              { day: "Monday-Friday", time: "6:00 AM - 10:00 PM" },
              { day: "Saturday-Sunday", time: "7:00 AM - 9:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Testimonials section",
      "Service catalog",
      "Business hours",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Premium Wash",
    description: "Luxury-focused design for high-end laundromats. Sophisticated color palette, premium imagery, and refined typography that conveys quality and exclusivity.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800",
    demoUrl: "/templates/premium-wash/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#C8A661", // Gold (Bloomberg inspired)
        secondary: "#b8860b",
        accent: "#1a2332", // Navy
        background: "#ffffff",
        text: "#1e3a5f",
        muted: "#64748b",
      },
      fonts: {
        heading: "Playfair Display, serif",
        body: "Lato, sans-serif",
      },
      spacing: "spacious",
      borderRadius: "subtle",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Premium Laundry Care",
            subtitle: "Experience the difference of professional-grade equipment and white-glove service",
            cta: { text: "Explore Our Services", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920",
          },
          {
            type: "features",
            heading: "The Premium Difference",
            items: [
              { icon: "Award", title: "Premium Equipment", description: "Commercial-grade machines from leading manufacturers" },
              { icon: "Users", title: "Concierge Service", description: "Dedicated staff to assist with your laundry needs" },
              { icon: "Zap", title: "Express Service", description: "Rush orders available for busy schedules" },
              { icon: "Leaf", title: "Eco-Friendly", description: "Energy-efficient machines and eco-friendly detergents" },
            ],
          },
          {
            type: "services",
            heading: "Luxury Services",
            items: [
              { name: "Signature Wash & Fold", price: "$2.25/lb", description: "Premium detergent and fabric softener included" },
              { name: "Delicate Care", price: "$3.50/lb", description: "Special handling for delicate fabrics" },
              { name: "Executive Dry Cleaning", price: "From $12", description: "Professional pressing and packaging" },
              { name: "White Glove Delivery", price: "$35 minimum", description: "Scheduled pickup and delivery to your door" },
            ],
          },
          {
            type: "gallery",
            heading: "Our Facility",
            images: [
              "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600",
              "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600",
              "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=600",
            ],
          },
        ],
      },
      {
        name: "Membership",
        slug: "/membership",
        sections: [
          {
            type: "pricing",
            heading: "Membership Plans",
            plans: [
              { name: "Basic", price: "$29/month", features: ["10% off all services", "Priority scheduling", "Free delivery"] },
              { name: "Premium", price: "$49/month", features: ["20% off all services", "VIP scheduling", "Free delivery", "Free stain removal"] },
            ],
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Schedule Your Service",
            address: "789 Luxury Lane, Uptown, ST 12345",
            phone: "(555) 456-7890",
            email: "concierge@premiumwash.com",
            hours: [
              { day: "Monday-Saturday", time: "7:00 AM - 8:00 PM" },
              { day: "Sunday", time: "9:00 AM - 6:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Membership portal",
      "Photo gallery",
      "Premium service tiers",
      "Online booking integration",
      "SEO optimized",
      "Custom domain support",
    ],
  },
  
  {
    name: "Eco Wash",
    description: "Earth-friendly design emphasizing sustainability and green practices. Natural color palette and imagery that resonates with environmentally conscious customers.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=800",
    demoUrl: "/templates/eco-wash/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#16a34a", // Forest Green
        secondary: "#84cc16", // Lime
        accent: "#65a30d",
        background: "#fafaf9",
        text: "#292524",
        muted: "#78716c",
      },
      fonts: {
        heading: "Nunito, sans-serif",
        body: "Source Sans Pro, sans-serif",
      },
      spacing: "comfortable",
      borderRadius: "organic",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Clean Clothes, Clean Planet",
            subtitle: "Eco-friendly laundry services that care for your clothes and the environment",
            cta: { text: "Learn About Our Process", link: "#sustainability" },
            backgroundImage: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=1920",
          },
          {
            type: "features",
            heading: "Our Green Promise",
            items: [
              { icon: "Leaf", title: "100% Eco-Friendly Detergents", description: "Plant-based, biodegradable cleaning products" },
              { icon: "Droplet", title: "Water Conservation", description: "High-efficiency machines that save 40% water" },
              { icon: "Zap", title: "Energy Efficient", description: "Solar-powered facility reduces carbon footprint" },
              { icon: "Recycle", title: "Zero Waste", description: "Comprehensive recycling and waste reduction program" },
            ],
          },
          {
            type: "services",
            heading: "Green Services",
            items: [
              { name: "Eco Self-Service", price: "$3.25 - $6", description: "Use our green machines and detergents" },
              { name: "Sustainable Wash & Fold", price: "$1.75/lb", description: "100% eco-friendly cleaning process" },
              { name: "Organic Dry Cleaning", price: "From $9", description: "Chemical-free wet cleaning technology" },
            ],
          },
          {
            type: "content",
            heading: "Our Sustainability Commitment",
            text: "We believe clean clothes shouldn't come at the expense of a clean planet. That's why we've invested in the most energy-efficient equipment, use only biodegradable detergents, and operate our facility on renewable solar energy.",
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "About Eco Wash",
            text: "Founded in 2015 by environmental advocates, we're on a mission to revolutionize the laundry industry one clean load at a time.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Visit Our Green Facility",
            address: "321 Eco Way, Green Valley, ST 12345",
            phone: "(555) 321-0987",
            email: "info@ecowash.com",
            hours: [
              { day: "Every Day", time: "6:00 AM - 11:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Sustainability focus",
      "Service showcase",
      "Contact form",
      "Hours display",
      "SEO optimized",
    ],
  },
  
  {
    name: "Express Laundry",
    description: "Fast, efficient design for laundromats emphasizing speed and convenience. Bold colors, clear calls-to-action, and streamlined layout perfect for busy customers.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
    demoUrl: "/templates/express-laundry/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#dc2626", // Red
        secondary: "#f97316", // Orange
        accent: "#ea580c",
        background: "#ffffff",
        text: "#18181b",
        muted: "#71717a",
      },
      fonts: {
        heading: "Montserrat, sans-serif",
        body: "Roboto, sans-serif",
      },
      spacing: "compact",
      borderRadius: "sharp",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Fast, Reliable Laundry Service",
            subtitle: "Drop off in the morning, pick up by evening. It's that simple.",
            cta: { text: "Get Started Today", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1920",
          },
          {
            type: "features",
            heading: "Why We're Faster",
            items: [
              { icon: "Zap", title: "Same-Day Service", description: "Drop off before 10 AM, pick up by 5 PM" },
              { icon: "Clock", title: "Extended Hours", description: "Open early, close late for your convenience" },
              { icon: "Smartphone", title: "Text Alerts", description: "Get notified when your laundry is ready" },
              { icon: "MapPin", title: "Multiple Locations", description: "Find us in 3 convenient spots across town" },
            ],
          },
          {
            type: "services",
            heading: "Quick Services",
            items: [
              { name: "Express Wash & Fold", price: "$1.50/lb", description: "Ready in 4 hours or less" },
              { name: "Rush Dry Cleaning", price: "From $10", description: "24-hour turnaround" },
              { name: "Pickup & Delivery", price: "$20 minimum", description: "Free for orders over $50" },
            ],
          },
          {
            type: "cta",
            heading: "Need It Fast?",
            text: "Call us or use our mobile app for instant pickup scheduling",
            buttonText: "Schedule Pickup",
            buttonLink: "tel:5551234567",
          },
        ],
      },
      {
        name: "Locations",
        slug: "/locations",
        sections: [
          {
            type: "content",
            heading: "Find Us Near You",
            text: "We have 3 convenient locations to serve you better. All stores offer the same great service and competitive pricing.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Get In Touch",
            address: "Multiple Locations - See Locations Page",
            phone: "(555) 123-4567",
            email: "express@laundrynow.com",
            hours: [
              { day: "Monday-Friday", time: "6:00 AM - 11:00 PM" },
              { day: "Saturday-Sunday", time: "7:00 AM - 10:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Multi-location support",
      "Call-to-action buttons",
      "Service speed emphasis",
      "Contact form",
      "SEO optimized",
    ],
  },
];
