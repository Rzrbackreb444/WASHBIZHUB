import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar, Clock, MapPin, WashingMachine, Check, QrCode, ChevronLeft, ChevronRight, Loader2, AlertCircle, CreditCard, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Machine {
  id: string;
  machineNumber: string;
  machineName: string | null;
  machineType: string;
  manufacturer: string | null;
  model: string | null;
  capacity: string | null;
  status: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  available: boolean;
  pricingType: string;
  isBlocked: boolean;
  isBooked: boolean;
  isPast: boolean;
  rate: string;
}

interface AvailabilityResponse {
  machine: Machine;
  date: string;
  settings: {
    slotDuration: number;
    openTime: string;
    closeTime: string;
    gracePeriodMinutes: number;
    maxAdvanceBookingDays: number;
  };
  slots: TimeSlot[];
}

export default function BookingsPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedMachineType, setSelectedMachineType] = useState<string>("");
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/bookings/locations"],
  });

  const { data: machines = [], isLoading: machinesLoading } = useQuery<Machine[]>({
    queryKey: ["/api/bookings/machines", selectedLocation],
    enabled: !!selectedLocation,
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery<AvailabilityResponse>({
    queryKey: ["/api/bookings/availability", selectedMachine, format(selectedDate, "yyyy-MM-dd")],
    enabled: !!selectedMachine,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setShowConfirmation(true);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/availability"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my-bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your machine reservation has been confirmed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const filteredMachines = machines.filter(m => 
    !selectedMachineType || m.machineType === selectedMachineType
  );

  const uniqueMachineTypes = [...new Set(machines.map(m => m.machineType))];

  const handleDateChange = (direction: number) => {
    setSelectedDate(prev => addDays(prev, direction));
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleBookNow = () => {
    if (!selectedSlot || !selectedMachine) return;

    const bookingData = {
      machineId: selectedMachine,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      duration: selectedSlot.duration,
      amount: selectedSlot.rate,
      pricingType: selectedSlot.pricingType,
      customerName: isAuthenticated ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() : customerName,
      customerEmail: isAuthenticated ? user?.email : customerEmail,
      customerPhone: customerPhone,
      isPaid: false,
    };

    createBookingMutation.mutate(bookingData);
  };

  const nextStep = () => {
    if (step === 1 && selectedLocation) setStep(2);
    else if (step === 2 && selectedMachine) setStep(3);
    else if (step === 3 && selectedSlot) setStep(4);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setSelectedMachine("");
        setSelectedMachineType("");
      }
      if (step === 3) setSelectedSlot(null);
    }
  };

  const getDateOptions = () => {
    const dates = [];
    const maxDays = availability?.settings.maxAdvanceBookingDays || 7;
    for (let i = 0; i < maxDays; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  return (
    <>
      <Helmet>
        <title>Book a Machine | WashBizHub</title>
        <meta name="description" content="Reserve laundry machines in advance. Book washers and dryers at your preferred laundromat with our easy online booking system." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-booking">
              <Calendar className="w-3 h-3 mr-1.5" />
              Machine Booking
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Reserve Your Machine
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Skip the wait - book your washer or dryer in advance
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2" data-testid="steps-indicator">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step >= s ? "bg-[#0A1628] text-white" : "bg-muted text-muted-foreground"}`}
                    data-testid={`step-${s}`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`w-12 h-0.5 ${step > s ? "bg-[#0A1628]" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <Card className="bg-card border shadow-sm" data-testid="card-location-select">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C8A661]" />
                  Select Location
                </CardTitle>
                <CardDescription>Choose your preferred laundromat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {locationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A661]" />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No locations available for booking</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location.id)}
                        className={`p-4 rounded-lg border text-left transition-all hover-elevate
                          ${selectedLocation === location.id 
                            ? "border-[#C8A661] bg-[#C8A661]/10" 
                            : "border-border hover:border-[#C8A661]/50"}`}
                        data-testid={`location-${location.id}`}
                      >
                        <div className="font-medium text-foreground">{location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.address}, {location.city}, {location.state}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={nextStep}
                    disabled={!selectedLocation}
                    className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                    data-testid="button-next-step-1"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-card border shadow-sm" data-testid="card-machine-select">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WashingMachine className="w-5 h-5 text-[#C8A661]" />
                  Select Machine
                </CardTitle>
                <CardDescription>Choose your machine type and specific unit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Machine Type</Label>
                  <Select value={selectedMachineType} onValueChange={setSelectedMachineType}>
                    <SelectTrigger data-testid="select-machine-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueMachineTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {machinesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A661]" />
                  </div>
                ) : filteredMachines.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <WashingMachine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No machines available at this location</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredMachines.map((machine) => (
                      <button
                        key={machine.id}
                        onClick={() => setSelectedMachine(machine.id)}
                        className={`p-4 rounded-lg border text-center transition-all hover-elevate
                          ${selectedMachine === machine.id 
                            ? "border-[#C8A661] bg-[#C8A661]/10" 
                            : "border-border hover:border-[#C8A661]/50"}`}
                        data-testid={`machine-${machine.id}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-2">
                          <WashingMachine className="w-5 h-5 text-[#C8A661]" />
                        </div>
                        <div className="font-medium text-foreground">{machine.machineNumber}</div>
                        <div className="text-xs text-muted-foreground capitalize">{machine.machineType}</div>
                        {machine.capacity && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {machine.capacity} lbs
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-2">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!selectedMachine}
                    className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                    data-testid="button-next-step-2"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="bg-card border shadow-sm" data-testid="card-time-select">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C8A661]" />
                  Select Time Slot
                </CardTitle>
                <CardDescription>Pick your preferred date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDateChange(-1)}
                    disabled={isSameDay(selectedDate, new Date())}
                    data-testid="button-prev-date"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {format(selectedDate, "EEEE")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(selectedDate, "MMMM d, yyyy")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDateChange(1)}
                    disabled={addDays(new Date(), (availability?.settings.maxAdvanceBookingDays || 7) - 1) <= selectedDate}
                    data-testid="button-next-date"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="all" data-testid="tab-all-slots">All</TabsTrigger>
                    <TabsTrigger value="morning" data-testid="tab-morning">Morning</TabsTrigger>
                    <TabsTrigger value="afternoon" data-testid="tab-afternoon">Afternoon</TabsTrigger>
                  </TabsList>

                  {availabilityLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C8A661]" />
                    </div>
                  ) : (
                    <>
                      <TabsContent value="all" className="mt-0">
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {availability?.slots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`p-2 rounded-lg border text-center text-sm transition-all
                                ${!slot.available 
                                  ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50" 
                                  : selectedSlot?.startTime === slot.startTime
                                    ? "border-[#C8A661] bg-[#C8A661] text-[#0A1628]"
                                    : slot.pricingType === "peak"
                                      ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:border-[#C8A661]"
                                      : "border-border hover:border-[#C8A661] hover-elevate"}`}
                              data-testid={`slot-${index}`}
                            >
                              <div className="font-medium">
                                {format(new Date(slot.startTime), "h:mm a")}
                              </div>
                              {slot.available && (
                                <div className="text-xs">
                                  ${slot.rate}
                                  {slot.pricingType === "peak" && (
                                    <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1 border-orange-300 text-orange-600">
                                      Peak
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="morning" className="mt-0">
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {availability?.slots
                            .filter(slot => new Date(slot.startTime).getHours() < 12)
                            .map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => handleSlotSelect(slot)}
                                disabled={!slot.available}
                                className={`p-2 rounded-lg border text-center text-sm transition-all
                                  ${!slot.available 
                                    ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50" 
                                    : selectedSlot?.startTime === slot.startTime
                                      ? "border-[#C8A661] bg-[#C8A661] text-[#0A1628]"
                                      : "border-border hover:border-[#C8A661] hover-elevate"}`}
                                data-testid={`slot-morning-${index}`}
                              >
                                <div className="font-medium">
                                  {format(new Date(slot.startTime), "h:mm a")}
                                </div>
                                {slot.available && <div className="text-xs">${slot.rate}</div>}
                              </button>
                            ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="afternoon" className="mt-0">
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {availability?.slots
                            .filter(slot => new Date(slot.startTime).getHours() >= 12)
                            .map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => handleSlotSelect(slot)}
                                disabled={!slot.available}
                                className={`p-2 rounded-lg border text-center text-sm transition-all
                                  ${!slot.available 
                                    ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50" 
                                    : selectedSlot?.startTime === slot.startTime
                                      ? "border-[#C8A661] bg-[#C8A661] text-[#0A1628]"
                                      : "border-border hover:border-[#C8A661] hover-elevate"}`}
                                data-testid={`slot-afternoon-${index}`}
                              >
                                <div className="font-medium">
                                  {format(new Date(slot.startTime), "h:mm a")}
                                </div>
                                {slot.available && <div className="text-xs">${slot.rate}</div>}
                              </button>
                            ))}
                        </div>
                      </TabsContent>
                    </>
                  )}
                </Tabs>

                {selectedSlot && (
                  <div className="p-4 bg-muted/50 rounded-lg" data-testid="selected-slot-summary">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Selected Time</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(selectedSlot.startTime), "h:mm a")} - {format(new Date(selectedSlot.endTime), "h:mm a")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#C8A661]">${selectedSlot.rate}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedSlot.duration} min session
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-3">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!selectedSlot}
                    className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                    data-testid="button-next-step-3"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="bg-card border shadow-sm" data-testid="card-confirm-booking">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#C8A661]" />
                  Confirm Booking
                </CardTitle>
                <CardDescription>Review and confirm your reservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium text-foreground">
                        {locations.find(l => l.id === selectedLocation)?.name}
                      </div>
                    </div>
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-muted-foreground">Machine</div>
                      <div className="font-medium text-foreground">
                        {filteredMachines.find(m => m.id === selectedMachine)?.machineNumber}
                      </div>
                    </div>
                    <WashingMachine className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-muted-foreground">Date & Time</div>
                      <div className="font-medium text-foreground">
                        {selectedSlot && format(new Date(selectedSlot.startTime), "EEEE, MMMM d")}
                      </div>
                      <div className="text-sm text-foreground">
                        {selectedSlot && `${format(new Date(selectedSlot.startTime), "h:mm a")} - ${format(new Date(selectedSlot.endTime), "h:mm a")}`}
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-[#C8A661]">${selectedSlot?.rate}</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="space-y-4 p-4 border rounded-lg" data-testid="guest-info-form">
                    <div className="text-sm font-medium text-foreground">Contact Information</div>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your name"
                          data-testid="input-customer-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="your@email.com"
                          data-testid="input-customer-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          data-testid="input-customer-phone"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} data-testid="button-prev-step-4">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleBookNow}
                    disabled={createBookingMutation.isPending || (!isAuthenticated && (!customerName || !customerEmail))}
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                    data-testid="button-confirm-booking"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-booking-confirmation">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0A1628]">
              <Check className="w-5 h-5 text-green-600" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your machine reservation has been confirmed
            </DialogDescription>
          </DialogHeader>
          
          {bookingResult && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4" data-testid="qr-code-container">
                  <QRCodeSVG
                    value={JSON.stringify({
                      code: bookingResult.checkInCode,
                      bookingId: bookingResult.id,
                      machineId: selectedMachine,
                      startTime: selectedSlot?.startTime
                    })}
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-sm text-muted-foreground mb-2">Your Check-in Code</div>
                <div className="text-3xl font-mono font-bold text-[#C8A661] tracking-wider" data-testid="text-checkin-code">
                  {bookingResult.checkInCode}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Scan QR code or present this code at the laundromat to start your machine
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-muted-foreground text-xs">Machine</div>
                  <div className="font-medium text-foreground">{filteredMachines.find(m => m.id === selectedMachine)?.machineNumber}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-muted-foreground text-xs">Time</div>
                  <div className="font-medium text-foreground">{selectedSlot && format(new Date(selectedSlot.startTime), "h:mm a")}</div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                A confirmation email has been sent with your booking details.
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => {
                setShowConfirmation(false);
                setStep(1);
                setSelectedLocation("");
                setSelectedMachine("");
                setSelectedSlot(null);
                setBookingResult(null);
              }}
              className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
              data-testid="button-book-another"
            >
              Book Another Machine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
