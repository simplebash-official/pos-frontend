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
  it('only hides the group labels at the dense tier', () => {
    expect(SIDEBAR_DENSITY_PRESETS.comfortable.showLabels).toBe(true);
    expect(SIDEBAR_DENSITY_PRESETS.compact.showLabels).toBe(true);
    expect(SIDEBAR_DENSITY_PRESETS.dense.showLabels).toBe(false);
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
function settle(contentAt: Record<SidebarDensity, number>, available: number): SidebarDensity {
  let density: SidebarDensity = 'comfortable';
  let ceiling: SidebarDensity | null = null;
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
    if (next === density) return density;
    density = next;
  }
  throw new Error('did not converge');
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
});
