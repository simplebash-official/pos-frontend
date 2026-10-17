import { Text, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
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

const CIRCLE = 36;
const LINE = 3;

/** A row of numbered circles joined by a line: done steps are blue ticks, the current one is ringed, the rest grey. */
export const StepProgress = ({ steps, active, onBack }: StepProgressProps) => {
  const isMobile = useIsMobile();
  return (
    <ol
      aria-label={steps[active]?.label}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        listStyle: 'none',
        margin: 0,
        padding: '4px 0 8px',
      }}
    >
      {steps.map((step, index) => {
        const done = index < active;
        const current = index === active;
        const circle = (
          <span
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: CIRCLE,
              height: CIRCLE,
              margin: '0 auto',
              borderRadius: '50%',
              fontWeight: 700,
              fontSize: 'var(--mantine-font-size-sm)',
              color: done
                ? 'var(--mantine-color-white)'
                : current
                  ? 'var(--mantine-color-blue-6)'
                  : 'var(--text-muted)',
              background: done
                ? 'var(--mantine-color-blue-6)'
                : current
                  ? 'var(--bg-card)'
                  : 'var(--bg-hover)',
              border: `2px solid ${
                done || current ? 'var(--mantine-color-blue-6)' : 'var(--border)'
              }`,
              boxShadow: current ? '0 0 0 4px var(--mantine-color-blue-light)' : undefined,
            }}
          >
            {done ? <IconCheck size={18} stroke={3} /> : index + 1}
          </span>
        );
        const labels = (
          <>
            <Text
              size={isMobile ? 'xs' : 'sm'}
              fw={current ? 700 : 600}
              c={current ? undefined : 'dimmed'}
              mt={8}
            >
              {step.label}
            </Text>
            {!isMobile && (
              <Text size="xs" c="dimmed">
                {step.description}
              </Text>
            )}
          </>
        );
        return (
          <li
            key={step.label}
            data-step={index}
            aria-current={current ? 'step' : undefined}
            style={{ position: 'relative', textAlign: 'center', minWidth: 0 }}
          >
            {index > 0 && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: (CIRCLE - LINE) / 2,
                  left: `calc(-50% + ${CIRCLE / 2 + 4}px)`,
                  right: `calc(50% + ${CIRCLE / 2 + 4}px)`,
                  height: LINE,
                  borderRadius: LINE,
                  background: index <= active ? 'var(--mantine-color-blue-6)' : 'var(--border)',
                }}
              />
            )}
            {done ? (
              <UnstyledButton
                type="button"
                onClick={() => onBack(index)}
                aria-label={step.label}
                style={{ display: 'block', width: '100%' }}
              >
                {circle}
                {labels}
              </UnstyledButton>
            ) : (
              <div>
                {circle}
                {labels}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};
