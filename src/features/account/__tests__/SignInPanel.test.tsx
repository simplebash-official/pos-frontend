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

  it('drops its heading and its own card when shown inside a dialog', () => {
    expect(html()).toContain('Sign In');
    expect(html()).toContain('mantine-Paper-root');
    const embedded = html({ embedded: true });
    expect(embedded).not.toContain('Sign In');
    expect(embedded).not.toContain('mantine-Paper-root');
    expect(embedded).toContain('Continue with Google');
    expect(embedded).toContain('Continue with email');
  });

  it('takes every radius from the theme, never a hard-coded one', () => {
    for (const out of [html(), html({ embedded: true })]) {
      expect(out).not.toMatch(/border-radius:\s*\d+px/);
    }
  });

  it('gives both ways to sign in the same width and touch height', () => {
    const out = html({ embedded: true });
    const google = out.match(/<button[^>]*data-log-id="signin\.google"[^>]*>/)?.[0] ?? '';
    const email = out.match(/<button[^>]*data-log-id="signin\.email"[^>]*>/)?.[0] ?? '';
    for (const button of [google, email]) {
      expect(button).toContain('data-block="true"');
      expect(button).toContain('min-height:44px');
    }
  });

  it('never asks for a password inside the POS', () => {
    expect(html()).not.toContain('type="password"');
  });

  it('shows Skip only when the caller allows it', () => {
    expect(html()).not.toContain('Skip for now');
    expect(html({ onSkip: () => {} })).toContain('Skip for now');
  });
});
