import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Anchor,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import {
  IconCash,
  IconFrame,
  IconNote,
  IconPrinter,
  IconReceipt,
  IconShieldCheck,
  IconTool,
  IconUser,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { ROUTES } from '@/constants';
import { CustomerChoiceCard } from '@/features/customers/components/CustomerChoiceCard';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { AssigneeSection } from '@/features/employees/components/AssigneeSection';
import { DrawerCard, Figure, KpiStrip, KpiTile } from '@/shared/components/drawer';
import { ItemCountBadge } from '@/shared/components/ticket-items/ItemCountBadge';
import { JobWarrantiesPanel } from '@/shared/components/ticket-items/JobWarrantiesPanel';
import { PromisedDatePicker } from '@/shared/components/PromisedDatePicker';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { NOTE_MAX, type PrintJobEditor } from '../hooks/usePrintJobEditor';
import { printJobTypeLabel } from '../lib/jobTypeLabels';
import type { PrintJob, PrintJobType } from '../types';
import { PrintItemsEditor } from './PrintItemsEditor';
import { WantedFrames } from './WantedFrames';

/** The form's id, so the panel's pinned Save button can submit it from outside. */
export const PRINT_JOB_FORM_ID = 'print-job-form';

const JOB_TYPES: PrintJobType[] = [
  'mug',
  't-shirt',
  'handbill',
  'banner',
  'photo-framing',
  'custom',
];

export interface PrintJobEditFormProps {
  editor: PrintJobEditor;
  /** The job being changed; `null` for a new order. */
  job: PrintJob | null;
}

/** The print job form, laid out as cards on the side panel's canvas. */
export const PrintJobEditForm = ({ editor, job }: PrintJobEditFormProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    form,
    drafts,
    setDrafts,
    frames,
    setFrames,
    frameProblem,
    tried,
    setNestedOpen,
    pickerOpen,
    setPickerOpen,
    rework,
    workLocked,
    totals,
    workProblem,
    hasStockPart,
    orderQuantity,
    priced,
    profitCents,
    payoutCents,
    capped,
    priceHint,
    statusOptions,
  } = editor;
  const noteLength = form.values.note.trim().length;

  return (
    <>
      <form
        id={PRINT_JOB_FORM_ID}
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
              <KpiTile icon={<IconUsers size={18} />} color="grape" label={t('Operator earns')}>
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

          <DrawerCard label={t('Order')} icon={<IconPrinter size={14} />}>
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, xs: 2 }}>
                <Select
                  label={t('Print Item / Service Type')}
                  data={JOB_TYPES.map((type) => ({ value: type, label: printJobTypeLabel(type) }))}
                  allowDeselect={false}
                  required
                  comboboxProps={{ zIndex: 400 }}
                  {...form.getInputProps('jobType')}
                />
                <NumberInput
                  label={t('Quantity (Units)')}
                  min={1}
                  allowDecimal={false}
                  thousandSeparator=","
                  required
                  {...form.getInputProps('quantity')}
                />
              </SimpleGrid>

              <PromisedDatePicker
                label={t('Promised ready by')}
                value={form.values.promisedReadyAt}
                onChange={(next) => form.setFieldValue('promisedReadyAt', next)}
                onNestedWindowChange={setNestedOpen}
                leading={
                  <Select
                    label={t('Job Order Status')}
                    data={statusOptions}
                    allowDeselect={false}
                    required
                    comboboxProps={{ zIndex: 400 }}
                    description={
                      job !== null &&
                      job.billedInvoiceNumber !== undefined &&
                      job.status !== 'delivered'
                        ? t('Billed. Set it to Delivered when the customer collects it.')
                        : !rework && hasStockPart && job !== null && job.status !== 'delivered'
                          ? t(
                              "Use 'Update & bill' below to hand it back: its parts from stock leave stock with the bill."
                            )
                          : undefined
                    }
                    {...form.getInputProps('status')}
                  />
                }
              />
            </Stack>
          </DrawerCard>

          {form.values.jobType === 'photo-framing' && (
            <DrawerCard label={t('Frames wanted')} icon={<IconFrame size={14} />}>
              <Stack gap="sm">
                <WantedFrames
                  frames={frames}
                  onChange={setFrames}
                  readOnly={workLocked}
                  showProblems={tried}
                />
                {tried && frameProblem !== null && (
                  <Text size="sm" c="red" role="alert">
                    {frameProblem}
                  </Text>
                )}
              </Stack>
            </DrawerCard>
          )}

          <DrawerCard
            label={t('Items and service fees')}
            icon={<IconTool size={14} />}
            action={<ItemCountBadge count={drafts.length} />}
          >
            <Stack gap="md">
              <PrintItemsEditor
                drafts={drafts}
                onChange={setDrafts}
                rework={rework}
                readOnly={workLocked}
                showProblems={tried}
                totals={totals}
                orderQuantity={orderQuantity}
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
                  <Text size="sm">
                    {t('Its items are locked. Void the invoice to change them.')}
                  </Text>
                </Alert>
              )}
              {workLocked && job !== null && !rework && job.status === 'delivered' && (
                <JobWarrantiesPanel
                  job={{ printJobKey: job.id }}
                  onNestedWindowChange={setNestedOpen}
                />
              )}
            </Stack>
          </DrawerCard>

          <DrawerCard label={t('Note')} icon={<IconNote size={14} />}>
            <Textarea
              label={t('Note (optional)')}
              description={t('Only your staff see this. It is not printed for the customer.')}
              placeholder={t('e.g. Logo on both sides, deliver in two boxes')}
              autosize
              minRows={2}
              maxRows={6}
              {...form.getInputProps('note')}
            />
            <Text size="xs" c={noteLength > NOTE_MAX ? 'red' : 'dimmed'} ta="right" mt={4}>
              {noteLength} / {NOTE_MAX}
            </Text>
          </DrawerCard>

          <DrawerCard
            label={t('Designer and printer, profit split')}
            icon={<IconUsers size={14} />}
          >
            <AssigneeSection
              label={t('Assign Designer / Machine Operator')}
              placeholder={t('Select an employee for this print job...')}
              profitNoun="job"
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
