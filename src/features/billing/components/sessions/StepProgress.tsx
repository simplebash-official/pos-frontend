import { Stepper } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface ProgressStep {
  label: string;
  description: string;
}

export interface StepProgressProps {
  steps: ProgressStep[];
  active: number;
  /** Called with an earlier step the person taps; steps ahead can never be tapped. */
  onBack: (step: number) => void;
}

/** The numbered progress bar of a multi-step window: done steps are blue ticks, the next ones stay grey. */
export const StepProgress = ({ steps, active, onBack }: StepProgressProps) => {
  const isMobile = useIsMobile();
  return (
    <Stepper
      active={active}
      onStepClick={(step) => {
        if (step < active) onBack(step);
      }}
      iconSize={32}
      size="sm"
      allowNextStepsSelect={false}
      classNames={{ separator: 'step-progress-separator' }}
      styles={{
        steps: { alignItems: 'center' },
        stepIcon: { fontWeight: 700, borderWidth: 2 },
        stepLabel: { fontWeight: 600, fontSize: 'var(--mantine-font-size-sm)' },
        stepDescription: { fontSize: 'var(--mantine-font-size-xs)', marginTop: 0 },
        separator: {
          height: 3,
          marginInline: 6,
          borderRadius: 2,
          background: 'var(--border)',
        },
      }}
    >
      {steps.map((step) => (
        <Stepper.Step
          key={step.label}
          label={isMobile ? undefined : step.label}
          description={isMobile ? undefined : step.description}
          aria-label={step.label}
        />
      ))}
    </Stepper>
  );
};
