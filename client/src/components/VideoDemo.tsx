import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, X, Maximize, RotateCcw } from "lucide-react";

interface VideoDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoDemo({ isOpen, onClose }: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const demoSteps = [
    { time: 0, title: "Enter Any Address", description: "Type any business or property address worldwide" },
    { time: 5, title: "AI Analysis Begins", description: "Our system analyzes 17+ data points in seconds" },
    { time: 12, title: "Location Intelligence", description: "Demographics, competition, foot traffic scored" },
    { time: 18, title: "Financial Projections", description: "Revenue potential and ROI calculations" },
    { time: 24, title: "Your CLEANBI Score", description: "Get your comprehensive investment score" },
  ];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const newProgress = prev + (100 / 300);
          const currentTime = (newProgress / 100) * 30;
          const stepIndex = demoSteps.findIndex((step, i) => {
            const nextStep = demoSteps[i + 1];
            return currentTime >= step.time && (!nextStep || currentTime < nextStep.time);
          });
          if (stepIndex !== -1) setCurrentStep(stepIndex);
          return newProgress;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleRestart = () => {
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
  };
  const handleClose = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
    onClose();
  };

  useEffect(() => {
    if (isOpen && progress === 0) {
      setIsPlaying(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-slate-900">
        <div className="relative">
          {/* Demo Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  LIVE DEMO
                </Badge>
                <span className="text-white/80 text-sm">
                  {Math.floor((progress / 100) * 30)}s / 30s
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Demo Content - Animated Mockup */}
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
            {/* Animated Browser Frame */}
            <div className="absolute inset-4 bg-white rounded-lg shadow-2xl overflow-hidden">
              {/* Browser Bar */}
              <div className="h-10 bg-slate-100 flex items-center px-4 gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-sm text-slate-500 border">
                    washbizhub.com/cleanbi-explorer
                  </div>
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white h-full">
                {/* Step 0-1: Address Input */}
                {currentStep <= 1 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-xl mx-auto text-center mb-6">
                      <h2 className="text-2xl font-bold text-[#001F3F] mb-2">CLEANBI Score Calculator</h2>
                      <p className="text-slate-600">Enter any address to get instant property intelligence</p>
                    </div>
                    <div className="max-w-lg mx-auto">
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white border-2 border-[#39CCCC] rounded-lg p-3 shadow-lg">
                          <span className={`text-slate-900 ${currentStep === 1 ? 'animate-pulse' : ''}`}>
                            {currentStep === 0 ? "Enter address..." : "123 Main Street, Los Angeles, CA 90012"}
                          </span>
                        </div>
                        <div className={`px-6 py-3 bg-[#39CCCC] rounded-lg text-white font-bold ${currentStep === 1 ? 'animate-pulse' : ''}`}>
                          Analyze
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Analysis */}
                {currentStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-xl mx-auto text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-[#39CCCC] border-t-transparent animate-spin" />
                      <h3 className="text-xl font-bold text-[#001F3F] mb-2">Analyzing Location...</h3>
                      <div className="space-y-2 text-left max-w-xs mx-auto">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Checking demographics...
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Analyzing competition...
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          Calculating foot traffic...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Financial */}
                {currentStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-xl mx-auto">
                      <h3 className="text-xl font-bold text-[#001F3F] mb-4 text-center">Financial Projections</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-green-500">
                          <p className="text-2xl font-bold text-green-600">$18,500</p>
                          <p className="text-xs text-slate-500">Est. Monthly Revenue</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-blue-500">
                          <p className="text-2xl font-bold text-blue-600">24%</p>
                          <p className="text-xs text-slate-500">Projected ROI</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-purple-500">
                          <p className="text-2xl font-bold text-purple-600">3.2 yrs</p>
                          <p className="text-xs text-slate-500">Payback Period</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Final Score */}
                {currentStep === 4 && (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="max-w-xl mx-auto text-center">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-white">82</p>
                          <p className="text-xs text-white/80">CLEANBI</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-lg px-4 py-1 mb-2">
                        Grade: A- (Strong Investment)
                      </Badge>
                      <p className="text-slate-600 mt-2">
                        This location shows excellent potential for laundromat investment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar & Controls */}
          <div className="bg-slate-900 p-4">
            {/* Step Indicators */}
            <div className="flex justify-between mb-3 px-2">
              {demoSteps.map((step, i) => (
                <div 
                  key={i}
                  className={`text-xs transition-all ${
                    i === currentStep 
                      ? 'text-[#39CCCC] font-bold' 
                      : i < currentStep 
                        ? 'text-green-400' 
                        : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-700 rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#39CCCC] to-[#b8860b] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleRestart}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                className="bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold px-8"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : progress >= 100 ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Replay
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Current Step Description */}
            <p className="text-center text-slate-400 text-sm mt-3">
              {demoSteps[currentStep]?.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
