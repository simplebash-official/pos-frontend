import { describe, expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import nginxConf from '../../nginx.conf?raw';

const sha256Base64 = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
};

// nginx.conf's Content-Security-Policy allows index.html's one inline script
// by hash. Editing that script without updating the hash would block the
// theme bootstrap (a flash of the wrong colour scheme) once the policy is
// enforced, so pin the two together here.
describe('nginx Content-Security-Policy', () => {
  it("allows index.html's inline script by its current sha256", async () => {
    const inline = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(inline.length).toBeGreaterThan(0);

    for (const script of inline) {
      expect(nginxConf).toContain(`'sha256-${await sha256Base64(script)}'`);
    }
  });
});
