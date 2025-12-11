import { AdvancedQRGenerator } from "@/components/advanced-qr-generator";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function QRGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="QR Code Generator - Create Custom Laundromat Marketing QR Codes | WashBizHub"
        description="Generate stunning custom QR codes for your laundromat. Add your logo, customize colors, choose styles. Perfect for loyalty cards, promotions, machine payments, and marketing materials."
        keywords={["qr code generator", "laundromat qr code", "custom qr code", "loyalty card qr", "marketing qr code", "laundry marketing"]}
      />
      
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb 
          items={[
            { name: "Home", url: "/" },
            { name: "Tools", url: "/tools" },
            { name: "QR Code Generator", url: "/qr-generator" }
          ]} 
        />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Advanced QR Code Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create stunning, branded QR codes for your laundromat marketing, loyalty programs, and promotions
          </p>
        </div>

        <AdvancedQRGenerator />

        {/* Use Cases Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-bold mb-2">Loyalty Programs</h3>
            <p className="text-sm text-muted-foreground">
              Create branded QR codes for your loyalty cards. Customers scan to check points, redeem rewards, or sign up.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-bold mb-2">Machine Payments</h3>
            <p className="text-sm text-muted-foreground">
              Generate unique QR codes for each machine. Link to mobile payment, status checks, or maintenance requests.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-bold mb-2">Marketing Materials</h3>
            <p className="text-sm text-muted-foreground">
              Add your logo to QR codes on flyers, business cards, and signage. Drive traffic to your website or social media.
            </p>
          </div>
        </div>

        {/* FAQ Section for SEO */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Can I add my laundromat logo to the QR code?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Upload any image (PNG, JPG, or SVG) and it will be embedded in the center of your QR code. Adjust the size and margin for best results.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">What format should I download for printing?</h3>
              <p className="text-sm text-muted-foreground">
                SVG is best for print materials as it scales to any size without losing quality. Use PNG for digital use and JPEG for smaller file sizes.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Will the QR code still scan with a logo inside?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! QR codes have built-in error correction. Keep your logo under 30% of the QR size and test scan before mass printing.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">What colors work best for QR codes?</h3>
              <p className="text-sm text-muted-foreground">
                High contrast is key. Dark colors on light backgrounds work best. Avoid light-on-light or dark-on-dark combinations as they may not scan reliably.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
