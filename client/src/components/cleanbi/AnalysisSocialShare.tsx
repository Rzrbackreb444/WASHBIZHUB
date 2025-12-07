import { useState } from "react";
import { Share2, Copy, Check, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/user-journey";

interface AnalysisSocialShareProps {
  analysis: {
    address: string;
    cleanbiScore: number;
    grade: string;
  } | null;
}

export function AnalysisSocialShare({ analysis }: AnalysisSocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!analysis) {
    return null;
  }

  const shareUrl = `${window.location.origin}/cleanbi-explorer`;
  const shareText = `I just analyzed ${analysis.address} with CLEANBI - scored ${analysis.cleanbiScore} (${analysis.grade})! Check out this location intelligence tool for laundromats.`;
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const trackShare = (platform: string) => {
    trackEvent({
      eventType: "feature_used",
      category: "cleanbi",
      label: `share_${platform}`,
      value: analysis.cleanbiScore,
      metadata: {
        address: analysis.address,
        grade: analysis.grade,
        platform
      }
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare("clipboard");
      toast({
        title: "Link Copied",
        description: "Share link and analysis details copied to clipboard."
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shareToFacebook = () => {
    trackShare("facebook");
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToTwitter = () => {
    trackShare("twitter");
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToLinkedIn = () => {
    trackShare("linkedin");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-testid="button-share-analysis"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-64 p-3"
        data-testid="share-popover-content"
      >
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground" data-testid="text-share-title">
            Share Analysis
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2" data-testid="text-share-preview">
            {shareText.slice(0, 80)}...
          </p>
          
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="h-9 w-9"
              data-testid="button-copy-link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareToFacebook}
              className="h-9 w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600"
              data-testid="button-share-facebook"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareToTwitter}
              className="h-9 w-9 hover:bg-sky-500 hover:text-white hover:border-sky-500"
              data-testid="button-share-twitter"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareToLinkedIn}
              className="h-9 w-9 hover:bg-blue-700 hover:text-white hover:border-blue-700"
              data-testid="button-share-linkedin"
            >
              <Linkedin className="w-4 h-4" />
            </Button>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Score: <span className="font-semibold text-[#C8A661]">{analysis.cleanbiScore}</span> · Grade: <span className="font-semibold">{analysis.grade}</span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
