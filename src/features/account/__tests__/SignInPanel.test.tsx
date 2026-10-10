import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignInPanel } from '../components/SignInPanel';

// React's server renderer separates adjacent text nodes with `<!-- -->`; drop those before matching.
const html = (props: Partial<Parameters<typeof SignInPanel>[0]> = {}) =>
  renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <MantineProvider>
        <SignInPanel {...props} />
      </MantineProvider>
    </QueryClientProvider>
  ).replace(/<!-- -->/g, '');

describe('SignInPanel', () => {
  it('offers Google and email, both finished in the browser', () => {
    const out = html();
    expect(out).toContain('Sign In');
    expect(out).toContain('Continue with Google');
    expect(out).toContain('Continue with email');
    expect(out).toContain('placeholder="Enter your email"');
    expect(out).toContain('data-log-id="signin.google"');
    expect(out).toContain('data-log-id="signin.email"');
    expect(out).toContain('in your browser');
  });

  it('can leave out its heading when a dialog already has a title', () => {
    expect(html()).toContain('Sign In');
    expect(html({ hideTitle: true })).not.toContain('Sign In');
    expect(html({ hideTitle: true })).toContain('Continue with Google');
  });

  it('never asks for a password inside the POS', () => {
    expect(html()).not.toContain('type="password"');
  });

  it('shows Skip only when the caller allows it', () => {
    expect(html()).not.toContain('Skip for now');
    expect(html({ onSkip: () => {} })).toContain('Skip for now');
  });
});
