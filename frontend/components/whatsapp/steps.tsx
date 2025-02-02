import type React from "react"

interface Step {
  title: string
  description: string
  action: React.ReactNode
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = currentStep === stepNumber
          const isCompleted = currentStep > stepNumber

          return (
            <div
              key={step.title}
              className={`relative flex gap-4 p-4 rounded-lg cursor-pointer transition-colors
                ${isActive ? "bg-gray-50" : "hover:bg-gray-50/50"}`}
              onClick={() => onStepClick(stepNumber)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isActive ? "bg-[#5932EA] text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-100"}`}
              >
                {stepNumber}
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {isActive && <div className="mt-4">{step.action}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

