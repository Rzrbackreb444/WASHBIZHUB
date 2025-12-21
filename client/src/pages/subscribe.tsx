import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Loader2 } from "lucide-react";

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  useEffect(() => {
    // Redirect to /pricing, preserving any plan parameter for analytics
    const params = new URLSearchParams(searchString);
    const plan = params.get('plan');
    
    // Redirect to pricing page (canonical pricing page)
    if (plan) {
      setLocation(`/pricing?plan=${plan}`);
    } else {
      setLocation('/pricing');
    }
  }, [setLocation, searchString]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#C8A661] mb-4" />
        <p className="text-muted-foreground">Redirecting to pricing...</p>
      </div>
    </div>
  );
}
