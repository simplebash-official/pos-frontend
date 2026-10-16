import { t } from '@/shared/i18n/t';
import type { LabelCoverageRow, LabelJob } from '../types';

/** 1 label / 2 labels, in the person's language. */
export const labelCount = (count: number): string =>
  `${count} ${count === 1 ? t('label') : t('labels')}`;

/** How a recorded print left the computer, in plain words. */
export const howItPrinted = (job: LabelJob): string => {
  if (job.action === 'download') return t('Saved as a PDF file');
  const dpi = job.dpi === null ? '' : ` · ${job.dpi} dpi`;
  return job.method === 'direct' && job.printerName !== null
    ? `${job.printerName}${dpi}`
    : `${t('Print window')}${dpi}`;
};

/** A job's result as a word and the status colour token of its dot. */
export const outcomeView = (job: LabelJob): { label: string; color: string } => {
  switch (job.outcome) {
    case 'failed':
      return { label: t('Did not print'), color: 'var(--status-error)' };
    case 'rendered':
      return { label: t('No answer from the printer'), color: 'var(--status-warn)' };
    case 'sent':
      return job.action === 'download'
        ? { label: t('Saved'), color: 'var(--status-ok)' }
        : { label: t('Printed'), color: 'var(--status-ok)' };
  }
};

/** One line on a product's labels, for the "Needs labels" list. */
export const coverageLine = (
  row: LabelCoverageRow,
  formatDate: (iso: string) => string
): string => {
  switch (row.status) {
    case 'never':
      return t('Never labelled');
    case 'needed':
      return `${row.receivedSinceLabel} ${t('new since the last label')}`;
    case 'labelled':
      return row.lastLabelledAt === null
        ? t('Labelled')
        : `${t('Labelled')} ${formatDate(row.lastLabelledAt)}`;
    case null:
      return t('Out of stock');
  }
};
