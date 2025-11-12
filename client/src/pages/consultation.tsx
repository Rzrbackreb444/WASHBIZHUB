import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, DollarSign, CheckCircle, MessageSquare, TrendingUp } from "lucide-react";

const consultationSchema = z.object({
  consultationType: z.string().min(1, "Please select a consultation type"),
  businessStage: z.string().min(1, "Please select your business stage"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().min(10, "Please provide more details (at least 10 characters)"),
  preferredDate: z.string().optional(),
});

type ConsultationForm = z.infer<typeof consultationSchema>;

const consultationTypes = [
  { value: "site_selection", label: "Site Selection & Location Analysis", icon: TrendingUp },
  { value: "business_plan", label: "Business Plan Development", icon: MessageSquare },
  { value: "equipment", label: "Equipment Selection & Layout", icon: CheckCircle },
  { value: "operations", label: "Operations & Efficiency", icon: Clock },
  { value: "marketing", label: "Marketing & Customer Acquisition", icon: TrendingUp },
  { value: "exit_strategy", label: "Exit Strategy & Business Sale", icon: DollarSign },
];

const businessStages = [
  { value: "researching", label: "Just Researching" },
  { value: "planning", label: "Planning to Start" },
  { value: "acquiring", label: "Acquiring a Laundromat" },
  { value: "operating", label: "Currently Operating" },
  { value: "selling", label: "Planning to Sell" },
];

export default function Consultation() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ConsultationForm>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultationType: "",
      businessStage: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      budget: "",
      timeline: "",
      message: "",
      preferredDate: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ConsultationForm) => {
      const response = await apiRequest("POST", "/api/consultations", {
        ...data,
        userId: null, // Optional - user might not be logged in
        status: "new",
        priority: "normal",
        consultationFee: "297.00", // $297 consultation fee
        paid: false,
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Consultation Request Submitted",
        description: "We'll contact you within 24 hours to schedule your consultation",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for requesting a consultation. Our expert will review your information and contact you within 24 hours to schedule your session.
            </p>
            <div className="bg-muted p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">What Happens Next:</h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>We'll call or email you to confirm your preferred consultation date</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>You'll receive a calendar invite with video conference link</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Prepare any questions or documents for your 60-minute session</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Payment link will be sent before your scheduled consultation</span>
                </li>
              </ul>
            </div>
            <Button onClick={() => setSubmitted(false)} variant="outline" data-testid="button-submit-another">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="text-page-title">
            Expert Laundromat Consultation
          </h1>
          <p className="text-xl text-green-200 mb-4">
            Get personalized guidance from industry experts
          </p>
          <div className="flex items-center justify-center gap-2 text-accent font-semibold">
            <DollarSign className="w-5 h-5" />
            <span>$297 per 60-minute session</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Calendar className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-lg">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Choose a time that works for you - evenings and weekends available
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-lg">Expert Guidance</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Work with operators who've built successful $1M+ laundromats
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-lg">Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Leave with a clear action plan tailored to your specific situation
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Your Consultation</CardTitle>
            <CardDescription>
              Fill out the form below and we'll contact you to schedule your session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="consultationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-consultation-type">
                              <SelectValue placeholder="Select consultation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {consultationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-business-stage">
                              <SelectValue placeholder="Select your business stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessStages.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., $250K-500K" {...field} data-testid="input-budget" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3-6 months" {...field} data-testid="input-timeline" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-preferred-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tell Us About Your Needs</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe what you'd like to discuss during the consultation..."
                          className="min-h-32"
                          {...field}
                          data-testid="textarea-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Request Consultation"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Before Your Consultation:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Confirmation call within 24 hours</li>
                  <li>• Calendar invite with video link</li>
                  <li>• Pre-consultation questionnaire</li>
                  <li>• Payment link ($297)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">During Your Session:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 60-minute video consultation</li>
                  <li>• Screen sharing for data review</li>
                  <li>• Actionable recommendations</li>
                  <li>• Follow-up resources provided</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
