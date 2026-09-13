import { describe, it, expect } from 'vitest';
import { SETTINGS_SECTIONS, getVisibleSettingsSections } from '../settingsSections';

describe('settingsSections desktop filtering', () => {
  it('includes the backup and benchmark sections in SETTINGS_SECTIONS with desktopOnly flag', () => {
    const backupSection = SETTINGS_SECTIONS.find((s) => s.id === 'backup');
    expect(backupSection).toBeDefined();
    expect(backupSection?.desktopOnly).toBe(true);

    const benchmarkSection = SETTINGS_SECTIONS.find((s) => s.id === 'benchmark');
    expect(benchmarkSection).toBeDefined();
    expect(benchmarkSection?.desktopOnly).toBe(true);
  });

  it('filters out desktopOnly sections when isDesktop is false (Web environment)', () => {
    const visibleOnWeb = getVisibleSettingsSections(false);
    expect(visibleOnWeb.some((s) => s.id === 'backup')).toBe(false);
    expect(visibleOnWeb.some((s) => s.id === 'benchmark')).toBe(false);
  });

  it('includes desktopOnly sections when isDesktop is true (Tauri desktop environment)', () => {
    const visibleOnDesktop = getVisibleSettingsSections(true);
    expect(visibleOnDesktop.some((s) => s.id === 'backup')).toBe(true);
    expect(visibleOnDesktop.some((s) => s.id === 'benchmark')).toBe(true);
  });

  it('marks branding, bank-details, printing, and templates as comingSoon and disabled', () => {
    const comingSoonSectionIds = ['branding', 'bank-details', 'printing', 'templates'];

    comingSoonSectionIds.forEach((id) => {
      const section = SETTINGS_SECTIONS.find((s) => s.id === id);
      expect(section).toBeDefined();
      expect(section?.comingSoon).toBe(true);
      expect(section?.disabled).toBe(true);
    });

    const activeSectionIds = ['shop-profile', 'updates', 'backup', 'benchmark'];
    activeSectionIds.forEach((id) => {
      const section = SETTINGS_SECTIONS.find((s) => s.id === id);
      expect(section).toBeDefined();
      expect(section?.comingSoon).toBeFalsy();
      expect(section?.disabled).toBeFalsy();
    });
  });
});

