/**
 * US-002 (#2): which sign-in methods each platform shows.
 * Apple on iOS and web (not Android); Google and email everywhere.
 */
export type AuthPlatform = 'ios' | 'android' | 'web';
export type AuthProvider = 'apple' | 'google' | 'email';

export function authProvidersFor(platform: AuthPlatform): AuthProvider[] {
  return platform === 'android' ? ['google', 'email'] : ['apple', 'google', 'email'];
}

/** Light validation before calling the backend; the server stays the source of truth. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const MIN_PASSWORD_LENGTH = 8;
