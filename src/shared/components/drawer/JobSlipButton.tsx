import { Button } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';

/** The outlined button below a job's Details card that opens the slip given at intake. */
export const JobSlipButton = ({ onClick }: { onClick: () => void }) => {
  const isMobile = useIsMobile();
  return (
    <Button
      variant="default"
      fullWidth
      size={isMobile ? 'md' : 'sm'}
      style={isMobile ? { minHeight: 44 } : undefined}
      onClick={onClick}
    >
      {t('Job slip')}
    </Button>
  );
};
