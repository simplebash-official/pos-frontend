import { t } from '@/shared/i18n/t';
import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';

// Shown where a document would be when the design to print it with is not available (the shop's
// choice was withdrawn, or its settings no longer fit). Nothing is printed in some other design on
// its own: pick another one for this print in the bar above, or — for an admin — choose a new
// design for the shop in Settings.
export const DesignUnavailableAlert = () => {
  const navigate = useNavigate();
  const isAdmin = useAppSelector(selectUserRole) === USER_ROLES.ADMIN;

  return (
    <Alert
      variant="light"
      color="orange"
      icon={<IconAlertCircle size={18} />}
      title={t('This design is not available')}
      m="md"
    >
      <Text size="sm">
        {t('The design chosen for this document can no longer be used.')}{' '}
        {t('Pick another design above for this print.')}
      </Text>
      {isAdmin && (
        <Group mt="sm">
          <Button
            size="xs"
            variant="default"
            onClick={() => navigate(ROUTES.SETTINGS, { state: { section: 'document-designs' } })}
          >
            {t('Choose a design')}
          </Button>
        </Group>
      )}
    </Alert>
  );
};
