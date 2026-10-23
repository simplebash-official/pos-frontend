// Shrinks a phone photo before it is sent: a receipt needs to be readable, not 12 megapixels. The
// server accepts at most 1 MB, so the quality is lowered until the photo fits.

/** Longest side, in pixels, a receipt photo is shrunk to. */
const MAX_EDGE = 1600;
/** JPEG qualities to try, best first. */
const QUALITIES = [0.85, 0.75, 0.65, 0.55, 0.45];
/** What the server accepts, less a margin for the base64 and the check. */
export const MAX_UPLOAD_BYTES = 900_000;

/** The size that fits `width` x `height` inside `maxEdge` on its longest side, keeping the shape. */
export const fitWithin = (
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } => {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

/** The bytes of a blob as base64 text. */
export const blobToBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

const toJpeg = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

/** A JPEG of the picked image that fits the upload limit, or `null` when the file is not a readable image. */
export const shrinkImage = async (file: File): Promise<Blob | null> => {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context === null) return null;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const quality of QUALITIES) {
    const blob = await toJpeg(canvas, quality);
    if (blob !== null && blob.size <= MAX_UPLOAD_BYTES) return blob;
  }
  return null;
};
