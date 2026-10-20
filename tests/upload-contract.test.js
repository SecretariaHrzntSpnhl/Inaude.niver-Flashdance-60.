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
    expect(html).toMatch(/<label[^>]*data-upload-zone[^>]*>[\s\S]*?<input[^>]*data-upload-input[\s\S]*?<\/label>/);
    expect(await readProjectFile('src/js/upload.js')).not.toContain('fileInput.click()');
  });

  it('requires sharing consent before submission', async () => {
    const html = await readProjectFile('upload.html');

    expect(html).toMatch(/<input name="consent" type="checkbox" required \/>/);
    expect(html).toMatch(/<button[^>]*data-upload-submit[^>]*disabled>/);
  });

  it('shows an accessible thank-you modal before returning to the album', async () => {
    const html = await readProjectFile('upload.html');
    const script = await readProjectFile('src/js/upload.js');
    const styles = await readProjectFile('src/styles/upload.css');

    expect(html).toMatch(/<dialog[^>]*data-upload-success[^>]*>/);
    expect(html).toContain('data-upload-success-link');
    expect(styles).toMatch(/\.upload-success:not\(\[open\]\)\s*\{\s*display:\s*none;/);
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

  it('builds a separate private moderation page without exposing an admin link publicly', async () => {
    const config = await readProjectFile('vite.config.js');
    const admin = await readProjectFile('admin.html');
    const publicPages = await Promise.all([
      readProjectFile('index.html'),
      readProjectFile('upload.html'),
      readProjectFile('galeria.html')
    ]);

    expect(config).toContain("admin: resolve(root, 'admin.html')");
    expect(admin).toContain('data-admin-login');
    expect(admin).toContain('data-admin-password');
    expect(admin).toContain('data-admin-dashboard');
    expect(admin).toContain('noindex, nofollow');
    publicPages.forEach((html) => expect(html).not.toContain('/admin.html'));
  });
});

describe('private album moderation', () => {
  it('requires an authenticated session to list and delete files', async () => {
    const script = await readProjectFile('src/admin.js');
    const policies = await readProjectFile('supabase/admin.sql');
    const readme = await readProjectFile('README.md');

    expect(script).toContain('/auth/v1/token?grant_type=password');
    expect(script).toContain('takeAuthRedirectSession');
    expect(script).toContain("['invite', 'recovery', 'signup'].includes(type)");
    expect(script).toContain("method: 'PUT'");
    expect(script).toContain('window.history.replaceState');
    expect(script).toContain('sessionStorage');
    expect(script).toContain('/rest/v1/rpc/is_album_admin');
    expect(script).toContain("download.textContent = 'Baixar arquivo'");
    expect(script).toContain('link.download = item.name');
    expect(script).toContain('URL.createObjectURL(await response.blob())');
    expect(script).toContain("method: 'DELETE'");
    expect(policies).toContain('to authenticated');
    expect(policies).toContain('alter table private.album_admins enable row level security');
    expect(policies).toContain('create or replace function public.is_album_admin()');
    expect(policies).toContain('(select private.is_album_admin())');
    expect(policies).toContain('for delete');
    expect(policies).not.toMatch(/for delete[\s\S]*?to anon/);
    expect(readme).toContain('não habilite o cadastro público');
  });
});
