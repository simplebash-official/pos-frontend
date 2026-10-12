import dayjs from 'dayjs';

// Characters a file system rejects (or that would split a path), plus whitespace.
const UNSAFE_FILE_CHARS = /[\\/:*?"<>|\s]+/g;

// `<number>-<YYYYMMDD-HHmmss>`, without the extension. The same name is the download file name
// and the print document title, so "Save as PDF" in the print dialog proposes the same name.
export const pdfFileName = (identifier: string, now: Date = new Date()): string => {
  const safe = identifier.replace(UNSAFE_FILE_CHARS, '-').replace(/^-+|-+$/g, '');
  return `${safe}-${dayjs(now).format('YYYYMMDD-HHmmss')}`;
};

export const downloadPdfBlob = (blob: Blob, baseName: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${baseName}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
