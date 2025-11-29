import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    console.error("[RouteErrorBoundary] Uncaught error:", error);
    console.error("[RouteErrorBoundary] Component stack:", errorInfo.componentStack);
    console.error("[RouteErrorBoundary] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          data-testid="error-boundary-container"
        >
          <Card className="w-full max-w-lg bg-white/10 backdrop-blur border-white/10">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-gold-500" />
              </div>
              <h1 
                className="text-2xl font-bold text-white"
                data-testid="text-error-title"
              >
                Something went wrong
              </h1>
              <p 
                className="text-white/70 text-sm mt-2"
                data-testid="text-error-description"
              >
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Error Details</p>
                <p 
                  className="text-sm text-white/80 font-mono break-words"
                  data-testid="text-error-message"
                >
                  {this.state.error?.message || "An unknown error occurred"}
                </p>
              </div>

              {this.state.error?.name && (
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="px-2 py-1 bg-white/10 rounded text-teal-400 font-medium">
                    {this.state.error.name}
                  </span>
                  <span>at {new Date().toLocaleTimeString()}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="w-full sm:w-auto gap-2 border-teal-400/50 text-teal-400 hover:bg-teal-400/10"
                data-testid="button-retry"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto gap-2 bg-gold-500 hover:bg-gold-600 text-white border-gold-600"
                data-testid="button-go-home"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
