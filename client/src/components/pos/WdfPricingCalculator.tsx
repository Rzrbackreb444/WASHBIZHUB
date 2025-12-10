import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scale,
  Zap,
  Clock,
  Sparkles,
  Droplets,
  Shirt,
  Leaf,
  Star,
  ChevronRight,
  Calculator,
  TrendingDown,
  Package,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PricingTier = {
  id: string;
  tierName: string;
  minWeight: number;
  maxWeight: number | null;
  pricePerPound: number;
};

type ServiceType = {
  id: string;
  name: string;
  multiplier: number;
  icon: typeof Clock;
  description: string;
  turnaround: string;
};

type Addon = {
  id: string;
  name: string;
  type: "per_pound" | "flat_fee" | "per_item";
  price: number;
  icon: typeof Sparkles;
  description: string;
};

const DEFAULT_PRICING_TIERS: PricingTier[] = [
  { id: "tier-1", tierName: "Standard", minWeight: 0, maxWeight: 10, pricePerPound: 2.00 },
  { id: "tier-2", tierName: "Bulk", minWeight: 10, maxWeight: 25, pricePerPound: 1.75 },
  { id: "tier-3", tierName: "Commercial", minWeight: 25, maxWeight: null, pricePerPound: 1.50 },
];

const SERVICE_TYPES: ServiceType[] = [
  { id: "regular", name: "Regular", multiplier: 1.0, icon: Clock, description: "Standard processing", turnaround: "24-48 hours" },
  { id: "same_day", name: "Same Day", multiplier: 1.5, icon: Zap, description: "Drop off by 9am, ready by 5pm", turnaround: "Same day" },
  { id: "express", name: "Express", multiplier: 2.0, icon: Sparkles, description: "Priority rush processing", turnaround: "4-6 hours" },
];

const DEFAULT_ADDONS: Addon[] = [
  { id: "stain", name: "Stain Treatment", type: "per_pound", price: 0.50, icon: Droplets, description: "Pre-treat tough stains" },
  { id: "softener", name: "Fabric Softener", type: "per_pound", price: 0.25, icon: Leaf, description: "Extra softness & fresh scent" },
  { id: "hang_dry", name: "Hang Dry Items", type: "per_item", price: 1.00, icon: Shirt, description: "Air dry delicates" },
  { id: "premium_fold", name: "Premium Folding", type: "flat_fee", price: 5.00, icon: Star, description: "Professional folding & packaging" },
];

const TAX_RATE = 0.0825;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

type WdfPricingCalculatorProps = {
  pricingTiers?: PricingTier[];
  addons?: Addon[];
  onCalculate?: (result: CalculationResult) => void;
  onAddToCart?: (result: CalculationResult) => void;
};

export type CalculationResult = {
  weight: number;
  serviceType: string;
  tierBreakdown: { tier: PricingTier; poundsInTier: number; tierCost: number }[];
  basePrice: number;
  serviceMultiplier: number;
  serviceFee: number;
  addons: { addon: Addon; quantity: number; cost: number }[];
  addonsTotal: number;
  subtotal: number;
  tax: number;
  total: number;
  savings: number;
};

