// Contract between the service worker (`src/sw.ts`) and the page. Kept free of
// imports because the service worker bundle includes this file.

/** BroadcastChannel the installing service worker reports download progress on. */
export const UPDATE_PROGRESS_CHANNEL = 'pos-sw-update-progress';

/** Files downloaded so far / files this update needs to download in total. */
export interface UpdateProgress {
  done: number;
  total: number;
}
