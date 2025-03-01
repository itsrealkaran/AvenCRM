import type React from 'react';

interface Step {
  title: string;
  description: string;
  content?: React.ReactNode;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  showNavigation?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export function Steps({ 
  steps, 
  currentStep, 
  onStepClick, 
  showNavigation = false,
  onNext,
  onBack,
  onComplete,
  isLastStep = false,
  isLoading = false
}: StepsProps) {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between mb-8'>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={step.title} className='flex flex-col items-center'>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                  ${isActive ? 'bg-[#5932EA] text-white' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                onClick={() => onStepClick && onStepClick(stepNumber)}
              >
                {stepNumber}
              </div>
              <div className='text-xs mt-2 text-center max-w-[80px]'>
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-[2px] w-16 mt-5 -ml-8 
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} 
                  style={{ position: 'absolute', left: `calc(${(index + 1) * (100 / steps.length)}% - 8px)` }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className='p-6 bg-gray-50 rounded-lg'>
        <h3 className='font-medium text-lg mb-2'>{steps[currentStep - 1].title}</h3>
        <p className='text-sm text-muted-foreground mb-6'>{steps[currentStep - 1].description}</p>
        <div>{steps[currentStep - 1].content}</div>
      </div>

      {showNavigation && (
        <div className='flex justify-between mt-6'>
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={currentStep === 1 || isLoading}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button 
              onClick={onComplete} 
              className="bg-[#5932EA] hover:bg-[#5932EA]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button 
              onClick={onNext} 
              className="bg-[#5932EA] hover:bg-[#5932EA]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Next'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Button component to avoid dependency issues
function Button({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'default'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}) {
  const baseClass = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClass = variant === 'outline' 
    ? 'border border-gray-300 hover:bg-gray-50' 
    : 'bg-blue-600 text-white hover:bg-blue-700';
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClass} ${variantClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