export default function WdfPricingCalculator({
  pricingTiers = DEFAULT_PRICING_TIERS,
  addons = DEFAULT_ADDONS,
  onCalculate,
  onAddToCart,
}: WdfPricingCalculatorProps) {
  const [weight, setWeight] = useState<number>(15);
  const [weightInput, setWeightInput] = useState<string>("15");
  const [serviceType, setServiceType] = useState<string>("regular");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [hangDryItems, setHangDryItems] = useState<number>(0);

  const sortedTiers = useMemo(() => 
    [...pricingTiers].sort((a, b) => a.minWeight - b.minWeight),
    [pricingTiers]
  );

  const calculateTierBreakdown = useCallback((totalWeight: number): { tier: PricingTier; poundsInTier: number; tierCost: number }[] => {
    const breakdown: { tier: PricingTier; poundsInTier: number; tierCost: number }[] = [];
    let remainingWeight = totalWeight;

    for (const tier of sortedTiers) {
      if (remainingWeight <= 0) break;
      
      const tierMax = tier.maxWeight ?? Infinity;
      const tierRange = tierMax - tier.minWeight;
      const poundsInTier = Math.min(remainingWeight, tierRange);
      
      if (totalWeight > tier.minWeight) {
        const actualPounds = totalWeight <= tierMax ? totalWeight - tier.minWeight : tierRange;
        const finalPounds = tier === sortedTiers[0] ? Math.min(totalWeight, tierMax) : Math.max(0, actualPounds);
        
        if (finalPounds > 0) {
          breakdown.push({
            tier,
            poundsInTier: finalPounds,
            tierCost: finalPounds * tier.pricePerPound,
          });
        }
      } else if (tier === sortedTiers[0] && totalWeight > 0) {
        breakdown.push({
          tier,
          poundsInTier: Math.min(totalWeight, tierMax),
          tierCost: Math.min(totalWeight, tierMax) * tier.pricePerPound,
        });
      }
      
      remainingWeight -= poundsInTier;
    }

    return breakdown;
  }, [sortedTiers]);

  const calculation = useMemo((): CalculationResult => {
    const service = SERVICE_TYPES.find(s => s.id === serviceType) || SERVICE_TYPES[0];
    
    const tierBreakdown: { tier: PricingTier; poundsInTier: number; tierCost: number }[] = [];
    let remaining = weight;
    
    for (const tier of sortedTiers) {
      if (remaining <= 0) break;
      
      const tierMax = tier.maxWeight ?? Infinity;
      let poundsInThisTier = 0;
      
      if (weight > tier.minWeight) {
        const startInTier = Math.max(0, tier.minWeight);
        const endInTier = Math.min(weight, tierMax);
        poundsInThisTier = endInTier - startInTier;
        
        if (poundsInThisTier > 0) {
          tierBreakdown.push({
            tier,
            poundsInTier: poundsInThisTier,
            tierCost: poundsInThisTier * tier.pricePerPound,
          });
        }
      }
    }

    const basePrice = tierBreakdown.reduce((sum, t) => sum + t.tierCost, 0);
    const serviceFee = basePrice * (service.multiplier - 1);
    
    const addonsList: { addon: Addon; quantity: number; cost: number }[] = [];
    for (const addon of addons) {
      const isSelected = selectedAddons[addon.id];
      if (isSelected) {
        let quantity = 1;
        let cost = 0;
        
        if (addon.type === "per_pound") {
          quantity = weight;
          cost = addon.price * weight;
        } else if (addon.type === "per_item" && addon.id === "hang_dry") {
          quantity = hangDryItems;
          cost = addon.price * hangDryItems;
        } else {
          cost = addon.price;
        }
        
        if (cost > 0) {
          addonsList.push({ addon, quantity, cost });
        }
      }
    }
    
    const addonsTotal = addonsList.reduce((sum, a) => sum + a.cost, 0);
    const subtotal = basePrice + serviceFee + addonsTotal;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const regularPrice = weight * (sortedTiers[0]?.pricePerPound || 2.00);
    const savings = Math.max(0, regularPrice - basePrice);

    return {
      weight,
      serviceType,
      tierBreakdown,
      basePrice,
      serviceMultiplier: service.multiplier,
      serviceFee,
      addons: addonsList,
      addonsTotal,
      subtotal,
      tax,
      total,
      savings,
    };
  }, [weight, serviceType, selectedAddons, hangDryItems, sortedTiers, addons]);

  const handleWeightChange = (value: string) => {
    setWeightInput(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      setWeight(parsed);
      onCalculate?.(calculation);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newWeight = value[0];
    setWeight(newWeight);
    setWeightInput(newWeight.toString());
    onCalculate?.(calculation);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: prev[addonId] ? 0 : 1,
    }));
  };

  const currentTier = useMemo(() => {
    return sortedTiers.find(tier => 
      weight >= tier.minWeight && (tier.maxWeight === null || weight < tier.maxWeight)
    ) || sortedTiers[sortedTiers.length - 1];
  }, [weight, sortedTiers]);

  const selectedService = SERVICE_TYPES.find(s => s.id === serviceType) || SERVICE_TYPES[0];

  return (
    <Card className="bg-card border shadow-sm overflow-hidden" data-testid="wdf-pricing-calculator">
      <div className="h-1 bg-[#C8A661]" />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
            <Calculator className="h-5 w-5 text-[#C8A661]" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">Wash & Fold Pricing</span>
            <p className="text-sm text-muted-foreground font-normal">Per-pound pricing with automatic discounts</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#C8A661]" />
              Weight (lbs)
            </Label>
            <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
              {currentTier?.tierName} Rate
            </Badge>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="number"
              value={weightInput}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-24 text-center text-lg font-semibold"
              min="0"
              step="0.5"
              data-testid="input-weight"
            />
            <div className="flex-1">
              <Slider
                value={[weight]}
                onValueChange={handleSliderChange}
                max={100}
                step={0.5}
                className="mt-2"
                data-testid="slider-weight"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 lbs</span>
                <span>50 lbs</span>
                <span>100 lbs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Weight Break Tiers</Label>
          <div className="space-y-2">
            {sortedTiers.map((tier, index) => {
              const isActive = weight >= tier.minWeight && (tier.maxWeight === null || weight < tier.maxWeight);
              const tierData = calculation.tierBreakdown.find(t => t.tier.id === tier.id);
              const progressPct = tierData ? (tierData.poundsInTier / (tier.maxWeight ? tier.maxWeight - tier.minWeight : 100)) * 100 : 0;
              
              return (
                <div 
                  key={tier.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive 
                      ? "border-[#C8A661] bg-[#C8A661]/5" 
                      : tierData 
                        ? "border-green-500/30 bg-green-50/50 dark:bg-green-900/10" 
                        : "border-border bg-muted/30"
                  }`}
                  data-testid={`pricing-tier-${tier.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tierData && tierData.poundsInTier > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium text-sm">{tier.tierName}</span>
                      <span className="text-xs text-muted-foreground">
                        {tier.minWeight}-{tier.maxWeight ?? "∞"} lbs
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#C8A661]">{formatCurrency(tier.pricePerPound)}</span>
                      <span className="text-xs text-muted-foreground">/lb</span>
                    </div>
                  </div>
                  {tierData && tierData.poundsInTier > 0 && (
                    <div className="space-y-1">
                      <Progress value={Math.min(100, progressPct)} className="h-1.5" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{tierData.poundsInTier.toFixed(1)} lbs in tier</span>
                        <span className="text-green-600 font-medium">{formatCurrency(tierData.tierCost)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {calculation.savings > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400">
                You save <strong>{formatCurrency(calculation.savings)}</strong> with bulk pricing
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Service Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {SERVICE_TYPES.map((service) => {
              const Icon = service.icon;
              const isSelected = serviceType === service.id;
              
              return (
                <button
                  key={service.id}
                  onClick={() => setServiceType(service.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected 
                      ? "border-[#C8A661] bg-[#C8A661]/10" 
                      : "border-border hover-elevate"
                  }`}
                  data-testid={`service-type-${service.id}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-[#C8A661]" : "text-muted-foreground"}`} />
                    <span className={`font-medium text-sm ${isSelected ? "text-[#C8A661]" : ""}`}>
                      {service.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{service.turnaround}</div>
                  {service.multiplier > 1 && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      +{((service.multiplier - 1) * 100).toFixed(0)}%
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Add-on Services</Label>
          <div className="grid grid-cols-2 gap-2">
            {addons.map((addon) => {
              const Icon = addon.icon;
              const isSelected = selectedAddons[addon.id];
              
              return (
                <div
                  key={addon.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? "border-[#C8A661] bg-[#C8A661]/5" 
                      : "border-border hover-elevate"
                  }`}
                  onClick={() => toggleAddon(addon.id)}
                  data-testid={`addon-${addon.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={!!isSelected} 
                      className="mt-0.5"
                      data-testid={`checkbox-addon-${addon.id}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-[#C8A661]" : "text-muted-foreground"}`} />
                        <span className="font-medium text-sm">{addon.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                      <div className="mt-1">
                        <span className="text-sm font-semibold text-[#C8A661]">
                          {formatCurrency(addon.price)}
                          {addon.type === "per_pound" && "/lb"}
                          {addon.type === "per_item" && "/item"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {addon.id === "hang_dry" && isSelected && (
                    <div className="mt-3 flex items-center gap-2">
                      <Label className="text-xs">Items:</Label>
                      <Input
                        type="number"
                        value={hangDryItems}
                        onChange={(e) => setHangDryItems(parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center"
                        min="0"
                        onClick={(e) => e.stopPropagation()}
                        data-testid="input-hang-dry-items"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="bg-muted/50 rounded-lg p-4 space-y-3" data-testid="price-breakdown">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Price Breakdown
          </h4>
          
          <div className="space-y-2 text-sm">
            {calculation.tierBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.poundsInTier.toFixed(1)} lbs @ {formatCurrency(item.tier.pricePerPound)}/lb
                </span>
                <span>{formatCurrency(item.tierCost)}</span>
              </div>
            ))}
            
            {calculation.serviceFee > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{selectedService.name} Service (+{((selectedService.multiplier - 1) * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(calculation.serviceFee)}</span>
              </div>
            )}
            
            {calculation.addons.map((item, index) => (
              <div key={index} className="flex justify-between text-muted-foreground">
                <span>{item.addon.name} ({item.quantity}x)</span>
                <span>{formatCurrency(item.cost)}</span>
              </div>
            ))}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
              <span>{formatCurrency(calculation.tax)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#C8A661]" data-testid="text-total-price">
                {formatCurrency(calculation.total)}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground text-right">
              Effective rate: {formatCurrency(calculation.subtotal / weight)}/lb
            </div>
          </div>
        </div>

        {onAddToCart && (
          <Button 
            className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
            onClick={() => onAddToCart(calculation)}
            data-testid="button-add-to-cart"
          >
            Add to Cart
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
