import { describe, it, expect } from 'vitest';
import { SETTINGS_SECTIONS, getVisibleSettingsSections } from '../settingsSections';

describe('settingsSections desktop filtering', () => {
  it('includes the backup section in SETTINGS_SECTIONS with desktopOnly flag', () => {
    const backupSection = SETTINGS_SECTIONS.find((s) => s.id === 'backup');
    expect(backupSection).toBeDefined();
    expect(backupSection?.desktopOnly).toBe(true);
  });

  it('filters out desktopOnly sections when isDesktop is false (Web environment)', () => {
    const visibleOnWeb = getVisibleSettingsSections(false);
    expect(visibleOnWeb.some((s) => s.id === 'backup')).toBe(false);
  });

  it('includes desktopOnly sections when isDesktop is true (Tauri desktop environment)', () => {
    const visibleOnDesktop = getVisibleSettingsSections(true);
    expect(visibleOnDesktop.some((s) => s.id === 'backup')).toBe(true);
  });
});
