import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { LabelElement, LabelSample, TextElement } from '../types';

/** The example values a design is previewed with, in the person's language. */
export const buildLabelSample = (): LabelSample => ({
  name: t('Sample item'),
  sku: 'SKU-0001',
  category: t('Category'),
  priceCents: 125000,
  code: '2000000000015',
});

/** The text a text item prints for the sample (used by the on-screen canvas). */
export const sampleText = (element: TextElement, sample: LabelSample, shopName: string): string => {
  switch (element.source) {
    case 'productName':
      return sample.name;
    case 'price':
      return formatMoney(sample.priceCents);
    case 'sku':
      return sample.sku;
    case 'code':
      return sample.code;
    case 'category':
      return sample.category;
    case 'shopName':
      return shopName;
    case 'customText':
      return element.customText ?? '';
  }
};

export const isTextElement = (element: LabelElement): element is TextElement =>
  element.type === 'text';
