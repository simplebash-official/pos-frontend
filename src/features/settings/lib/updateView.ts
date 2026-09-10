// Pure view helpers for the Settings → Updates section, kept out of the
// component so they can be unit-tested under the node test runner.

/**
 * Download progress as a whole percent, or null when the total size is not
 * known yet (the progress bar shows an indeterminate state instead).
 */
export const downloadPercent = (downloaded: number, total: number): number | null => {
  if (!(total > 0)) return null;
  return Math.min(100, Math.max(0, Math.round((downloaded / total) * 100)));
};

/** A short, non-technical version label, e.g. "Version 1.4.0". */
export const versionLabel = (version: string): string =>
  version ? `Version ${version}` : 'Version unknown';
