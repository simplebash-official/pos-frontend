import { useCallback, useState } from 'react';
import { getInitialShopCodeState } from './shopCode';

/**
 * Shop code state shared by the desktop and mobile login forms. `locked` means the code came from a
 * `?shop=` link and the field stays hidden until the person taps "Change" or a login attempt fails
 * (so a mistyped link can never strand them).
 */
export const useLoginShopCode = (search: string) => {
  const [state] = useState(() => getInitialShopCodeState(search));
  const [shopCode, setShopCode] = useState(state.shopCode);
  const [locked, setLocked] = useState(state.locked);
  const [focusField, setFocusField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeShop = useCallback(() => {
    setLocked(false);
    setFocusField(true);
  }, []);
  const revealField = useCallback(() => setLocked(false), []);

  return { shopCode, setShopCode, locked, focusField, error, setError, changeShop, revealField };
};
