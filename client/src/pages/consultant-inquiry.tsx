import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const inquirySchema = z.object({
  firstName: z.string().min(2, 'Please enter your first name (at least 2 characters)'),
  lastName: z.string().min(2, 'Please enter your last name (at least 2 characters)'),
  email: z.string().min(1, 'Please enter your email address').email('Please enter a valid email address (e.g., name@example.com)'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  businessName: z.string().min(3, 'Please enter your business name (at least 3 characters)'),
  inquiryType: z.enum(['new-business', 'expansion', 'optimization', 'troubleshooting', 'financing', 'other']),
  message: z.string().min(20, 'Please tell us more about your situation (at least 20 characters)'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type InquiryData = z.infer<typeof inquirySchema>;

export default function ConsultantInquiry() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InquiryData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      businessName: '',
      inquiryType: 'optimization',
      message: '',
      budget: '',
      timeline: '',
    },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: async (data: InquiryData) => {
      return apiRequest('POST', '/api/consultant/inquiry', data);
    },
    onSuccess: () => {
      toast({
        title: 'Inquiry Submitted',
        description: 'We\'ll be in touch within 24 hours at consult@washbizhub.com',
      });
      setSubmitted(true);
      form.reset();
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit inquiry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InquiryData) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Mail className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="text-muted-foreground">
                Your inquiry has been sent to consult@washbizhub.com. We'll get back to you within 24 hours.
              </p>
              <Button onClick={() => setSubmitted(false)} className="w-full">
                Submit Another Inquiry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Free Consultant Inquiry | Expert Laundromat Advice | WashBizHub"
        description="Get expert advice on starting, expanding, or optimizing your laundromat. Free initial consultation. Submit your inquiry now."
        canonicalUrl="/consultant-inquiry"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 border-b border-blue-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Get Expert Advice</h1>
            </div>
            <p className="text-blue-200 mb-4">Connect with laundromat consultants for personalized guidance</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>consult@washbizhub.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">🚀 New Business</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Starting from scratch? Get guidance on location selection, equipment, financing, and more.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">📈 Expansion</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ready to grow? Advice on scaling operations, multi-unit management, and growth strategies.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">⚙️ Optimization</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Maximize profits by improving operations, customer experience, and equipment efficiency.
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Form</CardTitle>
              <CardDescription>Tell us about your situation and how we can help</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="555-123-4567" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold">Business Information</h3>
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your laundromat name" {...field} data-testid="input-business-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What brings you here?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-inquiry-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new-business">Starting a new business</SelectItem>
                              <SelectItem value="expansion">Expanding existing business</SelectItem>
                              <SelectItem value="optimization">Optimizing current operations</SelectItem>
                              <SelectItem value="troubleshooting">Troubleshooting problems</SelectItem>
                              <SelectItem value="financing">Financing assistance</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold">Tell Us More</h3>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your situation, challenges, goals, and what you're looking for help with..."
                              className="min-h-32"
                              {...field}
                              data-testid="textarea-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range (optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger data-testid="select-budget">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="$0-$50K">Under $50K</SelectItem>
                                <SelectItem value="$50K-$100K">$50K - $100K</SelectItem>
                                <SelectItem value="$100K-$250K">$100K - $250K</SelectItem>
                                <SelectItem value="$250K+">$250K+</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeline (optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger data-testid="select-timeline">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="1-3-months">1-3 months</SelectItem>
                                <SelectItem value="3-6-months">3-6 months</SelectItem>
                                <SelectItem value="6-12-months">6-12 months</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-inquiry">
                    <Send className="w-4 h-4 mr-2" />
                    {mutation.isPending ? 'Submitting...' : 'Submit Inquiry'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="mt-12 text-center text-muted-foreground">
            <p>Email us at <strong>consult@washbizhub.com</strong></p>
            <p className="mt-2">Response time: Usually within 24 hours</p>
          </div>
        </div>
      </div>
    </>
  );
}
