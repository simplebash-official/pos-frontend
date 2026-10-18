import type { PackagesStatus } from '../types';

export interface PackagesView {
  /** Mantine colour of the badge. */
  color: string;
  /** English text to translate. */
  label: string;
  /** Shown after the label, when there is a number to show. */
  count: number | null;
  /** A short extra line (English text to translate, or the shell's own error text). */
  hint: string | null;
  /** The hint is the shell's error text and must not be translated. */
  hintIsRaw: boolean;
}

/** How the "custom designs on this computer" line reads for a status from the desktop shell. */
export const packagesView = (packages: PackagesStatus): PackagesView => {
  const view = (
    color: string,
    label: string,
    count: number | null = null,
    hint: string | null = null,
    hintIsRaw = false
  ): PackagesView => ({ color, label, count, hint, hintIsRaw });

  switch (packages.state) {
    case 'upToDate':
      return packages.installed > 0
        ? view('teal', 'Up to date', packages.installed)
        : view('teal', 'Up to date', null, 'Your shop has no custom designs yet.');
    case 'pending':
      return view('blue', 'Downloading', packages.pending, 'They will be ready in a moment.');
    case 'needsAppUpdate':
      return view(
        'orange',
        'Needs an app update',
        packages.needsAppUpdate,
        'Update this app to use these designs.'
      );
    case 'error':
      return view(
        'red',
        'Could not download',
        null,
        packages.lastError ?? 'We will try again after the next sync.',
        packages.lastError !== null
      );
    case 'paused':
      return view('yellow', 'Cloud paused', null, 'Designs already on this computer keep working.');
    case 'notChecked':
      return view('gray', 'Not checked yet');
  }
};
