import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Step {
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps?: Step[];
  variant: 'steps' | 'bar';
  showLabels?: boolean;
  className?: string;
}

type StepStatus = 'completed' | 'current' | 'upcoming';

function getStepStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'upcoming';
}

function StepCircle({ 
  stepNumber, 
  status 
}: { 
  stepNumber: number; 
  status: StepStatus;
}) {
  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 font-semibold text-sm";
  
  return (
    <div
      className={cn(
        baseClasses,
        status === 'completed' && "bg-emerald-500 border-emerald-500 text-white",
        status === 'current' && "bg-amber-500 border-amber-500 text-white animate-pulse",
        status === 'upcoming' && "bg-transparent border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
      )}
      data-testid={`step-circle-${stepNumber}`}
    >
      {status === 'completed' ? (
        <Check className="w-5 h-5" data-testid={`step-check-${stepNumber}`} />
      ) : (
        <span data-testid={`step-number-${stepNumber}`}>{stepNumber}</span>
      )}
    </div>
  );
}

function StepConnector({ status }: { status: 'completed' | 'upcoming' }) {
  return (
    <div
      className={cn(
        "flex-1 h-0.5 mx-2 transition-colors duration-300",
        status === 'completed' ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
      )}
      data-testid="step-connector"
    />
  );
}

function StepsVariant({ 
  currentStep, 
  totalSteps, 
  steps, 
  showLabels 
}: Omit<ProgressIndicatorProps, 'variant' | 'className'>) {
  const stepItems = Array.from({ length: totalSteps }, (_, i) => ({
    number: i + 1,
    label: steps?.[i]?.label || `Step ${i + 1}`,
    description: steps?.[i]?.description,
    status: getStepStatus(i + 1, currentStep),
  }));

  return (
    <div className="w-full" data-testid="progress-steps">
      <div className="flex items-center justify-between">
        {stepItems.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <StepCircle stepNumber={step.number} status={step.status} />
              {showLabels && (
                <div className="mt-2 text-center">
                  <p 
                    className={cn(
                      "text-sm font-medium transition-colors",
                      step.status === 'completed' && "text-emerald-600 dark:text-emerald-400",
                      step.status === 'current' && "text-amber-600 dark:text-amber-400",
                      step.status === 'upcoming' && "text-gray-400 dark:text-gray-500"
                    )}
                    data-testid={`step-label-${step.number}`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p 
                      className="text-xs text-muted-foreground mt-0.5 max-w-24"
                      data-testid={`step-description-${step.number}`}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            {index < stepItems.length - 1 && (
              <StepConnector 
                status={step.status === 'completed' ? 'completed' : 'upcoming'} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarVariant({ 
  currentStep, 
  totalSteps, 
  showLabels 
}: Omit<ProgressIndicatorProps, 'variant' | 'steps' | 'className'>) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="w-full" data-testid="progress-bar">
      {showLabels && (
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-sm font-medium text-foreground"
            data-testid="progress-bar-step-text"
          >
            Step {currentStep} of {totalSteps}
          </span>
          <span 
            className="text-sm font-semibold text-amber-600 dark:text-amber-400"
            data-testid="progress-bar-percentage"
          >
            {percentage}%
          </span>
        </div>
      )}
      <Progress 
        value={percentage} 
        className="h-2" 
        data-testid="progress-bar-indicator"
      />
    </div>
  );
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
  variant,
  showLabels = true,
  className,
}: ProgressIndicatorProps) {
  const validCurrentStep = Math.max(1, Math.min(currentStep, totalSteps));
  const validTotalSteps = Math.max(1, totalSteps);

  return (
    <div 
      className={cn("w-full", className)} 
      data-testid="progress-indicator"
      data-variant={variant}
    >
      {variant === 'steps' ? (
        <StepsVariant
          currentStep={validCurrentStep}
          totalSteps={validTotalSteps}
          steps={steps}
          showLabels={showLabels}
        />
      ) : (
        <BarVariant
          currentStep={validCurrentStep}
          totalSteps={validTotalSteps}
          showLabels={showLabels}
        />
      )}
    </div>
  );
}

export default ProgressIndicator;
