import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { 
  Calendar, Clock, MapPin, WashingMachine, Users, DollarSign, 
  XCircle, CheckCircle, AlertTriangle, Search, Filter, RefreshCw,
  Ban, RotateCcw, Timer, QrCode, ChevronDown, Plus, Lock, Unlock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface BookingData {
  booking: {
    id: string;
    machineId: string;
    laundromatId: string;
    customerId: string | null;
    startTime: string;
    endTime: string;
    duration: number;
    status: string;
    checkInCode: string;
    checkInTime: string | null;
    amount: string | null;
    isPaid: boolean;
    pricingType: string;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    createdAt: string;
  };
  machine: {
    id: string;
    machineNumber: string;
    machineName: string | null;
    machineType: string;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
  customer: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface Stats {
  totalBookings: number;
  todayBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  noShows: number;
  cancelledBookings: number;
  revenue: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  checked_in: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  checked_in: Timer,
  completed: CheckCircle,
  cancelled: XCircle,
  no_show: AlertTriangle,
};

export default function BookingManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockMachineId, setBlockMachineId] = useState("");
  const [blockDate, setBlockDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("10:00");
  const [blockReason, setBlockReason] = useState("");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<Stats>({
    queryKey: ["/api/booking-management/stats", selectedLocation],
  });

  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<BookingData[]>({
    queryKey: ["/api/booking-management/bookings", selectedLocation, selectedDate, selectedStatus],
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/cancel`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Booking Cancelled", description: "The booking has been cancelled." });
      setShowCancelDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/booking-management"] });
      refetchBookings();
      refetchStats();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiRequest("POST", `/api/booking-management/${bookingId}/no-show`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Marked as No-Show", description: "The booking has been marked as no-show." });
      refetchBookings();
      refetchStats();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiRequest("POST", `/api/booking-management/${bookingId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Booking Completed", description: "The booking has been marked as completed." });
      refetchBookings();
      refetchStats();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const blockSlotMutation = useMutation({
    mutationFn: async (data: { machineId: string; date: string; startTime: string; endTime: string; blockReason: string }) => {
      const response = await apiRequest("POST", "/api/booking-management/block-slot", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Slot Blocked", description: "The time slot has been blocked for maintenance." });
      setShowBlockDialog(false);
      setBlockMachineId("");
      setBlockReason("");
      refetchBookings();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredBookings = bookings.filter(b => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const customerName = b.customer 
        ? `${b.customer.firstName || ""} ${b.customer.lastName || ""}`.toLowerCase()
        : (b.booking.customerName || "").toLowerCase();
      const email = (b.customer?.email || b.booking.customerEmail || "").toLowerCase();
      const machine = (b.machine?.machineNumber || "").toLowerCase();
      
      return customerName.includes(query) || email.includes(query) || machine.includes(query);
    }
    return true;
  });

  const getCustomerName = (booking: BookingData) => {
    if (booking.customer?.firstName || booking.customer?.lastName) {
      return `${booking.customer.firstName || ""} ${booking.customer.lastName || ""}`.trim();
    }
    return booking.booking.customerName || "Guest";
  };

  const getCustomerEmail = (booking: BookingData) => {
    return booking.customer?.email || booking.booking.customerEmail || "N/A";
  };

  return (
    <>
      <Helmet>
        <title>Booking Management | WashBizHub</title>
        <meta name="description" content="Manage machine bookings, view reservations, and track check-ins for your laundromat locations." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="mb-2 border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-management">
                <Calendar className="w-3 h-3 mr-1.5" />
                Operator Dashboard
              </Badge>
              <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
              <p className="text-muted-foreground">Manage reservations and track machine bookings</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBlockDialog(true)}
                data-testid="button-block-slot"
              >
                <Lock className="w-4 h-4 mr-2" />
                Block Slot
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  refetchBookings();
                  refetchStats();
                }}
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="bg-card border shadow-sm" data-testid="stat-total">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#C8A661]">{stats?.totalBookings || 0}</div>
                <div className="text-xs text-muted-foreground">Total Bookings</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border shadow-sm" data-testid="stat-today">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0A1628] dark:text-white">{stats?.todayBookings || 0}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border shadow-sm" data-testid="stat-confirmed">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.confirmedBookings || 0}</div>
                <div className="text-xs text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border shadow-sm" data-testid="stat-completed">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.completedBookings || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border shadow-sm" data-testid="stat-no-shows">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats?.noShows || 0}</div>
                <div className="text-xs text-muted-foreground">No-Shows</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border shadow-sm" data-testid="stat-cancelled">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats?.cancelledBookings || 0}</div>
                <div className="text-xs text-muted-foreground">Cancelled</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border shadow-sm" data-testid="stat-revenue">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#C8A661]">
                  ${(stats?.revenue || 0).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Revenue</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border shadow-sm mb-6" data-testid="card-filters">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name, email, or machine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                    data-testid="input-date"
                  />
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-36" data-testid="select-status">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No-Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList data-testid="tabs-view">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-0">
              <Card className="bg-card border shadow-sm" data-testid="card-bookings-list">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle>Bookings</CardTitle>
                  <CardDescription>
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {bookingsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-[#C8A661]" />
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No bookings found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Machine</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Check-in Code</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((item) => {
                            const StatusIcon = statusIcons[item.booking.status] || Clock;
                            return (
                              <TableRow key={item.booking.id} data-testid={`booking-row-${item.booking.id}`}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {getCustomerName(item)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {getCustomerEmail(item)}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <WashingMachine className="w-4 h-4 text-muted-foreground" />
                                    <span>{item.machine?.machineNumber || "N/A"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {format(new Date(item.booking.startTime), "MMM d, yyyy")}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(new Date(item.booking.startTime), "h:mm a")} - {format(new Date(item.booking.endTime), "h:mm a")}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={statusColors[item.booking.status]}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {item.booking.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium text-[#C8A661]">
                                    ${item.booking.amount || "0.00"}
                                  </span>
                                  {item.booking.isPaid && (
                                    <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                      Paid
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                    {item.booking.checkInCode}
                                  </code>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" data-testid={`button-actions-${item.booking.id}`}>
                                        Actions
                                        <ChevronDown className="w-4 h-4 ml-1" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedBooking(item);
                                          setShowDetailsDialog(true);
                                        }}
                                        data-testid={`action-view-${item.booking.id}`}
                                      >
                                        <QrCode className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      
                                      {(item.booking.status === "confirmed" || item.booking.status === "checked_in") && (
                                        <DropdownMenuItem
                                          onClick={() => completeMutation.mutate(item.booking.id)}
                                          data-testid={`action-complete-${item.booking.id}`}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Mark Complete
                                        </DropdownMenuItem>
                                      )}
                                      
                                      {item.booking.status === "confirmed" && (
                                        <DropdownMenuItem
                                          onClick={() => noShowMutation.mutate(item.booking.id)}
                                          data-testid={`action-noshow-${item.booking.id}`}
                                        >
                                          <AlertTriangle className="w-4 h-4 mr-2" />
                                          Mark No-Show
                                        </DropdownMenuItem>
                                      )}
                                      
                                      {["pending", "confirmed"].includes(item.booking.status) && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedBooking(item);
                                            setShowCancelDialog(true);
                                          }}
                                          className="text-red-600"
                                          data-testid={`action-cancel-${item.booking.id}`}
                                        >
                                          <Ban className="w-4 h-4 mr-2" />
                                          Cancel Booking
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <Card className="bg-card border shadow-sm" data-testid="card-calendar-view">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>View bookings by time slots</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => {
                      const hourBookings = filteredBookings.filter(b => {
                        const bookingHour = new Date(b.booking.startTime).getHours();
                        return bookingHour === hour;
                      });
                      
                      return (
                        <div
                          key={hour}
                          className="flex items-start gap-4 py-2 border-b border-border/50"
                          data-testid={`calendar-hour-${hour}`}
                        >
                          <div className="w-16 text-sm text-muted-foreground font-medium">
                            {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`}
                          </div>
                          <div className="flex-1 min-h-[40px]">
                            {hourBookings.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {hourBookings.map((booking) => (
                                  <button
                                    key={booking.booking.id}
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowDetailsDialog(true);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-sm transition-all hover-elevate
                                      ${statusColors[booking.booking.status]}`}
                                    data-testid={`calendar-booking-${booking.booking.id}`}
                                  >
                                    <span className="font-medium">{booking.machine?.machineNumber}</span>
                                    <span className="mx-1">-</span>
                                    <span>{getCustomerName(booking)}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="h-10 border border-dashed border-border/50 rounded-lg bg-muted/20" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-booking-details">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Booking #{selectedBooking?.booking.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{getCustomerName(selectedBooking)}</div>
                  <div className="text-sm text-muted-foreground">{getCustomerEmail(selectedBooking)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={statusColors[selectedBooking.booking.status]}>
                    {selectedBooking.booking.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Machine</div>
                  <div className="font-medium">{selectedBooking.machine?.machineNumber}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {selectedBooking.machine?.machineType}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{selectedBooking.location?.name}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Date & Time</div>
                  <div className="font-medium">
                    {format(new Date(selectedBooking.booking.startTime), "MMMM d, yyyy")}
                  </div>
                  <div className="text-sm">
                    {format(new Date(selectedBooking.booking.startTime), "h:mm a")} - {format(new Date(selectedBooking.booking.endTime), "h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{selectedBooking.booking.duration} minutes</div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">Check-in Code</div>
                <div className="text-3xl font-mono font-bold text-[#C8A661]">
                  {selectedBooking.booking.checkInCode}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-xl font-bold text-[#C8A661]">
                  ${selectedBooking.booking.amount || "0.00"}
                  {selectedBooking.booking.isPaid && (
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                      Paid
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent data-testid="dialog-cancel-booking">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedBooking) {
                  cancelMutation.mutate({
                    bookingId: selectedBooking.booking.id,
                    reason: "Cancelled by operator",
                  });
                }
              }}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent data-testid="dialog-block-slot">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C8A661]" />
              Block Time Slot
            </DialogTitle>
            <DialogDescription>
              Block a machine for maintenance or other purposes. Customers will not be able to book during this time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-machine">Machine ID</Label>
              <Input
                id="block-machine"
                placeholder="Enter machine ID"
                value={blockMachineId}
                onChange={(e) => setBlockMachineId(e.target.value)}
                data-testid="input-block-machine"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="block-date">Date</Label>
              <Input
                id="block-date"
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                data-testid="input-block-date"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block-start">Start Time</Label>
                <Input
                  id="block-start"
                  type="time"
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  data-testid="input-block-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-end">End Time</Label>
                <Input
                  id="block-end"
                  type="time"
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  data-testid="input-block-end-time"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason</Label>
              <Select value={blockReason} onValueChange={setBlockReason}>
                <SelectTrigger data-testid="select-block-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="out_of_order">Out of Order</SelectItem>
                  <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (blockMachineId && blockDate && blockStartTime && blockEndTime) {
                  blockSlotMutation.mutate({
                    machineId: blockMachineId,
                    date: blockDate,
                    startTime: blockStartTime,
                    endTime: blockEndTime,
                    blockReason: blockReason || "Maintenance",
                  });
                }
              }}
              disabled={blockSlotMutation.isPending || !blockMachineId || !blockDate}
              className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
              data-testid="button-confirm-block"
            >
              {blockSlotMutation.isPending ? "Blocking..." : "Block Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
