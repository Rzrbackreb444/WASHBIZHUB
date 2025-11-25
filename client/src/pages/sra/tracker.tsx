import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  status: "taken" | "upcoming" | "missed";
}

interface Appointment {
  id: string;
  title: string;
  type: "doctor" | "pt" | "ot" | "speech" | "other";
  date: string;
  time: string;
  location: string;
}

interface Exercise {
  id: string;
  name: string;
  category: "physical" | "speech" | "cognitive" | "balance";
  duration: number;
  completed: number;
  target: number;
}

interface CheckInData {
  mood: number;
  energy: number;
  pain: number;
  journalEntry: string;
  completed: boolean;
}

const mockMedications: Medication[] = [
  { id: "1", name: "Blood Thinner", dosage: "10mg", time: "8:00 AM", taken: true, status: "taken" },
  { id: "2", name: "Blood Pressure", dosage: "25mg", time: "8:00 AM", taken: true, status: "taken" },
  { id: "3", name: "Cholesterol", dosage: "40mg", time: "12:00 PM", taken: false, status: "upcoming" },
  { id: "4", name: "Antidepressant", dosage: "50mg", time: "8:00 PM", taken: false, status: "upcoming" },
];

const mockAppointments: Appointment[] = [
  { id: "1", title: "Dr. Smith - Neurologist", type: "doctor", date: "Today", time: "2:30 PM", location: "Medical Center" },
  { id: "2", title: "Physical Therapy", type: "pt", date: "Tomorrow", time: "10:00 AM", location: "Rehab Clinic" },
  { id: "3", title: "Speech Therapy", type: "speech", date: "Wed, Nov 27", time: "3:00 PM", location: "Speech Center" },
  { id: "4", title: "Occupational Therapy", type: "ot", date: "Thu, Nov 28", time: "11:00 AM", location: "Therapy Center" },
];

const mockExercises: Exercise[] = [
  { id: "1", name: "Arm Stretches", category: "physical", duration: 15, completed: 12, target: 20 },
  { id: "2", name: "Word Finding", category: "speech", duration: 10, completed: 8, target: 10 },
  { id: "3", name: "Memory Games", category: "cognitive", duration: 20, completed: 15, target: 30 },
  { id: "4", name: "Standing Balance", category: "balance", duration: 10, completed: 5, target: 10 },
];

