import { formatMoney } from '@/shared/lib/money';
import type { CashMovement, CashMovementType } from '../../types';

export const printCashMovementVoucher = (movement: CashMovement) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';

  const typeLabels: Record<CashMovementType, string> = {
    petty_expense: 'PAY-OUT / SMALL EXPENSE',
    rent_and_bills: 'PAY-OUT / RENT AND BILLS',
    staff_payment: 'PAY-OUT / STAFF PAYMENT',
    supplier_payment: 'PAY-OUT / SUPPLIER PAYMENT',
    owner_withdrawal: 'OWNER WITHDRAWAL (DRAWINGS)',
    add_cash: 'PAY-IN / CASH ADDITION',
    cash_drop: 'CASH DROP',
    no_sale: 'NO SALE DRAWER OPEN',
  };
  // Words typed by the cashier end up inside HTML, so they are escaped first.
  const esc = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const row = (label: string, value: string | undefined, bold = true) =>
    value
      ? `<div class="row"><span>${label}</span><span${bold ? ' class="bold"' : ''}>${esc(value)}</span></div>`
      : '';
  const category = movement.customLabel
    ? `${movement.categoryName}: ${movement.customLabel}`
    : movement.categoryName;
  const payeeLabel =
    movement.movementType === 'add_cash'
      ? 'Received from:'
      : movement.movementType === 'owner_withdrawal'
        ? 'Taken by:'
        : 'Paid to:';
  const period =
    movement.periodStart && movement.periodEnd
      ? `${movement.periodStart} to ${movement.periodEnd}`
      : undefined;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cash Voucher ${movement.movementNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #000;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .title { font-size: 16px; margin-bottom: 4px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .amount { font-size: 18px; margin: 8px 0; }
          .signatures { margin-top: 35px; }
          .sig-line { border-top: 1px solid #000; width: 45%; text-align: center; font-size: 11px; padding-top: 4px; }
          .sig-row { display: flex; justify-content: space-between; margin-top: 30px; }
          @media print {
            body { width: 100%; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="center bold title">CASH TRANSACTION VOUCHER</div>
        <div class="center bold">${typeLabels[movement.movementType]}</div>
        <div class="divider"></div>
        <div class="row"><span>Voucher No:</span><span class="bold">${movement.movementNumber}</span></div>
        <div class="row"><span>Date & Time:</span><span>${new Date(movement.createdAt).toLocaleString()}</span></div>
        <div class="row"><span>Terminal ID:</span><span>${movement.terminalId}</span></div>
        ${movement.sessionKey ? `<div class="row"><span>Session:</span><span>${movement.sessionKey}</span></div>` : ''}
        ${movement.recordedLate ? `<div class="row"><span class="bold">** RECORDED LATE **</span></div>` : ''}
        <div class="divider"></div>
        <div class="row amount"><span class="bold">AMOUNT:</span><span class="bold">${formatMoney(movement.amountCents)}</span></div>
        <div class="divider"></div>
        ${row('For:', category)}
        ${row(payeeLabel, movement.payeeName)}
        ${row('Period:', period, false)}
        ${row('Reference:', movement.referenceNo, false)}
        ${row('Note:', movement.note, false)}
        <div class="row"><span>Recorded By:</span><span>${movement.recordedByNameSnapshot}</span></div>
        ${movement.approvedByNameSnapshot ? `<div class="row"><span>Authorized By:</span><span class="bold">${movement.approvedByNameSnapshot}</span></div>` : ''}
        
        <div class="signatures">
          <div class="sig-row">
            <div class="sig-line">Recipient / Handover</div>
            <div class="sig-line">Authorized Signatory</div>
          </div>
        </div>
      </body>
    </html>
  `;

  document.body.appendChild(iframe);
  iframe.srcdoc = html;
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1000);
    }, 250);
  };
};
