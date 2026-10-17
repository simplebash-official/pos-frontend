import { formatMoney } from '@/shared/lib/money';
import type { CashMovement, CashMovementType, ZReportResponse } from '../../types';

export const printCashMovementVoucher = (movement: CashMovement) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';

  const typeLabels: Record<CashMovementType, string> = {
    pay_in: 'PAY-IN / CASH ADDITION',
    pay_out_expense: 'PAY-OUT / PETTY EXPENSE',
    pay_out_supplier: 'PAY-OUT / SUPPLIER PAYMENT',
    owner_withdrawal: 'OWNER WITHDRAWAL (DRAWINGS)',
    cash_drop: 'CASH DROP TO SAFE',
    drawer_open_no_sale: 'NO SALE DRAWER OPEN',
  };

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
        <div class="row"><span>Reason:</span><span class="bold">${movement.reason}</span></div>
        ${movement.recipientOrSource ? `<div class="row"><span>Recipient/Source:</span><span class="bold">${movement.recipientOrSource}</span></div>` : ''}
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

export const printZReportHtml = (report: ZReportResponse) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';

  const recon = report.cashReconciliation;
  const sess = report.session;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Z-Report ${sess.sessionNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #000;
            width: 80mm;
            margin: 0 auto;
            padding: 8px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .title { font-size: 16px; margin-bottom: 2px; }
          .subtitle { font-size: 13px; margin-bottom: 6px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-top: 2px solid #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .section-title { font-size: 13px; font-weight: bold; margin: 8px 0 4px 0; }
          .highlight { font-size: 14px; font-weight: bold; }
          @media print {
            body { width: 100%; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="center bold title">REGISTER Z-REPORT</div>
        <div class="center subtitle">End of Session Summary</div>
        <div class="divider"></div>
        <div class="row"><span>Session:</span><span class="bold">${sess.sessionNumber}</span></div>
        <div class="row"><span>Terminal ID:</span><span>${sess.terminalId}</span></div>
        <div class="row"><span>Cashier:</span><span class="bold">${sess.cashierNameSnapshot}</span></div>
        <div class="row"><span>Opened:</span><span>${new Date(sess.openedAt).toLocaleString()}</span></div>
        <div class="row"><span>Closed:</span><span>${sess.closedAt ? new Date(sess.closedAt).toLocaleString() : 'Open'}</span></div>
        <div class="double-divider"></div>

        <div class="section-title">SALES SUMMARY</div>
        <div class="row"><span>Gross Sales:</span><span>${formatMoney(report.grossSalesCents)}</span></div>
        <div class="row"><span>Returns / Credit Notes:</span><span>-${formatMoney(report.returnsCents)}</span></div>
        <div class="row"><span>Discounts Given:</span><span>-${formatMoney(report.discountCents)}</span></div>
        <div class="divider"></div>
        <div class="row highlight"><span>NET SALES:</span><span>${formatMoney(report.netSalesCents)}</span></div>
        <div class="row"><span>Invoices Issued:</span><span>${report.totalInvoicesCount}</span></div>
        <div class="double-divider"></div>

        <div class="section-title">PAYMENTS COLLECTED</div>
        ${report.paymentMethods
          .map(
            (pm) =>
              `<div class="row"><span>${pm.method.toUpperCase()} (${pm.count}):</span><span>${formatMoney(pm.totalCents)}</span></div>`
          )
          .join('')}
        <div class="double-divider"></div>

        <div class="section-title">CASH MOVEMENTS</div>
        <div class="row"><span>Pay-Ins (Change added):</span><span>+${formatMoney(recon.payInCents)}</span></div>
        <div class="row"><span>Pay-Outs (Expenses):</span><span>-${formatMoney(recon.payOutCents)}</span></div>
        <div class="row"><span>Cash Refunds:</span><span>-${formatMoney(recon.cashRefundsCents)}</span></div>
        <div class="row"><span>Owner Withdrawals:</span><span>-${formatMoney(recon.ownerWithdrawalsCents)}</span></div>
        <div class="row"><span>Cash Drops to Safe:</span><span>-${formatMoney(recon.cashDropsCents)}</span></div>
        <div class="double-divider"></div>

        <div class="section-title">CASH DRAWER RECONCILIATION</div>
        <div class="row"><span>Opening Float:</span><span>${formatMoney(recon.openingFloatCents)}</span></div>
        <div class="row"><span>Cash Sales:</span><span>+${formatMoney(recon.cashSalesCents)}</span></div>
        <div class="row"><span>Expected Drawer Cash:</span><span class="bold">${formatMoney(recon.expectedCashCents)}</span></div>
        <div class="row highlight"><span>Actual Counted Cash:</span><span>${formatMoney(recon.countedCashCents)}</span></div>
        <div class="divider"></div>
        <div class="row highlight"><span>CASH VARIANCE:</span><span>${formatMoney(recon.varianceCents)}</span></div>
        <div class="divider"></div>
        <div class="row"><span>Retained for Next Shift:</span><span class="bold">${formatMoney(recon.closingFloatCents)}</span></div>
        <div class="row"><span>Safe Deposit / Bank:</span><span class="bold">${formatMoney(recon.safeDepositCents)}</span></div>
        <div class="double-divider"></div>

        <div class="center" style="margin-top: 15px; font-size: 11px;">
          Generated: ${new Date().toLocaleString()}
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
