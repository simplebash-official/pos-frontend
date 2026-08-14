import React from 'react';
import type { PrintPayload } from '@/features/billing/lib/buildPrintPayload';
import { PAPER_PROFILES, PaperProfile } from '../paperProfiles';
import { formatMoney } from '@/shared/lib/money';

export interface A4InvoiceProps {
  payload: PrintPayload;
  paperProfile?: PaperProfile;
}

export const A4Invoice: React.FC<A4InvoiceProps> = ({
  payload,
  paperProfile = PAPER_PROFILES.a4,
}) => {
  const { invoice, shop, copyDesignation, isDuplicate, formattedDate, formattedTime } = payload;
  const isPaid = invoice.status === 'paid' && !invoice.isCredit;
  const isCredit = invoice.isCredit || invoice.status === 'pending';

  const containerStyle: React.CSSProperties = {
    fontFamily: paperProfile.fontFamily,
    width: `${paperProfile.widthMm}mm`,
    minHeight: `${paperProfile.isContinuous ? 'auto' : '297mm'}`,
    margin: '0 auto',
    padding: `${paperProfile.paddingMm}mm`,
    fontSize: `${paperProfile.fontSizePx}px`,
    lineHeight: paperProfile.lineHeight,
    color: '#0F1115',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    position: 'relative',
    WebkitFontSmoothing: 'antialiased',
  };

  return (
    <div style={containerStyle} className="a4-invoice-container">
      {/* Inline Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #FFFFFF;
          }
          .a4-invoice-container {
            width: 100% !important;
            padding: ${paperProfile.paddingMm}mm !important;
          }
          thead {
            display: table-header-group;
          }
          tr, .totals-block, .signature-block, .terms-block {
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Header Band */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #3D4EAC',
          paddingBottom: '16px',
          marginBottom: '20px',
          position: 'relative',
        }}
      >
        {/* Left: Shop Branding */}
        <div style={{ flex: 1, paddingRight: '20px' }}>
          {shop.logoBase64 ? (
            <img
              src={shop.logoBase64}
              alt={shop.tradingName}
              style={{ maxHeight: '48px', marginBottom: '8px' }}
            />
          ) : (
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3D4EAC' }}>
              {shop.tradingName || shop.legalName}
            </div>
          )}
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            {shop.legalName}
          </div>
          {shop.addressLines.map((line, idx) => (
            <div key={idx} style={{ fontSize: '11px', color: '#5B6270' }}>
              {line}
            </div>
          ))}
          <div style={{ fontSize: '11px', color: '#5B6270', marginTop: '2px' }}>
            Phone: {shop.primaryPhone} {shop.secondaryPhone ? `| ${shop.secondaryPhone}` : ''}
          </div>
          {shop.email && (
            <div style={{ fontSize: '11px', color: '#5B6270' }}>
              Email: {shop.email} | Web: {shop.website}
            </div>
          )}
          {(shop.businessRegNo || (shop.isVatRegistered && shop.vatNo)) && (
            <div style={{ fontSize: '10.5px', color: '#6C737F', marginTop: '4px' }}>
              {shop.businessRegNo && <span>Reg No: {shop.businessRegNo} </span>}
              {shop.isVatRegistered && shop.vatNo && <span>| VAT No: {shop.vatNo}</span>}
            </div>
          )}
        </div>

        {/* Right: Meta & Status Stamp */}
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#3D4EAC',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            INVOICE
          </div>

          <table style={{ marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: '2px 8px',
                    color: '#5B6270',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  Invoice No:
                </td>
                <td
                  style={{
                    padding: '2px 0 2px 8px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    textAlign: 'right',
                  }}
                >
                  {invoice.invoiceNumber}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: '2px 8px',
                    color: '#5B6270',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  Date:
                </td>
                <td style={{ padding: '2px 0 2px 8px', fontWeight: 600, textAlign: 'right' }}>
                  {formattedDate} {formattedTime}
                </td>
              </tr>
              {invoice.dueDate && (
                <tr>
                  <td
                    style={{
                      padding: '2px 8px',
                      color: '#C2334D',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    Due Date:
                  </td>
                  <td
                    style={{
                      padding: '2px 0 2px 8px',
                      fontWeight: 700,
                      color: '#C2334D',
                      textAlign: 'right',
                    }}
                  >
                    {invoice.dueDate}
                  </td>
                </tr>
              )}
              <tr>
                <td
                  style={{
                    padding: '2px 8px',
                    color: '#5B6270',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  Cashier:
                </td>
                <td style={{ padding: '2px 0 2px 8px', textAlign: 'right' }}>
                  {invoice.cashierName || 'Cashier'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Status Stamp */}
          <div
            style={{
              position: 'absolute',
              top: '0px',
              right: '180px',
              border: `2px solid ${isPaid ? '#0E9F6E' : isCredit ? '#C77700' : '#6C737F'}`,
              color: isPaid ? '#0E9F6E' : isCredit ? '#C77700' : '#6C737F',
              padding: '4px 12px',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.1em',
              transform: 'rotate(-8deg)',
              opacity: 0.85,
              textAlign: 'center',
            }}
          >
            {isPaid ? 'PAID' : isCredit ? 'CREDIT' : 'PENDING'}
            {isDuplicate && (
              <div style={{ fontSize: '9px', letterSpacing: '0.05em' }}>DUPLICATE</div>
            )}
          </div>
        </div>
      </div>

      {/* Party Blocks (Bill To & Payment Summary) */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {/* Bill To */}
        <div
          style={{
            flex: 1,
            border: '1px solid #E4E6EB',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: '#FAFAFB',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#5B6270',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}
          >
            BILL TO
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F1115' }}>
            {invoice.customerName || 'Walk-in Customer'}
          </div>
          {invoice.customerPhone && (
            <div
              style={{ fontSize: '11.5px', color: '#33429A', marginTop: '2px', fontWeight: 600 }}
            >
              Phone: {invoice.customerPhone}
            </div>
          )}
          {invoice.customerAddress && (
            <div style={{ fontSize: '11px', color: '#5B6270', marginTop: '2px' }}>
              Address: {invoice.customerAddress}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div
          style={{
            flex: 1,
            border: '1px solid #E4E6EB',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: '#FAFAFB',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#5B6270',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}
          >
            PAYMENT SUMMARY
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              marginBottom: '3px',
            }}
          >
            <span style={{ color: '#5B6270' }}>Payment Method:</span>
            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
              {invoice.paymentMethod}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              marginBottom: '3px',
            }}
          >
            <span style={{ color: '#5B6270' }}>Amount Tendered:</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatMoney(invoice.tenderedAmountCents || invoice.totalCents)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <span style={{ color: '#5B6270' }}>Balance Due:</span>
            <span
              style={{
                fontWeight: 700,
                color: isCredit ? '#C77700' : '#0E9F6E',
                fontFamily: 'monospace',
              }}
            >
              {isCredit ? formatMoney(invoice.totalCents) : 'Rs. 0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Item Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          fontSize: '11.5px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#F4F5F7',
              borderTop: '1px solid #D2D6DC',
              borderBottom: '1px solid #D2D6DC',
            }}
          >
            <th
              style={{
                padding: '8px 6px',
                textAlign: 'center',
                width: '30px',
                fontWeight: 700,
                color: '#5B6270',
              }}
            >
              #
            </th>
            <th
              style={{ padding: '8px 8px', textAlign: 'left', fontWeight: 700, color: '#5B6270' }}
            >
              Description
            </th>
            <th
              style={{
                padding: '8px 8px',
                textAlign: 'center',
                width: '50px',
                fontWeight: 700,
                color: '#5B6270',
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: '8px 8px',
                textAlign: 'right',
                width: '100px',
                fontWeight: 700,
                color: '#5B6270',
              }}
            >
              Unit Price
            </th>
            <th
              style={{
                padding: '8px 8px',
                textAlign: 'right',
                width: '80px',
                fontWeight: 700,
                color: '#5B6270',
              }}
            >
              Discount
            </th>
            <th
              style={{
                padding: '8px 8px',
                textAlign: 'right',
                width: '110px',
                fontWeight: 700,
                color: '#5B6270',
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id || index} style={{ borderBottom: '1px solid #E4E6EB' }}>
              <td style={{ padding: '8px 6px', textAlign: 'center', color: '#9AA1AC' }}>
                {index + 1}
              </td>
              <td style={{ padding: '8px 8px' }}>
                <div style={{ fontWeight: 600, color: '#0F1115' }}>{item.name}</div>
                {item.sku && (
                  <div style={{ fontSize: '10px', color: '#6C737F', fontFamily: 'monospace' }}>
                    SKU: {item.sku}
                  </div>
                )}
                {item.sourceTicketNumber && (
                  <div style={{ fontSize: '10px', color: '#33429A', marginTop: '1px' }}>
                    Service Ticket: {item.sourceTicketNumber}{' '}
                    {item.assignedEmployeeName ? `· Technician: ${item.assignedEmployeeName}` : ''}
                  </div>
                )}
              </td>
              <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600 }}>
                {item.quantity}
              </td>
              <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'monospace' }}>
                {formatMoney(item.unitPriceCents)}
              </td>
              <td
                style={{
                  padding: '8px 8px',
                  textAlign: 'right',
                  color: item.discountCents > 0 ? '#C2334D' : '#9AA1AC',
                  fontFamily: 'monospace',
                }}
              >
                {item.discountCents > 0 ? `-${formatMoney(item.discountCents)}` : '-'}
              </td>
              <td
                style={{
                  padding: '8px 8px',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {formatMoney(item.totalCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Stack */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div style={{ width: '280px' }} className="totals-block">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '3px 0',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#5B6270' }}>Subtotal:</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {formatMoney(payload.subtotalCents)}
            </span>
          </div>

          {payload.discountCents > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                fontSize: '12px',
                color: '#C2334D',
              }}
            >
              <span>Order Discount:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                -{formatMoney(payload.discountCents)}
              </span>
            </div>
          )}

          {payload.taxCents > 0 && payload.settings.showTaxColumn && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#5B6270' }}>VAT ({Math.round(shop.vatRate * 100)}%):</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {formatMoney(payload.taxCents)}
              </span>
            </div>
          )}

          {/* Grand Total Filled Accent Band */}
          <div
            style={{
              backgroundColor: '#3D4EAC',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '8px 12px',
              marginTop: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
              GRAND TOTAL
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'monospace' }}>
              {formatMoney(payload.totalCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div
        style={{
          border: '1px solid #E4E6EB',
          borderRadius: '6px',
          padding: '8px 12px',
          backgroundColor: '#FAFAFB',
          marginBottom: '20px',
          fontSize: '11px',
          color: '#33429A',
          fontWeight: 600,
        }}
      >
        <span style={{ color: '#5B6270', fontWeight: 400 }}>Amount in words: </span>
        {payload.amountInWords}
      </div>

      {/* Invoice Notes if present */}
      {invoice.notes && (
        <div
          style={{
            border: '1px solid #E4E6EB',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '20px',
            fontSize: '11px',
          }}
        >
          <span style={{ fontWeight: 700, color: '#5B6270' }}>Notes: </span>
          <span>{invoice.notes}</span>
        </div>
      )}

      {/* Terms & Warranty Block */}
      <div
        style={{ borderTop: '1px solid #E4E6EB', paddingTop: '12px', marginBottom: '20px' }}
        className="terms-block"
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#5B6270',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          TERMS & WARRANTY POLICY
        </div>
        <div
          style={{ fontSize: '10px', color: '#5B6270', whiteSpace: 'pre-line', lineHeight: 1.4 }}
        >
          {payload.warrantyText}
        </div>
      </div>

      {/* Bank Transfer Details (if credit or online) */}
      {(isCredit || invoice.paymentMethod === 'online' || payload.settings.showBankDetails) &&
        shop.bankName && (
          <div
            style={{
              backgroundColor: '#F4F5F7',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '24px',
              fontSize: '10.5px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
              BANK TRANSFER DETAILS
            </div>
            <div>
              Bank: {shop.bankName} | Branch: {shop.bankBranch}
            </div>
            <div>
              Account Name: {shop.accountName} | Account No:{' '}
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{shop.accountNumber}</span>
            </div>
          </div>
        )}

      {/* Signature Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '40px',
          marginBottom: '30px',
          padding: '0 20px',
        }}
        className="signature-block"
      >
        <div style={{ textAlign: 'center', width: '200px' }}>
          <div style={{ borderBottom: '1px solid #9AA1AC', height: '1px', marginBottom: '6px' }} />
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F1115' }}>
            Authorised Signature
          </div>
          <div style={{ fontSize: '9.5px', color: '#6C737F' }}>for {shop.tradingName}</div>
        </div>
        <div style={{ textAlign: 'center', width: '200px' }}>
          <div style={{ borderBottom: '1px solid #9AA1AC', height: '1px', marginBottom: '6px' }} />
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F1115' }}>Received By</div>
          <div style={{ fontSize: '9.5px', color: '#6C737F' }}>Customer Name / Date</div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #E4E6EB',
          paddingTop: '8px',
          textAlign: 'center',
          fontSize: '9.5px',
          color: '#6C737F',
        }}
      >
        <div>
          {shop.tradingName} · Tel: {shop.primaryPhone} · Email: {shop.email}
        </div>
        <div style={{ marginTop: '2px', fontWeight: 600 }}>
          {copyDesignation} · This is a computer-generated invoice.
        </div>
      </div>
    </div>
  );
};
