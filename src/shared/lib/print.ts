/**
 * Helper to trigger print dialog or handle printer communication requests.
 */
export function triggerThermalPrint(elementId: string): void {
  const printElement = document.getElementById(elementId);
  if (!printElement) {
    console.warn(`Print element with ID "${elementId}" not found.`);
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt Print</title>
        <style>
          body {
            font-family: monospace;
            width: 80mm;
            margin: 0;
            padding: 10px;
            font-size: 12px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        ${printElement.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