const getAppointmentIcon = (type: string) => {
  switch (type) {
    case "doctor": return Stethoscope;
    case "pt": return Dumbbell;
    case "ot": return Target;
    case "speech": return Mic2;
    default: return Calendar;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "physical": return Dumbbell;
    case "speech": return Mic2;
    case "cognitive": return Brain;
    case "balance": return Scale;
    default: return Activity;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "physical": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
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

export default function SRATracker() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [exercises] = useState<Exercise[]>(mockExercises);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    mood: 5,
    energy: 5,
    pain: 3,
    journalEntry: "",
    completed: false,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [addMedDialogOpen, setAddMedDialogOpen] = useState(false);
  const [addApptDialogOpen, setAddApptDialogOpen] = useState(false);
  const [logExerciseDialogOpen, setLogExerciseDialogOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", time: "" });
  const [newAppt, setNewAppt] = useState({ title: "", type: "doctor", date: "", time: "", location: "" });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const handleMedicationToggle = (id: string) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id
          ? { ...med, taken: !med.taken, status: !med.taken ? "taken" : "upcoming" }
          : med
      )
    );
  };

  const handleAddMedication = () => {
    if (newMed.name && newMed.dosage && newMed.time) {
      const medication: Medication = {
        id: Date.now().toString(),
        name: newMed.name,
        dosage: newMed.dosage,
        time: newMed.time,
        taken: false,
        status: "upcoming",
      };
      setMedications([...medications, medication]);
      setNewMed({ name: "", dosage: "", time: "" });
      setAddMedDialogOpen(false);
    }
  };

  const handleCheckIn = () => {
    setCheckInData(prev => ({ ...prev, completed: true }));
  };

  const medicationsTaken = medications.filter(m => m.taken).length;
  const medicationsTotal = medications.length;
  const medicationProgress = (medicationsTaken / medicationsTotal) * 100;

  const exerciseProgress = exercises.reduce((acc, ex) => {
    return acc + (ex.completed / ex.target) * 100;
  }, 0) / exercises.length;

  const weeklyAdherence = 87;
  const currentStreak = 12;

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
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" data-testid="loading-state">
        <div className="text-center">
          <img src={sosLogo} alt="Loading" className="w-24 h-24 mx-auto animate-pulse mb-4" />
          <p className="text-white/60">Loading your recovery dashboard...</p>
        </div>
      </div>
    );
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

      {/* Header Section */}
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
                      data-testid="button-save-med"
                    >
                      Add Medication
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
                          <SelectItem value="pt">Physical Therapy</SelectItem>
                          <SelectItem value="ot">Occupational Therapy</SelectItem>
                          <SelectItem value="speech">Speech Therapy</SelectItem>
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
                      className="bg-[#FF6600] hover:bg-[#FF6600]/90"
                      data-testid="button-save-appt"
                    >
                      Schedule
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
                    <p className="text-white/60 text-sm">Select exercises you completed today:</p>
                    {exercises.map(exercise => (
                      <div key={exercise.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <Checkbox 
                          id={`exercise-${exercise.id}`}
                          className="border-[#FF6600] data-[state=checked]:bg-[#FF6600]"
                          data-testid={`checkbox-exercise-${exercise.id}`}
                        />
                        <label htmlFor={`exercise-${exercise.id}`} className="flex-1 text-white">
                          {exercise.name}
                        </label>
                        <Badge className={getCategoryColor(exercise.category)}>
                          {exercise.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="border-white/20 text-white" data-testid="button-cancel-exercise">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      className="bg-[#FF6600] hover:bg-[#FF6600]/90"
                      data-testid="button-save-exercise"
                    >
                      Log Progress
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Today's Overview Card */}
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
                <p className="text-2xl font-bold text-white">{medicationsTaken}/{medicationsTotal}</p>
                <Progress value={medicationProgress} className="h-2 mt-2" data-testid="progress-medications" />
              </div>

              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-appointments">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Appointments Today</span>
                </div>
                <p className="text-2xl font-bold text-white">{appointments.filter(a => a.date === "Today").length}</p>
                <p className="text-white/60 text-sm mt-1">
                  {appointments.find(a => a.date === "Today")?.time || "No appointments"} next
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-exercises">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Exercises</span>
                </div>
                <p className="text-2xl font-bold text-white">{Math.round(exerciseProgress)}%</p>
                <Progress value={exerciseProgress} className="h-2 mt-2" data-testid="progress-exercises" />
              </div>

              <div className="p-4 rounded-lg bg-white/5" data-testid="overview-checkin">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-[#FF6600]" />
                  <span className="text-white/80 text-sm">Daily Check-in</span>
                </div>
                {checkInData.completed ? (
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
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Medication Section */}
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
                  {medicationsTaken}/{medicationsTotal} taken
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div 
                      key={med.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        med.taken 
                          ? "bg-green-500/10 border-green-500/30" 
                          : "bg-white/5 border-white/10 hover:border-[#FF6600]/30"
                      }`}
                      data-testid={`medication-item-${med.id}`}
                    >
                      <Checkbox 
                        checked={med.taken}
                        onCheckedChange={() => handleMedicationToggle(med.id)}
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
                          {med.time}
                        </p>
                        <Badge className={getStatusColor(med.status)} data-testid={`badge-med-status-${med.id}`}>
                          {med.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Appointments Section */}
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
                <div className="space-y-3">
                  {appointments.map((appt) => {
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
                          <p className="text-white/60 text-sm">{appt.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#FF6600] font-medium">{appt.date}</p>
                          <p className="text-white/60 text-sm">{appt.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Exercise Section */}
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
                <div className="space-y-4">
                  {exercises.map((exercise) => {
                    const Icon = getCategoryIcon(exercise.category);
                    const progress = (exercise.completed / exercise.target) * 100;
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
                              <p className="text-white/60 text-sm">{exercise.duration} minutes</p>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(exercise.category)} data-testid={`badge-exercise-category-${exercise.id}`}>
                            {exercise.category}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Progress</span>
                            <span className="text-white">{exercise.completed}/{exercise.target} reps</span>
                          </div>
                          <Progress value={progress} className="h-2" data-testid={`progress-exercise-${exercise.id}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Progress Section */}
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

            {/* Daily Check-in Widget */}
            <Card className="bg-[#0a0a0a] border-[#FF6600]/20" data-testid="card-daily-checkin">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#FF6600]" />
                  Daily Check-in
                </CardTitle>
                <CardDescription className="text-white/60">How are you feeling today?</CardDescription>
              </CardHeader>
              <CardContent>
                {checkInData.completed ? (
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
                      className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90"
                      data-testid="button-submit-checkin"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete Check-in
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
