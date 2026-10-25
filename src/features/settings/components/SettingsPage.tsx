import { t } from '@/shared/i18n/t';
import { useState, type ReactNode } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { ActionIcon, Badge, Box, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageHeader } from '@/shared/components/PageHeader';
import { useLayoutTier } from '@/shared/hooks/useResponsive';
import { ROUTES } from '@/constants/routes';
import { SettingsNavDrillDownList, SettingsNavList, SettingsNavTabs } from './SettingsNav';
import { SETTINGS_SECTIONS, type SettingsSectionId } from '../settingsSections';
import { useVisibleSettingsSections } from '../hooks/useVisibleSettingsSections';
import { ShopProfileSection } from './sections/ShopProfileSection';
import { RegisterShiftsSection } from './sections/RegisterShiftsSection';
import { BrandingSection } from './sections/BrandingSection';
import { BankDetailsSection } from './sections/BankDetailsSection';
import { PrintingSection } from './sections/PrintingSection';
import { DocumentDesignsSection } from './sections/DocumentDesignsSection';
import { DocumentTemplatesSection } from './sections/DocumentTemplatesSection';
import { LabelsSection } from '@/features/labels/components/LabelsSection';
import { CashCategoriesSection } from './sections/CashCategoriesSection';
import { PayeesSection } from './sections/PayeesSection';
import { CashRulesSection } from './sections/CashRulesSection';
import { AboutSection } from './sections/AboutSection';
import { BackupSection } from './sections/BackupSection';
import { BenchmarkSection } from './sections/BenchmarkSection';
import { LogsSection } from './sections/LogsSection';
import { AccountSection } from '@/features/account';
import { ConflictsSection, SyncSection } from '@/features/sync-status';

