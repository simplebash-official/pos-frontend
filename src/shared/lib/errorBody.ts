// A request made with `responseType: 'blob'` receives even its *error* body as a
// Blob. Reading it back as JSON lets the server's own message (e.g. "That barcode
// is too narrow to scan") reach the person instead of a bare status text.

const readBlobText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

/**
 * The parsed JSON of an error response body. Anything that is not a JSON blob
 * (already-parsed JSON, a PDF blob, an unreadable body) is returned unchanged.
 */
export const readErrorBody = async (data: unknown): Promise<unknown> => {
  if (!(data instanceof Blob) || !data.type.includes('json')) return data;
  try {
    return JSON.parse(await readBlobText(data));
  } catch {
    return data;
  }
};
