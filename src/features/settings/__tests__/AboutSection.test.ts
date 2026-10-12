import { describe, it, expect } from 'vitest';
import { AboutSection, UpdatesSection } from '../components/sections/AboutSection';
import { SETTINGS_SECTIONS, getVisibleSettingsSections } from '../settingsSections';
import { versionLabel, downloadPercent } from '../lib/updateView';
import { env } from '@/config/env';

describe('AboutSection Component & Configuration Contracts', () => {
  it('exports AboutSection component function', () => {
    expect(typeof AboutSection).toBe('function');
  });

  it('exports UpdatesSection as an alias to AboutSection for backward compatibility', () => {
    expect(UpdatesSection).toBe(AboutSection);
  });

  it('registers the about section in SETTINGS_SECTIONS with expected metadata', () => {
    const section = SETTINGS_SECTIONS.find((s) => s.id === 'about');
    expect(section).toBeDefined();
    expect(section?.label).toBe('About');
    expect(section?.shortLabel).toBe('About');
    expect(section?.description).toBe('Version, build details and system information');
    expect(section?.comingSoon).toBeFalsy();
    expect(section?.disabled).toBeFalsy();
  });

  it('is visible in both web and desktop environments', () => {
    const webSections = getVisibleSettingsSections(false);
    expect(webSections.some((s) => s.id === 'about')).toBe(true);

    const desktopSections = getVisibleSettingsSections(true);
    expect(desktopSections.some((s) => s.id === 'about')).toBe(true);
  });

  it('reads build environment identity correctly', () => {
    expect(typeof env.appVersion).toBe('string');
    expect(typeof env.buildTime).toBe('string');
    expect(typeof env.commit).toBe('string');
    expect(typeof env.appName).toBe('string');
  });

  it('preserves updateView utility functions', () => {
    expect(versionLabel('1.0.0')).toBe('Version 1.0.0');
    expect(versionLabel('')).toBe('Version unknown');
    expect(downloadPercent(50, 100)).toBe(50);
    expect(downloadPercent(0, 0)).toBeNull();
  });
});
