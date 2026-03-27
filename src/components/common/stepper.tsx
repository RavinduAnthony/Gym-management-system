import { Check } from 'lucide-react';

interface StepperProps {
    steps: string[];
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="relative">
            <div className="absolute left-0 top-1/2 -mt-[2px] w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
            </div>

            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isActive = stepNumber === currentStep;

                    return (
                        <div key={step} className="flex flex-col items-center gap-2 relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 
                  ${isCompleted
                                        ? 'bg-primary text-primary-foreground border-2 border-primary'
                                        : isActive
                                            ? 'bg-background text-primary border-2 border-primary shadow-[0_0_0_4px] shadow-primary/20'
                                            : 'bg-background text-muted-foreground border-2 border-muted'
                                    }
                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-semibold">{stepNumber}</span>}
                            </div>
                            <span
                                className={`text-xs font-medium absolute -bottom-6 w-32 text-center -translate-x-1/2 left-1/2 whitespace-nowrap
                  ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                `}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
