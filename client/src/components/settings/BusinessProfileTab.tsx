import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  Image,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  operatingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
}

interface BusinessProfile {
  businessName: string;
  ein: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  logoUrl: string;
  locations: Location[];
}

const defaultHours = {
  monday: { open: "06:00", close: "22:00", closed: false },
  tuesday: { open: "06:00", close: "22:00", closed: false },
  wednesday: { open: "06:00", close: "22:00", closed: false },
  thursday: { open: "06:00", close: "22:00", closed: false },
  friday: { open: "06:00", close: "22:00", closed: false },
  saturday: { open: "07:00", close: "21:00", closed: false },
  sunday: { open: "08:00", close: "20:00", closed: false },
};

export default function BusinessProfileTab() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  
  const [businessData, setBusinessData] = useState<BusinessProfile>({
    businessName: "",
    ein: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    logoUrl: "",
    locations: [],
  });

  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    operatingHours: defaultHours,
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/business/profile", businessData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/profile"] });
      setIsEditing(false);
      toast({
        title: "Business profile updated",
        description: "Your business information has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update business profile",
        variant: "destructive",
      });
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (location: Partial<Location>) => {
      const res = await apiRequest("POST", "/api/business/locations", location);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/profile"] });
      setShowLocationDialog(false);
      setNewLocation({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        operatingHours: defaultHours,
      });
      toast({
        title: "Location added",
        description: "New location has been added to your business.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add location",
        variant: "destructive",
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      await apiRequest("DELETE", `/api/business/locations/${locationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/profile"] });
      toast({
        title: "Location removed",
        description: "Location has been removed from your business.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove location",
        variant: "destructive",
      });
    },
  });

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#C8A661]" />
              </div>
              Business Information
            </CardTitle>
            <CardDescription>Manage your business details and branding</CardDescription>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-business"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    placeholder="Your Business LLC"
                    data-testid="input-business-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN (Tax ID)</Label>
                  <Input
                    id="ein"
                    value={businessData.ein}
                    onChange={(e) => setBusinessData({ ...businessData, ein: e.target.value })}
                    placeholder="XX-XXXXXXX"
                    data-testid="input-ein"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  placeholder="123 Main Street"
                  data-testid="input-business-address"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    placeholder="City"
                    data-testid="input-business-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={businessData.state}
                    onValueChange={(value) => setBusinessData({ ...businessData, state: value })}
                  >
                    <SelectTrigger data-testid="select-business-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={businessData.zip}
                    onChange={(e) => setBusinessData({ ...businessData, zip: e.target.value })}
                    placeholder="12345"
                    data-testid="input-business-zip"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone</Label>
                <Input
                  id="phone"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  data-testid="input-business-phone"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                    {businessData.logoUrl ? (
                      <img src={businessData.logoUrl} alt="Logo" className="h-full w-full object-contain rounded-lg" />
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button variant="outline" size="sm" data-testid="button-upload-logo">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB. Recommended: 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => updateBusinessMutation.mutate()}
                disabled={updateBusinessMutation.isPending}
                className="w-full"
                data-testid="button-save-business"
              >
                {updateBusinessMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Save Business Information
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  {businessData.logoUrl ? (
                    <img src={businessData.logoUrl} alt="Logo" className="h-full w-full object-contain rounded-lg" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{businessData.businessName || "No business name set"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {businessData.ein ? `EIN: ${businessData.ein}` : "No EIN configured"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {businessData.address ? (
                        <>
                          {businessData.address}<br />
                          {businessData.city}, {businessData.state} {businessData.zip}
                        </>
                      ) : (
                        "No address configured"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {businessData.phone || "No phone configured"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Locations
            </CardTitle>
            <CardDescription>Manage your business locations and operating hours</CardDescription>
          </div>
          <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-location">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Add a new location to your business
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="locationName">Location Name</Label>
                  <Input
                    id="locationName"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="Downtown Location"
                    data-testid="input-location-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationAddress">Street Address</Label>
                  <Input
                    id="locationAddress"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    placeholder="123 Main Street"
                    data-testid="input-location-address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationCity">City</Label>
                    <Input
                      id="locationCity"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                      placeholder="City"
                      data-testid="input-location-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationState">State</Label>
                    <Select
                      value={newLocation.state}
                      onValueChange={(value) => setNewLocation({ ...newLocation, state: value })}
                    >
                      <SelectTrigger data-testid="select-location-state">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationZip">ZIP</Label>
                    <Input
                      id="locationZip"
                      value={newLocation.zip}
                      onChange={(e) => setNewLocation({ ...newLocation, zip: e.target.value })}
                      placeholder="12345"
                      data-testid="input-location-zip"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationPhone">Phone</Label>
                  <Input
                    id="locationPhone"
                    value={newLocation.phone}
                    onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                    data-testid="input-location-phone"
                  />
                </div>

                <Button
                  onClick={() => addLocationMutation.mutate(newLocation)}
                  disabled={addLocationMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-location"
                >
                  {addLocationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Location
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {businessData.locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No locations added yet</p>
              <p className="text-sm">Click "Add Location" to add your first location</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businessData.locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                  data-testid={`location-card-${location.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{location.name}</h4>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {location.address}, {location.city}, {location.state} {location.zip}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {location.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        6:00 AM - 10:00 PM
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" data-testid={`button-edit-location-${location.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLocationMutation.mutate(location.id)}
                      disabled={deleteLocationMutation.isPending}
                      data-testid={`button-delete-location-${location.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
