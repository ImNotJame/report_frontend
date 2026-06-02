import React from "react";
import { Check } from "lucide-react";

export default function FormStepper({ currentStep, steps, onStepClick }) {
  return (
    <div className="stepper-container">
      <div className="stepper-wrapper">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div
              key={index}
              className={`stepper-item ${isCompleted ? "completed" : ""} ${
                isActive ? "active" : ""
              }`}
            >
              <div className="stepper-step-wrapper">
                <div
                  className="stepper-circle"
                  onClick={() => {
                    // Optional: Allow clicking to go back to completed steps
                    if (isCompleted || isActive) {
                      onStepClick(stepNumber);
                    }
                  }}
                  style={{ cursor: isCompleted || isActive ? "pointer" : "not-allowed" }}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNumber}
                </div>
                <div className="stepper-title">{step}</div>
              </div>
              {index < steps.length - 1 && <div className="stepper-divider" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
