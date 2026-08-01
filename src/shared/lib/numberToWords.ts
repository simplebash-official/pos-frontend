/**
 * Converts monetary amount in cents to formal words in Sri Lankan Rupees.
 * Example: 8000000 -> "Sri Lankan Rupees Eighty Thousand Only"
 * Example: 8000050 -> "Sri Lankan Rupees Eighty Thousand and Cents Fifty Only"
 */
export function numberToWordsRupees(amountCents: number): string {
  if (amountCents <= 0) return 'Sri Lankan Rupees Zero Only';

  const totalRupees = Math.floor(amountCents / 100);
  const cents = amountCents % 100;

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertBelowThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) {
      const rem = n % 10;
      return tens[Math.floor(n / 10)] + (rem > 0 ? ` ${ones[rem]}` : '');
    }
    const hundredRem = n % 100;
    return `${ones[Math.floor(n / 100)]} Hundred${hundredRem > 0 ? ` ${convertBelowThousand(hundredRem)}` : ''}`;
  }

  function convertNumber(n: number): string {
    if (n === 0) return 'Zero';

    const lakh = Math.floor(n / 100000);
    let remainder = n % 100000;

    const thousand = Math.floor(remainder / 1000);
    remainder = remainder % 1000;

    const parts: string[] = [];

    if (lakh > 0) {
      parts.push(`${convertBelowThousand(lakh)} Lakh`);
    }
    if (thousand > 0) {
      parts.push(`${convertBelowThousand(thousand)} Thousand`);
    }
    if (remainder > 0) {
      parts.push(convertBelowThousand(remainder));
    }

    return parts.join(' ');
  }

  const rupeeText = convertNumber(totalRupees);
  let result = `Sri Lankan Rupees ${rupeeText}`;

  if (cents > 0) {
    const centsText = convertBelowThousand(cents);
    result += ` and Cents ${centsText}`;
  }

  return `${result} Only`;
}
