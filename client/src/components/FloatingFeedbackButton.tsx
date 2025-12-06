import { useState } from 'react';
import { MessageSquarePlus, X, Send, Sparkles, Lightbulb, Bug, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const categoryOptions = [
  { value: 'feature-request', label: 'Feature Request', icon: Sparkles },
  { value: 'improvement', label: 'Improvement', icon: Lightbulb },
  { value: 'bug-report', label: 'Bug Report', icon: Bug },
  { value: 'general-feedback', label: 'General Feedback', icon: MessageSquare },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

export function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general-feedback',
    subject: '',
    message: '',
    page: typeof window !== 'undefined' ? window.location.pathname : '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/feedback/submit', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        category: 'general-feedback',
        subject: '',
        message: '',
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      });
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 3000);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name, email, and message.',
        variant: 'destructive',
      });
      return;
    }
    if (formData.message.length < 20) {
      toast({
        title: 'Message Too Short',
        description: 'Please provide more detail in your message (at least 20 characters).',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate({
      ...formData,
      subject: formData.subject || `Feedback from ${formData.name}`,
    });
  };

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-card border border-border rounded-lg shadow-xl p-6 w-80 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Send className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Thank You!</h3>
          <p className="text-sm text-muted-foreground">Your feedback has been sent to our team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-card border border-border rounded-lg shadow-xl w-80 md:w-96 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-[#C8A661]" />
              <span className="font-semibold">Share Feedback</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-feedback"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fb-name" className="text-xs">Name</Label>
                <Input
                  id="fb-name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9"
                  data-testid="input-floating-name"
                />
              </div>
              <div>
                <Label htmlFor="fb-email" className="text-xs">Email</Label>
                <Input
                  id="fb-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9"
                  data-testid="input-floating-email"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="fb-category" className="text-xs">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-9" data-testid="select-floating-category">
                  <SelectValue />
                </SelectTrigger>
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
            </div>
            
            <div>
              <Label htmlFor="fb-subject" className="text-xs">Subject (Optional)</Label>
              <Input
                id="fb-subject"
                placeholder="Brief summary"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="h-9"
                data-testid="input-floating-subject"
              />
            </div>
            
            <div>
              <Label htmlFor="fb-message" className="text-xs">Your Feedback</Label>
              <Textarea
                id="fb-message"
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="min-h-[80px] resize-none"
                data-testid="textarea-floating-message"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]"
              disabled={mutation.isPending}
              data-testid="button-floating-submit"
            >
              {mutation.isPending ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628] shadow-lg"
          data-testid="button-open-feedback"
        >
          <MessageSquarePlus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
