import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../../components/Icon';

const STEPS = [
  "Validating Project Inputs",
  "Saving Project Details",
  "Saving Team Members",
  "Configuring Communication Channels",
  "Provisioning Integration Credentials",
  "Mapping Timeline & Milestones",
  "Creating Activity Logs",
  "Generating PDF Document",
  "Generating DOCX Document",
  "Building JSON Output",
  "Finalizing Package"
];

export const GenerationModal = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    // Progress through the steps every 300-800ms
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-surface/80 backdrop-blur-sm animate-in fade-in duration-300"></div>
      <div 
        className="bg-surface-base border border-border-subtle rounded-3xl w-[calc(100%-2rem)] max-w-md shadow-2xl flex flex-col z-[101] overflow-hidden"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh'
        }}
      >
        
        <div className="p-8 pb-6 text-center space-y-4 border-b border-border-subtle shrink-0">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary animate-pulse">
            <Icon name="rocket_launch" size={32} />
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Generating Kickoff Package</h3>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Please wait while we assemble your enterprise artifacts...</p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto grow custom-scrollbar">
          <div className="space-y-4">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;
              const isPending = currentStep < index;

              return (
                <div key={index} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                    isCompleted 
                      ? 'bg-status-success border-status-success text-white' 
                      : isCurrent
                        ? 'bg-primary border-primary text-white animate-pulse'
                        : 'bg-surface-container border-border-subtle text-transparent'
                  }`}>
                    {isCompleted ? <Icon name="check" size={14} /> : isCurrent ? <Icon name="hourglass_empty" size={12} className="animate-spin" /> : null}
                  </div>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-on-surface line-through opacity-70' : isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>,
    document.body
  );
};
