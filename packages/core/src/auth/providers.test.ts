import { describe, expect, it } from 'vitest';

import { authProvidersFor, isValidEmail } from './providers';

describe('authProvidersFor', () => {
  it('shows Apple on iOS and web', () => {
    expect(authProvidersFor('ios')).toContain('apple');
    expect(authProvidersFor('web')).toContain('apple');
  });

  it('hides Apple on Android', () => {
    expect(authProvidersFor('android')).not.toContain('apple');
  });

  it('shows Google and email on every platform', () => {
    for (const p of ['ios', 'android', 'web'] as const) {
      expect(authProvidersFor(p)).toEqual(expect.arrayContaining(['google', 'email']));
    }
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.co', '  reader@reed.app '])('accepts %s', (v) => expect(isValidEmail(v)).toBe(true));
  it.each(['', 'reader', 'reader@', 'a b@c.d', '@reed.app'])('rejects %j', (v) =>
    expect(isValidEmail(v)).toBe(false),
  );
});
