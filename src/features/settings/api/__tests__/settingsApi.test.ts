import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient } from '@/api/client';
import { getShopProfileApi, updateShopProfileApi } from '../settingsApi';
import type { ShopProfile } from '../../types';

describe('settingsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockProfile: ShopProfile = {
    id: 'main',
    version: 2,
    legalName: 'SimpleBash LLC',
    tradingName: 'SimpleBash POS',
    addressLines: ['123 Main St', 'Colombo'],
    primaryPhone: '0771234567',
    secondaryPhone: '',
    email: 'shop@example.com',
    website: 'https://example.com',
    businessRegNo: '',
    bankName: '',
    bankBranch: '',
    accountName: '',
    accountNumber: '',
    logoBase64: '',
    defaultWarrantyText: '',
    defaultFooterText: '',
    receiptFooterText: '',
  };

  it('calls GET /settings/shop-profile and returns data', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockProfile,
      success: true,
    });

    const result = await getShopProfileApi();

    expect(spy).toHaveBeenCalledWith('/settings/shop-profile');
    expect(result).toEqual(mockProfile);
  });

  it('calls PUT /settings/shop-profile with payload and returns updated data', async () => {
    const updates = { tradingName: 'New Shop Name', primaryPhone: '0719998877' };
    const updatedProfile = { ...mockProfile, ...updates, version: 3 };

    const spy = vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      data: updatedProfile,
      success: true,
    });

    const result = await updateShopProfileApi(updates);

    expect(spy).toHaveBeenCalledWith('/settings/shop-profile', updates);
    expect(result).toEqual(updatedProfile);
  });
});