const renderSection = (
  id: SettingsSectionId,
  onDirtyChange: (dirty: boolean) => void,
  onOpenSection: (target: SettingsSectionId) => void
) => {
  const meta = SETTINGS_SECTIONS.find((s) => s.id === id);
  if (meta?.comingSoon) {
    const Icon = meta.icon;
    return (
      <Paper
        p="xl"
        withBorder
        style={{
          backgroundColor: 'var(--bg-card)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Stack align="center" justify="center" gap="md" py="xl" style={{ minHeight: 340 }}>
          <ThemeIcon size={64} radius="xl" variant="light" color="gray">
            <Icon size={32} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            {t(meta.label)}
          </Text>
          <Badge size="md" variant="light" color="gray" tt="none">
            {t('Coming Soon')}
          </Badge>
          <Text size="sm" c="dimmed" ta="center" maw={420}>
            {t(
              'This feature is currently under active development and will be available in an upcoming update.'
            )}
          </Text>
        </Stack>
      </Paper>
    );
  }

  switch (id) {
    case 'shop-profile':
      return <ShopProfileSection onDirtyChange={onDirtyChange} />;
    case 'register-shifts':
      return <RegisterShiftsSection onDirtyChange={onDirtyChange} />;
    case 'cash-rules':
      return <CashRulesSection onDirtyChange={onDirtyChange} />;
    case 'cash-categories':
      return <CashCategoriesSection />;
    case 'payees':
      return <PayeesSection />;
    case 'branding':
      return <BrandingSection onDirtyChange={onDirtyChange} />;
    case 'bank-details':
      return <BankDetailsSection onDirtyChange={onDirtyChange} />;
    case 'printing':
      return <PrintingSection onDirtyChange={onDirtyChange} />;
    case 'document-designs':
      return <DocumentDesignsSection onDirtyChange={onDirtyChange} />;
    case 'labels':
      return <LabelsSection onDirtyChange={onDirtyChange} />;
    case 'templates':
      return <DocumentTemplatesSection onDirtyChange={onDirtyChange} />;
    case 'about':
    case 'updates':
      return <AboutSection onDirtyChange={onDirtyChange} />;
    case 'account':
      return <AccountSection onDirtyChange={onDirtyChange} />;
    case 'sync':
      return <SyncSection onDirtyChange={onDirtyChange} onOpenSection={onOpenSection} />;
    case 'conflicts':
      return <ConflictsSection onDirtyChange={onDirtyChange} />;
    case 'backup':
      return <BackupSection onDirtyChange={onDirtyChange} />;
    case 'benchmark':
      return <BenchmarkSection onDirtyChange={onDirtyChange} />;
    case 'logs':
      return <LogsSection onDirtyChange={onDirtyChange} />;
  }
};

/** Settings for whoever may open at least one section; everyone else goes back to the dashboard. */
export const SettingsPage = () => {
  const sections = useVisibleSettingsSections();
  if (sections.length === 0) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <SettingsContent firstSection={sections[0].id} openable={sections.map((s) => s.id)} />;
};

const SettingsContent = ({
  firstSection,
  openable,
}: {
  firstSection: SettingsSectionId;
  openable: SettingsSectionId[];
}) => {
  const tier = useLayoutTier();

  // The sync badge deep-links here with `state: { section }`.
  const requestedSection = (
    useLocation().state as { section?: SettingsSectionId | 'updates' } | null
  )?.section;
  const targetSection = requestedSection === 'updates' ? 'about' : requestedSection;
  const initialSection: SettingsSectionId =
    targetSection !== undefined && openable.includes(targetSection) ? targetSection : firstSection;
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(initialSection);
  // Mobile only: whether the user has drilled into a section, or is still looking at the list.
  const [mobileSectionOpen, setMobileSectionOpen] = useState(initialSection !== firstSection);
  const [isSectionDirty, setIsSectionDirty] = useState(false);
  // undefined = no pending navigation attempt; otherwise the target the user tried to switch to.
  const [pendingTarget, setPendingTarget] = useState<SettingsSectionId | 'back' | undefined>(
    undefined
  );

  const commitNavigate = (target: SettingsSectionId | 'back') => {
    if (target === 'back') {
      setMobileSectionOpen(false);
    } else {
      const targetMeta = SETTINGS_SECTIONS.find((s) => s.id === target);
      if (targetMeta?.disabled || targetMeta?.comingSoon) {
        return;
      }
      setActiveSection(target);
      setMobileSectionOpen(true);
    }
    setIsSectionDirty(false);
  };

  const requestNavigate = (target: SettingsSectionId | 'back') => {
    if (isSectionDirty) {
      setPendingTarget(target);
    } else {
      commitNavigate(target);
    }
  };

  const activeSectionMeta = SETTINGS_SECTIONS.find((s) => s.id === activeSection);

  const header = (
    <Box style={{ flexShrink: 0 }}>
      <PageHeader
        title={t('POS & Document Settings')}
        description={t('Configure shop profile, bank details, and printing behavior.')}
      />
    </Box>
  );

  let body: ReactNode;

  if (tier === 'desktop') {
    body = (
      <Group
        align="stretch"
        gap="xl"
        wrap="nowrap"
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <Box
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <SettingsNavList active={activeSection} onChange={requestNavigate} />
        </Box>
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {renderSection(activeSection, setIsSectionDirty, requestNavigate)}
        </Box>
      </Group>
    );
  } else if (tier === 'tablet') {
    body = (
      <Stack
        gap="md"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box style={{ flexShrink: 0 }}>
          <SettingsNavTabs active={activeSection} onChange={requestNavigate} />
        </Box>
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {renderSection(activeSection, setIsSectionDirty, requestNavigate)}
        </Box>
      </Stack>
    );
  } else if (mobileSectionOpen) {
    body = (
      <Stack
        gap="md"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Group gap="xs" style={{ flexShrink: 0 }}>
          <ActionIcon
            variant="default"
            size={44}
            onClick={() => requestNavigate('back')}
            aria-label={t('Back to settings list')}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>
          <Text fw={700} size="md">
            {activeSectionMeta?.label}
          </Text>
        </Group>
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {renderSection(activeSection, setIsSectionDirty, requestNavigate)}
        </Box>
      </Stack>
    );
  } else {
    body = (
      <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <SettingsNavDrillDownList active={activeSection} onChange={requestNavigate} />
      </Box>
    );
  }

  return (
    <>
      <Stack gap="lg" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
        {header}
        {body}
      </Stack>

      <ConfirmDialog
        opened={pendingTarget !== undefined}
        onClose={() => setPendingTarget(undefined)}
        onConfirm={() => {
          if (pendingTarget !== undefined) {
            commitNavigate(pendingTarget);
          }
          setPendingTarget(undefined);
        }}
        title={t('Discard unsaved changes?')}
        confirmLabel={t('Discard Changes')}
        cancelLabel={t('Keep Editing')}
      >
        {t('You have unsaved changes in this section. Leaving now will discard them.')}
      </ConfirmDialog>
    </>
  );
};
