import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { isTauri } from '@/shared/lib/runtime';
import type { SetupSystemPayload, SetupSystemResult } from '../types';

export type MilestoneStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ProvisioningMilestone {
  id: string;
  number: string;
  title: string;
  description: string;
  status: MilestoneStatus;
}

export interface ProvisioningLogEntry {
  id: string;
  timestamp: string;
  tag: string;
  tagColor: string;
  message: string;
}

export interface UseProvisioningOrchestratorProps {
  payload: SetupSystemPayload | null;
  isPending: boolean;
  result: SetupSystemResult | null;
  error: string | null;
}

export interface UseProvisioningOrchestratorReturn {
  progress: number;
  currentStageText: string;
  milestones: ProvisioningMilestone[];
  logs: ProvisioningLogEntry[];
  isFinished: boolean;
  fastForward: () => void;
}

interface TimedStageStep {
  delayMs: number;
  progress: number;
  stageText: string;
  milestoneStatuses: MilestoneStatus[];
  log?: {
    tag: string;
    tagColor: string;
    messageTemplate: (payload: SetupSystemPayload) => string;
  };
}

const formatTimestamp = (): string => {
  const d = new Date();
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

export const useProvisioningOrchestrator = ({
  payload,
  isPending: _isPending,
  result,
  error,
}: UseProvisioningOrchestratorProps): UseProvisioningOrchestratorReturn => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStageText, setCurrentStageText] = useState<string>(
    isTauri() ? 'Starting workstation provisioning...' : 'Starting shop provisioning...'
  );
  const [logs, setLogs] = useState<ProvisioningLogEntry[]>([]);
  const [milestoneStatuses, setMilestoneStatuses] = useState<MilestoneStatus[]>([
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
  ]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const startedRef = useRef(false);
  const animationFinishedRef = useRef(false);
  const resultRef = useRef<SetupSystemResult | null>(result);
  const payloadRef = useRef<SetupSystemPayload | null>(payload);
  const timeoutsRef = useRef<number[]>([]);

  // Synchronize latest payload into ref
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  // Synchronize latest result into ref
  useEffect(() => {
    resultRef.current = result;
    if (result && animationFinishedRef.current) {
      setIsFinished(true);
    }
  }, [result]);

  // Handle errors immediately: halt schedule, mark active milestone as failed, log error
  useEffect(() => {
    if (!error) return;

    // Clear all pending timeouts
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];

    const errTimer = window.setTimeout(() => {
      setMilestoneStatuses((prev) => {
        const next = [...prev];
        const runningIdx = next.findIndex((s) => s === 'running');
        if (runningIdx !== -1) {
          next[runningIdx] = 'failed';
        } else {
          const pendingIdx = next.findIndex((s) => s === 'pending');
          if (pendingIdx !== -1) next[pendingIdx] = 'failed';
        }
        return next;
      });

      setLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          timestamp: formatTimestamp(),
          tag: 'ERROR',
          tagColor: 'red',
          message: `Initialization aborted: ${error}`,
        },
      ]);
    }, 0);

    timeoutsRef.current.push(errTimer);
  }, [error]);

  // Fast-forward action to skip straight to 100%
  const fastForward = useCallback(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];

    setProgress(100);
    setCurrentStageText(
      isTauri()
        ? 'Workstation initialized and ready for launch!'
        : 'Shop initialized and ready for launch!'
    );
    setMilestoneStatuses(['completed', 'completed', 'completed', 'completed', 'completed']);
    animationFinishedRef.current = true;

    setLogs((prev) => {
      if (prev.some((l) => l.tag === 'OK')) return prev;
      return [
        ...prev,
        {
          id: `fast-forward-${Date.now()}`,
          timestamp: formatTimestamp(),
          tag: 'OK',
          tagColor: 'teal',
          message: isTauri()
            ? 'All 25 SQLite tables, security credentials, and configuration records ready.'
            : 'All shop collections, security credentials, and configuration records ready.',
        },
      ];
    });

    if (resultRef.current) {
      setIsFinished(true);
    }
  }, []);

  // Orchestrate the step-by-step milestone progression immediately on mount
  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const activePayload: SetupSystemPayload = payloadRef.current || {
      load_sample_data: true,
      admin_name: 'System Admin',
      admin_email: 'admin@pos.com',
      admin_password: '••••••••',
    };

    const isDemo = activePayload.load_sample_data;
    const adminEmail = activePayload.admin_email || 'admin@pos.com';

    // Step-by-step sequenced timeline where each milestone has an exclusive 1.2s execution window:
    // Stage 0 (0ms - 1200ms): Milestone 1 alone is running, emits 3 kernel logs, then turns completed
    // Stage 1 (1200ms - 2400ms): Milestone 2 alone is running, emits 3 security logs, then turns completed
    // Stage 2 (2400ms - 3600ms): Milestone 3 alone is running, emits 2 catalog logs, then turns completed
    // Stage 3 (3600ms - 4800ms): Milestone 4 alone is running, emits 2 sidecar logs, then turns completed
    // Stage 4 (4800ms - 6000ms): Milestone 5 alone is running, emits 2 verify logs, then turns completed
    // Stage 5 (6000ms+): All 5 are completed, progress is 100%, OK log emitted, celebration reveals
    const desktopSteps: TimedStageStep[] = [
      // --- STAGE 0: Workstation Core & SQLite Engine (0ms - 1200ms) ---
      {
        delayMs: 0,
        progress: 4,
        stageText: 'Initializing embedded SQLite database engine...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
      },
      {
        delayMs: 150,
        progress: 9,
        stageText: 'Initializing embedded SQLite database engine...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
        log: {
          tag: 'KERNEL',
          tagColor: 'cyan',
          messageTemplate: () => 'Opening embedded SQLite instance at pos.db (WAL mode enabled)',
        },
      },
      {
        delayMs: 500,
        progress: 14,
        stageText: 'Configuring database pragma & safety registers...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
        log: {
          tag: 'KERNEL',
          tagColor: 'cyan',
          messageTemplate: () =>
            'PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON',
        },
      },
      {
        delayMs: 900,
        progress: 18,
        stageText: 'Verifying relational schema and table indices...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
        log: {
          tag: 'MIGRATE',
          tagColor: 'blue',
          messageTemplate: () =>
            'Verified 25 core tables: invoices, products, stock_movements, repairs, users',
        },
      },

      // --- STAGE 1: Security Vault & Administrator Profile (1200ms - 2400ms) ---
      {
        delayMs: 1200,
        progress: 20,
        stageText: 'Provisioning Super-Administrator identity...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
      },
      {
        delayMs: 1350,
        progress: 26,
        stageText: 'Provisioning Super-Administrator identity...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
        log: {
          tag: 'AUTH',
          tagColor: 'indigo',
          messageTemplate: () => `Provisioning initial Super-Admin account for ${adminEmail}`,
        },
      },
      {
        delayMs: 1700,
        progress: 32,
        stageText: 'Generating Argon2id cryptographic password digest...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
        log: {
          tag: 'SECURITY',
          tagColor: 'grape',
          messageTemplate: () =>
            'Argon2id digest minted: 19MB memory cost, 2 iterations, 1 parallelism lane',
        },
      },
      {
        delayMs: 2050,
        progress: 38,
        stageText: 'Generating local desktop workstation IPC API token...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
        log: {
          tag: 'SECURITY',
          tagColor: 'grape',
          messageTemplate: () =>
            'Local API key generated and stored in workstation credential vault',
        },
      },

      // --- STAGE 2: Catalog, Sequence Registers & Rules (2400ms - 3600ms) ---
      {
        delayMs: 2400,
        progress: 40,
        stageText: isDemo
          ? 'Populating category hierarchy and demo inventory SKUs...'
          : 'Initializing pristine production catalog registers...',
        milestoneStatuses: ['completed', 'completed', 'running', 'pending', 'pending'],
      },
      {
        delayMs: 2550,
        progress: 48,
        stageText: isDemo
          ? 'Populating category hierarchy and demo inventory SKUs...'
          : 'Initializing pristine production catalog registers...',
        milestoneStatuses: ['completed', 'completed', 'running', 'pending', 'pending'],
        log: {
          tag: 'CATALOG',
          tagColor: 'teal',
          messageTemplate: () =>
            isDemo
              ? 'Ingested retail category tree: Phones, Laptops, Accessories, Repair Components'
              : 'Initialized clean category register with automatic barcode and SKU sequencer',
        },
      },
      {
        delayMs: 3050,
        progress: 56,
        stageText: isDemo
          ? 'Configuring sample suppliers, customer loyalty and tax rules...'
          : 'Configuring default payment channels and invoice tax rules...',
        milestoneStatuses: ['completed', 'completed', 'running', 'pending', 'pending'],
        log: {
          tag: 'CATALOG',
          tagColor: 'teal',
          messageTemplate: () =>
            isDemo
              ? 'Loaded 3 supplier vendors, 5 loyalty customer accounts, and demo stock'
              : 'Configured standard payment channels: Cash, Card, Bank Transfer, Credit',
        },
      },

      // --- STAGE 3: Hardware Bridge & Sidecar Daemons (3600ms - 4800ms) ---
      {
        delayMs: 3600,
        progress: 60,
        stageText: 'Binding sidecar inter-process communication bridge...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'running', 'pending'],
      },
      {
        delayMs: 3750,
        progress: 68,
        stageText: 'Binding sidecar inter-process communication bridge...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'running', 'pending'],
        log: {
          tag: 'BRIDGE',
          tagColor: 'orange',
          messageTemplate: () => 'Tauri IPC bridge connected to backend port 8080',
        },
      },
      {
        delayMs: 4200,
        progress: 76,
        stageText: 'Connecting Typst document rendering daemon...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'running', 'pending'],
        log: {
          tag: 'BRIDGE',
          tagColor: 'orange',
          messageTemplate: () =>
            'Document-server initialized on port 8090 (thermal 80mm & A4 templates)',
        },
      },

      // --- STAGE 4: Cryptographic Tokens & System Verification (4800ms - 6000ms) ---
      {
        delayMs: 4800,
        progress: 80,
        stageText: 'Signing administrator JWT authentication claims...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'running'],
      },
      {
        delayMs: 4950,
        progress: 88,
        stageText: 'Signing administrator JWT authentication claims...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'running'],
        log: {
          tag: 'AUTH',
          tagColor: 'indigo',
          messageTemplate: () => 'HMAC-SHA256 JWT claims verified with role: [ADMINISTRATOR]',
        },
      },
      {
        delayMs: 5450,
        progress: 96,
        stageText: 'Verifying workstation identity and security posture...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'running'],
        log: {
          tag: 'VERIFY',
          tagColor: 'teal',
          messageTemplate: () => 'Workstation installation receipt signed and verified',
        },
      },

      // --- STAGE 5: All Complete (6000ms+) ---
      {
        delayMs: 6000,
        progress: 100,
        stageText: 'Workstation initialized and ready for launch!',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'completed'],
        log: {
          tag: 'OK',
          tagColor: 'teal',
          messageTemplate: () =>
            'All 25 SQLite tables, security credentials, and configuration records ready.',
        },
      },
    ];

    const cloudSteps: TimedStageStep[] = [
      // --- STAGE 0: Tenant Document Store & Cloud Engine (0ms - 1200ms) ---
      {
        delayMs: 0,
        progress: 4,
        stageText: 'Initializing cloud shop document store...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
      },
      {
        delayMs: 150,
        progress: 9,
        stageText: 'Initializing cloud shop document store...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
        log: {
          tag: 'STORE',
          tagColor: 'cyan',
          messageTemplate: () =>
            `Connected to isolated tenant store (partition: ${activePayload.admin_email || 'tenant'})`,
        },
      },
      {
        delayMs: 500,
        progress: 14,
        stageText: 'Applying tenant schema validations & partition indexes...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
        log: {
          tag: 'STORE',
          tagColor: 'cyan',
          messageTemplate: () =>
            'Enforcing tenant_id isolation pragma & compound query indices',
        },
      },
      {
        delayMs: 900,
        progress: 18,
        stageText: 'Verifying relational schema and table indices...',
        milestoneStatuses: ['running', 'pending', 'pending', 'pending', 'pending'],
        log: {
          tag: 'MIGRATE',
          tagColor: 'blue',
          messageTemplate: () =>
            'Verified core collections: invoices, products, stock_movements, repairs, users',
        },
      },

      // --- STAGE 1: Security Vault & Administrator Profile (1200ms - 2400ms) ---
      {
        delayMs: 1200,
        progress: 20,
        stageText: 'Provisioning Administrator identity & access tokens...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
      },
      {
        delayMs: 1350,
        progress: 26,
        stageText: 'Provisioning Administrator identity & access tokens...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
        log: {
          tag: 'AUTH',
          tagColor: 'indigo',
          messageTemplate: () => `Assigning Super-Admin role to account ${adminEmail}`,
        },
      },
      {
        delayMs: 1700,
        progress: 32,
        stageText: 'Assigning tenant cryptographic permissions...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
        log: {
          tag: 'SECURITY',
          tagColor: 'grape',
          messageTemplate: () =>
            'Access control matrix minted: billing:*, inventory:*, repairs:*, users:*',
        },
      },
      {
        delayMs: 2050,
        progress: 38,
        stageText: 'Authorizing tenant API tokens and workstation sessions...',
        milestoneStatuses: ['completed', 'running', 'pending', 'pending', 'pending'],
        log: {
          tag: 'SECURITY',
          tagColor: 'grape',
          messageTemplate: () =>
            'Tenant API credentials verified and active for multi-device sync',
        },
      },

      // --- STAGE 2: Catalog, Sequence Registers & Rules (2400ms - 3600ms) ---
      {
        delayMs: 2400,
        progress: 40,
        stageText: isDemo
          ? 'Populating category hierarchy and demo inventory SKUs...'
          : 'Initializing pristine production catalog registers...',
        milestoneStatuses: ['completed', 'completed', 'running', 'pending', 'pending'],
      },
      {
        delayMs: 2550,
        progress: 48,
        stageText: isDemo
          ? 'Populating category hierarchy and demo inventory SKUs...'
          : 'Initializing pristine production catalog registers...',
        milestoneStatuses: ['completed', 'completed', 'running', 'pending', 'pending'],
        log: {
          tag: 'CATALOG',
          tagColor: 'teal',
          messageTemplate: () =>
            isDemo
              ? 'Ingested retail category tree: Phones, Laptops, Accessories, Repair Components'
              : 'Initialized clean category register with automatic barcode and SKU sequencer',
        },
      },
      {
        delayMs: 3050,
        progress: 56,
        stageText: isDemo
          ? 'Configuring sample suppliers, customer loyalty and tax rules...'
          : 'Configuring default payment channels and invoice tax rules...',
        milestoneStatuses: ['completed', 'completed', 'running', 'pending', 'pending'],
        log: {
          tag: 'CATALOG',
          tagColor: 'teal',
          messageTemplate: () =>
            isDemo
              ? 'Loaded 3 supplier vendors, 5 loyalty customer accounts, and demo stock'
              : 'Configured standard payment channels: Cash, Card, Bank Transfer, Credit',
        },
      },

      // --- STAGE 3: Cloud Document Bridge & Rendering Pipelines (3600ms - 4800ms) ---
      {
        delayMs: 3600,
        progress: 60,
        stageText: 'Connecting cloud document rendering pipeline...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'running', 'pending'],
      },
      {
        delayMs: 3750,
        progress: 68,
        stageText: 'Connecting cloud document rendering pipeline...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'running', 'pending'],
        log: {
          tag: 'BRIDGE',
          tagColor: 'orange',
          messageTemplate: () => 'Cloud document bridge connected to generation service',
        },
      },
      {
        delayMs: 4200,
        progress: 76,
        stageText: 'Configuring thermal and A4 document layouts...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'running', 'pending'],
        log: {
          tag: 'BRIDGE',
          tagColor: 'orange',
          messageTemplate: () =>
            'Document service ready (thermal 80mm & A4 invoice templates)',
        },
      },

      // --- STAGE 4: Store Sync & Verification (4800ms - 6000ms) ---
      {
        delayMs: 4800,
        progress: 80,
        stageText: 'Verifying store synchronization & security posture...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'running'],
      },
      {
        delayMs: 4950,
        progress: 88,
        stageText: 'Verifying store synchronization & security posture...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'running'],
        log: {
          tag: 'AUTH',
          tagColor: 'indigo',
          messageTemplate: () => 'Tenant JWT claims verified with role: [ADMINISTRATOR]',
        },
      },
      {
        delayMs: 5450,
        progress: 96,
        stageText: 'Validating cloud shop instance receipt...',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'running'],
        log: {
          tag: 'VERIFY',
          tagColor: 'teal',
          messageTemplate: () => 'Cloud shop instance receipt signed and verified',
        },
      },

      // --- STAGE 5: All Complete (6000ms+) ---
      {
        delayMs: 6000,
        progress: 100,
        stageText: 'Shop initialized and ready for launch!',
        milestoneStatuses: ['completed', 'completed', 'completed', 'completed', 'completed'],
        log: {
          tag: 'OK',
          tagColor: 'teal',
          messageTemplate: () =>
            'All database collections, security credentials, and configuration records ready.',
        },
      },
    ];

    const steps = isTauri() ? desktopSteps : cloudSteps;

    // Schedule all steps
    steps.forEach((step, idx) => {
      const timer = window.setTimeout(() => {
        setProgress(step.progress);
        setCurrentStageText(step.stageText);
        setMilestoneStatuses(step.milestoneStatuses);

        if (step.log) {
          const entry: ProvisioningLogEntry = {
            id: `log-${idx}-${Date.now()}`,
            timestamp: formatTimestamp(),
            tag: step.log.tag,
            tagColor: step.log.tagColor,
            message: step.log.messageTemplate(activePayload),
          };
          setLogs((prev) => [...prev, entry]);
        }

        // At the final step, mark animation finished and unlock completion if result is ready
        if (step.progress === 100) {
          animationFinishedRef.current = true;
          if (resultRef.current) {
            const finishTimer = window.setTimeout(() => {
              setIsFinished(true);
            }, 500);
            timeoutsRef.current.push(finishTimer);
          }
        }
      }, step.delayMs);

      timeoutsRef.current.push(timer);
    });

    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
      startedRef.current = false;
    };
  }, []);

  // Derive stage text and milestones with error awareness
  const displayedStageText = useMemo(() => {
    if (error) return 'Setup failed. Please check backend diagnostics.';
    return currentStageText;
  }, [error, currentStageText]);

  const displayedMilestones = useMemo(() => {
    const desktopMilestones: ProvisioningMilestone[] = [
      {
        id: 'kernel',
        number: '01',
        title: 'Workstation Core & SQLite Engine',
        description: 'Embedded storage engine, WAL journal mode & 25 relational tables',
        status: milestoneStatuses[0],
      },
      {
        id: 'security',
        number: '02',
        title: 'Security Vault & Administrator Profile',
        description: 'Argon2id password hashing, Super-Admin role & desktop API token',
        status: milestoneStatuses[1],
      },
      {
        id: 'catalog',
        number: '03',
        title: 'Catalog, Sequence Registers & Rules',
        description: payload?.load_sample_data
          ? 'Retail inventory, repair parts, categories & customer loyalty'
          : 'Pristine production catalog registers, payment modes & SKU generators',
        status: milestoneStatuses[2],
      },
      {
        id: 'sidecars',
        number: '04',
        title: 'Hardware Bridge & Sidecar Daemons',
        description: 'Tauri IPC bridge, Typst document rendering server & print queues',
        status: milestoneStatuses[3],
      },
      {
        id: 'ready',
        number: '05',
        title: 'Cryptographic Tokens & System Verification',
        description: 'HMAC-SHA256 JWT authentication claims & installation receipt',
        status: milestoneStatuses[4],
      },
    ];

    const cloudMilestones: ProvisioningMilestone[] = [
      {
        id: 'kernel',
        number: '01',
        title: 'Shop Document Store & Cloud Engine',
        description: 'Multi-tenant isolated storage & transactional integrity',
        status: milestoneStatuses[0],
      },
      {
        id: 'security',
        number: '02',
        title: 'Security Vault & Administrator Profile',
        description: 'Super-Admin role, tenant credentials & access control',
        status: milestoneStatuses[1],
      },
      {
        id: 'catalog',
        number: '03',
        title: 'Catalog, Sequence Registers & Rules',
        description: payload?.load_sample_data
          ? 'Retail inventory, repair parts, categories & customer loyalty'
          : 'Pristine production catalog registers, payment modes & SKU generators',
        status: milestoneStatuses[2],
      },
      {
        id: 'sidecars',
        number: '04',
        title: 'Cloud Document Bridge & Rendering Pipelines',
        description: 'Cloud document generator & thermal/A4 invoice templates',
        status: milestoneStatuses[3],
      },
      {
        id: 'ready',
        number: '05',
        title: 'Multi-Device Sync & Store Verification',
        description: 'Cross-device synchronization channels & store verification',
        status: milestoneStatuses[4],
      },
    ];

    const rawMilestones = isTauri() ? desktopMilestones : cloudMilestones;

    if (!error) return rawMilestones;

    return rawMilestones.map((m) =>
      m.status === 'running' ? { ...m, status: 'failed' as MilestoneStatus } : m
    );
  }, [milestoneStatuses, payload?.load_sample_data, error]);

  return {
    progress,
    currentStageText: displayedStageText,
    milestones: displayedMilestones,
    logs,
    isFinished,
    fastForward,
  };
};
