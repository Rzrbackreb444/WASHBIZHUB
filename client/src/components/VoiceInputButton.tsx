import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useVoiceInput, VoiceInputError } from "@/hooks/use-voice-input";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
  showTranscript?: boolean;
  autoSubmit?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function VoiceInputButton({
  onTranscript,
  onFinalTranscript,
  disabled = false,
  className,
  showTranscript = true,
  autoSubmit = true,
  size = "icon",
  variant = "outline",
}: VoiceInputButtonProps) {
  const { toast } = useToast();
  const [showTranscriptBubble, setShowTranscriptBubble] = useState(false);

  const handleError = (error: VoiceInputError, message: string) => {
    if (error !== "aborted" && error !== "no-speech") {
      toast({
        title: "Voice Input Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleFinalTranscript = (transcript: string) => {
    if (autoSubmit) {
      onTranscript(transcript);
    }
    onFinalTranscript?.(transcript);
    setShowTranscriptBubble(false);
  };

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    toggleListening,
    resetTranscript,
  } = useVoiceInput({
    onTranscript: (t) => {
      setShowTranscriptBubble(true);
    },
    onFinalTranscript: handleFinalTranscript,
    onError: handleError,
  });

  const currentTranscript = interimTranscript || transcript;

  useEffect(() => {
    if (isListening) {
      setShowTranscriptBubble(true);
    }
  }, [isListening]);

  const handleClick = () => {
    if (isListening) {
      toggleListening();
    } else {
      resetTranscript();
      toggleListening();
    }
  };

  const handleDismissTranscript = () => {
    setShowTranscriptBubble(false);
    resetTranscript();
  };

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant={variant}
            disabled
            className={cn("relative", className)}
            data-testid="button-voice-input"
          >
            <MicOff className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voice input not supported in this browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant={isListening ? "default" : variant}
            onClick={handleClick}
            disabled={disabled}
            className={cn(
              "relative transition-all",
              isListening && "bg-red-500 hover:bg-red-600 text-white border-red-600",
              className
            )}
            data-testid="button-voice-input"
          >
            {isListening ? (
              <>
                <Mic className="h-4 w-4 animate-pulse" />
                <span
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping"
                  data-testid="status-voice-recording"
                />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
              </>
            ) : error ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isListening
              ? "Click to stop listening"
              : "Click to use voice input"}
          </p>
        </TooltipContent>
      </Tooltip>

      {showTranscript && showTranscriptBubble && (isListening || currentTranscript) && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 min-w-[200px] max-w-[300px]"
          data-testid="text-voice-transcript"
        >
          <div className="bg-card border rounded-lg shadow-lg p-3 relative">
            <button
              onClick={handleDismissTranscript}
              className="absolute top-1 right-1 p-1 rounded-full hover:bg-muted transition-colors"
              data-testid="button-dismiss-transcript"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
            
            {isListening && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1" data-testid="status-voice-recording">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Listening...</span>
                </div>
                <WaveformAnimation />
              </div>
            )}
            
            <p className="text-sm text-foreground pr-4">
              {currentTranscript || (
                <span className="text-muted-foreground italic">
                  {isListening ? "Speak now..." : "No speech detected"}
                </span>
              )}
            </p>
            
            {interimTranscript && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                (processing...)
              </p>
            )}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-card" />
        </div>
      )}
    </div>
  );
}

function WaveformAnimation() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-0.5 bg-primary rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 12 + 4}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.5s",
          }}
        />
      ))}
    </div>
  );
}

export function VoiceInputInline({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const handleTranscript = (transcript: string) => {
    onChange(value ? `${value} ${transcript}`.trim() : transcript);
  };

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10"
        data-testid="input-voice-inline"
      />
      <div className="absolute right-1">
        <VoiceInputButton
          onTranscript={handleTranscript}
          size="sm"
          variant="ghost"
        />
      </div>
    </div>
  );
}
