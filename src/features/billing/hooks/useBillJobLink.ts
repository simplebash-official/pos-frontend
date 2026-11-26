import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { notify } from '@/shared/notify';
import { t } from '@/shared/i18n/t';
import { billBlocker } from '@/shared/lib/billBlocker';
import { getErrorMessage } from '@/shared/lib/error';
import { printBillBlockerNotice } from '@/features/print-jobs';
import { fetchPrintJob } from '@/features/print-jobs/api/printJobsApi';
import { billBlockerNotice } from '@/features/repairs';
import { fetchRepairJob } from '@/features/repairs/api/repairsApi';
import type { CartItem } from '@/store/slices/cartSlice';
import { printCartLine, printJobTitle } from '../lib/printCartLine';
import { repairCartLine } from '../lib/repairCartLine';
import { useServiceJobCart } from './useServiceJobCart';

/** A linked job once it is loaded: either why it cannot be billed, or the line it adds. */
type LinkedJob =
  | { blocked: { title: string; message: string } }
  | {
      blocked: null;
      line: CartItem;
      customerName: string;
      customerPhone: string;
      added: { title: string; message: string };
    };

const loadRepair = async (id: string): Promise<LinkedJob> => {
  const job = await fetchRepairJob(id);
  const blocker = billBlocker(job);
  if (blocker !== null) return { blocked: billBlockerNotice(blocker, job) };
  return {
    blocked: null,
    line: repairCartLine(job),
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    added: {
      title: t('Repair added to the bill'),
      message: `${job.ticketNumber}: ${job.deviceModel}`,
    },
  };
};

const loadPrintJob = async (id: string): Promise<LinkedJob> => {
  const job = await fetchPrintJob(id);
  const blocker = billBlocker(job);
  if (blocker !== null) return { blocked: printBillBlockerNotice(blocker, job) };
  return {
    blocked: null,
    line: printCartLine(job),
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    added: {
      title: t('Print job added to the bill'),
      message: `${job.ticketNumber}: ${printJobTitle(job)}`,
    },
  };
};

/**
 * The Repairs and Print Jobs pages send the cashier to the Billing Counter with
 * `?billRepair=<repair id>` or `?billPrint=<print job id>`: put that job on the bill, then take
 * the link out of the address.
 */
export const useBillJobLink = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const billRepairId = searchParams.get('billRepair');
  const billPrintId = searchParams.get('billPrint');
  const addServiceJob = useServiceJobCart();
  // Attaching the customer changes `addServiceJob` while the address is still being cleared; the
  // fetch below must not start over for that, so it reads the latest one from here.
  const addServiceJobRef = useRef(addServiceJob);
  useEffect(() => {
    addServiceJobRef.current = addServiceJob;
  });

  useEffect(() => {
    let link: { param: string; load: () => Promise<LinkedJob>; failedTitle: string };
    if (billRepairId) {
      link = {
        param: 'billRepair',
        load: () => loadRepair(billRepairId),
        failedTitle: t('Could not add the repair'),
      };
    } else if (billPrintId) {
      link = {
        param: 'billPrint',
        load: () => loadPrintJob(billPrintId),
        failedTitle: t('Could not add the print job'),
      };
    } else {
      return;
    }
    let isCancelled = false;
    const clearParam = () =>
      setSearchParams(
        (params) => {
          params.delete(link.param);
          return params;
        },
        { replace: true }
      );
    link
      .load()
      .then((job) => {
        if (isCancelled) return;
        if (job.blocked !== null) {
          notify.error(job.blocked);
        } else {
          addServiceJobRef.current(job.line, job.customerName, job.customerPhone);
          notify.success(job.added);
        }
        clearParam();
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        notify.error({ title: link.failedTitle, message: getErrorMessage(err) });
        clearParam();
      });
    return () => {
      isCancelled = true;
    };
  }, [billRepairId, billPrintId, setSearchParams]);
};
