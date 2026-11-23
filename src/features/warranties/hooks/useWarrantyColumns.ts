import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLayoutTier } from '@/shared/hooks/useResponsive';

export type WarrantyColumns = 1 | 2 | 3 | 4;

const OPTIONS: readonly WarrantyColumns[] = [1, 2, 3, 4];

/** The most cards a row can hold at each screen size; a phone always has one. */
const MOST_PER_ROW = { mobile: 1, tablet: 2, desktop: 4 } as const;

const isColumns = (value: number): value is WarrantyColumns =>
  OPTIONS.some((option) => option === value);

/**
 * How many warranty cards sit in a row: the number the person chose (kept on this computer),
 * limited to what the screen can hold, and the choices the screen offers.
 */
export const useWarrantyColumns = () => {
  const tier = useLayoutTier();
  const [chosen, setChosen] = useLocalStorage<WarrantyColumns>({
    key: STORAGE_KEYS.WARRANTY_COLUMNS,
    defaultValue: 2,
    deserialize: (raw) => {
      const value = Number(raw);
      return isColumns(value) ? value : 2;
    },
  });
  const most = MOST_PER_ROW[tier];
  return {
    perRow: Math.min(chosen, most),
    choices: OPTIONS.filter((option) => option <= most),
    choose: setChosen,
  };
};
