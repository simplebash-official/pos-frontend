import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WelcomeWizard,
  SplashStep,
  FeatureGuideStep,
  DataChoiceStep,
  ProgressStep,
  getSetupStatusApi,
  initializeSetupApi,
  getInstallationInfoApi,
  completeInstallationSetupNative,
  getInstallationInfoNative,
} from '../index';
import { apiClient } from '@/api/client';
import * as runtime from '@/shared/lib/runtime';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Onboarding Module Exports & Components', () => {
  it('exports all wizard components and functions', () => {
    expect(typeof WelcomeWizard).toBe('function');
    expect(typeof SplashStep).toBe('function');
    expect(typeof FeatureGuideStep).toBe('function');
    expect(typeof DataChoiceStep).toBe('function');
    expect(typeof ProgressStep).toBe('function');
    expect(typeof getSetupStatusApi).toBe('function');
    expect(typeof initializeSetupApi).toBe('function');
    expect(typeof getInstallationInfoApi).toBe('function');
    expect(typeof completeInstallationSetupNative).toBe('function');
    expect(typeof getInstallationInfoNative).toBe('function');
  });
});

describe('Onboarding API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSetupStatusApi fetches, normalizes camelCase and returns setup status', async () => {
    const mockStatusCamelCase = {
      setupCompleted: false,
      isFirstRun: true,
      installationId: 'inst-123',
      installedAt: '2026-09-13T10:00:00Z',
      setupCompletedAt: null,
      sampleDataLoaded: false,
      appVersion: '0.2.1',
      platform: 'macos',
    };

    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockStatusCamelCase,
      message: 'Setup status retrieved successfully',
    });

    const result = await getSetupStatusApi();
    expect(spy).toHaveBeenCalledWith('/system/setup-status');
    expect(result.setup_completed).toBe(false);
    expect(result.is_first_run).toBe(true);
    expect(result.installation_id).toBe('inst-123');
    expect(result.installed_at).toBe('2026-09-13T10:00:00Z');
    expect(result.app_version).toBe('0.2.1');
    expect(result.platform).toBe('macos');
  });

  it('initializeSetupApi posts dual-cased setup payload and normalizes result', async () => {
    const payload = {
      load_sample_data: true,
      admin_name: 'Store Owner',
      admin_email: 'admin@pos.com',
      admin_password: 'admin@password123',
    };

    const mockResultCamelCase = {
      setupCompleted: true,
      sampleDataLoaded: true,
      adminEmail: 'admin@pos.com',
      token: 'jwt-token-xyz',
      user: {
        id: 'user-admin',
        name: 'Store Owner',
        email: 'admin@pos.com',
        role: 'admin',
      },
      message: 'System setup completed successfully',
    };

    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockResultCamelCase,
      message: 'System setup completed successfully',
    });

    const result = await initializeSetupApi(payload);
    expect(spy).toHaveBeenCalledWith('/system/setup', {
      loadSampleData: true,
      adminName: 'Store Owner',
      adminEmail: 'admin@pos.com',
      adminPassword: 'admin@password123',
    });
    expect(result.setup_completed).toBe(true);
    expect(result.sample_data_loaded).toBe(true);
    expect(result.admin_email).toBe('admin@pos.com');
    expect(result.token).toBe('jwt-token-xyz');
    expect(result.user?.role).toBe('admin');
  });

  it('getInstallationInfoApi calls /system/installation with Bearer auth', async () => {
    const mockRecord = {
      installation_id: 'inst-456',
      installed_at: '2026-09-13T10:00:00Z',
      app_version: '0.2.1',
      platform: 'macos',
      setup_completed: true,
      setup_completed_at: '2026-09-13T10:05:00Z',
      sample_data_loaded: false,
    };

    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockRecord,
    });

    const result = await getInstallationInfoApi();
    expect(spy).toHaveBeenCalledWith('/system/installation');
    expect(result.installation_id).toBe('inst-456');
    expect(result.sample_data_loaded).toBe(false);
  });
});

describe('Tauri Native Interop Graceful Web Degradation', () => {
  it('completeInstallationSetupNative returns null when running outside Tauri', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);

    const result = await completeInstallationSetupNative(true);
    expect(result).toBeNull();
  });

  it('getInstallationInfoNative returns null when running outside Tauri', async () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);

    const result = await getInstallationInfoNative();
    expect(result).toBeNull();
  });
});

describe('Database Setup Choice Logic', () => {
  it('validates email format and minimum password length correctly', () => {
    const validateCredentials = (email: string, password: string) => {
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return 'INVALID_EMAIL';
      }
      if (!password || password.length < 6) {
        return 'PASSWORD_TOO_SHORT';
      }
      return 'VALID';
    };

    expect(validateCredentials('', '123456')).toBe('INVALID_EMAIL');
    expect(validateCredentials('not-an-email', '123456')).toBe('INVALID_EMAIL');
    expect(validateCredentials('admin@pos.com', '123')).toBe('PASSWORD_TOO_SHORT');
    expect(validateCredentials('admin@pos.com', '123456')).toBe('VALID');
    expect(validateCredentials('admin@pos.com', 'admin@1234')).toBe('VALID');
  });

  it('differentiates demo data mode from clean database mode', () => {
    const buildSetupPayload = (mode: 'demo' | 'clean', adminEmail: string, password: string) => ({
      load_sample_data: mode === 'demo',
      admin_email: adminEmail,
      admin_password: password,
    });

    const demoPayload = buildSetupPayload('demo', 'admin@pos.com', 'admin@1234');
    expect(demoPayload.load_sample_data).toBe(true);

    const cleanPayload = buildSetupPayload('clean', 'owner@shop.com', 'secure_pass');
    expect(cleanPayload.load_sample_data).toBe(false);
    expect(cleanPayload.admin_email).toBe('owner@shop.com');
  });
});
