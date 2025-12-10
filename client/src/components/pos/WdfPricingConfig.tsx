import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Scale,
  Zap,
  Clock,
  Sparkles,
  GripVertical,
  Save,
  X,
} from "lucide-react";

type PricingTier = {
  id: string;
  tierName: string;
  minWeight: number;
  maxWeight: number | null;
  pricePerPound: number;
  serviceType: string;
  serviceMultiplier: number;
  displayOrder: number;
  isActive: boolean;
};

type WdfAddon = {
  id: string;
  addonName: string;
  addonType: "per_pound" | "flat_fee" | "per_item";
  price: number;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
};

const tierFormSchema = z.object({
  tierName: z.string().min(1, "Tier name is required"),
  minWeight: z.coerce.number().min(0, "Min weight must be 0 or greater"),
  maxWeight: z.coerce.number().optional().nullable(),
  pricePerPound: z.coerce.number().min(0.01, "Price must be greater than 0"),
  serviceType: z.string().min(1, "Service type is required"),
  serviceMultiplier: z.coerce.number().min(0.1, "Multiplier must be at least 0.1"),
  isActive: z.boolean().default(true),
});

const addonFormSchema = z.object({
  addonName: z.string().min(1, "Add-on name is required"),
  addonType: z.enum(["per_pound", "flat_fee", "per_item"]),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

type TierFormData = z.infer<typeof tierFormSchema>;
type AddonFormData = z.infer<typeof addonFormSchema>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

type WdfPricingConfigProps = {
  laundromatId?: string;
};

export default function WdfPricingConfig({ laundromatId }: WdfPricingConfigProps) {
  const { toast } = useToast();
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [showAddonDialog, setShowAddonDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [editingAddon, setEditingAddon] = useState<WdfAddon | null>(null);

  const { data: tiers = [], isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ['/api/pos/wdf/pricing-tiers', laundromatId],
  });

  const { data: addons = [], isLoading: addonsLoading } = useQuery<WdfAddon[]>({
    queryKey: ['/api/pos/wdf/addons', laundromatId],
  });

  const tierForm = useForm<TierFormData>({
    resolver: zodResolver(tierFormSchema),
    defaultValues: {
      tierName: "",
      minWeight: 0,
      maxWeight: null,
      pricePerPound: 2.00,
      serviceType: "regular",
      serviceMultiplier: 1.0,
      isActive: true,
    },
  });

  const addonForm = useForm<AddonFormData>({
    resolver: zodResolver(addonFormSchema),
    defaultValues: {
      addonName: "",
      addonType: "per_pound",
      price: 0.50,
      description: "",
      icon: "sparkles",
      isActive: true,
    },
  });

  const saveTierMutation = useMutation({
    mutationFn: async (data: TierFormData & { id?: string }) => {
      const url = data.id 
        ? `/api/pos/wdf/pricing-tiers/${data.id}` 
        : '/api/pos/wdf/pricing-tiers';
      return apiRequest(url, {
        method: data.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...data, laundromatId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/pricing-tiers'] });
      setShowTierDialog(false);
      setEditingTier(null);
      tierForm.reset();
      toast({ title: "Saved", description: "Pricing tier saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save pricing tier.", variant: "destructive" });
    },
  });

  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/pos/wdf/pricing-tiers/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/pricing-tiers'] });
      toast({ title: "Deleted", description: "Pricing tier deleted." });
    },
  });

  const saveAddonMutation = useMutation({
    mutationFn: async (data: AddonFormData & { id?: string }) => {
      const url = data.id 
        ? `/api/pos/wdf/addons/${data.id}` 
        : '/api/pos/wdf/addons';
      return apiRequest(url, {
        method: data.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...data, laundromatId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/addons'] });
      setShowAddonDialog(false);
      setEditingAddon(null);
      addonForm.reset();
      toast({ title: "Saved", description: "Add-on saved successfully." });
    },
  });

  const deleteAddonMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/pos/wdf/addons/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/addons'] });
      toast({ title: "Deleted", description: "Add-on deleted." });
    },
  });

  const openEditTier = (tier: PricingTier) => {
    setEditingTier(tier);
    tierForm.reset({
      tierName: tier.tierName,
      minWeight: tier.minWeight,
      maxWeight: tier.maxWeight,
      pricePerPound: tier.pricePerPound,
      serviceType: tier.serviceType,
      serviceMultiplier: tier.serviceMultiplier,
      isActive: tier.isActive,
    });
    setShowTierDialog(true);
  };

  const openEditAddon = (addon: WdfAddon) => {
    setEditingAddon(addon);
    addonForm.reset({
      addonName: addon.addonName,
      addonType: addon.addonType,
      price: addon.price,
      description: addon.description,
      icon: addon.icon,
      isActive: addon.isActive,
    });
    setShowAddonDialog(true);
  };

  const onSubmitTier = (data: TierFormData) => {
    saveTierMutation.mutate({ ...data, id: editingTier?.id });
  };

  const onSubmitAddon = (data: AddonFormData) => {
    saveAddonMutation.mutate({ ...data, id: editingAddon?.id });
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "same_day": return <Zap className="h-4 w-4 text-yellow-500" />;
      case "express": return <Sparkles className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8" data-testid="wdf-pricing-config">
      <Card className="bg-card border shadow-sm overflow-hidden">
        <div className="h-1 bg-[#C8A661]" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Scale className="h-5 w-5 text-[#C8A661]" />
            </div>
            <div>
              <CardTitle>Weight Break Pricing Tiers</CardTitle>
              <p className="text-sm text-muted-foreground">Configure per-pound pricing with volume discounts</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              setEditingTier(null);
              tierForm.reset();
              setShowTierDialog(true);
            }}
            className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
            data-testid="button-add-tier"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Tier Name</TableHead>
                <TableHead>Weight Range</TableHead>
                <TableHead>Price/lb</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No pricing tiers configured. Add your first tier to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tiers.map((tier) => (
                  <TableRow key={tier.id} data-testid={`tier-row-${tier.id}`}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell className="font-medium">{tier.tierName}</TableCell>
                    <TableCell>
                      {tier.minWeight} - {tier.maxWeight ?? '∞'} lbs
                    </TableCell>
                    <TableCell className="font-semibold text-[#C8A661]">
                      {formatCurrency(tier.pricePerPound)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getServiceIcon(tier.serviceType)}
                        <span className="capitalize">{tier.serviceType.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tier.serviceMultiplier}x</TableCell>
                    <TableCell>
                      {tier.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditTier(tier)}
                          data-testid={`button-edit-tier-${tier.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Delete this pricing tier?')) {
                              deleteTierMutation.mutate(tier.id);
                            }
                          }}
                          data-testid={`button-delete-tier-${tier.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card border shadow-sm overflow-hidden">
        <div className="h-1 bg-[#C8A661]" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#C8A661]" />
            </div>
            <div>
              <CardTitle>Add-on Services</CardTitle>
              <p className="text-sm text-muted-foreground">Configure optional add-on services with pricing</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              setEditingAddon(null);
              addonForm.reset();
              setShowAddonDialog(true);
            }}
            className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
            data-testid="button-add-addon"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Pricing Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No add-on services configured. Add services to upsell to customers.
                  </TableCell>
                </TableRow>
              ) : (
                addons.map((addon) => (
                  <TableRow key={addon.id} data-testid={`addon-row-${addon.id}`}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell className="font-medium">{addon.addonName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {addon.addonType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-[#C8A661]">
                      {formatCurrency(addon.price)}
                      {addon.addonType === 'per_pound' && '/lb'}
                      {addon.addonType === 'per_item' && '/item'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {addon.description}
                    </TableCell>
                    <TableCell>
                      {addon.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditAddon(addon)}
                          data-testid={`button-edit-addon-${addon.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Delete this add-on service?')) {
                              deleteAddonMutation.mutate(addon.id);
                            }
                          }}
                          data-testid={`button-delete-addon-${addon.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit' : 'Add'} Pricing Tier</DialogTitle>
            <DialogDescription>
              Configure weight-based pricing with automatic discounts for higher volumes.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...tierForm}>
            <form onSubmit={tierForm.handleSubmit(onSubmitTier)} className="space-y-4">
              <FormField
                control={tierForm.control}
                name="tierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard, Bulk, Commercial" {...field} data-testid="input-tier-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tierForm.control}
                  name="minWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} data-testid="input-min-weight" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tierForm.control}
                  name="maxWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          placeholder="∞ (leave empty for unlimited)"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          data-testid="input-max-weight"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={tierForm.control}
                name="pricePerPound"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Pound ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-price-per-pound" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tierForm.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="same_day">Same Day</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tierForm.control}
                  name="serviceMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Multiplier</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} data-testid="input-multiplier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={tierForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">Enable this pricing tier</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-tier-active" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowTierDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-save-tier">
                  <Save className="h-4 w-4 mr-2" />
                  Save Tier
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddonDialog} onOpenChange={setShowAddonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddon ? 'Edit' : 'Add'} Add-on Service</DialogTitle>
            <DialogDescription>
              Configure optional services that customers can add to their order.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addonForm}>
            <form onSubmit={addonForm.handleSubmit(onSubmitAddon)} className="space-y-4">
              <FormField
                control={addonForm.control}
                name="addonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Stain Treatment, Hang Dry" {...field} data-testid="input-addon-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addonForm.control}
                  name="addonType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-addon-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="per_pound">Per Pound</SelectItem>
                          <SelectItem value="flat_fee">Flat Fee</SelectItem>
                          <SelectItem value="per_item">Per Item</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addonForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} data-testid="input-addon-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addonForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the service" {...field} data-testid="input-addon-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addonForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">Show this add-on to customers</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-addon-active" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddonDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-save-addon">
                  <Save className="h-4 w-4 mr-2" />
                  Save Add-on
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
