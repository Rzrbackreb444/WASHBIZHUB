import type { InsertWebsiteTemplate } from "@shared/schema";

/**
 * 17 Professional Laundromat Website Templates
 * Ready for one-click deployment with custom subdomain hosting
 * 
 * Templates breakdown:
 * - 9 Free templates: Modern Clean, Fresh & Clean, Eco Wash, Express Laundry, 
 *   Retro Classic, Urban Loft, Family First, Neighborhood Hub, 24/7 Express, College Town
 * - 8 Pro templates: Premium Wash, Tech Forward, Luxury Lounge, Commercial Pro, 
 *   Bilingual Welcome, Holiday Special, Coin-Op Classic
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
  
  {
    name: "Retro Classic",
    description: "Nostalgic vintage 1950s/60s aesthetic with pastel colors and retro typography. Perfect for laundromats with character that want to evoke the golden age of coin laundry.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    demoUrl: "/templates/retro-classic/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#e879a9", // Pastel Pink
        secondary: "#67e8f9", // Pastel Cyan
        accent: "#fcd34d", // Pastel Yellow
        background: "#fef3c7",
        text: "#44403c",
        muted: "#78716c",
      },
      fonts: {
        heading: "Pacifico, cursive",
        body: "Quicksand, sans-serif",
      },
      spacing: "comfortable",
      borderRadius: "rounded",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Welcome to Classic Suds",
            subtitle: "Where laundry day feels like the good old days. Quality service since 1962.",
            cta: { text: "Step Inside", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920",
          },
          {
            type: "features",
            heading: "The Classic Experience",
            items: [
              { icon: "Coffee", title: "Cozy Lounge", description: "Relax with free coffee while you wait" },
              { icon: "Radio", title: "Jukebox Vibes", description: "Classic tunes playing all day" },
              { icon: "Heart", title: "Family Owned", description: "Three generations of laundry expertise" },
              { icon: "Star", title: "Vintage Charm", description: "Retro decor meets modern machines" },
            ],
          },
          {
            type: "services",
            heading: "Our Services",
            items: [
              { name: "Self-Service Wash", price: "$3.00 - $5.50", description: "Classic coin-op experience" },
              { name: "Full-Service Wash & Fold", price: "$1.35/lb", description: "We handle everything for you" },
              { name: "Vintage Garment Care", price: "From $10", description: "Special care for delicate vintage items" },
            ],
          },
          {
            type: "testimonials",
            heading: "Customer Love",
            items: [
              { name: "Betty R.", text: "Takes me back to when Mom would bring us here as kids. Love this place!", rating: 5 },
              { name: "Frank T.", text: "Best atmosphere in town. Great machines and even better people.", rating: 5 },
            ],
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "Our Story",
            text: "Established in 1962, Classic Suds has been serving our community for over 60 years. What started as a small 10-machine laundromat has grown into a beloved neighborhood institution, all while maintaining the charm and personal service that made us a local favorite.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Visit Us",
            address: "500 Vintage Avenue, Retro Town, ST 12345",
            phone: "(555) 195-6200",
            email: "hello@classicsuds.com",
            hours: [
              { day: "Monday-Saturday", time: "6:00 AM - 10:00 PM" },
              { day: "Sunday", time: "7:00 AM - 8:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Retro design aesthetic",
      "Testimonials section",
      "Service pricing",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Urban Loft",
    description: "Industrial modern design with exposed brick aesthetics, dark themes, and metropolitan energy. Ideal for city laundromats targeting young professionals.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
    demoUrl: "/templates/urban-loft/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#f59e0b", // Amber
        secondary: "#78716c", // Warm Gray
        accent: "#ea580c", // Orange
        background: "#1c1917",
        text: "#fafaf9",
        muted: "#a8a29e",
      },
      fonts: {
        heading: "Oswald, sans-serif",
        body: "Work Sans, sans-serif",
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
            title: "LOFT LAUNDRY",
            subtitle: "Industrial strength cleaning in the heart of downtown. Modern machines, urban soul.",
            cta: { text: "Explore Services", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920",
          },
          {
            type: "features",
            heading: "The Urban Advantage",
            items: [
              { icon: "Wifi", title: "Free High-Speed WiFi", description: "Work remotely while you wait" },
              { icon: "Zap", title: "Speed Cycles", description: "30-minute express wash available" },
              { icon: "CreditCard", title: "Cashless Payment", description: "Apple Pay, Google Pay, cards accepted" },
              { icon: "Coffee", title: "Espresso Bar", description: "Premium coffee and snacks on-site" },
            ],
          },
          {
            type: "services",
            heading: "Services",
            items: [
              { name: "Self-Service", price: "$4 - $8", description: "Premium commercial machines" },
              { name: "Drop & Go", price: "$1.75/lb", description: "Same-day wash and fold service" },
              { name: "Urban Express", price: "$2.50/lb", description: "2-hour rush service" },
              { name: "Delivery", price: "$15 minimum", description: "Free delivery over $40" },
            ],
          },
          {
            type: "cta",
            heading: "Join the Neighborhood",
            text: "Download our app for exclusive deals and loyalty rewards",
            buttonText: "Get the App",
            buttonLink: "#app",
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "Our Space",
            text: "Located in a converted warehouse in the arts district, Loft Laundry brings industrial chic to the laundry experience. Exposed brick, reclaimed wood, and state-of-the-art equipment create a space where you'll actually want to spend time.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Find Us",
            address: "888 Industrial Blvd, Arts District, ST 12345",
            phone: "(555) 808-LOFT",
            email: "hello@loftlaundry.com",
            hours: [
              { day: "Every Day", time: "6:00 AM - Midnight" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Dark theme design",
      "App integration ready",
      "Service catalog",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Family First",
    description: "Warm, welcoming design with playful elements perfect for family-oriented laundromats. Features bright colors, friendly imagery, and kid-focused amenities.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800",
    demoUrl: "/templates/family-first/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#8b5cf6", // Purple
        secondary: "#f472b6", // Pink
        accent: "#06b6d4", // Cyan
        background: "#faf5ff",
        text: "#3b0764",
        muted: "#7e22ce",
      },
      fonts: {
        heading: "Fredoka One, cursive",
        body: "Nunito Sans, sans-serif",
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
            title: "Family Bubbles Laundromat",
            subtitle: "Where laundry time is family time! Safe, clean, and fun for everyone.",
            cta: { text: "See What Makes Us Special", link: "#features" },
            backgroundImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1920",
          },
          {
            type: "features",
            heading: "Family-Friendly Features",
            items: [
              { icon: "Tv", title: "Kids Play Area", description: "Supervised play zone with games and toys" },
              { icon: "Shield", title: "Safe & Clean", description: "Sanitized hourly, family-safe products" },
              { icon: "Car", title: "Drive-Through Drop-Off", description: "Never leave your car with kids in tow" },
              { icon: "Gift", title: "Birthday Parties", description: "Yes, really! Book our party room" },
            ],
          },
          {
            type: "services",
            heading: "Services for Busy Families",
            items: [
              { name: "Family Wash Bundles", price: "$25-$45", description: "Discounted multi-load packages" },
              { name: "Baby Items Special", price: "$1.50/lb", description: "Gentle, hypoallergenic cleaning" },
              { name: "Sports Gear Cleaning", price: "$2.00/lb", description: "Uniforms, bags, and equipment" },
              { name: "Weekly Pickup", price: "$30/week", description: "Scheduled family laundry service" },
            ],
          },
          {
            type: "testimonials",
            heading: "Happy Families",
            items: [
              { name: "The Johnson Family", text: "Our kids actually ASK to go to the laundromat now. The play area is amazing!", rating: 5 },
              { name: "Maria G.", text: "The drive-through drop-off is a lifesaver with my three little ones.", rating: 5 },
            ],
          },
        ],
      },
      {
        name: "Kids Zone",
        slug: "/kids-zone",
        sections: [
          {
            type: "content",
            heading: "The Fun Zone",
            text: "Our 500 sq ft play area features arcade games, a climbing structure, coloring stations, and a TV with kid-friendly programming. Plus, our snack bar has healthy options for the whole family!",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Visit Us Today!",
            address: "123 Family Circle, Suburbia, ST 12345",
            phone: "(555) 4-FAMILY",
            email: "fun@familybubbles.com",
            hours: [
              { day: "Monday-Friday", time: "6:00 AM - 9:00 PM" },
              { day: "Saturday-Sunday", time: "7:00 AM - 8:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Family-focused design",
      "Testimonials section",
      "Service bundles display",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Tech Forward",
    description: "Digital-first design for app-connected laundromats. Emphasizes smart features, mobile integration, and futuristic aesthetics for the connected customer.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800",
    demoUrl: "/templates/tech-forward/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#6366f1", // Indigo
        secondary: "#22d3ee", // Cyan
        accent: "#a855f7", // Purple
        background: "#0f172a",
        text: "#f8fafc",
        muted: "#94a3b8",
      },
      fonts: {
        heading: "Space Grotesk, sans-serif",
        body: "Inter, sans-serif",
      },
      spacing: "compact",
      borderRadius: "modern",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Smart Laundry, Smarter Living",
            subtitle: "The future of laundry is here. Monitor your wash from anywhere with our connected machines.",
            cta: { text: "Download the App", link: "#app" },
            backgroundImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1920",
          },
          {
            type: "features",
            heading: "Connected Features",
            items: [
              { icon: "Smartphone", title: "Mobile App Control", description: "Start, stop, and monitor from your phone" },
              { icon: "Bell", title: "Smart Notifications", description: "Know exactly when your laundry is done" },
              { icon: "CreditCard", title: "Digital Wallet", description: "Load credits, earn rewards automatically" },
              { icon: "BarChart", title: "Usage Analytics", description: "Track your laundry habits and savings" },
            ],
          },
          {
            type: "services",
            heading: "Digital Services",
            items: [
              { name: "Smart Wash", price: "$4 - $7", description: "App-controlled premium machines" },
              { name: "AI Fold Service", price: "$2.00/lb", description: "Robotic folding technology" },
              { name: "Subscription Wash", price: "$49/month", description: "Unlimited washes, premium member perks" },
              { name: "Drone Delivery", price: "$10 flat", description: "Coming soon to select areas" },
            ],
          },
          {
            type: "pricing",
            heading: "App Membership Tiers",
            plans: [
              { name: "Basic", price: "Free", features: ["Machine monitoring", "Push notifications", "Digital payments"] },
              { name: "Premium", price: "$9.99/month", features: ["All Basic features", "Priority booking", "10% off services", "Free delivery"] },
              { name: "Unlimited", price: "$49/month", features: ["Unlimited self-service washes", "VIP support", "20% off add-ons", "Partner discounts"] },
            ],
          },
        ],
      },
      {
        name: "App",
        slug: "/app",
        sections: [
          {
            type: "content",
            heading: "Download Our App",
            text: "Available on iOS and Android. Scan the QR code in-store or search 'SmartWash' in your app store. Join 50,000+ users who've upgraded their laundry experience.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Get Connected",
            address: "2077 Innovation Way, Tech Park, ST 12345",
            phone: "(555) APP-WASH",
            email: "support@smartwashlaundry.com",
            hours: [
              { day: "Facility", time: "Open 24/7" },
              { day: "Support", time: "6:00 AM - 10:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "App integration showcase",
      "Subscription tier display",
      "QR code integration",
      "Contact form",
      "SEO optimized",
      "Analytics dashboard ready",
    ],
  },
  
  {
    name: "Neighborhood Hub",
    description: "Community-centered design emphasizing local connections and neighborhood pride. Perfect for laundromats that serve as gathering spots for their community.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=800",
    demoUrl: "/templates/neighborhood-hub/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#059669", // Emerald
        secondary: "#0d9488", // Teal
        accent: "#f59e0b", // Amber
        background: "#ecfdf5",
        text: "#064e3b",
        muted: "#047857",
      },
      fonts: {
        heading: "Merriweather, serif",
        body: "Source Sans Pro, sans-serif",
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
            title: "Your Neighborhood Laundry Hub",
            subtitle: "More than a laundromat - we're part of the community. Serving neighbors since 1998.",
            cta: { text: "Join Our Community", link: "#community" },
            backgroundImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=1920",
          },
          {
            type: "features",
            heading: "Community First",
            items: [
              { icon: "Users", title: "Community Board", description: "Local events, lost & found, neighbor connections" },
              { icon: "Book", title: "Little Free Library", description: "Take a book, leave a book while you wait" },
              { icon: "Heart", title: "Charity Wash Days", description: "Monthly free wash days for those in need" },
              { icon: "MapPin", title: "Local Business Wall", description: "Supporting our neighborhood businesses" },
            ],
          },
          {
            type: "services",
            heading: "Neighborhood Services",
            items: [
              { name: "Self-Service Wash", price: "$3.00 - $6.00", description: "Well-maintained, reliable machines" },
              { name: "Wash & Fold", price: "$1.25/lb", description: "Same-day available for neighbors" },
              { name: "Senior Discount", price: "15% off", description: "Every day for 65+ community members" },
              { name: "Neighbor Pickup", price: "Free", description: "Walking distance delivery at no charge" },
            ],
          },
          {
            type: "content",
            heading: "Community Events",
            text: "Join us for monthly community coffee mornings (first Saturday), book club meetings (third Wednesday), and our annual block party. Check our community board for the latest local happenings!",
          },
        ],
      },
      {
        name: "Community",
        slug: "/community",
        sections: [
          {
            type: "content",
            heading: "Giving Back",
            text: "We believe in supporting our neighbors. Through our Suds of Kindness program, we provide free laundry services to families in need, partner with local shelters, and host coat drives every winter.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Stop By Anytime",
            address: "42 Main Street, Our Town, ST 12345",
            phone: "(555) 867-5309",
            email: "neighbors@hublaundry.com",
            hours: [
              { day: "Monday-Sunday", time: "5:30 AM - 11:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Community-focused design",
      "Event calendar ready",
      "Senior discount display",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Luxury Lounge",
    description: "Spa-like premium design for high-end laundry lounges. Features calming colors, elegant typography, and an emphasis on the relaxation experience.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800",
    demoUrl: "/templates/luxury-lounge/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#7c3aed", // Violet
        secondary: "#a78bfa", // Light Violet
        accent: "#c4b5fd", // Lavender
        background: "#faf5ff",
        text: "#4c1d95",
        muted: "#7c3aed",
      },
      fonts: {
        heading: "Cormorant Garamond, serif",
        body: "Raleway, sans-serif",
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
            title: "The Laundry Lounge",
            subtitle: "Elevate your laundry experience. Relax, refresh, and renew while we care for your garments.",
            cta: { text: "Book Your Visit", link: "#booking" },
            backgroundImage: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=1920",
          },
          {
            type: "features",
            heading: "The Lounge Experience",
            items: [
              { icon: "Flower2", title: "Aromatherapy", description: "Calming lavender and eucalyptus throughout" },
              { icon: "Armchair", title: "Spa Seating", description: "Massage chairs and cozy reading nooks" },
              { icon: "Wine", title: "Refreshment Bar", description: "Complimentary tea, coffee, and sparkling water" },
              { icon: "Music", title: "Curated Ambiance", description: "Soothing music and soft lighting" },
            ],
          },
          {
            type: "services",
            heading: "Luxury Services",
            items: [
              { name: "Lounge Self-Service", price: "$6 - $12", description: "Premium machines with aromatherapy pods" },
              { name: "Concierge Wash & Fold", price: "$3.00/lb", description: "White-glove treatment for every item" },
              { name: "Cashmere & Silk Care", price: "$5.00/lb", description: "Specialist handling for luxury fabrics" },
              { name: "Wardrobe Valet", price: "$100/month", description: "Monthly pickup, cleaning, and storage" },
            ],
          },
          {
            type: "pricing",
            heading: "Lounge Memberships",
            plans: [
              { name: "Day Pass", price: "$15", features: ["Full lounge access", "One complimentary beverage", "WiFi & charging"] },
              { name: "Monthly Member", price: "$99/month", features: ["Unlimited lounge visits", "15% off all services", "Reserved seating", "Beverage credits"] },
              { name: "VIP Annual", price: "$999/year", features: ["All Monthly benefits", "25% off all services", "Quarterly wardrobe consultation", "Guest passes"] },
            ],
          },
        ],
      },
      {
        name: "Treatments",
        slug: "/treatments",
        sections: [
          {
            type: "content",
            heading: "Garment Spa Treatments",
            text: "Our fabric specialists provide restorative treatments for your cherished garments. From heirloom restoration to eco-luxury cleaning, we treat every piece with the care it deserves.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Reserve Your Experience",
            address: "One Luxury Lane, Uptown Heights, ST 12345",
            phone: "(555) LUX-WASH",
            email: "concierge@thelaundrylounge.com",
            hours: [
              { day: "Monday-Friday", time: "7:00 AM - 9:00 PM" },
              { day: "Saturday-Sunday", time: "8:00 AM - 7:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Booking integration",
      "Membership tiers",
      "Premium service menu",
      "Contact form",
      "SEO optimized",
      "VIP portal access",
    ],
  },
  
  {
    name: "24/7 Express",
    description: "Night-focused design for 24-hour laundromats. Dark theme with neon accents emphasizing round-the-clock availability and safety features.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
    demoUrl: "/templates/247-express/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#14b8a6", // Teal/Neon
        secondary: "#f43f5e", // Pink/Neon
        accent: "#facc15", // Yellow/Neon
        background: "#0a0a0a",
        text: "#fafafa",
        muted: "#a1a1aa",
      },
      fonts: {
        heading: "Exo 2, sans-serif",
        body: "Rubik, sans-serif",
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
            title: "ALWAYS OPEN. ALWAYS READY.",
            subtitle: "Night owl? Early bird? Third shift? We never close. 24/7/365 laundry when you need it.",
            cta: { text: "We're Open Now", link: "#location" },
            backgroundImage: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1920",
          },
          {
            type: "features",
            heading: "24/7 Features",
            items: [
              { icon: "Moon", title: "Night Attendant", description: "Staff on-site 10 PM - 6 AM for safety" },
              { icon: "Camera", title: "24/7 Surveillance", description: "HD cameras and monitored security" },
              { icon: "Lightbulb", title: "Bright & Safe", description: "Well-lit parking and facility" },
              { icon: "Phone", title: "Emergency Line", description: "24-hour support hotline" },
            ],
          },
          {
            type: "services",
            heading: "Anytime Services",
            items: [
              { name: "Self-Service", price: "$3.50 - $7.00", description: "Available 24 hours a day" },
              { name: "Night Owl Drop-Off", price: "$1.50/lb", description: "Drop by midnight, ready by 8 AM" },
              { name: "Graveyard Special", price: "$1.25/lb", description: "Midnight-5 AM discounted wash & fold" },
              { name: "Express Dry", price: "$2.00/load", description: "High-heat 25-minute dry cycles" },
            ],
          },
          {
            type: "cta",
            heading: "Late Night Loyalty",
            text: "Wash between midnight and 5 AM? Get 20% off with our Night Owl Card.",
            buttonText: "Get Your Card",
            buttonLink: "#loyalty",
          },
        ],
      },
      {
        name: "Safety",
        slug: "/safety",
        sections: [
          {
            type: "content",
            heading: "Your Safety Matters",
            text: "Our facility features 32 HD security cameras, emergency call buttons at every station, night attendants, well-lit parking, and direct police department communication. Wash worry-free at any hour.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Find Us (We're Always Here)",
            address: "247 Nighthawk Drive, Anytown, ST 12345",
            phone: "(555) 247-WASH",
            email: "always@247express.com",
            hours: [
              { day: "Every Day", time: "OPEN 24 HOURS" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Dark theme design",
      "Safety features highlight",
      "Night specials display",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "College Town",
    description: "Student-friendly design with budget-conscious messaging, campus vibes, and features that appeal to college students living in dorms or apartments.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800",
    demoUrl: "/templates/college-town/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#2563eb", // School Blue
        secondary: "#dc2626", // School Red
        accent: "#fbbf24", // Gold
        background: "#ffffff",
        text: "#1e3a8a",
        muted: "#6b7280",
      },
      fonts: {
        heading: "Bebas Neue, sans-serif",
        body: "Open Sans, sans-serif",
      },
      spacing: "compact",
      borderRadius: "modern",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "STUDENT SUDS",
            subtitle: "Laundry made easy (and cheap) for broke college kids. Show your student ID for instant savings!",
            cta: { text: "Student Deals", link: "#deals" },
            backgroundImage: "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=1920",
          },
          {
            type: "features",
            heading: "Campus Life Friendly",
            items: [
              { icon: "GraduationCap", title: "Student Discount", description: "15% off with valid student ID" },
              { icon: "Wifi", title: "Free WiFi", description: "Study while you spin" },
              { icon: "Clock", title: "Late Night Hours", description: "Open until 2 AM during finals" },
              { icon: "DollarSign", title: "Quarter Machines", description: "Because who has laundry cards?" },
            ],
          },
          {
            type: "services",
            heading: "Budget-Friendly Services",
            items: [
              { name: "Self-Service Wash", price: "$2.50 - $5.00", description: "The cheapest in town" },
              { name: "Semester Bulk Deal", price: "$99/semester", description: "Unlimited washes for one price" },
              { name: "Dorm Pickup", price: "$15 minimum", description: "We pick up from campus dorms" },
              { name: "Study Snacks", price: "$1-$3", description: "Energy drinks, ramen, and coffee" },
            ],
          },
          {
            type: "testimonials",
            heading: "Student Reviews",
            items: [
              { name: "Jake S., Junior", text: "Literally the only affordable laundromat near campus. WiFi is fast too!", rating: 5 },
              { name: "Priya M., Sophomore", text: "The semester deal saved me so much money. Way better than dorm machines.", rating: 5 },
            ],
          },
        ],
      },
      {
        name: "Deals",
        slug: "/deals",
        sections: [
          {
            type: "content",
            heading: "Current Student Specials",
            text: "Semester Unlimited Pass - $99. Finals Week Extended Hours. Free dryer with every large load on Mondays. Refer a friend, get $5 credit. Download our app for digital punch card rewards!",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Location",
            address: "101 College Avenue, University Town, ST 12345",
            phone: "(555) STU-DENT",
            email: "hello@studentsuds.com",
            hours: [
              { day: "Sunday-Thursday", time: "6:00 AM - Midnight" },
              { day: "Friday-Saturday", time: "6:00 AM - 2:00 AM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Student discount system",
      "Campus-focused design",
      "Deal showcase",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Commercial Pro",
    description: "B2B focused professional design for laundromats serving businesses. Emphasizes volume capacity, commercial accounts, and professional reliability.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
    demoUrl: "/templates/commercial-pro/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#1e40af", // Corporate Blue
        secondary: "#0369a1", // Professional Blue
        accent: "#ca8a04", // Gold accent
        background: "#f8fafc",
        text: "#0f172a",
        muted: "#475569",
      },
      fonts: {
        heading: "IBM Plex Sans, sans-serif",
        body: "IBM Plex Sans, sans-serif",
      },
      spacing: "comfortable",
      borderRadius: "subtle",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Commercial Laundry Solutions",
            subtitle: "Trusted by hotels, restaurants, salons, and healthcare facilities. Enterprise-grade service for businesses of all sizes.",
            cta: { text: "Request a Quote", link: "#quote" },
            backgroundImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920",
          },
          {
            type: "features",
            heading: "Why Businesses Choose Us",
            items: [
              { icon: "Building2", title: "Volume Capacity", description: "Process 500+ lbs daily" },
              { icon: "Clock", title: "Guaranteed Turnaround", description: "24-48 hour service commitments" },
              { icon: "FileText", title: "Net-30 Terms", description: "Flexible invoicing for accounts" },
              { icon: "Truck", title: "Fleet Pickup", description: "Scheduled route service available" },
            ],
          },
          {
            type: "services",
            heading: "Commercial Services",
            items: [
              { name: "Restaurant Linens", price: "Custom pricing", description: "Tablecloths, napkins, aprons, towels" },
              { name: "Hotel Laundry", price: "Per-room contracts", description: "Sheets, towels, robes, spa linens" },
              { name: "Healthcare Textiles", price: "HIPAA compliant", description: "Scrubs, lab coats, patient linens" },
              { name: "Salon & Spa", price: "Weekly service", description: "Towels, capes, robes, sheets" },
            ],
          },
          {
            type: "content",
            heading: "Industries We Serve",
            text: "Hotels & Hospitality • Restaurants & Catering • Healthcare & Medical • Salons & Spas • Fitness Centers • Property Management • Event Venues • Manufacturing",
          },
        ],
      },
      {
        name: "Industries",
        slug: "/industries",
        sections: [
          {
            type: "content",
            heading: "Tailored Solutions",
            text: "Every industry has unique laundry requirements. Our account managers work with you to develop custom processes, scheduling, and pricing that fits your operational needs.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Open a Commercial Account",
            address: "500 Industrial Parkway, Commerce City, ST 12345",
            phone: "(555) BIZ-WASH",
            email: "accounts@commercialprolaundry.com",
            hours: [
              { day: "Operations", time: "24/7" },
              { day: "Sales Office", time: "Monday-Friday 8 AM - 6 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Quote request system",
      "Industry-specific pages",
      "B2B account portal",
      "Contact form",
      "SEO optimized",
      "CRM integration ready",
    ],
  },
  
  {
    name: "Bilingual Welcome",
    description: "English/Spanish bilingual template designed for laundromats serving diverse communities. Full bilingual content with culturally inclusive imagery.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=800",
    demoUrl: "/templates/bilingual-welcome/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#0891b2", // Teal
        secondary: "#f97316", // Orange
        accent: "#fbbf24", // Yellow
        background: "#ffffff",
        text: "#134e4a",
        muted: "#5eead4",
      },
      fonts: {
        heading: "Barlow, sans-serif",
        body: "Barlow, sans-serif",
      },
      spacing: "comfortable",
      borderRadius: "rounded",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Welcome / Bienvenidos",
            subtitle: "Your friendly neighborhood laundromat. Su lavanderia amigable del vecindario.",
            cta: { text: "Our Services / Nuestros Servicios", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=1920",
          },
          {
            type: "features",
            heading: "Why Choose Us / Por Que Elegirnos",
            items: [
              { icon: "Globe", title: "Bilingual Staff / Personal Bilingue", description: "We speak your language / Hablamos su idioma" },
              { icon: "Heart", title: "Family Owned / Negocio Familiar", description: "Serving since 2005 / Sirviendo desde 2005" },
              { icon: "DollarSign", title: "Fair Prices / Precios Justos", description: "Quality at affordable rates / Calidad a precios accesibles" },
              { icon: "Clock", title: "Long Hours / Horario Extendido", description: "Open early, close late / Abrimos temprano, cerramos tarde" },
            ],
          },
          {
            type: "services",
            heading: "Services / Servicios",
            items: [
              { name: "Self-Service / Autoservicio", price: "$3.00 - $6.00", description: "Use our machines / Use nuestras maquinas" },
              { name: "Wash & Fold / Lavar y Doblar", price: "$1.50/lb", description: "We do it for you / Lo hacemos por usted" },
              { name: "Dry Cleaning / Tintoreria", price: "From $8 / Desde $8", description: "Professional care / Cuidado profesional" },
              { name: "Delivery / Entrega a Domicilio", price: "$20 minimum / minimo", description: "To your door / A su puerta" },
            ],
          },
          {
            type: "testimonials",
            heading: "Customer Stories / Historias de Clientes",
            items: [
              { name: "Maria L.", text: "Me encanta que todo el personal habla espanol. Siempre me siento bienvenida.", rating: 5 },
              { name: "Roberto T.", text: "Best prices in the neighborhood. I've been coming here for 10 years.", rating: 5 },
            ],
          },
        ],
      },
      {
        name: "About / Sobre Nosotros",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "Our Story / Nuestra Historia",
            text: "Founded by the Martinez family in 2005, we opened this laundromat to serve our community with respect and quality. / Fundada por la familia Martinez en 2005, abrimos esta lavanderia para servir a nuestra comunidad con respeto y calidad.",
          },
        ],
      },
      {
        name: "Contact / Contacto",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Visit Us / Visitenos",
            address: "234 Community Blvd, La Comunidad, ST 12345",
            phone: "(555) 234-5678",
            email: "hola@bienvenidoslaundry.com",
            hours: [
              { day: "Monday-Sunday / Lunes-Domingo", time: "6:00 AM - 10:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Full bilingual content",
      "Language toggle option",
      "Culturally inclusive",
      "Contact form",
      "SEO optimized",
      "Multi-language SEO",
    ],
  },
  
  {
    name: "Holiday Special",
    description: "Seasonal promotion-focused template with festive design elements. Perfect for laundromats running holiday specials and seasonal campaigns.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=800",
    demoUrl: "/templates/holiday-special/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#dc2626", // Holiday Red
        secondary: "#15803d", // Holiday Green
        accent: "#fbbf24", // Gold
        background: "#fef2f2",
        text: "#450a0a",
        muted: "#991b1b",
      },
      fonts: {
        heading: "Lobster, cursive",
        body: "Nunito, sans-serif",
      },
      spacing: "comfortable",
      borderRadius: "rounded",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Holiday Laundry Specials!",
            subtitle: "Tis the season for clean clothes! Enjoy festive savings all month long.",
            cta: { text: "See Holiday Deals", link: "#deals" },
            backgroundImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=1920",
          },
          {
            type: "features",
            heading: "Holiday Happenings",
            items: [
              { icon: "Gift", title: "Gift Cards Available", description: "The perfect stocking stuffer!" },
              { icon: "Percent", title: "25% Off Wash & Fold", description: "Now through New Year's" },
              { icon: "PartyPopper", title: "Free Hot Cocoa", description: "Complimentary at our hot cocoa bar" },
              { icon: "Calendar", title: "Extended Hours", description: "Open Christmas Eve until 6 PM" },
            ],
          },
          {
            type: "services",
            heading: "Holiday Services",
            items: [
              { name: "Holiday Rush Wash", price: "$1.25/lb", description: "25% off regular price!" },
              { name: "Gift Wrapping Service", price: "$5.00", description: "We'll wrap your gift cards beautifully" },
              { name: "Party Linen Cleaning", price: "$2.00/lb", description: "Get tablecloths ready for gatherings" },
              { name: "New Year's Deep Clean", price: "20% off", description: "Start fresh - comforters, curtains, more" },
            ],
          },
          {
            type: "cta",
            heading: "Give the Gift of Clean!",
            text: "Gift cards available in any amount. Perfect for college students, new homeowners, or busy parents!",
            buttonText: "Buy Gift Cards",
            buttonLink: "#gift-cards",
          },
        ],
      },
      {
        name: "Holiday Deals",
        slug: "/deals",
        sections: [
          {
            type: "content",
            heading: "Current Promotions",
            text: "25% off all Wash & Fold through 12/31. Free dryer with every large load. Buy $50 gift card, get $10 free. Refer a friend in December, both get $10 credit!",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Holiday Hours",
            address: "789 Festive Lane, Holiday Town, ST 12345",
            phone: "(555) HOLIDAY",
            email: "joy@holidaylaundry.com",
            hours: [
              { day: "Regular Hours", time: "6 AM - 10 PM" },
              { day: "Christmas Eve", time: "6 AM - 6 PM" },
              { day: "Christmas Day", time: "CLOSED" },
              { day: "New Year's Eve", time: "6 AM - 8 PM" },
              { day: "New Year's Day", time: "10 AM - 6 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Promotion countdown timer",
      "Gift card integration",
      "Seasonal design elements",
      "Contact form",
      "SEO optimized",
      "Easy theme switching",
    ],
  },
  
  {
    name: "Coin-Op Classic",
    description: "Traditional coin laundry template emphasizing the classic self-service model. Clean, functional design with emphasis on reliability and simplicity.",
    industry: "laundromat",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800",
    demoUrl: "/templates/coin-op-classic/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#1d4ed8", // Classic Blue
        secondary: "#60a5fa", // Light Blue
        accent: "#fcd34d", // Coin Gold
        background: "#f0f9ff",
        text: "#1e3a8a",
        muted: "#64748b",
      },
      fonts: {
        heading: "Archivo Black, sans-serif",
        body: "Archivo, sans-serif",
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
            title: "Coin Laundry Done Right",
            subtitle: "Simple. Reliable. Affordable. Self-service laundry the way it should be.",
            cta: { text: "Find Us", link: "#location" },
            backgroundImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1920",
          },
          {
            type: "features",
            heading: "Why Coin-Op Works",
            items: [
              { icon: "Coins", title: "Quarters Accepted", description: "Simple coin-operated machines" },
              { icon: "Wrench", title: "Always Working", description: "Daily maintenance, 99% uptime" },
              { icon: "DollarSign", title: "Lowest Prices", description: "No apps, no fees, no gimmicks" },
              { icon: "Clock", title: "Fast Machines", description: "25-minute wash, 30-minute dry" },
            ],
          },
          {
            type: "services",
            heading: "Self-Service Pricing",
            items: [
              { name: "Top Load Washer", price: "$2.50", description: "Perfect for small loads" },
              { name: "Front Load Single", price: "$3.50", description: "Standard family load" },
              { name: "Front Load Double", price: "$5.00", description: "Large loads and bedding" },
              { name: "Triple Load", price: "$6.50", description: "Comforters and bulk items" },
              { name: "Dryers", price: "$0.25/8 min", description: "High-heat efficiency dryers" },
            ],
          },
          {
            type: "content",
            heading: "Change Machine On-Site",
            text: "Our bill changer accepts $1, $5, $10, and $20 bills. We also sell single-use detergent pods, fabric softener, and dryer sheets from our vending machines.",
          },
        ],
      },
      {
        name: "Machines",
        slug: "/machines",
        sections: [
          {
            type: "content",
            heading: "Our Equipment",
            text: "We operate 20 top-load washers, 30 front-load washers (small, medium, large), and 40 commercial dryers. All machines are commercial-grade Speed Queen and Dexter equipment, serviced daily.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Location & Hours",
            address: "100 Laundry Lane, Anytown, ST 12345",
            phone: "(555) COIN-WASh",
            email: "info@coinopclassic.com",
            hours: [
              { day: "Every Day", time: "5:00 AM - 11:00 PM" },
              { day: "Last Wash", time: "10:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Machine pricing display",
      "Equipment inventory",
      "Change machine info",
      "Contact form",
      "SEO optimized",
      "Simple maintenance-friendly",
    ],
  },
  
  // ========================================
  // CAR WASH TEMPLATES
  // ========================================
  
  {
    name: "Sparkle Auto Spa",
    description: "Premium car wash template with a luxurious, high-end aesthetic. Deep blue and gold accents convey professionalism and quality for detailing services and premium wash packages.",
    industry: "car_wash",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
    demoUrl: "/templates/sparkle-auto-spa/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#1e3a5f", // Deep Navy
        secondary: "#C8A661", // Gold
        accent: "#2563eb",
        background: "#ffffff",
        text: "#1e293b",
        muted: "#64748b",
      },
      fonts: {
        heading: "Playfair Display, serif",
        body: "Inter, sans-serif",
      },
      spacing: "spacious",
      borderRadius: "modern",
    },
    
    pages: [
      {
        name: "Home",
        slug: "/",
        sections: [
          {
            type: "hero",
            title: "Premium Auto Detailing",
            subtitle: "Where your vehicle receives the royal treatment it deserves",
            cta: { text: "Book Your Detail", link: "#services" },
            backgroundImage: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1920",
          },
          {
            type: "features",
            heading: "The Sparkle Difference",
            items: [
              { icon: "Sparkles", title: "Hand Wash Only", description: "Every vehicle washed by trained technicians" },
              { icon: "Shield", title: "Premium Products", description: "Only the finest detailing chemicals and waxes" },
              { icon: "Award", title: "Certified Detailers", description: "IDA-certified professional team" },
              { icon: "Clock", title: "While You Wait", description: "Comfortable lounge with complimentary refreshments" },
            ],
          },
          {
            type: "services",
            heading: "Detailing Packages",
            items: [
              { name: "Express Wash", price: "$35", description: "Exterior hand wash, tire shine, windows" },
              { name: "Premium Wash", price: "$75", description: "Full wash plus interior vacuum and wipe-down" },
              { name: "Complete Detail", price: "$150", description: "Full interior/exterior detail with wax" },
              { name: "Ceramic Coating", price: "From $500", description: "Long-lasting paint protection" },
            ],
          },
          {
            type: "gallery",
            heading: "Our Work",
            images: [
              "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600",
              "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600",
              "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600",
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
            text: "From quick express washes to comprehensive ceramic coating packages, we offer a full range of auto care services to keep your vehicle looking showroom-new.",
          },
          {
            type: "pricing",
            heading: "Service Menu",
            plans: [
              { name: "Basic", price: "$35", features: ["Exterior hand wash", "Tire dressing", "Window cleaning"] },
              { name: "Premium", price: "$75", features: ["Full exterior wash", "Interior vacuum", "Dashboard wipe", "Air freshener"] },
              { name: "Ultimate", price: "$150", features: ["Complete detail", "Hand wax", "Leather conditioning", "Engine bay cleaning"] },
            ],
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "About Sparkle Auto Spa",
            text: "Founded by automotive enthusiasts, Sparkle Auto Spa brings professional-grade detailing to everyday drivers. Our team combines passion with precision to deliver results that exceed expectations.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Visit Our Spa",
            address: "500 Auto Plaza Drive, Your City, ST 12345",
            phone: "(555) 789-0123",
            email: "appointments@sparkleautospa.com",
            hours: [
              { day: "Monday-Saturday", time: "8:00 AM - 6:00 PM" },
              { day: "Sunday", time: "10:00 AM - 4:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Online booking integration",
      "Service package display",
      "Photo gallery",
      "Contact form",
      "Google Maps integration",
      "SEO optimized",
    ],
  },
  
  {
    name: "Express Wash Bay",
    description: "Fast-paced, energetic design for express car wash businesses. Bold colors and clear pricing emphasize speed and value. Perfect for high-volume tunnel washes.",
    industry: "car_wash",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    demoUrl: "/templates/express-wash-bay/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#dc2626", // Red
        secondary: "#fbbf24", // Yellow
        accent: "#0891b2",
        background: "#ffffff",
        text: "#1f2937",
        muted: "#6b7280",
      },
      fonts: {
        heading: "Montserrat, sans-serif",
        body: "Open Sans, sans-serif",
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
            title: "In & Out in Minutes!",
            subtitle: "Express car wash - clean, fast, affordable",
            cta: { text: "See Our Prices", link: "#pricing" },
            backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920",
          },
          {
            type: "features",
            heading: "Why Express Wash?",
            items: [
              { icon: "Zap", title: "3-Minute Wash", description: "Our tunnel wash gets you clean fast" },
              { icon: "DollarSign", title: "From $8", description: "Best prices in town, guaranteed" },
              { icon: "Car", title: "Unlimited Plans", description: "Wash as much as you want monthly" },
              { icon: "Clock", title: "Open Late", description: "7 AM - 9 PM, 7 days a week" },
            ],
          },
          {
            type: "services",
            heading: "Wash Packages",
            items: [
              { name: "Basic Wash", price: "$8", description: "Exterior wash and rinse" },
              { name: "Super Wash", price: "$12", description: "Wash, wax, tire shine" },
              { name: "Ultimate Wash", price: "$18", description: "Everything plus underbody and triple foam" },
              { name: "Unlimited Monthly", price: "$29.99/mo", description: "Unlimited Super Washes" },
            ],
          },
          {
            type: "cta",
            heading: "Join Our Wash Club",
            text: "Unlimited washes starting at $29.99/month",
            buttonText: "Sign Up Now",
            buttonLink: "#membership",
          },
        ],
      },
      {
        name: "Pricing",
        slug: "/pricing",
        sections: [
          {
            type: "pricing",
            heading: "Wash Menu",
            plans: [
              { name: "Basic", price: "$8", features: ["Exterior wash", "Spot-free rinse", "Air dry"] },
              { name: "Super", price: "$12", features: ["All Basic features", "Tire shine", "Rain-X", "Wax coating"] },
              { name: "Ultimate", price: "$18", features: ["All Super features", "Underbody wash", "Triple foam", "Interior fragrance"] },
            ],
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
            text: "With 5 convenient locations, there's always an Express Wash Bay nearby. All locations offer the same great service at the same low prices.",
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
            phone: "(555) CAR-WASH",
            email: "hello@expresswashbay.com",
            hours: [
              { day: "Every Day", time: "7:00 AM - 9:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Multi-location support",
      "Membership signup",
      "Pricing display",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Eco Green Car Wash",
    description: "Environmentally conscious car wash template emphasizing water conservation and eco-friendly products. Natural colors and sustainability messaging appeal to green-minded customers.",
    industry: "car_wash",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=800",
    demoUrl: "/templates/eco-green-car-wash/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#059669", // Emerald
        secondary: "#10b981",
        accent: "#0d9488",
        background: "#f0fdf4",
        text: "#14532d",
        muted: "#6b7280",
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
            title: "Clean Car, Clean Planet",
            subtitle: "Eco-friendly car wash that saves 80% more water than home washing",
            cta: { text: "Learn Our Process", link: "#sustainability" },
            backgroundImage: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=1920",
          },
          {
            type: "features",
            heading: "Our Green Promise",
            items: [
              { icon: "Droplet", title: "Water Recycling", description: "85% of our water is reclaimed and reused" },
              { icon: "Leaf", title: "Biodegradable Soaps", description: "All-natural, plant-based cleaning products" },
              { icon: "Sun", title: "Solar Powered", description: "100% renewable energy facility" },
              { icon: "Recycle", title: "Zero Runoff", description: "No chemicals enter storm drains" },
            ],
          },
          {
            type: "services",
            heading: "Eco Wash Packages",
            items: [
              { name: "Eco Express", price: "$12", description: "Quick exterior wash with recycled water" },
              { name: "Eco Plus", price: "$18", description: "Full wash with organic wax protection" },
              { name: "Eco Premium", price: "$28", description: "Complete detail with plant-based products" },
            ],
          },
          {
            type: "content",
            heading: "Why Wash Green?",
            text: "Washing your car at home can use 80-140 gallons of water. Our eco-friendly system uses just 15-20 gallons per wash, and 85% of that water is recycled. Plus, our biodegradable products keep harmful chemicals out of waterways.",
          },
        ],
      },
      {
        name: "Sustainability",
        slug: "/sustainability",
        sections: [
          {
            type: "content",
            heading: "Our Environmental Commitment",
            text: "At Eco Green Car Wash, we believe a clean car shouldn't come at the cost of a clean environment. Our facility is designed from the ground up to minimize environmental impact while delivering sparkling results.",
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
            address: "123 Sustainability Way, Green City, ST 12345",
            phone: "(555) ECO-WASH",
            email: "info@ecogreenwash.com",
            hours: [
              { day: "Monday-Saturday", time: "7:00 AM - 7:00 PM" },
              { day: "Sunday", time: "8:00 AM - 5:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Sustainability messaging",
      "Environmental impact stats",
      "Service pricing",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  // ========================================
  // DRY CLEANER TEMPLATES
  // ========================================
  
  {
    name: "Pristine Dry Cleaners",
    description: "Elegant, sophisticated template for premium dry cleaning services. Rich colors and refined typography convey quality and attention to detail for discerning customers.",
    industry: "dry_cleaner",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    demoUrl: "/templates/pristine-dry-cleaners/demo",
    isPro: true,
    
    theme: {
      colors: {
        primary: "#1e3a5f", // Navy
        secondary: "#C8A661", // Gold
        accent: "#7c3aed",
        background: "#ffffff",
        text: "#1e293b",
        muted: "#64748b",
      },
      fonts: {
        heading: "Cormorant Garamond, serif",
        body: "Raleway, sans-serif",
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
            title: "Excellence in Garment Care",
            subtitle: "Professional dry cleaning with the attention to detail your wardrobe deserves",
            cta: { text: "Schedule Pickup", link: "#contact" },
            backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920",
          },
          {
            type: "features",
            heading: "The Pristine Difference",
            items: [
              { icon: "Award", title: "Master Cleaners", description: "Certified professionals with 20+ years experience" },
              { icon: "Shirt", title: "Specialty Care", description: "Expert handling of delicates, silks, and designer items" },
              { icon: "Truck", title: "Free Pickup & Delivery", description: "Convenient service to your home or office" },
              { icon: "Sparkles", title: "Eco-Friendly", description: "GreenEarth certified cleaning process" },
            ],
          },
          {
            type: "services",
            heading: "Our Services",
            items: [
              { name: "Dry Cleaning", price: "From $8", description: "Professional solvent cleaning for suits, dresses, coats" },
              { name: "Shirt Laundry", price: "$3.50", description: "Laundered, pressed, and perfectly finished" },
              { name: "Wedding Gown", price: "From $175", description: "Preservation and specialty cleaning" },
              { name: "Leather & Suede", price: "From $45", description: "Expert leather care and restoration" },
              { name: "Alterations", price: "Varies", description: "Expert tailoring and alterations on-site" },
            ],
          },
          {
            type: "testimonials",
            heading: "What Our Clients Say",
            items: [
              { name: "Margaret S.", text: "The only cleaners I trust with my designer pieces. Impeccable quality.", rating: 5 },
              { name: "James R.", text: "Their shirt service is outstanding. Perfect creases every time.", rating: 5 },
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
            heading: "Complete Garment Care",
            text: "From everyday business attire to heirloom wedding gowns, we provide expert care for every garment in your wardrobe. Our master cleaners use state-of-the-art equipment and eco-friendly processes.",
          },
          {
            type: "pricing",
            heading: "Price List",
            plans: [
              { name: "Standard", price: "", features: ["Suits from $16", "Dresses from $12", "Pants $8", "Shirts $3.50"] },
              { name: "Specialty", price: "", features: ["Wedding gowns from $175", "Leather from $45", "Drapes per pleat $3", "Comforters from $35"] },
            ],
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "Our Story",
            text: "For over three decades, Pristine Dry Cleaners has served discerning clients who demand the highest quality garment care. Our family-owned business combines traditional craftsmanship with modern technology.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Schedule Service",
            address: "789 Fashion Avenue, Uptown District, ST 12345",
            phone: "(555) 456-7890",
            email: "care@pristinecleaners.com",
            hours: [
              { day: "Monday-Friday", time: "7:00 AM - 7:00 PM" },
              { day: "Saturday", time: "8:00 AM - 5:00 PM" },
              { day: "Sunday", time: "Closed" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Pickup scheduling",
      "Price list display",
      "Testimonials section",
      "Contact form",
      "Google Maps integration",
      "SEO optimized",
    ],
  },
  
  {
    name: "Quick Press",
    description: "Modern, efficient design for express dry cleaning services. Clean lines and clear pricing emphasize speed and convenience for busy professionals.",
    industry: "dry_cleaner",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
    demoUrl: "/templates/quick-press/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#0891b2", // Cyan
        secondary: "#06b6d4",
        accent: "#8b5cf6",
        background: "#ffffff",
        text: "#0f172a",
        muted: "#64748b",
      },
      fonts: {
        heading: "Poppins, sans-serif",
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
            title: "Same-Day Dry Cleaning",
            subtitle: "Drop off by 10 AM, pick up by 5 PM. It's that simple.",
            cta: { text: "Find a Location", link: "#locations" },
            backgroundImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920",
          },
          {
            type: "features",
            heading: "Why Quick Press?",
            items: [
              { icon: "Clock", title: "Same-Day Service", description: "In by 10, out by 5 - every day" },
              { icon: "Smartphone", title: "Text When Ready", description: "Get notified when your clothes are done" },
              { icon: "CreditCard", title: "Simple Pricing", description: "No hidden fees, no surprises" },
              { icon: "MapPin", title: "15 Locations", description: "Convenient spots across the city" },
            ],
          },
          {
            type: "services",
            heading: "Simple Pricing",
            items: [
              { name: "Suits", price: "$14.99", description: "Jacket and pants, ready same-day" },
              { name: "Dress Shirts", price: "$2.99", description: "Laundered and pressed" },
              { name: "Dresses", price: "$11.99", description: "Most styles and fabrics" },
              { name: "Pants/Skirts", price: "$7.99", description: "Dry cleaned and pressed" },
            ],
          },
          {
            type: "cta",
            heading: "New Customer Special",
            text: "First order 50% off - no minimum!",
            buttonText: "Get Offer",
            buttonLink: "#contact",
          },
        ],
      },
      {
        name: "Pricing",
        slug: "/pricing",
        sections: [
          {
            type: "pricing",
            heading: "Our Prices",
            plans: [
              { name: "Everyday Items", price: "", features: ["Shirts $2.99", "Pants $7.99", "Suits $14.99", "Dresses $11.99"] },
              { name: "Specialty Items", price: "", features: ["Coats from $18", "Sweaters $9.99", "Ties $5.99", "Comforters from $29"] },
            ],
          },
        ],
      },
      {
        name: "Locations",
        slug: "/locations",
        sections: [
          {
            type: "content",
            heading: "Find a Location",
            text: "With 15 locations across the metro area, there's always a Quick Press nearby. All stores offer the same great prices and same-day service.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Questions?",
            address: "Multiple Locations - See Map",
            phone: "(555) QUICK-DC",
            email: "help@quickpress.com",
            hours: [
              { day: "Monday-Friday", time: "7:00 AM - 8:00 PM" },
              { day: "Saturday", time: "8:00 AM - 6:00 PM" },
              { day: "Sunday", time: "10:00 AM - 4:00 PM" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Multi-location support",
      "Clear pricing display",
      "Text notifications mention",
      "Contact form",
      "SEO optimized",
    ],
  },
  
  {
    name: "Neighborhood Cleaners",
    description: "Warm, community-focused template for local dry cleaners. Friendly colors and personal touch appeal to families and long-time neighborhood customers.",
    industry: "dry_cleaner",
    category: "business",
    previewImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=800",
    demoUrl: "/templates/neighborhood-cleaners/demo",
    isPro: false,
    
    theme: {
      colors: {
        primary: "#7c3aed", // Purple
        secondary: "#a78bfa",
        accent: "#f59e0b",
        background: "#faf5ff",
        text: "#1e1b4b",
        muted: "#6b7280",
      },
      fonts: {
        heading: "Quicksand, sans-serif",
        body: "Lato, sans-serif",
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
            title: "Your Neighborhood Cleaners",
            subtitle: "Family-owned since 1985. Where quality meets community.",
            cta: { text: "Meet Our Family", link: "#about" },
            backgroundImage: "https://images.unsplash.com/photo-1545259742-12f1d7514ca4?w=1920",
          },
          {
            type: "features",
            heading: "Why Our Neighbors Love Us",
            items: [
              { icon: "Heart", title: "Family Owned", description: "Three generations of caring service" },
              { icon: "Users", title: "Know Your Name", description: "Personal service, not a number" },
              { icon: "Shield", title: "Guaranteed Quality", description: "If you're not happy, we'll redo it free" },
              { icon: "Gift", title: "Loyalty Rewards", description: "Every 10th item free for regulars" },
            ],
          },
          {
            type: "services",
            heading: "Services",
            items: [
              { name: "Dry Cleaning", price: "From $6", description: "Suits, dresses, coats, and more" },
              { name: "Laundry Service", price: "$1.50/lb", description: "Wash, dry, and fold" },
              { name: "Alterations", price: "From $10", description: "Expert tailoring on-site" },
              { name: "Household Items", price: "Varies", description: "Comforters, drapes, table linens" },
            ],
          },
          {
            type: "testimonials",
            heading: "From Our Neighbors",
            items: [
              { name: "The Johnson Family", text: "We've been coming here for 20 years. They're like family!", rating: 5 },
              { name: "Maria G.", text: "Always friendly, always reliable. Wouldn't go anywhere else.", rating: 5 },
              { name: "Tom S.", text: "Best alterations in town. Maria works magic!", rating: 5 },
            ],
          },
        ],
      },
      {
        name: "About",
        slug: "/about",
        sections: [
          {
            type: "content",
            heading: "Our Story",
            text: "When Rosa and Antonio opened our doors in 1985, they had one goal: treat every customer like family. Today, their grandchildren continue that tradition, providing the same personal, quality service that made us a neighborhood favorite.",
          },
        ],
      },
      {
        name: "Services",
        slug: "/services",
        sections: [
          {
            type: "content",
            heading: "What We Do",
            text: "From everyday dry cleaning to wedding gown preservation, from simple hemming to complete wardrobe alterations - we handle it all with the care and attention your clothes deserve.",
          },
        ],
      },
      {
        name: "Contact",
        slug: "/contact",
        sections: [
          {
            type: "contact",
            heading: "Stop By & Say Hello",
            address: "Corner of Main & Oak, Your Town, ST 12345",
            phone: "(555) 123-WASH",
            email: "hello@neighborhoodcleaners.com",
            hours: [
              { day: "Monday-Friday", time: "7:00 AM - 6:30 PM" },
              { day: "Saturday", time: "8:00 AM - 4:00 PM" },
              { day: "Sunday", time: "Closed (Family Day)" },
            ],
          },
        ],
      },
    ],
    
    features: [
      "Mobile responsive",
      "Family story section",
      "Customer testimonials",
      "Service catalog",
      "Contact form",
      "SEO optimized",
    ],
  },
];
