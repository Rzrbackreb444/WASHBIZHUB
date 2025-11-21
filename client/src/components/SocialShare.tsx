import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  affiliateTag?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SocialShare({
  url,
  title,
  description = "",
  affiliateTag,
  buttonVariant = "outline",
  buttonSize = "sm",
  className = "",
}: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate affiliate link if tag provided
  const getShareUrl = () => {
    try {
      const shareUrl = new URL(url, window.location.origin);
      if (affiliateTag) {
        shareUrl.searchParams.set("ref", affiliateTag);
      }
      return shareUrl.toString();
    } catch {
      // If URL parsing fails, return as-is
      return url;
    }
  };

  const shareUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      testId: "button-share-facebook",
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      testId: "button-share-twitter",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      testId: "button-share-linkedin",
    },
    {
      name: "WhatsApp",
      icon: SiWhatsapp,
      color: "bg-green-600 hover:bg-green-700",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      testId: "button-share-whatsapp",
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-slate-600 hover:bg-slate-700",
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      testId: "button-share-email",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={className}
          data-testid="button-open-share-dialog"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle data-testid="text-share-title">Share {title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {affiliateTag 
              ? "Your affiliate link is embedded. Earn 20% commission on any sales!"
              : "Share this with your network"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Copy Link */}
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {affiliateTag ? "Your Affiliate Link" : "Link"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-slate-800 border-slate-700 text-white text-sm"
                data-testid="input-share-url"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="border-slate-600 shrink-0"
                data-testid="button-copy-url"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Platforms */}
          <div>
            <Label className="text-slate-300 text-sm mb-3 block">
              Share on Social Media
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      className={`${platform.color} text-white justify-start w-full`}
                      data-testid={platform.testId}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {platform.name}
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>

          {affiliateTag && (
            <div className="bg-gold-900/20 border border-gold-700 rounded-lg p-4">
              <p className="text-gold-200 text-sm font-medium">
                💰 Affiliate Tag: <span className="font-mono">{affiliateTag}</span>
              </p>
              <p className="text-gold-300/80 text-xs mt-1">
                Track clicks and earn 20% commission on all sales through this link
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
