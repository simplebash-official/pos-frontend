import { useState } from 'react';
import { Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconBuildingBank, IconCash, IconCreditCard, IconWorld } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useAccounts } from '../hooks/useAccounts';
import { accountLabel, activityLines } from '../lib/accountView';
import type { AccountKind, AccountSummary } from '../types';
import { OpeningBalanceModal } from './OpeningBalanceModal';

const ICONS: Record<AccountKind, ReactNode> = {
  drawer: <IconCash size={20} />,
  bank: <IconBuildingBank size={20} />,
  card: <IconCreditCard size={20} />,
  online: <IconWorld size={20} />,
};

type TrackedAccount = AccountSummary & { kind: Exclude<AccountKind, 'drawer'> };
const isTracked = (account: AccountSummary): account is TrackedAccount => account.kind !== 'drawer';

// Where the shop's money is: the cash in the drawers, and the bank, card and online accounts. The
// drawer is counted from the shifts; the others start from an opening balance the owner sets once
// and are worked out from sales, income, expenses and cash taken to or from the bank. Only people
// with the accounts permission reach this page (see the route guard) and the backend refuses
// everyone else; setting an opening balance needs the owner's permission.
export const MoneyAccountsPage = () => {
  const isMobile = useIsMobile();
  const canManage = useHasPermission(PERMISSIONS.ACCOUNTS_MANAGE);
  const { data, isLoading } = useAccounts();
  const [editing, setEditing] = useState<TrackedAccount | null>(null);

  return (
    <>
      <Stack gap="md">
        <PageHeader
          title={t('Money Accounts')}
          description={t(
            'What the shop holds in the cash drawer, the bank, cards and online, worked out from every sale, payment and cash movement.'
          )}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {isLoading || data === undefined
            ? [0, 1, 2, 3].map((n) => <Skeleton key={n} h={160} />)
            : data.accounts.map((account) => (
                <Paper key={account.kind} withBorder p="md">
                  <Stack gap="sm">
                    <Group gap="sm" wrap="nowrap">
                      {ICONS[account.kind]}
                      <Text fw={700}>{accountLabel(account.kind)}</Text>
                    </Group>

                    {account.balanceCents === undefined ? (
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">
                          {t('Not set up yet.')}
                        </Text>
                        {canManage && isTracked(account) ? (
                          <Button
                            variant="light"
                            h={isMobile ? 44 : undefined}
                            onClick={() => setEditing(account)}
                            data-log-id="accounts.set-opening"
                          >
                            {t('Set opening balance')}
                          </Button>
                        ) : (
                          <Text size="xs" c="dimmed">
                            {t('The owner can set where this account started.')}
                          </Text>
                        )}
                      </Stack>
                    ) : (
                      <Stack gap="xs">
                        <Text size="xl" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatMoney(account.balanceCents)}
                        </Text>
                        {account.kind === 'drawer' && (
                          <Text size="xs" c="dimmed">
                            {t('Cash in all drawers right now.')}
                          </Text>
                        )}
                        {account.activity !== undefined &&
                          account.openingBalanceCents !== undefined &&
                          account.asOfDate !== undefined && (
                            <Stack gap={4}>
                              <Text size="xs" c="dimmed">
                                {`${t('Started with')} ${formatMoney(account.openingBalanceCents)} ${t('on')} ${formatDate(account.asOfDate)}`}
                              </Text>
                              {activityLines(account.kind, account.activity).map((line) => (
                                <Group key={line.key} justify="space-between" wrap="nowrap">
                                  <Text size="sm">{line.label}</Text>
                                  <Text
                                    size="sm"
                                    c={line.sign === 1 ? 'green' : 'red'}
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                  >
                                    {`${line.sign === 1 ? '+' : '−'} ${formatMoney(line.cents)}`}
                                  </Text>
                                </Group>
                              ))}
                            </Stack>
                          )}
                        {canManage && isTracked(account) && (
                          <Button
                            variant="default"
                            size="xs"
                            h={isMobile ? 44 : undefined}
                            onClick={() => setEditing(account)}
                            data-log-id="accounts.change-opening"
                          >
                            {t('Change opening balance')}
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              ))}
        </SimpleGrid>
      </Stack>

      {editing !== null && (
        <OpeningBalanceModal account={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
};
