import { describe, expect, it } from 'vitest';
import {
  coverageLabel,
  daysLeftLabel,
  endsOnIfStartedToday,
  periodUsedPercent,
  profileProblem,
  sameProfile,
  stateLook,
  toProfileInput,
  validUntil,
} from '../warrantyView';

describe('warranty view rules', () => {
  it('names a coverage in plain words', () => {
    expect(coverageLabel({ kind: 'none' })).toBe('No warranty');
    expect(coverageLabel({ kind: 'lifetime' })).toBe('Lifetime');
    expect(coverageLabel({ kind: 'limited', value: 12, unit: 'months' })).toBe('12 months');
    expect(coverageLabel({ kind: 'limited', value: 1, unit: 'years' })).toBe('1 year');
    expect(coverageLabel({ kind: 'limited', value: 7, unit: 'days' })).toBe('7 days');
  });

  it('gives every state a colour and a word', () => {
    expect(stateLook('active')).toEqual({ color: 'green', label: 'Active' });
    expect(stateLook('expiring_soon').color).toBe('orange');
    expect(stateLook('expired').color).toBe('red');
    expect(stateLook('under_claim').color).toBe('blue');
    expect(stateLook('void')).toEqual({ color: 'gray', label: 'Cancelled' });
  });

  it('says how much cover is left', () => {
    expect(daysLeftLabel({ daysRemaining: 45, state: 'active' })).toBe('45 days left');
    expect(daysLeftLabel({ daysRemaining: 1, state: 'expiring_soon' })).toBe('Last day today');
    expect(daysLeftLabel({ daysRemaining: 0, state: 'expired' })).toBe('Ended');
    expect(daysLeftLabel({ daysRemaining: undefined, state: 'active' })).toBe('');
    expect(validUntil({ endsOn: undefined })).toBe('Covered for life');
    expect(validUntil({ endsOn: '2027-11-02' })).toBe('Valid until 02 Nov 2027');
  });

  it('works out the progress bar from the server days', () => {
    const base = { startsOn: '2026-11-03', endsOn: '2026-11-12' };
    expect(periodUsedPercent({ ...base, daysRemaining: 10 })).toBe(0);
    expect(periodUsedPercent({ ...base, daysRemaining: 5 })).toBe(50);
    expect(periodUsedPercent({ ...base, daysRemaining: 0 })).toBe(100);
    expect(
      periodUsedPercent({ startsOn: '2026-11-03', endsOn: undefined, daysRemaining: undefined })
    ).toBeNull();
  });

  it('checks a warranty profile before it is saved', () => {
    expect(profileProblem({ coverage: { kind: 'none' } })).toBeNull();
    expect(profileProblem({ coverage: { kind: 'limited', value: 6, unit: 'months' } })).toBe(
      'Choose who gives the warranty.'
    );
    expect(
      profileProblem({
        coverage: { kind: 'limited', value: 0, unit: 'months' },
        warrantyType: 'shop',
      })
    ).toBe('Enter how long the warranty lasts, at least 1.');
    expect(profileProblem({ coverage: { kind: 'lifetime' } })).toBe(
      'Choose who gives the warranty.'
    );
    expect(profileProblem({ coverage: { kind: 'lifetime' }, warrantyType: 'both' })).toBeNull();
  });

  it('sends only what the server accepts', () => {
    expect(
      toProfileInput({ coverage: { kind: 'none' }, warrantyType: 'shop', terms: 'x' })
    ).toEqual({ coverage: { kind: 'none' } });
    expect(
      toProfileInput({
        coverage: { kind: 'limited', value: 6, unit: 'months' },
        warrantyType: 'shop',
        terms: '   ',
      })
    ).toEqual({ coverage: { kind: 'limited', value: 6, unit: 'months' }, warrantyType: 'shop' });
    expect(
      sameProfile(
        { coverage: { kind: 'lifetime' }, warrantyType: 'shop', terms: ' a ' },
        { coverage: { kind: 'lifetime' }, warrantyType: 'shop', terms: 'a' }
      )
    ).toBe(true);
  });

  it('previews the end date with the shared calculation', () => {
    expect(endsOnIfStartedToday({ kind: 'none' })).toBeNull();
    expect(endsOnIfStartedToday({ kind: 'lifetime' })).toBeNull();
    const end = endsOnIfStartedToday({ kind: 'limited', value: 1, unit: 'days' });
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    expect(end).toBe(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  });
});
