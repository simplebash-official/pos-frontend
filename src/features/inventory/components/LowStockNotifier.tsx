import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { ROUTES } from '@/constants';
import { useLowStockProducts } from '../hooks/useProducts';

/**
 * Notifies once when a product first crosses its low-stock threshold.
 *
 * `notifiedProductIds` is module scope, not a ref, so a StrictMode double
 * mount (or a remount on auth flip) doesn't re-announce a product that was
 * already flagged — the same rationale as syncNotifications.ts's guards.
 */
const notifiedProductIds = new Set<string>();

export const LowStockNotifier = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: lowStockProducts } = useLowStockProducts();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const currentIds = new Set(lowStockProducts.map((p) => p.id));

    // Don't flag every already-low product the moment the app loads —
    // only react to a product newly crossing the threshold during this
    // session. The set still seeds so future recoveries can re-notify.
    if (isFirstRun.current) {
      currentIds.forEach((id) => notifiedProductIds.add(id));
      isFirstRun.current = false;
      return;
    }

    lowStockProducts.forEach((product) => {
      if (notifiedProductIds.has(product.id)) {
        return;
      }
      notifiedProductIds.add(product.id);
      dispatch(
        addNotification({
          id: `low-stock-${product.id}`,
          category: 'inventory',
          actionIconType: 'box',
          priority: 'urgent',
          title: 'Low Stock Alert',
          message: `${product.name} is low on stock (${product.stockQuantity} left).`,
          link: ROUTES.INVENTORY,
        })
      );
    });

    notifiedProductIds.forEach((id) => {
      if (!currentIds.has(id)) {
        notifiedProductIds.delete(id);
      }
    });
  }, [isAuthenticated, lowStockProducts, dispatch]);

  return null;
};
