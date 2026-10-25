import { describe, it, expect } from 'vitest';
import {
  SETTINGS_PERMISSIONS,
  SETTINGS_SECTIONS,
  canOpenSettings,
  getVisibleSettingsSections,
  sectionsForAccess,
} from '../settingsSections';

describe('settingsSections desktop filtering', () => {
  it('includes the backup and benchmark sections in SETTINGS_SECTIONS with desktopOnly flag', () => {
    const backupSection = SETTINGS_SECTIONS.find((s) => s.id === 'backup');
    expect(backupSection).toBeDefined();
    expect(backupSection?.desktopOnly).toBe(true);

    const benchmarkSection = SETTINGS_SECTIONS.find((s) => s.id === 'benchmark');
    expect(benchmarkSection).toBeDefined();
    expect(benchmarkSection?.desktopOnly).toBe(true);
  });

  it('registers the activity log as a desktop-only section', () => {
    const logsSection = SETTINGS_SECTIONS.find((s) => s.id === 'logs');
    expect(logsSection).toBeDefined();
    expect(logsSection?.desktopOnly).toBe(true);
    expect(logsSection?.comingSoon).toBeFalsy();
    expect(getVisibleSettingsSections(false).some((s) => s.id === 'logs')).toBe(false);
    expect(getVisibleSettingsSections(true).some((s) => s.id === 'logs')).toBe(true);
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

  it('marks branding, bank-details, and templates as comingSoon and disabled', () => {
    const comingSoonSectionIds = ['branding', 'bank-details', 'templates'];

    comingSoonSectionIds.forEach((id) => {
      const section = SETTINGS_SECTIONS.find((s) => s.id === id);
      expect(section).toBeDefined();
      expect(section?.comingSoon).toBe(true);
      expect(section?.disabled).toBe(true);
    });

    // Printing is open: it holds the A4 invoice design (Classic / Modern) switch.
    const activeSectionIds = [
      'shop-profile',
      'register-shifts',
      'printing',
      'document-designs',
      'about',
      'backup',
      'benchmark',
    ];
    activeSectionIds.forEach((id) => {
      const section = SETTINGS_SECTIONS.find((s) => s.id === id);
      expect(section).toBeDefined();
      expect(section?.comingSoon).toBeFalsy();
      expect(section?.disabled).toBeFalsy();
    });
  });

  it('configures the register-shifts section with correct labels and metadata', () => {
    const regSection = SETTINGS_SECTIONS.find((s) => s.id === 'register-shifts');
    expect(regSection).toBeDefined();
    expect(regSection?.label).toBe('Registers & Shifts');
    expect(regSection?.shortLabel).toBe('Registers');
    expect(regSection?.description).toBe(
      'Multi-device shift sharing and cash drawer isolation mode'
    );
    expect(regSection?.desktopOnly).toBeFalsy();
    expect(getVisibleSettingsSections(false).some((s) => s.id === 'register-shifts')).toBe(true);
    expect(getVisibleSettingsSections(true).some((s) => s.id === 'register-shifts')).toBe(true);
  });

  it('configures the about section with correct labels and visibility on both web and desktop', () => {
    const aboutSection = SETTINGS_SECTIONS.find((s) => s.id === 'about');
    expect(aboutSection).toBeDefined();
    expect(aboutSection?.label).toBe('About');
    expect(aboutSection?.shortLabel).toBe('About');
    expect(aboutSection?.desktopOnly).toBeFalsy();
    expect(getVisibleSettingsSections(false).some((s) => s.id === 'about')).toBe(true);
    expect(getVisibleSettingsSections(true).some((s) => s.id === 'about')).toBe(true);
  });
});

describe('settingsSections access', () => {
  const web = () => getVisibleSettingsSections(false);
  const admin = { isAdmin: true, permissions: [] };
  const manager = { isAdmin: false, permissions: ['payees:manage', 'expenses:manage'] };
  const cashier = { isAdmin: false, permissions: ['cash_movements:create'] };

  it('gives only the payees section a permission, so every other section stays Admin-only', () => {
    expect(SETTINGS_SECTIONS.filter((s) => s.permission !== undefined).map((s) => s.id)).toEqual([
      'payees',
    ]);
    expect(SETTINGS_PERMISSIONS).toEqual(['payees:manage']);
  });

  it('shows an Admin every section', () => {
    expect(sectionsForAccess(web(), admin)).toEqual(web());
  });

  it('shows someone with payees:manage only the landlords and companies section', () => {
    expect(sectionsForAccess(web(), manager).map((s) => s.id)).toEqual(['payees']);
  });

  it('shows someone without it nothing', () => {
    expect(sectionsForAccess(web(), cashier)).toEqual([]);
  });

  it('lets an Admin or a payee manager into Settings, and nobody else', () => {
    expect(canOpenSettings(admin)).toBe(true);
    expect(canOpenSettings(manager)).toBe(true);
    expect(canOpenSettings(cashier)).toBe(false);
  });
});
