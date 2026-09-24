import { Anchor, Text } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { env } from '@/config/env';
import { isShopCodeRequired } from '../lib/shopCode';

/**
 * Multi-tenant web login only: points people who don't have a shop yet at the
 * SimpleBash app, where they sign up. Renders nothing on the desktop app or a
 * single-shop deployment, which have no cloud sign-up.
 */
export const CreateShopLink = () => {
  if (!isShopCodeRequired()) return null;
  return (
    <Text size="sm" c="dimmed" ta="center">
      {t('New to SimpleBash?')}{' '}
      <Anchor href={`${env.accountsUrl}/signup`} size="sm" fw={600}>
        {t('Create your shop')}
      </Anchor>
    </Text>
  );
};
