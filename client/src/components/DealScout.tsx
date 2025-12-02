/**
 * DEAL SCOUT - AI-Powered Deal Finder
 * Personalized opportunity alerts and discovery
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface DealOpportunity {
  id: string;
  title: string;
  location: string;
  askingPrice: number;
  cleanbiScore: number;
  cleanbiGrade: string;
  estimatedValue: number;
  dealType: "new_listing" | "price_drop" | "undervalued" | "hot_market";
  timeAgo: string;
  urgency: "high" | "medium" | "low";
}

const SAMPLE_DEALS: DealOpportunity[] = [
  {
    id: "1",
    title: "24hr Coin Laundry - Prime Location",
    location: "Houston, TX",
    askingPrice: 185000,
    cleanbiScore: 87,
    cleanbiGrade: "A",
    estimatedValue: 245000,
    dealType: "undervalued",
    timeAgo: "2 hours ago",
    urgency: "high",
  },
  {
    id: "2",
    title: "Speed Queen Equipped - Strip Mall",
    location: "Phoenix, AZ",
    askingPrice: 225000,
    cleanbiScore: 78,
    cleanbiGrade: "B",
    estimatedValue: 260000,
    dealType: "new_listing",
    timeAgo: "6 hours ago",
    urgency: "medium",
  },
  {
    id: "3",
    title: "Washateria + Drop-Off Service",
    location: "Austin, TX",
    askingPrice: 320000,
    cleanbiScore: 82,
    cleanbiGrade: "A",
    estimatedValue: 380000,
    dealType: "price_drop",
    timeAgo: "1 day ago",
    urgency: "medium",
  },
];

function getDealTypeLabel(type: string) {
  switch (type) {
    case "new_listing": return "New Listing";
    case "price_drop": return "Price Drop";
    case "undervalued": return "Below Market Value";
    case "hot_market": return "Hot Market";
    default: return type;
  }
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "bg-emerald-500";
    case "B": return "bg-lime-500";
    case "C": return "bg-amber-500";
    default: return "bg-[#C8A661]";
  }
}

export function DealScout() {
  const [deals] = useState<DealOpportunity[]>(SAMPLE_DEALS);
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold" data-testid="text-scout-title">Deal Scout</h3>
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">AI-Powered</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Opportunities matched to your criteria
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSetupOpen(true)} data-testid="button-setup-alerts">
            Set Up Alerts
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        <AnimatePresence>
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-muted/30 transition-colors"
              data-testid={`deal-${deal.id}`}
            >
              <Link href={`/listings/${deal.id}`}>
                <div className="cursor-pointer">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${deal.urgency === 'high' ? 'border-red-500/50 text-red-600' : ''}`}
                        >
                          {getDealTypeLabel(deal.dealType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{deal.timeAgo}</span>
                      </div>
                      <h4 className="font-medium text-sm truncate">{deal.title}</h4>
                      <p className="text-xs text-muted-foreground">{deal.location}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${getGradeColor(deal.cleanbiGrade)}`}>
                        {deal.cleanbiGrade}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Asking: </span>
                      <span className="font-semibold">${deal.askingPrice.toLocaleString()}</span>
                    </div>
                    {deal.estimatedValue > deal.askingPrice && (
                      <div className="text-emerald-600">
                        <span className="text-xs">Est. value: </span>
                        <span className="font-semibold">${deal.estimatedValue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {deal.estimatedValue > deal.askingPrice && (
                    <div className="mt-2 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-emerald-700 font-medium">
                        Potential upside: ${(deal.estimatedValue - deal.askingPrice).toLocaleString()} ({Math.round((deal.estimatedValue - deal.askingPrice) / deal.askingPrice * 100)}% below market)
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing top 3 matches</p>
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <Link href="/deal-scout">View All Opportunities</Link>
          </Button>
        </div>
      </div>

      <DealScoutSetup open={setupOpen} onClose={() => setSetupOpen(false)} />
    </Card>
  );
}

function DealScoutSetup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [locations, setLocations] = useState("");
  const [priceRange, setPriceRange] = useState([100000, 500000]);
  const [minScore, setMinScore] = useState(70);
  const [alertTypes, setAlertTypes] = useState({
    newListings: true,
    priceDrops: true,
    undervalued: true,
    hotMarkets: false,
  });
  const [frequency, setFrequency] = useState("instant");

  const handleSave = () => {
    console.log("Saving alert preferences:", {
      locations,
      priceRange,
      minScore,
      alertTypes,
      frequency,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Deal Alerts</DialogTitle>
          <DialogDescription>
            Get notified when opportunities match your criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Target Locations</Label>
            <Input
              placeholder="e.g., Houston, TX; Phoenix, AZ"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              data-testid="input-locations"
            />
            <p className="text-xs text-muted-foreground">Separate multiple locations with semicolons</p>
          </div>

          <div className="space-y-3">
            <Label>Price Range</Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={50000}
              max={2000000}
              step={25000}
              data-testid="slider-price"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Minimum CLEANBI Score</Label>
            <Slider
              value={[minScore]}
              onValueChange={([v]) => setMinScore(v)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-score"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score: {minScore}+</span>
              <span className={minScore >= 85 ? "text-emerald-600" : minScore >= 70 ? "text-lime-600" : "text-amber-600"}>
                {minScore >= 85 ? "A Grade" : minScore >= 70 ? "B+ Grade" : "C+ Grade"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Alert Types</Label>
            <div className="space-y-2">
              {[
                { key: "newListings", label: "New Listings" },
                { key: "priceDrops", label: "Price Drops" },
                { key: "undervalued", label: "Below Market Value" },
                { key: "hotMarkets", label: "Hot Market Activity" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={alertTypes[key as keyof typeof alertTypes]}
                    onCheckedChange={(checked) =>
                      setAlertTypes({ ...alertTypes, [key]: checked })
                    }
                    data-testid={`switch-${key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <div className="grid grid-cols-3 gap-2">
              {["instant", "daily", "weekly"].map((freq) => (
                <Button
                  key={freq}
                  variant={frequency === freq ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFrequency(freq)}
                  data-testid={`button-freq-${freq}`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" data-testid="button-save-alerts">
            Save Alerts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DealScoutBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">
            3 new opportunities match your criteria
          </h4>
          <p className="text-xs text-muted-foreground">
            Including 1 below-market deal in Houston, TX
          </p>
        </div>
        <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700" asChild>
          <Link href="/deal-scout">View Deals</Link>
        </Button>
      </div>
    </div>
  );
}
