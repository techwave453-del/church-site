import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from '../site-config.js';

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
