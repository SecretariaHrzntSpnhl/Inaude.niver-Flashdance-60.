// Runtime validation coverage for: guest photo upload and Netlify configuration.
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readProjectFile = (fileName) =>
  readFile(new URL(`../${fileName}`, import.meta.url), 'utf8');

describe('guest photo upload', () => {
  it('lets guests choose multiple images without forcing camera capture', async () => {
    const html = await readProjectFile('upload.html');
    const input = html.match(/<input\s+class="upload-file-input"[\s\S]*?\/>/)?.[0];

    expect(input).toBeDefined();
    expect(input).toContain('accept="image/*,video/mp4,video/quicktime,video/webm"');
    expect(input).toMatch(/\bmultiple\b/);
    expect(input).not.toMatch(/\bcapture\b/);
  });

  it('requires sharing consent before submission', async () => {
    const html = await readProjectFile('upload.html');

    expect(html).toMatch(/<input name="consent" type="checkbox" required \/>/);
    expect(html).toMatch(/<button[^>]*data-upload-submit[^>]*disabled>/);
  });
});

describe('Netlify deployment', () => {
  it('provides the public Supabase build variables', async () => {
    const config = await readProjectFile('netlify.toml');

    expect(config).toMatch(/VITE_SUPABASE_URL\s*=/);
    expect(config).toMatch(/VITE_SUPABASE_ANON_KEY\s*=/);
  });
});
