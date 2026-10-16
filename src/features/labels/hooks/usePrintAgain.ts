import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/lib/error';
import { fetchLabelCoverage } from '../api/labelsApi';
import { rowsFromJob, type LabelRow } from '../lib/printJob';
import type { LabelJob } from '../types';

/**
 * Turns a past print into rows to print again with today's details (names,
 * prices and the units still in stock), telling the person what was left out.
 */
export const usePrintAgain = (onRows: (rows: LabelRow[]) => void) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const printAgain = async (job: LabelJob) => {
    setLoadingKey(job.key);
    try {
      const productKeys = [...new Set(job.items.map((item) => item.productKey))];
      const coverage = await fetchLabelCoverage({
        page: 1,
        limit: productKeys.length,
        productKeys,
      });
      const { rows, missing } = rowsFromJob(
        job,
        coverage.items.map((row) => row.product)
      );
      if (missing > 0) {
        notifications.show({
          title: t('Some items are no longer in your stock list'),
          message: `${missing} ${t('left out of this print.')}`,
          color: 'orange',
        });
      }
      if (rows.length > 0) onRows(rows);
    } catch (error) {
      notifications.show({
        title: t('Could not load that print'),
        message: getErrorMessage(error),
        color: 'red',
      });
    } finally {
      setLoadingKey(null);
    }
  };
  return { printAgain, loadingKey };
};
