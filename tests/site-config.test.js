import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_CONTENT, mergeSiteContent, buildSiteThemeCss } from '../site-config.js';

test('default site content includes the church landing settings', () => {
  assert.equal(DEFAULT_SITE_CONTENT.churchName, 'Kingdom Fellowship Christian Church');
  assert.ok(Array.isArray(DEFAULT_SITE_CONTENT.gallery));
});

test('mergeSiteContent preserves defaults while overriding updates', () => {
  const merged = mergeSiteContent({ churchName: 'New Church', subtitle: 'Updated copy' });
  assert.equal(merged.churchName, 'New Church');
  assert.equal(merged.subtitle, 'Updated copy');
  assert.equal(merged.cta, 'Enter Site');
});

test('theme css tints the first homepage row with the site accent', () => {
  const css = buildSiteThemeCss({ mode: 'light', accent: '#123456' });
  assert.match(css, /\.servicesSection\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*#12345620\s*0%,\s*#f4f7fa\s*100%\)/i);
});
