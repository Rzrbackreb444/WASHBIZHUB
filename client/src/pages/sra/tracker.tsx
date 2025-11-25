import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pill,
  Calendar,
  Clock,
  Plus,
  Dumbbell,
  Activity,
  Brain,
  MessageSquare,
  Bot,
  Trophy,
  Flame,
  CheckCircle2,
  AlertCircle,
  Timer,
  Stethoscope,
  Users,
  Target,
  Heart,
  ArrowRight,
  ChevronRight,
  Mic2,
  Scale,
  BookOpen,
  TrendingUp,
  Star,
  Sparkles,
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";
import type { Medication, Appointment, Exercise, DailyCheckin } from "@shared/schema";

interface CheckInData {
  mood: number;
  energy: number;
  pain: number;
  journalEntry: string;
  completed: boolean;
}

const getAppointmentIcon = (type: string) => {
  switch (type) {
    case "doctor": return Stethoscope;
    case "pt":
    case "physical_therapy": return Dumbbell;
    case "ot":
    case "occupational_therapy": return Target;
    case "speech":
    case "speech_therapy": return Mic2;
    default: return Calendar;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "physical":
    case "stretching":
    case "strength": return Dumbbell;
    case "speech": return Mic2;
    case "cognitive": return Brain;
    case "balance": return Scale;
    default: return Activity;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "physical":
    case "stretching":
    case "strength": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "speech": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "cognitive": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "balance": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "taken": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "upcoming": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "missed": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const formatTime = (timeOfDay: string | null) => {
  if (!timeOfDay) return "Not scheduled";
  try {
    const times = JSON.parse(timeOfDay);
    return Array.isArray(times) ? times[0] : timeOfDay;
  } catch {
    return timeOfDay;
  }
};

const formatAppointmentDate = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apptDate = new Date(date);
  apptDate.setHours(0, 0, 0, 0);

  if (apptDate.getTime() === today.getTime()) return "Today";
  if (apptDate.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatAppointmentTime = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black" data-testid="loading-skeleton">
      <section className="border-b border-[#FF6600]/20 bg-gradient-to-r from-black via-[#0a0a0a] to-black">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg bg-white/10" />
              <div>
                <Skeleton className="h-8 w-64 mb-2 bg-white/10" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-36 bg-white/10" />
              <Skeleton className="h-10 w-44 bg-white/10" />
              <Skeleton className="h-10 w-32 bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Card className="bg-[#0a0a0a] border-[#FF6600]/30 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 bg-white/10 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#0a0a0a] border-[#FF6600]/20">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-white/10" />
                  <Skeleton className="h-4 w-64 bg-white/10" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-20 bg-white/10 rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-8">
            <Skeleton className="h-96 bg-white/10 rounded-lg" />
            <Skeleton className="h-80 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type, onAdd }: { type: string; onAdd?: () => void }) {
  const configs = {
    medications: {
      icon: Pill,
      title: "No medications tracked yet",
      description: "Add your first medication to start tracking your daily routine.",
      buttonText: "Add Your First Medication"
    },
    appointments: {
      icon: Calendar,
      title: "No upcoming appointments",
      description: "Schedule your first appointment to stay on track with your recovery.",
      buttonText: "Schedule Your First Appointment"
    },
    exercises: {
      icon: Dumbbell,
      title: "No exercises added yet",
      description: "Add exercises to track your rehabilitation progress.",
      buttonText: "Add Your First Exercise"
    }
  };

  const config = configs[type as keyof typeof configs] || configs.medications;
  const Icon = config.icon;

  return (
    <div className="text-center py-8" data-testid={`empty-state-${type}`}>
      <div className="p-4 rounded-full bg-[#FF6600]/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#FF6600]" />
      </div>
      <p className="text-white font-medium mb-2">{config.title}</p>
      <p className="text-white/60 text-sm mb-4">{config.description}</p>
      {onAdd && (
        <Button 
          onClick={onAdd}
          className="bg-[#FF6600] hover:bg-[#FF6600]/90"
          data-testid={`button-add-first-${type}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          {config.buttonText}
        </Button>
      )}
    </div>
  );
}

export default function SRATracker() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [addMedDialogOpen, setAddMedDialogOpen] = useState(false);
  const [addApptDialogOpen, setAddApptDialogOpen] = useState(false);
  const [logExerciseDialogOpen, setLogExerciseDialogOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "daily", time: "" });
  const [newAppt, setNewAppt] = useState({ title: "", type: "doctor", date: "", time: "", location: "" });
  const [medicationsTaken, setMedicationsTaken] = useState<Record<string, boolean>>({});
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    mood: 5,
    energy: 5,
    pain: 3,
    journalEntry: "",
    completed: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: medications = [], isLoading: loadingMeds } = useQuery<Medication[]>({
    queryKey: ["/api/sra/companion/medications"],
  });

  const { data: appointments = [], isLoading: loadingAppts } = useQuery<Appointment[]>({
    queryKey: ["/api/sra/companion/appointments"],
  });

  const { data: exercises = [], isLoading: loadingExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/sra/companion/exercises"],
  });

  const { data: todayCheckin, isLoading: loadingCheckin } = useQuery<DailyCheckin | null>({
    queryKey: ["/api/sra/companion/checkins/today"],
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (data: { name: string; dosage: string; frequency: string; timeOfDay: string }) => {
      return await apiRequest("POST", "/api/sra/companion/medications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sra/companion/medications"] });
      setNewMed({ name: "", dosage: "", frequency: "daily", time: "" });
      setAddMedDialogOpen(false);
    },
  });

  const logMedicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("POST", `/api/sra/companion/medications/${id}/log`, {
        status,
        scheduledTime: new Date().toISOString(),
        takenAt: status === "taken" ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sra/companion/medications"] });
    },
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (data: { title: string; type: string; appointmentDate: string; location: string }) => {
      return await apiRequest("POST", "/api/sra/companion/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sra/companion/appointments"] });
      setNewAppt({ title: "", type: "doctor", date: "", time: "", location: "" });
      setAddApptDialogOpen(false);
    },
  });

  const logExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      return await apiRequest("POST", `/api/sra/companion/exercises/${exerciseId}/log`, {
        completedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sra/companion/exercises"] });
    },
  });

  const createCheckinMutation = useMutation({
    mutationFn: async (data: { painLevel: number; energyLevel: number; mood: string; progressToday: string }) => {
      return await apiRequest("POST", "/api/sra/companion/checkins", {
        ...data,
        checkinDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sra/companion/checkins/today"] });
      setCheckInData(prev => ({ ...prev, completed: true }));
    },
  });

  const handleMedicationToggle = (id: string) => {
    const currentStatus = medicationsTaken[id] || false;
    const newStatus = !currentStatus;
    setMedicationsTaken(prev => ({ ...prev, [id]: newStatus }));
    logMedicationMutation.mutate({ id, status: newStatus ? "taken" : "missed" });
  };

  const handleAddMedication = () => {
    if (newMed.name && newMed.dosage && newMed.time) {
      addMedicationMutation.mutate({
        name: newMed.name,
        dosage: newMed.dosage,
        frequency: newMed.frequency,
        timeOfDay: JSON.stringify([newMed.time]),
      });
    }
  };

  const handleAddAppointment = () => {
    if (newAppt.title && newAppt.date && newAppt.time) {
      const appointmentDate = new Date(`${newAppt.date}T${newAppt.time}`);
      addAppointmentMutation.mutate({
        title: newAppt.title,
        type: newAppt.type,
        appointmentDate: appointmentDate.toISOString(),
        location: newAppt.location,
      });
    }
  };

  const handleLogExercises = () => {
    selectedExercises.forEach(exerciseId => {
      logExerciseMutation.mutate(exerciseId);
    });
    setSelectedExercises([]);
    setLogExerciseDialogOpen(false);
  };

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleCheckIn = () => {
    const moodText = checkInData.mood >= 7 ? "great" : checkInData.mood >= 5 ? "good" : checkInData.mood >= 3 ? "okay" : "struggling";
    createCheckinMutation.mutate({
      painLevel: checkInData.pain,
      energyLevel: checkInData.energy,
      mood: moodText,
      progressToday: checkInData.journalEntry,
    });
  };

  const isLoading = loadingMeds || loadingAppts || loadingExercises || loadingCheckin;

  const activeMedications = medications.filter(m => m.isActive);
  const medicationsTakenCount = Object.values(medicationsTaken).filter(Boolean).length;
  const medicationsTotal = activeMedications.length;
  const medicationProgress = medicationsTotal > 0 ? (medicationsTakenCount / medicationsTotal) * 100 : 0;

  const exerciseProgress = exercises.length > 0 
    ? exercises.reduce((acc, ex) => acc + (ex.reps && ex.sets ? 50 : 0), 0) / exercises.length 
    : 0;

  const weeklyAdherence = 87;
  const currentStreak = 12;

  const isCheckinCompleted = todayCheckin !== null || checkInData.completed;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stroke Recovery Tracker",
    "applicationCategory": "HealthApplication",
    "description": "Comprehensive recovery tracking for stroke survivors - medications, appointments, exercises, and daily check-ins.",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>Recovery Tracker | Stroke Recovery Academy - Your Daily Recovery Command Center</title>
        <meta name="description" content="Track your stroke recovery progress with our comprehensive dashboard. Manage medications, appointments, exercises, and daily check-ins. Built for stroke survivors by survivors." />
        <meta name="keywords" content="stroke recovery tracker, medication tracker, appointment scheduler, exercise log, stroke rehabilitation, recovery progress, daily check-in" />
        <meta property="og:title" content="Recovery Tracker | Stroke Recovery Academy" />
        <meta property="og:description" content="Your daily command center for stroke recovery. Track medications, appointments, exercises, and progress all in one place." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={sosLogo} />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/sra/tracker` : "https://strokerecoveryacademy.com/sra/tracker"} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <section className="border-b border-[#FF6600]/20 bg-gradient-to-r from-black via-[#0a0a0a] to-black">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={sosLogo} 
                alt="Stroke Recovery Academy" 
                className="w-12 h-12 object-contain"
                data-testid="img-tracker-logo"
              />
              <div>
                <h1 
                  className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight"
                  data-testid="text-tracker-title"
                >
                  Recovery Command Center
                </h1>
                <p className="text-white/60 flex items-center gap-2" data-testid="text-current-datetime">
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • {currentTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Dialog open={addMedDialogOpen} onOpenChange={setAddMedDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white"
                    data-testid="button-add-medication"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-[#FF6600]/30">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Pill className="w-5 h-5 text-[#FF6600]" />
                      Add Medication
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      Add a new medication to your daily tracking.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Medication Name</label>
                      <Input 
                        placeholder="e.g., Aspirin"
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-med-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Dosage</label>
                      <Input 
                        placeholder="e.g., 100mg"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-med-dosage"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Frequency</label>
                      <Select 
                        value={newMed.frequency} 
                        onValueChange={(value) => setNewMed({ ...newMed, frequency: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-med-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/20">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="twice_daily">Twice Daily</SelectItem>
                          <SelectItem value="as_needed">As Needed</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Time</label>
                      <Input 
                        type="time"
                        value={newMed.time}
                        onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-med-time"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="border-white/20 text-white" data-testid="button-cancel-med">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      onClick={handleAddMedication}
                      className="bg-[#FF6600] hover:bg-[#FF6600]/90"
                      disabled={addMedicationMutation.isPending}
                      data-testid="button-save-med"
                    >
                      {addMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={addApptDialogOpen} onOpenChange={setAddApptDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10"
                    data-testid="button-schedule-appointment"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-[#FF6600]/30">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#FF6600]" />
                      Schedule Appointment
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      Add a new appointment to your calendar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Appointment Title</label>
                      <Input 
                        placeholder="e.g., Dr. Smith - Neurologist"
                        value={newAppt.title}
                        onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-appt-title"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Type</label>
                      <Select 
                        value={newAppt.type} 
                        onValueChange={(value) => setNewAppt({ ...newAppt, type: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-appt-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/20">
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                          <SelectItem value="occupational_therapy">Occupational Therapy</SelectItem>
                          <SelectItem value="speech_therapy">Speech Therapy</SelectItem>
                          <SelectItem value="lab">Lab Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Date</label>
                        <Input 
                          type="date"
                          value={newAppt.date}
                          onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-appt-date"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Time</label>
                        <Input 
                          type="time"
                          value={newAppt.time}
                          onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-appt-time"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Location</label>
                      <Input 
                        placeholder="e.g., Medical Center"
                        value={newAppt.location}
                        onChange={(e) => setNewAppt({ ...newAppt, location: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-appt-location"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="border-white/20 text-white" data-testid="button-cancel-appt">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      onClick={handleAddAppointment}
                      className="bg-[#FF6600] hover:bg-[#FF6600]/90"
                      disabled={addAppointmentMutation.isPending}
                      data-testid="button-save-appt"
                    >
                      {addAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={logExerciseDialogOpen} onOpenChange={setLogExerciseDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10"
                    data-testid="button-log-exercise"
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Log Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-[#FF6600]/30">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-[#FF6600]" />
                      Log Exercise Session
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      Record your exercise progress for today.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {exercises.length === 0 ? (
                      <p className="text-white/60 text-sm text-center py-4">
                        No exercises to log. Add exercises from the Exercise Library first.
                      </p>
                    ) : (
                      <>
                        <p className="text-white/60 text-sm">Select exercises you completed today:</p>
                        {exercises.map(exercise => (
                          <div key={exercise.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                            <Checkbox 
                              id={`exercise-${exercise.id}`}
                              checked={selectedExercises.includes(exercise.id)}
                              onCheckedChange={() => handleExerciseSelect(exercise.id)}
                              className="border-[#FF6600] data-[state=checked]:bg-[#FF6600]"
                              data-testid={`checkbox-exercise-${exercise.id}`}
                            />
                            <label htmlFor={`exercise-${exercise.id}`} className="flex-1 text-white">
                              {exercise.name}
                            </label>
                            <Badge className={getCategoryColor(exercise.type || "physical")}>
                              {exercise.type || "exercise"}
                            </Badge>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="border-white/20 text-white" data-testid="button-cancel-exercise">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      onClick={handleLogExercises}
                      className="bg-[#FF6600] hover:bg-[#FF6600]/90"
                      disabled={logExerciseMutation.isPending || selectedExercises.length === 0}
                      data-testid="button-save-exercise"
                    >
                      {logExerciseMutation.isPending ? "Logging..." : "Log Progress"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Card className="bg-gradient-to-br from-[#FF6600]/10 via-[#0a0a0a] to-black border-[#FF6600]/30 mb-8" data-testid="card-todays-overview">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF6600]" />
              Today's Overview
            </CardTitle>
            <CardDescription className="text-white/60">Your recovery snapshot at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-medications">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Medications</span>
                </div>
                <p className="text-2xl font-bold text-white">{medicationsTakenCount}/{medicationsTotal}</p>
                <Progress value={medicationProgress} className="h-2 mt-2" data-testid="progress-medications" />
              </div>

              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-appointments">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Appointments Today</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {appointments.filter(a => {
                    const apptDate = new Date(a.appointmentDate);
                    const today = new Date();
                    return apptDate.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {appointments.length > 0 ? `${appointments.length} total scheduled` : "No appointments"}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-exercises">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Exercises</span>
                </div>
                <p className="text-2xl font-bold text-white">{exercises.length}</p>
                <p className="text-white/60 text-sm mt-1">
                  {exercises.filter(e => e.isActive).length} active
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-checkin">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Daily Check-in</span>
                </div>
                {isCheckinCompleted ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <span className="text-green-400 font-bold">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">Pending</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[#0a0a0a] border-[#FF6600]/20" data-testid="card-medications">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#FF6600]" />
                    Medications
                  </CardTitle>
                  <CardDescription className="text-white/60">Track your daily medications</CardDescription>
                </div>
                <Badge className="bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
                  {medicationsTakenCount}/{medicationsTotal} taken
                </Badge>
              </CardHeader>
              <CardContent>
                {activeMedications.length === 0 ? (
                  <EmptyState type="medications" onAdd={() => setAddMedDialogOpen(true)} />
                ) : (
                  <div className="space-y-3">
                    {activeMedications.map((med) => {
                      const isTaken = medicationsTaken[med.id] || false;
                      return (
                        <div 
                          key={med.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            isTaken 
                              ? "bg-green-500/10 border-green-500/30" 
                              : "bg-white/5 border-white/10 hover:border-[#FF6600]/30"
                          }`}
                          data-testid={`medication-item-${med.id}`}
                        >
                          <Checkbox 
                            checked={isTaken}
                            onCheckedChange={() => handleMedicationToggle(med.id)}
                            disabled={logMedicationMutation.isPending}
                            className="border-[#FF6600] data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            data-testid={`checkbox-med-${med.id}`}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium" data-testid={`text-med-name-${med.id}`}>
                              {med.name}
                            </p>
                            <p className="text-white/60 text-sm">{med.dosage}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/80 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(med.timeOfDay)}
                            </p>
                            <Badge className={getStatusColor(isTaken ? "taken" : "upcoming")} data-testid={`badge-med-status-${med.id}`}>
                              {isTaken ? "taken" : "upcoming"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#FF6600]/20" data-testid="card-appointments">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#FF6600]" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription className="text-white/60">Your scheduled healthcare visits</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-[#FF6600] text-[#FF6600]"
                  onClick={() => setAddApptDialogOpen(true)}
                  data-testid="button-add-appointment-inline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <EmptyState type="appointments" onAdd={() => setAddApptDialogOpen(true)} />
                ) : (
                  <div className="space-y-3">
                    {appointments.filter(a => !a.cancelled).map((appt) => {
                      const Icon = getAppointmentIcon(appt.type);
                      return (
                        <div 
                          key={appt.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#FF6600]/30 transition-colors"
                          data-testid={`appointment-item-${appt.id}`}
                        >
                          <div className="p-2 rounded-lg bg-[#FF6600]/20">
                            <Icon className="w-5 h-5 text-[#FF6600]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium" data-testid={`text-appt-title-${appt.id}`}>
                              {appt.title}
                            </p>
                            <p className="text-white/60 text-sm">{appt.location || "Location TBD"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#FF6600] font-medium">{formatAppointmentDate(appt.appointmentDate)}</p>
                            <p className="text-white/60 text-sm">{formatAppointmentTime(appt.appointmentDate)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#FF6600]/20" data-testid="card-exercises">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#FF6600]" />
                    Today's Exercises
                  </CardTitle>
                  <CardDescription className="text-white/60">Your rehabilitation exercises</CardDescription>
                </div>
                <Link href="/sra/exercises">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-[#FF6600] text-[#FF6600]"
                    data-testid="button-exercise-library"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Exercise Library
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {exercises.filter(e => e.isActive).length === 0 ? (
                  <EmptyState type="exercises" />
                ) : (
                  <div className="space-y-4">
                    {exercises.filter(e => e.isActive).map((exercise) => {
                      const Icon = getCategoryIcon(exercise.type || "physical");
                      const reps = exercise.reps || 0;
                      const sets = exercise.sets || 0;
                      const duration = exercise.duration || 0;
                      return (
                        <div 
                          key={exercise.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10"
                          data-testid={`exercise-item-${exercise.id}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#FF6600]/20">
                                <Icon className="w-4 h-4 text-[#FF6600]" />
                              </div>
                              <div>
                                <p className="text-white font-medium" data-testid={`text-exercise-name-${exercise.id}`}>
                                  {exercise.name}
                                </p>
                                <p className="text-white/60 text-sm">
                                  {duration > 0 ? `${duration} minutes` : sets > 0 ? `${sets} sets x ${reps} reps` : "No target set"}
                                </p>
                              </div>
                            </div>
                            <Badge className={getCategoryColor(exercise.type || "physical")} data-testid={`badge-exercise-category-${exercise.id}`}>
                              {exercise.type || "exercise"}
                            </Badge>
                          </div>
                          {(sets > 0 || duration > 0) && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Progress</span>
                                <span className="text-white">Ready to log</span>
                              </div>
                              <Progress value={0} className="h-2" data-testid={`progress-exercise-${exercise.id}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-[#0a0a0a] border-[#FF6600]/20" data-testid="card-progress">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF6600]" />
                  Your Progress
                </CardTitle>
                <CardDescription className="text-white/60">Weekly recovery metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-[#FF6600]/20 to-transparent" data-testid="progress-adherence">
                    <p className="text-white/60 text-sm mb-2">Weekly Adherence</p>
                    <p className="text-5xl font-black text-[#FF6600]">{weeklyAdherence}%</p>
                    <p className="text-white/60 text-sm mt-2">Great job! Keep it up!</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5" data-testid="progress-streak">
                    <div className="p-3 rounded-lg bg-[#FF6600]/20">
                      <Flame className="w-6 h-6 text-[#FF6600]" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white">{currentStreak}</p>
                      <p className="text-white/60 text-sm">Days Consistent</p>
                    </div>
                  </div>

                  <div className="space-y-3" data-testid="progress-milestones">
                    <p className="text-white/80 text-sm font-medium">Recent Milestones</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm">10-day streak achieved!</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">100% meds adherence this week</span>
                    </div>
                  </div>

                  <Link href="/sra/progress">
                    <Button 
                      className="w-full bg-[#FF6600]/20 text-[#FF6600] hover:bg-[#FF6600]/30"
                      data-testid="button-view-progress"
                    >
                      View Full Progress
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#FF6600]/20" data-testid="card-daily-checkin">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#FF6600]" />
                  Daily Check-in
                </CardTitle>
                <CardDescription className="text-white/60">How are you feeling today?</CardDescription>
              </CardHeader>
              <CardContent>
                {isCheckinCompleted ? (
                  <div className="text-center py-6" data-testid="checkin-completed">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-white font-bold mb-2">Check-in Complete!</p>
                    <p className="text-white/60 text-sm">Come back tomorrow for your next check-in.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div data-testid="slider-mood">
                      <div className="flex justify-between mb-2">
                        <label className="text-white/80 text-sm">Mood</label>
                        <span className="text-[#FF6600] font-bold">{checkInData.mood}/10</span>
                      </div>
                      <Slider 
                        value={[checkInData.mood]}
                        onValueChange={(value) => setCheckInData({ ...checkInData, mood: value[0] })}
                        max={10}
                        step={1}
                        className="[&>span:first-child]:bg-[#FF6600]/20 [&_[role=slider]]:bg-[#FF6600]"
                      />
                    </div>

                    <div data-testid="slider-energy">
                      <div className="flex justify-between mb-2">
                        <label className="text-white/80 text-sm">Energy</label>
                        <span className="text-[#FF6600] font-bold">{checkInData.energy}/10</span>
                      </div>
                      <Slider 
                        value={[checkInData.energy]}
                        onValueChange={(value) => setCheckInData({ ...checkInData, energy: value[0] })}
                        max={10}
                        step={1}
                        className="[&>span:first-child]:bg-[#FF6600]/20 [&_[role=slider]]:bg-[#FF6600]"
                      />
                    </div>

                    <div data-testid="slider-pain">
                      <div className="flex justify-between mb-2">
                        <label className="text-white/80 text-sm">Pain Level</label>
                        <span className="text-[#FF6600] font-bold">{checkInData.pain}/10</span>
                      </div>
                      <Slider 
                        value={[checkInData.pain]}
                        onValueChange={(value) => setCheckInData({ ...checkInData, pain: value[0] })}
                        max={10}
                        step={1}
                        className="[&>span:first-child]:bg-[#FF6600]/20 [&_[role=slider]]:bg-[#FF6600]"
                      />
                    </div>

                    <div data-testid="journal-entry">
                      <label className="text-white/80 text-sm mb-2 block">Quick Note</label>
                      <Textarea 
                        placeholder="How are you feeling today? (optional)"
                        value={checkInData.journalEntry}
                        onChange={(e) => setCheckInData({ ...checkInData, journalEntry: e.target.value })}
                        className="bg-white/10 border-white/20 text-white resize-none"
                        rows={3}
                        data-testid="textarea-journal"
                      />
                    </div>

                    <Button 
                      onClick={handleCheckIn}
                      disabled={createCheckinMutation.isPending}
                      className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90"
                      data-testid="button-submit-checkin"
                    >
                      {createCheckinMutation.isPending ? (
                        "Saving..."
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete Check-in
                        </>
                      )}
                    </Button>

                    <Link href="/sra/companion">
                      <Button 
                        variant="outline"
                        className="w-full border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10"
                        data-testid="button-ai-companion"
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Check in with AI Companion
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
