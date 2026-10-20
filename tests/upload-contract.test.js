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

  it('shows an accessible thank-you modal before returning to the album', async () => {
    const html = await readProjectFile('upload.html');
    const script = await readProjectFile('src/js/upload.js');

    expect(html).toMatch(/<dialog[^>]*data-upload-success[^>]*>/);
    expect(html).toContain('data-upload-success-link');
    expect(script).toContain('successDialog.showModal()');
    expect(script).toContain('window.setTimeout(() => window.location.assign(returnUrl.href), 4500)');
    expect(script).toContain("returnUrl.searchParams.set('album-item', lastUploadedName)");
  });
});

describe('live infinite album carousel', () => {
  it('refreshes new uploads and opens the latest uploaded image on return', async () => {
    const script = await readProjectFile('src/js/carrusel.js');

    expect(script).toContain("get('album-item')");
    expect(script).toContain('const refreshAlbum = async () =>');
    expect(script).toContain("document.addEventListener('visibilitychange'");
    expect(script).toContain('window.setInterval(() =>');
    expect(script).toContain('track.replaceChildren(');
  });

  it('animates incoming photos without changing their image files', async () => {
    const script = await readProjectFile('src/js/carrusel.js');
    const styles = await readProjectFile('src/styles/carrusel.css');

    expect(script).toContain("activeSlide.classList.add('is-arriving')");
    expect(styles).toContain('.slide.is-arriving[data-transition="focus"]');
    expect(styles).toContain('.slide.is-arriving[data-transition="silver"]');
    expect(styles).toContain('.slide.is-arriving[data-transition="warm"]');
  });
});

describe('Netlify deployment', () => {
  it('provides the public Supabase build variables', async () => {
    const config = await readProjectFile('netlify.toml');

    expect(config).toMatch(/VITE_SUPABASE_URL\s*=/);
    expect(config).toMatch(/VITE_SUPABASE_ANON_KEY\s*=/);
  });
});
