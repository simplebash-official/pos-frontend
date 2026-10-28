import { describe, it, expect } from 'vitest';

import {
  SIDEBAR_DENSITY_PRESETS,
  denser,
  looser,
  stepDensity,
  type SidebarDensity,
} from '../sidebarDensity';

describe('denser / looser', () => {
  it('step one tier in each direction', () => {
    expect(denser('comfortable')).toBe('compact');
    expect(denser('compact')).toBe('dense');
    expect(looser('dense')).toBe('compact');
    expect(looser('compact')).toBe('comfortable');
  });

  it('saturate at the ends', () => {
    expect(denser('dense')).toBe('dense');
    expect(looser('comfortable')).toBe('comfortable');
  });
});

describe('stepDensity', () => {
  it('compresses one step while overflowing', () => {
    expect(stepDensity('comfortable', true)).toBe('compact');
    expect(stepDensity('compact', true)).toBe('dense');
  });

  it('never compresses past the dense floor', () => {
    expect(stepDensity('dense', true)).toBe('dense');
  });

  it('holds the current tier when content fits', () => {
    (['comfortable', 'compact', 'dense'] as SidebarDensity[]).forEach((d) => {
      expect(stepDensity(d, false)).toBe(d);
    });
  });
});

describe('SIDEBAR_DENSITY_PRESETS', () => {
  it('defines spacing properties for each density tier', () => {
    const tiers: SidebarDensity[] = ['comfortable', 'compact', 'dense'];
    tiers.forEach((tier) => {
      const preset = SIDEBAR_DENSITY_PRESETS[tier];
      expect(preset.rootPad).toBeDefined();
      expect(preset.groupGap).toBeDefined();
      expect(preset.itemGap).toBeGreaterThan(0);
      expect(preset.navlinkPy).toBeGreaterThan(0);
    });
  });

  it('never grows a numeric spacing knob as it compresses', () => {
    const tiers: SidebarDensity[] = ['comfortable', 'compact', 'dense'];
    const numeric = (p: (typeof SIDEBAR_DENSITY_PRESETS)[SidebarDensity]) => [
      p.itemGap,
      p.navlinkPy,
    ];
    for (let i = 1; i < tiers.length; i++) {
      const prev = numeric(SIDEBAR_DENSITY_PRESETS[tiers[i - 1]]);
      const curr = numeric(SIDEBAR_DENSITY_PRESETS[tiers[i]]);
      curr.forEach((v, j) => expect(v).toBeLessThanOrEqual(prev[j]));
    }
  });
});

/**
 * Simulates the hook's settle machine: one step per "measurement", stepping down on overflow and
 * up otherwise, with a `ceiling` that blocks re-loosening into a tier known to overflow at the
 * current height.
 */
function settleFrom(
  contentAt: Record<SidebarDensity, number>,
  available: number,
  startDensity: SidebarDensity,
  startCeiling: SidebarDensity | null
): { density: SidebarDensity; ceiling: SidebarDensity | null } {
  let density: SidebarDensity = startDensity;
  let ceiling: SidebarDensity | null = startCeiling;
  for (let i = 0; i < 10; i++) {
    const overflowing = contentAt[density] > available;
    let next: SidebarDensity = density;
    if (overflowing) {
      if (density !== 'dense') {
        ceiling = density;
        next = denser(density);
      }
    } else {
      const up = looser(density);
      if (up !== density && up !== ceiling) next = up;
    }
    if (next === density) return { density, ceiling };
    density = next;
  }
  throw new Error('did not converge');
}

function settle(contentAt: Record<SidebarDensity, number>, available: number): SidebarDensity {
  return settleFrom(contentAt, available, 'comfortable', null).density;
}

describe('settle machine', () => {
  const content: Record<SidebarDensity, number> = {
    comfortable: 900,
    compact: 760,
    dense: 560,
  };

  it('lands on the loosest tier that fits', () => {
    expect(settle(content, 1000)).toBe('comfortable');
    expect(settle(content, 850)).toBe('compact');
    expect(settle(content, 600)).toBe('dense');
  });

  it('stops at dense even when nothing fits', () => {
    expect(settle(content, 300)).toBe('dense');
  });

  it('does not oscillate when a looser tier fits by a wide margin', () => {
    // comfortable (900) overflows 640 by a lot; compact (760) still overflows; dense (560) fits
    // with 80px to spare — the ceiling must stop it bouncing back up.
    expect(settle(content, 640)).toBe('dense');
  });

  it('resets ceiling on content shrink and settles back to comfortable', () => {
    const expandedContent: Record<SidebarDensity, number> = {
      comfortable: 900,
      compact: 760,
      dense: 560,
    };
    const expandedResult = settleFrom(expandedContent, 640, 'comfortable', null);
    expect(expandedResult.density).toBe('dense');
    expect(expandedResult.ceiling).toBe('compact');

    const collapsedContent: Record<SidebarDensity, number> = {
      comfortable: 350,
      compact: 320,
      dense: 300,
    };

    // Stale ceiling from expanded state blocks step-up to compact/comfortable
    const blockedResult = settleFrom(
      collapsedContent,
      640,
      expandedResult.density,
      expandedResult.ceiling
    );
    expect(blockedResult.density).toBe('dense');

    // Resetting ceiling on content shrink allows stepping all the way back to comfortable
    const resetResult = settleFrom(collapsedContent, 640, expandedResult.density, null);
    expect(resetResult.density).toBe('comfortable');
  });
});
