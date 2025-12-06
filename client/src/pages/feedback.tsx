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
import { MessageSquare, Send, CheckCircle, Lightbulb, Bug, Sparkles, HelpCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const feedbackSchema = z.object({
  name: z.string().min(2, 'Please enter your name (at least 2 characters)'),
  email: z.string().min(1, 'Please enter your email address').email('Please enter a valid email address'),
  category: z.enum(['feature-request', 'improvement', 'bug-report', 'general-feedback', 'other']),
  subject: z.string().min(5, 'Please enter a subject (at least 5 characters)'),
  message: z.string().min(20, 'Please describe your feedback in detail (at least 20 characters)'),
  page: z.string().optional(),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

const categoryOptions = [
  { value: 'feature-request', label: 'New Feature Request', icon: Sparkles, description: 'Suggest a new feature you\'d like to see' },
  { value: 'improvement', label: 'Improvement Suggestion', icon: Lightbulb, description: 'Ideas to make existing features better' },
  { value: 'bug-report', label: 'Bug Report', icon: Bug, description: 'Report something that isn\'t working' },
  { value: 'general-feedback', label: 'General Feedback', icon: MessageSquare, description: 'Share your thoughts and experience' },
  { value: 'other', label: 'Other', icon: HelpCircle, description: 'Anything else on your mind' },
];

export default function Feedback() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      category: 'general-feedback',
      subject: '',
      message: '',
      page: '',
    },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      return apiRequest('POST', '/api/feedback/submit', data);
    },
    onSuccess: () => {
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you! Your feedback has been sent to our team.',
      });
      setSubmitted(true);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FeedbackData) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="text-muted-foreground">
                Your feedback has been sent to our team at info@washbizhub.com. We read every submission and truly appreciate your input!
              </p>
              <Button 
                onClick={() => setSubmitted(false)} 
                className="w-full"
                data-testid="button-submit-another"
              >
                Submit More Feedback
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
        title="Feedback & Suggestions | Help Us Improve | WashBizHub"
        description="Share your ideas, suggestions, and feedback with WashBizHub. Help us build the best platform for laundromat professionals."
        canonicalUrl="/feedback"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#0A1628] via-[#1a2a4a] to-[#0A1628] text-white py-12 border-b border-[#C8A661]/30">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-8 h-8 text-[#C8A661]" />
              <h1 className="text-3xl md:text-4xl font-bold">Share Your Feedback</h1>
            </div>
            <p className="text-gray-300 mb-4">
              Your ideas and suggestions help us build a better platform. Whether it's a new feature request, 
              an improvement idea, or just general feedback - we want to hear from you!
            </p>
            <div className="flex items-center gap-2 text-sm text-[#C8A661]">
              <Send className="w-4 h-4" />
              <span>All feedback is sent directly to info@washbizhub.com</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Form</CardTitle>
              <CardDescription>
                Tell us what's on your mind. We read every submission and use your feedback to improve WashBizHub.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Smith" 
                              {...field} 
                              data-testid="input-name"
                            />
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="w-4 h-4" />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {categoryOptions.find(c => c.value === field.value)?.description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief summary of your feedback" 
                            {...field} 
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="page"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Page or Feature (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., CLEANBI Explorer, Pricing Page, Dashboard" 
                            {...field} 
                            data-testid="input-page"
                          />
                        </FormControl>
                        <FormDescription>
                          If your feedback is about a specific page or feature, let us know which one
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please share your thoughts in detail. The more specific you are, the better we can understand and act on your feedback..."
                            className="min-h-[150px] resize-y"
                            {...field} 
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628] font-semibold"
                    disabled={mutation.isPending}
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Have an urgent issue? Contact us directly at{' '}
              <a href="mailto:info@washbizhub.com" className="text-[#C8A661] hover:underline">
                info@washbizhub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
