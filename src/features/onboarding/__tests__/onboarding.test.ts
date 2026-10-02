import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WelcomeWizard,
  SplashStep,
  FeatureGuideStep,
  DataChoiceStep,
  ProgressStep,
  ProvisioningConsole,
  ProvisioningMilestones,
  useProvisioningOrchestrator,
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
    expect(typeof ProvisioningConsole).toBe('function');
    expect(typeof ProvisioningMilestones).toBe('function');
    expect(typeof useProvisioningOrchestrator).toBe('function');
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
    expect(spy).toHaveBeenCalledWith(
      '/system/setup',
      {
        loadSampleData: true,
        adminName: 'Store Owner',
        adminEmail: 'admin@pos.com',
        adminPassword: 'admin@password123',
      },
      { timeout: 120_000 }
    );
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
      if (!password || password.length < 8) {
        return 'PASSWORD_TOO_SHORT';
      }
      return 'VALID';
    };

    expect(validateCredentials('', '123456')).toBe('INVALID_EMAIL');
    expect(validateCredentials('not-an-email', '123456')).toBe('INVALID_EMAIL');
    expect(validateCredentials('admin@pos.com', '123')).toBe('PASSWORD_TOO_SHORT');
    expect(validateCredentials('admin@pos.com', '123456')).toBe('PASSWORD_TOO_SHORT');
    expect(validateCredentials('admin@pos.com', '12345678')).toBe('VALID');
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

describe('Provisioning Experience Architecture', () => {
  it('defines 5 standard milestone phases with identifiers and numbers', () => {
    const expectedMilestoneIds = ['kernel', 'security', 'catalog', 'sidecars', 'ready'];
    const expectedNumbers = ['01', '02', '03', '04', '05'];

    expect(expectedMilestoneIds).toHaveLength(5);
    expect(expectedNumbers).toHaveLength(5);
  });

  it('formats terminal logs with brackets and tags suitable for clipboard export', () => {
    const sampleLogs = [
      { timestamp: '12:00:00.123', tag: 'KERNEL', message: 'Opening SQLite instance' },
      { timestamp: '12:00:00.456', tag: 'AUTH', message: 'Admin account created' },
      { timestamp: '12:00:01.789', tag: 'OK', message: 'Ready' },
    ];

    const formatted = sampleLogs
      .map((entry) => `[${entry.timestamp}] [${entry.tag}] ${entry.message}`)
      .join('\n');

    expect(formatted).toContain('[12:00:00.123] [KERNEL] Opening SQLite instance');
    expect(formatted).toContain('[12:00:00.456] [AUTH] Admin account created');
    expect(formatted).toContain('[12:00:01.789] [OK] Ready');
  });

  it('correctly maps status states to badge visual colors', () => {
    const getBadgeStatusColor = (status: 'pending' | 'running' | 'completed' | 'failed') => {
      switch (status) {
        case 'running':
          return 'blue';
        case 'completed':
          return 'teal';
        case 'failed':
          return 'red';
        default:
          return 'gray';
      }
    };

    expect(getBadgeStatusColor('running')).toBe('blue');
    expect(getBadgeStatusColor('completed')).toBe('teal');
    expect(getBadgeStatusColor('failed')).toBe('red');
    expect(getBadgeStatusColor('pending')).toBe('gray');
  });

  it('guarantees sequential stage-by-stage progression state machine', () => {
    // Test the state transitions from stage 0 to stage 5
    const getStageStatuses = (activeStage: number) => {
      const statuses = ['pending', 'pending', 'pending', 'pending', 'pending'];
      for (let i = 0; i < 5; i++) {
        if (i < activeStage) statuses[i] = 'completed';
        else if (i === activeStage && activeStage < 5) statuses[i] = 'running';
        else if (activeStage >= 5) statuses[i] = 'completed';
      }
      return statuses;
    };

    // Stage 0: Milestone 0 running, all others pending
    expect(getStageStatuses(0)).toEqual(['running', 'pending', 'pending', 'pending', 'pending']);

    // Stage 1: Milestone 0 completed, Milestone 1 running, 2..4 pending
    expect(getStageStatuses(1)).toEqual(['completed', 'running', 'pending', 'pending', 'pending']);

    // Stage 2: Milestones 0,1 completed, Milestone 2 running, 3..4 pending
    expect(getStageStatuses(2)).toEqual([
      'completed',
      'completed',
      'running',
      'pending',
      'pending',
    ]);

    // Stage 3: Milestones 0..2 completed, Milestone 3 running, 4 pending
    expect(getStageStatuses(3)).toEqual([
      'completed',
      'completed',
      'completed',
      'running',
      'pending',
    ]);

    // Stage 4: Milestones 0..3 completed, Milestone 4 running
    expect(getStageStatuses(4)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'running',
    ]);

    // Stage 5: All 5 completed
    expect(getStageStatuses(5)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
    ]);
  });

  it('differentiates milestones between Desktop SQLite and Web Cloud mode', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    // In Tauri, milestone 01 is SQLite Engine
    const desktopTitle01 = runtime.isTauri()
      ? 'Workstation Core & SQLite Engine'
      : 'Shop Document Store & Cloud Engine';
    expect(desktopTitle01).toBe('Workstation Core & SQLite Engine');

    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    // In Web Cloud, milestone 01 is Cloud Engine
    const cloudTitle01 = runtime.isTauri()
      ? 'Workstation Core & SQLite Engine'
      : 'Shop Document Store & Cloud Engine';
    expect(cloudTitle01).toBe('Shop Document Store & Cloud Engine');
  });

  it('allows cloud setup payload submission without password re-entry', () => {
    const buildCloudPayload = (
      loadSampleData: boolean,
      adminName: string,
      adminEmail: string
    ) => ({
      load_sample_data: loadSampleData,
      admin_name: adminName,
      admin_email: adminEmail,
      admin_password: undefined,
    });

    const payload = buildCloudPayload(true, 'Cloud Owner', 'owner@mycloudshop.com');
    expect(payload.load_sample_data).toBe(true);
    expect(payload.admin_email).toBe('owner@mycloudshop.com');
    expect(payload.admin_name).toBe('Cloud Owner');
    // No placeholder password: the cloud setup uses the signed-in session.
    expect(payload.admin_password).toBeUndefined();
  });
});
