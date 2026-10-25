import { t } from '@/shared/i18n/t';
import {
  IconBuildingBank,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
  IconUser,
} from '@tabler/icons-react';
import {
  ChoiceCard,
  ChoiceGroup,
} from '@/features/billing/components/sessions/movement/ChoiceCard';
import type { PaymentSource } from '../types';
import { CHOICE_GRID } from './choiceGrid';

const SOURCES: Array<{
  source: PaymentSource;
  label: () => string;
  hint: () => string;
  icon: React.ReactNode;
}> = [
  {
    source: 'drawer',
    label: () => t('Cash drawer'),
    hint: () => t('Cash from this register.'),
    icon: <IconCash size={18} />,
  },
  {
    source: 'owner_pocket',
    label: () => t('My own pocket'),
    hint: () => t('You paid with your own money.'),
    icon: <IconUser size={18} />,
  },
  {
    source: 'bank',
    label: () => t('Bank'),
    hint: () => t('Paid from the bank.'),
    icon: <IconBuildingBank size={18} />,
  },
  {
    source: 'card',
    label: () => t('Card'),
    hint: () => t('Paid by card.'),
    icon: <IconCreditCard size={18} />,
  },
  {
    source: 'online',
    label: () => t('Online'),
    hint: () => t('Paid by an online transfer.'),
    icon: <IconDeviceMobile size={18} />,
  },
];

export interface PaymentSourceChoiceProps {
  /** The accessible name of the group of cards. */
  label: string;
  value: PaymentSource | null;
  onChange: (source: PaymentSource) => void;
  isMobile: boolean;
}

/** Where the money for a payment comes from: the drawer, the owner's pocket, the bank, a card or online. */
export const PaymentSourceChoice = ({
  label,
  value,
  onChange,
  isMobile,
}: PaymentSourceChoiceProps) => (
  <ChoiceGroup label={label} style={CHOICE_GRID}>
    {SOURCES.map((option) => (
      <ChoiceCard
        key={option.source}
        label={option.label()}
        hint={option.hint()}
        icon={option.icon}
        selected={value === option.source}
        allowed
        tall={isMobile}
        onSelect={() => onChange(option.source)}
      />
    ))}
  </ChoiceGroup>
);
