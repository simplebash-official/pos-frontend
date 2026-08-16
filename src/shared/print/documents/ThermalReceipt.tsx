import React from 'react';
import type { PrintPayload } from '@/features/billing/lib/buildPrintPayload';
import { PAPER_PROFILES, PaperProfile } from '../paperProfiles';
import { formatMoney } from '@/shared/lib/money';

export interface ThermalReceiptProps {
  payload: PrintPayload;
  paperProfile?: PaperProfile;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  payload,
  paperProfile = PAPER_PROFILES.thermal80,
}) => {
  const { invoice, shop, formattedDate, formattedTime } = payload;
  const is58mm = paperProfile.id === 'thermal58';

  const containerStyle: React.CSSProperties = {
    fontFamily: paperProfile.fontFamily,
    width: `${paperProfile.widthMm}mm`,
    maxWidth: `${paperProfile.widthMm}mm`,
    margin: '0 auto',
    padding: `${paperProfile.paddingMm}mm`,
    fontSize: `${paperProfile.fontSizePx}px`,
    lineHeight: paperProfile.lineHeight,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    WebkitFontSmoothing: 'antialiased',
  };

  const dividerDashed: React.CSSProperties = {
    borderTop: '1px dashed #000000',
    margin: '6px 0',
  };

  const dividerSolid: React.CSSProperties = {
    borderTop: '1px solid #000000',
    margin: '6px 0',
  };

  const rowFlex: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      {payload.settings.showLogoOnReceipt && shop.logoBase64 && (
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <img src={shop.logoBase64} alt={shop.tradingName} style={{ maxHeight: '36px' }} />
        </div>
      )}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: is58mm ? '13px' : '15px' }}>
        {shop.tradingName || shop.legalName}
      </div>
      <div style={{ textAlign: 'center', fontSize: '10px' }}>{shop.addressLines.join(', ')}</div>
      <div style={{ textAlign: 'center', fontSize: '10px' }}>
        Tel: {shop.primaryPhone} {shop.secondaryPhone ? `| ${shop.secondaryPhone}` : ''}
      </div>

      <div style={dividerDashed} />

      {/* Meta Info */}
      <div style={rowFlex}>
        <span>Invoice #:</span>
        <span style={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</span>
      </div>
      <div style={rowFlex}>
        <span>Date:</span>
        <span>
          {formattedDate} {formattedTime}
        </span>
      </div>
      <div style={rowFlex}>
        <span>Cashier:</span>
        <span>{invoice.cashierName || 'Cashier'}</span>
      </div>
      <div style={rowFlex}>
        <span>Customer:</span>
        <span>{invoice.customerName || 'Walk-in Guest'}</span>
      </div>
      {invoice.customerPhone && (
        <div style={rowFlex}>
          <span>Phone:</span>
          <span>{invoice.customerPhone}</span>
        </div>
      )}

      <div style={dividerDashed} />

      {/* Line Items */}
      {invoice.items.map((item, idx) => (
        <div key={item.id || idx} style={{ marginBottom: '4px' }}>
          <div style={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
            {idx + 1}. {item.name} {item.sku ? `(${item.sku})` : ''}
          </div>
          {item.sourceTicketNumber && (
            <div style={{ fontSize: '10px', paddingLeft: '8px' }}>
              Ticket: {item.sourceTicketNumber}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px' }}>
            <span>
              {item.quantity} × {formatMoney(item.unitPriceCents)}
            </span>
            <span style={{ fontWeight: 'bold' }}>{formatMoney(item.totalCents)}</span>
          </div>
          {item.discountCents > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingLeft: '8px',
                fontSize: '10px',
              }}
            >
              <span>Line Discount</span>
              <span>-{formatMoney(item.discountCents)}</span>
            </div>
          )}
        </div>
      ))}

      <div style={dividerDashed} />

      {/* Totals */}
      <div style={rowFlex}>
        <span>Subtotal:</span>
        <span>{formatMoney(payload.subtotalCents)}</span>
      </div>
      {payload.discountCents > 0 && (
        <div style={rowFlex}>
          <span>Order Discount:</span>
          <span>-{formatMoney(payload.discountCents)}</span>
        </div>
      )}
      {payload.taxCents > 0 && (
        <div style={rowFlex}>
          <span>VAT / Tax:</span>
          <span>{formatMoney(payload.taxCents)}</span>
        </div>
      )}

      <div style={dividerSolid} />

      <div style={{ ...rowFlex, fontSize: is58mm ? '13px' : '15px', fontWeight: 'bold' }}>
        <span>TOTAL:</span>
        <span>{formatMoney(payload.totalCents)}</span>
      </div>

      <div style={dividerSolid} />

      {/* Payment details */}
      <div style={rowFlex}>
        <span>Payment Method:</span>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {invoice.paymentMethod}
        </span>
      </div>

      {invoice.paymentMethod === 'cash' && (
        <>
          <div style={rowFlex}>
            <span>Tendered:</span>
            <span>{formatMoney(invoice.tenderedAmountCents || 0)}</span>
          </div>
          <div style={{ ...rowFlex, fontWeight: 'bold' }}>
            <span>CHANGE DUE:</span>
            <span>{formatMoney(invoice.changeDueCents || 0)}</span>
          </div>
        </>
      )}

      {invoice.paymentMethod === 'card' && (invoice.cardLast4 || invoice.cardRef) && (
        <div style={rowFlex}>
          <span>Card Last 4:</span>
          <span style={{ fontWeight: 'bold' }}>•••• {invoice.cardLast4 || invoice.cardRef}</span>
        </div>
      )}

      {invoice.paymentMethod === 'split' &&
        invoice.splitPayments &&
        invoice.splitPayments.length > 0 && (
          <div style={{ marginTop: '2px', marginBottom: '2px' }}>
            {invoice.splitPayments.map((sp, idx) => (
              <div key={sp.id || idx} style={rowFlex}>
                <span>
                  Split ({sp.method.toUpperCase()}
                  {sp.method === 'card' && (sp.cardLast4 || sp.reference)
                    ? ` •••• ${sp.cardLast4 || sp.reference}`
                    : ''}
                  ):
                </span>
                <span>{formatMoney(sp.amountCents)}</span>
              </div>
            ))}
          </div>
        )}

      {invoice.isCredit && (
        <div style={{ ...rowFlex, fontWeight: 'bold', color: '#B45309' }}>
          <span>STATUS:</span>
          <span>UNPAID CREDIT</span>
        </div>
      )}

      <div style={dividerDashed} />

      {/* Warranty & Terms */}
      <div
        style={{ textAlign: 'center', fontSize: '9.5px', marginTop: '4px', whiteSpace: 'pre-line' }}
      >
        {payload.warrantyText || shop.defaultWarrantyText}
      </div>

      <div style={dividerDashed} />

      {/* Barcode / QR Simulation Code & Thank You */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div
          style={{
            fontFamily: 'monospace',
            letterSpacing: '2px',
            fontWeight: 'bold',
            fontSize: '13px',
          }}
        >
          * {invoice.invoiceNumber} *
        </div>
        <div style={{ fontWeight: 'bold', marginTop: '4px' }}>
          {shop.receiptFooterText || 'Thank you for your business!'}
        </div>
      </div>

      {/* Auto-cutter feed lines */}
      <div style={{ height: '35px' }} />
    </div>
  );
};
