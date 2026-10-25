import { isTauri } from '@/shared/lib/runtime';
import { useCloudState } from '@/features/account';
import {
  getVisibleSettingsSections,
  sectionsForAccess,
  type SettingsSectionMeta,
} from '../settingsSections';
import { useSettingsAccess } from './useSettingsAccess';

/** The sections this person may open on this device (desktop-only and cloud-only ones filtered out). */
export const useVisibleSettingsSections = (): SettingsSectionMeta[] => {
  const { state: cloud } = useCloudState();
  const access = useSettingsAccess();
  return sectionsForAccess(
    getVisibleSettingsSections(isTauri(), cloud.enabled, cloud.linked),
    access
  );
};
