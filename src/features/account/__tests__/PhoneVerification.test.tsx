import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { PhoneVerification } from '../components/PhoneVerification';

// React's server renderer separates adjacent text nodes with `<!-- -->`; drop those before matching.
const html = (props: Partial<Parameters<typeof PhoneVerification>[0]> = {}) =>
  renderToString(
    <MantineProvider>
      <PhoneVerification verified={null} onVerified={() => {}} onClear={() => {}} {...props} />
    </MantineProvider>
  ).replace(/<!-- -->/g, '');

describe('PhoneVerification (first screen)', () => {
  it('shows the fixed Sri Lanka prefix and only asks for the rest of the number', () => {
    const out = html();
    expect(out).toContain('LK +94');
    expect(out).toContain('Mobile number');
    expect(out).toContain('Sri Lankan mobile numbers only.');
    expect(out).toContain('placeholder="77 123 4567"');
    expect(out).toContain('type="tel"');
  });

  it('keeps the number out of the logs and names its button for them', () => {
    const out = html();
    expect(out).toContain('data-log-redact');
    expect(out).toContain('data-log-id="account.phone.send"');
  });

  it('disables the field while a registration is running', () => {
    expect(html({ disabled: true })).toContain('disabled');
  });
});

describe('PhoneVerification (verified)', () => {
  it('shows the number masked, never in full', () => {
    const out = html({ verified: { phone: '94771234567', proof: 'ovp_secret' } });
    expect(out).toContain('Your phone number is verified.');
    expect(out).toContain('077 *** 4567');
    expect(out).not.toContain('94771234567');
    expect(out).not.toContain('ovp_secret');
    expect(out).toContain('Change number');
  });
});
