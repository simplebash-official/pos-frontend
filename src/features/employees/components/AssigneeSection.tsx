import { useState } from 'react';
import { Alert, Badge, Group, NumberInput, Paper, Select, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCoin, IconPercentage } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { t } from '@/shared/i18n/t';
import { formatMoney, toCents } from '@/shared/lib/money';
import { USER_ROLES } from '@/constants/roles';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useAllEmployees } from '../hooks/useEmployees';
import type { Employee, SplitType } from '../types';
import { OwnerProfileModal } from './OwnerProfileModal';

/** The form fields this section owns (a repair and a print job share them). */
export interface AssigneeValues {
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValueRupeesOrPercent?: number | string;
}

/** What the server worked out for the job as typed so far. */
export interface AssigneeFigures {
  /** `false` until the job has a price, so there is no profit to split yet. */
  priced: boolean;
  /** What to say instead of the payout while it is not known yet. */
  hint: string | null;
  profitCents: number;
  payoutCents: number;
  capped: boolean;
}

export interface AssigneeSectionProps {
  heading: string;
  label: string;
  placeholder: string;
  /** Which word the "capped" notice uses for the job. */
  profitNoun: 'repair' | 'job';
  values: AssigneeValues;
  onChange: (changes: AssigneeValues) => void;
  figures: AssigneeFigures;
  /** A window opened from here is open (the window around it must not close on Escape). */
  onNestedWindowChange: (open: boolean) => void;
}

/** The list's own entry for an admin without an employee profile yet; never a real key. */
const ADD_ME = 'add-me';

/** What the form holds once someone is picked: an owner takes no split, anyone else their usual one. */
const selection = (employee: Employee): AssigneeValues =>
  employee.role === 'owner'
    ? {
        assignedEmployeeId: employee.key,
        assignedEmployeeName: employee.name,
        splitType: undefined,
        splitValueRupeesOrPercent: undefined,
      }
    : {
        // The server finds an employee by this business key, not the local id.
        assignedEmployeeId: employee.key,
        assignedEmployeeName: employee.name,
        splitType: employee.defaultSplitType,
        splitValueRupeesOrPercent:
          employee.defaultSplitType === 'fixed'
            ? employee.defaultSplitValue / 100
            : employee.defaultSplitValue,
      };

/** Picks who does the job, with the owner able to pick themselves and no commission for them. */
export const AssigneeSection = ({
  heading,
  label,
  placeholder,
  profitNoun,
  values,
  onChange,
  figures,
  onNestedWindowChange,
}: AssigneeSectionProps) => {
  const { data: employees } = useAllEmployees();
  const user = useAppSelector(selectAuthUser);
  const [adding, setAdding] = useState(false);
  // Bumped when the list was used to open a window, so it forgets the entry it was left showing.
  const [listKey, setListKey] = useState(0);

  const mine =
    user === null ? undefined : employees.find((e) => e.login?.username === user.username);
  const canAddMe = user !== null && user.role === USER_ROLES.ADMIN && mine === undefined;
  const chosen = employees.find((e) => e.key === values.assignedEmployeeId);
  const chosenIsOwner = chosen !== undefined && chosen.role === 'owner';
  const hasSplit = values.assignedEmployeeId !== undefined && values.assignedEmployeeId !== '';

  const setWindowOpen = (open: boolean) => {
    setAdding(open);
    onNestedWindowChange(open);
  };

  const handleChange = (value: string | null) => {
    if (value === ADD_ME) {
      setListKey((key) => key + 1);
      setWindowOpen(true);
      return;
    }
    const employee = employees.find((e) => e.key === value);
    onChange(
      employee === undefined
        ? { assignedEmployeeId: '', assignedEmployeeName: '' }
        : selection(employee)
    );
  };

  const options = [
    { value: '', label: t('Unassigned (No Employee)') },
    ...(canAddMe ? [{ value: ADD_ME, label: t('Add me as a technician') }] : []),
    ...(mine === undefined ? [] : [{ value: mine.key, label: `${t('Me')} (${mine.name})` }]),
    ...employees
      .filter((e) => e.key !== mine?.key)
      .map((e) => ({ value: e.key, label: `${e.name} (${e.role.toUpperCase()})` })),
  ];

  const splitCents =
    values.splitType === 'fixed'
      ? toCents(Number(values.splitValueRupeesOrPercent))
      : Number(values.splitValueRupeesOrPercent);

  return (
    <Paper p="sm" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text size="xs" fw={700} tt="uppercase" c="blue">
            {heading}
          </Text>
          {!chosenIsOwner && (
            <Badge color="blue" variant="light" size="xs">
              {t('Commission Payout')}
            </Badge>
          )}
        </Group>

        <Select
          key={listKey}
          label={label}
          placeholder={placeholder}
          data={options}
          value={values.assignedEmployeeId}
          onChange={handleChange}
        />

        {chosenIsOwner && (
          <Text size="sm" c="dimmed">
            {t('You keep the whole profit, so no commission is paid.')}
          </Text>
        )}

        {hasSplit && !chosenIsOwner && (
          <>
            <Group align="flex-end" grow mt="xs">
              <div>
                <Text size="xs" fw={600} mb={4}>
                  {t('Split Type')}
                </Text>
                <SegmentedToggle
                  value={values.splitType}
                  onChange={(value) => onChange({ splitType: value as SplitType })}
                  data={[
                    {
                      label: (
                        <Group gap={4} justify="center" wrap="nowrap">
                          <IconPercentage size={14} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap' }}>{t('Percentage (%)')}</span>
                        </Group>
                      ),
                      value: 'percentage',
                    },
                    {
                      label: (
                        <Group gap={4} justify="center" wrap="nowrap">
                          <IconCoin size={14} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap' }}>{t('Fixed (LKR)')}</span>
                        </Group>
                      ),
                      value: 'fixed',
                    },
                  ]}
                  fullWidth
                  size="sm"
                />
              </div>

              <NumberInput
                label={
                  values.splitType === 'percentage'
                    ? t('Employee Split (%)')
                    : t('Fixed Commission (LKR)')
                }
                min={0}
                max={values.splitType === 'percentage' ? 100 : 1000000}
                value={values.splitValueRupeesOrPercent}
                onChange={(value) => onChange({ splitValueRupeesOrPercent: value })}
              />
            </Group>

            {figures.capped && (
              <Alert
                color="orange"
                icon={<IconAlertTriangle size={16} />}
                title={t('Fixed Commission Capped')}
                p="xs"
              >
                {t('Fixed split (')}
                {formatMoney(splitCents)}
                {profitNoun === 'repair'
                  ? t(') exceeds the repair net profit (')
                  : t(') exceeds the job net profit (')}
                {formatMoney(figures.profitCents)}
                {t('). Commission will be capped at the total profit.')}
              </Alert>
            )}

            <Paper p="xs" withBorder mt="xs">
              <Group justify="space-between">
                <Text size="xs" fw={600}>
                  {t('Employee Commission Payout:')}
                </Text>
                <Text fw={800} size="md" c={figures.priced ? 'blue' : 'dimmed'}>
                  {figures.priced ? formatMoney(figures.payoutCents) : figures.hint}
                </Text>
              </Group>
            </Paper>
          </>
        )}
      </Stack>

      <OwnerProfileModal
        opened={adding}
        onClose={() => setWindowOpen(false)}
        onCreated={(employee) => {
          onChange(selection(employee));
          setWindowOpen(false);
        }}
      />
    </Paper>
  );
};
