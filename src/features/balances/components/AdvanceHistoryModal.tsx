import React from 'react';
import { Modal, Skeleton, Stack, Table, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useStaffAdvanceDetail } from '../hooks/useBalances';
import type { StaffAdvance } from '../types';

export interface AdvanceHistoryModalProps {
  advance: StaffAdvance;
  onClose: () => void;
}

/** What one staff member was given and what has been taken back from their pay. */
export const AdvanceHistoryModal: React.FC<AdvanceHistoryModalProps> = ({ advance, onClose }) => {
  const isMobile = useIsMobile();
  const { data, isLoading } = useStaffAdvanceDetail(advance.employeeKey);

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Advances')} — ${advance.name}`}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      {isLoading || data === undefined ? (
        <Skeleton h={140} />
      ) : (
        <Stack gap="md">
          <Text size="sm" fw={600}>
            {t('Given')}
          </Text>
          {data.given.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('No advances recorded.')}
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={420}>
              <Table verticalSpacing="xs">
                <Table.Tbody>
                  {data.given.map((g) => (
                    <Table.Tr key={g.number}>
                      <Table.Td>{formatDate(g.date)}</Table.Td>
                      <Table.Td>
                        <Text size="sm">{g.categoryName}</Text>
                        <Text size="xs" c="dimmed">
                          {g.number}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(g.amountCents)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
          <Text size="sm" fw={600}>
            {t('Taken back from pay')}
          </Text>
          {data.recoveries.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('Nothing taken back yet.')}
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={420}>
              <Table verticalSpacing="xs">
                <Table.Tbody>
                  {data.recoveries.map((r) => (
                    <Table.Tr key={r.key}>
                      <Table.Td>{formatDate(r.recoveredOn)}</Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {r.note ?? ''}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(r.amountCents)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
          <Text size="sm">
            {t('Still owes')} <b>{formatMoney(data.summary.outstandingCents)}</b>
          </Text>
        </Stack>
      )}
    </Modal>
  );
};
