import { useNavigate } from 'react-router-dom';
import { Alert, Anchor, Select, SimpleGrid, Stack, Text, Textarea, TextInput } from '@mantine/core';
import {
  IconBarcode,
  IconCash,
  IconDeviceMobile,
  IconReceipt,
  IconShieldCheck,
  IconTool,
  IconUser,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { ROUTES } from '@/constants';
import { ItemCountBadge } from '@/shared/components/ticket-items/ItemCountBadge';
import { JobWarrantiesPanel } from '@/shared/components/ticket-items/JobWarrantiesPanel';
import { AssigneeSection } from '@/features/employees/components/AssigneeSection';
import { CustomerChoiceCard } from '@/features/customers/components/CustomerChoiceCard';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { DrawerCard, Figure, KpiStrip, KpiTile } from '@/shared/components/drawer';
import { PromisedDatePicker } from '@/shared/components/PromisedDatePicker';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { RepairEditor } from '../hooks/useRepairEditor';
import { countItems } from '../lib/repairItems';
import type { RepairJob } from '../types';
import { RepairItemsEditor } from './RepairItemsEditor';

/** The form's id, so the panel's pinned Save button can submit it from outside. */
export const REPAIR_FORM_ID = 'repair-form';

export interface RepairEditFormProps {
  editor: RepairEditor;
  /** The job being changed; `null` for a new ticket. */
  job: RepairJob | null;
}

/** The repair form, laid out as cards on the side panel's canvas. */
export const RepairEditForm = ({ editor, job }: RepairEditFormProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    form,
    drafts,
    setDrafts,
    tried,
    setNestedOpen,
    pickerOpen,
    setPickerOpen,
    rework,
    workLocked,
    totals,
    workProblem,
    hasStockPart,
    priced,
    profitCents,
    payoutCents,
    capped,
    priceHint,
    statusOptions,
  } = editor;

  return (
    <>
      <form
        id={REPAIR_FORM_ID}
        noValidate
        onSubmit={form.onSubmit(
          (values) => editor.handleSubmit(values, null),
          (errors) => editor.focusFirstError(Object.keys(errors))
        )}
      >
        <Stack gap="md">
          {!isMobile && (
            <KpiStrip>
              <KpiTile icon={<IconCash size={18} />} color="blue" label={t('Total')}>
                <Figure
                  value={totals === null ? '—' : formatMoney(totals.totals.priceCents)}
                  hint={priced ? t('Customer pays') : (priceHint ?? t('Not priced yet'))}
                  color="blue"
                />
              </KpiTile>
              <KpiTile icon={<IconWallet size={18} />} color="teal" label={t('Profit')}>
                <Figure
                  value={priced ? formatMoney(profitCents) : '—'}
                  hint={t('Only you see this')}
                  color="teal"
                />
              </KpiTile>
              <KpiTile icon={<IconUsers size={18} />} color="grape" label={t('Technician earns')}>
                <Figure
                  value={priced ? formatMoney(payoutCents) : '—'}
                  hint={capped ? t('Capped at the profit') : t('Commission')}
                  color="grape"
                />
              </KpiTile>
            </KpiStrip>
          )}

          <DrawerCard label={t('Customer')} icon={<IconUser size={14} />}>
            <Stack gap="md">
              {job !== null && job.kind.kind === 'warranty_rework' && (
                <Alert color="blue" icon={<IconShieldCheck size={16} />} p="sm">
                  <Text size="sm" fw={700}>
                    {t('Warranty rework: free for the customer')}
                  </Text>
                  <Text size="sm">
                    {t('Redoing job')}{' '}
                    <Text component="span" fw={600}>
                      {job.kind.originalTicketNumber}
                    </Text>{' '}
                    {t('under claim')}{' '}
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (job.kind.kind !== 'warranty_rework') return;
                        navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${job.kind.claimKey}`);
                      }}
                    >
                      {job.kind.claimNumber}
                    </Anchor>
                    {'. '}
                    {t('Mark it delivered when it is handed back; parts used leave stock then.')}
                  </Text>
                </Alert>
              )}

              <CustomerChoiceCard
                customer={
                  form.values.customerKey === ''
                    ? null
                    : { name: form.values.customerName, phone: form.values.customerPhone }
                }
                onChoose={() => {
                  setPickerOpen(true);
                  setNestedOpen(true);
                }}
                required
                error={form.errors.customerKey as string | undefined}
              />
            </Stack>
          </DrawerCard>

          <DrawerCard label={t('Device and problem')} icon={<IconDeviceMobile size={14} />}>
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, xs: 2 }}>
                <TextInput
                  label={t('Device Model')}
                  placeholder={t('e.g. iPhone 13 Pro / Asus ROG Laptop')}
                  required
                  {...form.getInputProps('deviceModel')}
                />
                <TextInput
                  label={t('Serial number or IMEI')}
                  placeholder={t('Optional. Its warranty is found by it later.')}
                  leftSection={<IconBarcode size={16} />}
                  data-barcode-scanner="true"
                  {...form.getInputProps('serialNumber')}
                />
              </SimpleGrid>

              {/* A new ticket is always Received, so only an edit has a status to choose. */}
              <PromisedDatePicker
                label={t('Promised ready by')}
                value={form.values.promisedReadyAt}
                onChange={(next) => form.setFieldValue('promisedReadyAt', next)}
                onNestedWindowChange={setNestedOpen}
                leading={
                  job === null ? undefined : (
                    <Select
                      label={t('Ticket Status')}
                      data={statusOptions}
                      required
                      description={
                        job.billedInvoiceNumber !== undefined && job.status !== 'delivered'
                          ? t('Billed. Set it to Delivered when the customer collects it.')
                          : !rework && hasStockPart && job.status !== 'delivered'
                            ? t(
                                "Use 'Update & bill' below to hand it back: its parts from stock leave stock with the bill."
                              )
                            : undefined
                      }
                      {...form.getInputProps('status')}
                    />
                  )
                }
              />

              <Textarea
                label={t('Issue & Diagnosis Description')}
                placeholder={t('e.g. Broken OLED panel, battery drain issues...')}
                autosize
                minRows={2}
                maxRows={5}
                required
                {...form.getInputProps('issueDescription')}
              />
            </Stack>
          </DrawerCard>

          <DrawerCard
            label={t('Parts and other fees')}
            icon={<IconTool size={14} />}
            action={<ItemCountBadge count={countItems(drafts)} />}
          >
            <Stack gap="md">
              <RepairItemsEditor
                drafts={drafts}
                onChange={setDrafts}
                rework={rework}
                readOnly={workLocked}
                showProblems={tried}
                totals={totals}
                profit={{ priced, profitCents, hint: priceHint }}
                onNestedWindowChange={setNestedOpen}
              />
              {tried && workProblem !== null && (
                <Text size="sm" c="red" role="alert">
                  {workProblem}
                </Text>
              )}
              {job !== null && job.billedInvoiceNumber !== undefined && (
                <Alert color="teal" icon={<IconReceipt size={16} />} p="sm">
                  <Text size="sm" fw={700}>
                    {t('Billed on')} {job.billedInvoiceNumber}
                  </Text>
                  <Text size="sm">{t('Its work is locked. Void the invoice to change it.')}</Text>
                </Alert>
              )}
              {workLocked && job !== null && !rework && job.status === 'delivered' && (
                <JobWarrantiesPanel
                  job={{ repairKey: job.id }}
                  onNestedWindowChange={setNestedOpen}
                />
              )}
            </Stack>
          </DrawerCard>

          <DrawerCard label={t('Technician and profit split')} icon={<IconUsers size={14} />}>
            <AssigneeSection
              label={t('Assign Technician / Employee')}
              placeholder={t('Select an employee for this repair...')}
              profitNoun="repair"
              values={form.values}
              onChange={(changes) => form.setValues(changes)}
              figures={{ priced, hint: priceHint, profitCents, payoutCents, capped }}
              onNestedWindowChange={setNestedOpen}
            />
          </DrawerCard>
        </Stack>
      </form>

      {/* Outside the form: a window opened from here must not submit it. */}
      <CustomerPickerModal
        opened={pickerOpen}
        zIndex={400}
        onClose={() => {
          setPickerOpen(false);
          setNestedOpen(false);
        }}
        onSelectCustomer={(customer) => {
          if (customer !== null) {
            form.setFieldValue('customerKey', customer.key);
            form.setFieldValue('customerName', customer.name);
            form.setFieldValue('customerPhone', customer.primaryPhone);
          }
          setPickerOpen(false);
          setNestedOpen(false);
        }}
      />
    </>
  );
};
