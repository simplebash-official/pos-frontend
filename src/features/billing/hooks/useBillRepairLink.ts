import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { notify } from '@/shared/notify';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { billBlocker, billBlockerNotice } from '@/features/repairs';
import { fetchRepairJob } from '@/features/repairs/api/repairsApi';
import { repairCartLine } from '../lib/repairCartLine';
import { useServiceJobCart } from './useServiceJobCart';

/**
 * The Repairs page sends the cashier to the Billing Counter with `?billRepair=<repair id>`: put that
 * job on the bill, then take the link out of the address.
 */
export const useBillRepairLink = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const billRepairId = searchParams.get('billRepair');
  const addServiceJob = useServiceJobCart();
  // Attaching the customer changes `addServiceJob` while the address is still being cleared; the
  // fetch below must not start over for that, so it reads the latest one from here.
  const addServiceJobRef = useRef(addServiceJob);
  useEffect(() => {
    addServiceJobRef.current = addServiceJob;
  });

  useEffect(() => {
    if (!billRepairId) return;
    let isCancelled = false;
    const clearParam = () =>
      setSearchParams(
        (params) => {
          params.delete('billRepair');
          return params;
        },
        { replace: true }
      );
    fetchRepairJob(billRepairId)
      .then((job) => {
        if (isCancelled) return;
        const blocker = billBlocker(job);
        if (blocker !== null) {
          notify.error({ ...billBlockerNotice(blocker, job.ticketNumber) });
        } else {
          addServiceJobRef.current(repairCartLine(job), job.customerName, job.customerPhone);
          notify.success({
            title: t('Repair added to the bill'),
            message: `${job.ticketNumber}: ${job.deviceModel}`,
          });
        }
        clearParam();
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        notify.error({
          title: t('Could not add the repair'),
          message: getErrorMessage(err),
        });
        clearParam();
      });
    return () => {
      isCancelled = true;
    };
  }, [billRepairId, setSearchParams]);
};
