import { useCallback } from 'react';
import { useCreateCustomer } from '@/features/customers';
import { useAppDispatch } from '@/store/hooks';
import { addItem, type CartItem } from '@/store/slices/cartSlice';
import { resolveOrCreateCustomer } from '../lib/resolveOrCreateCustomer';
import { useCartCustomer } from './useCart';

/**
 * Puts a repair or print job on the bill. When the bill has no customer yet, the job's customer is
 * attached too: looked up by phone (or created) on the server in the background, so adding the
 * line stays instant and the customer appears a moment later.
 */
export const useServiceJobCart = () => {
  const dispatch = useAppDispatch();
  const { customerId, attachCustomer } = useCartCustomer();
  const { mutateAsync: createCustomerAsync } = useCreateCustomer();

  return useCallback(
    (line: CartItem, customerName: string, customerPhone: string) => {
      dispatch(addItem(line));
      if (!customerName || (customerId !== null && customerId !== '')) return;
      void resolveOrCreateCustomer(customerName, customerPhone, createCustomerAsync)
        .then((customer) => {
          if (customer) {
            attachCustomer(
              customer.key,
              customer.name,
              customer.primaryPhone,
              customer.address,
              customer.outstandingBalanceCents
            );
          } else {
            attachCustomer(null, customerName, customerPhone);
          }
        })
        .catch(() => attachCustomer(null, customerName, customerPhone));
    },
    [dispatch, customerId, attachCustomer, createCustomerAsync]
  );
};
