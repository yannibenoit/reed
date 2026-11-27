import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthProvider } from '@reed/core';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/** reed://auth/callback on native, <origin>/auth/callback on web. Must be in the Supabase redirect allow-list. */
export const authRedirectUrl = () => Linking.createURL('auth/callback');

export type AuthResult = { ok: true; message?: string } | { ok: false; error: string };

const ok = (message?: string): AuthResult => ({ ok: true, message });
const fail = (error: unknown): AuthResult => ({ ok: false, error: friendlyError(error) });

export function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (/invalid login credentials/i.test(raw)) return 'Wrong email or password.';
  if (/already registered|already exists/i.test(raw)) return 'An account with this email already exists. Sign in instead.';
  if (/rate limit|too many/i.test(raw)) return 'Too many attempts. Wait a minute and try again.';
  if (/network|fetch/i.test(raw)) return "Can't reach Reed. Check your connection.";
  return raw || 'Something went wrong. Try again.';
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? fail(error) : ok();
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: authRedirectUrl() },
  });
  if (error) return fail(error);
  // With email confirmation on (prod), there is no session until the link is opened.
  return data.session ? ok() : ok('Check your email to confirm your account.');
}

export async function sendMagicLink(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: authRedirectUrl() },
  });
  return error ? fail(error) : ok('Check your email for a sign-in link. Open it on this device.');
}

/** Exchanges the ?code= from an OAuth / magic-link redirect for a session. */
export async function completeAuthFromUrl(url: string): Promise<AuthResult> {
  const params = new URL(url).searchParams;
  const description = params.get('error_description');
  if (description) return fail(description);
  const code = params.get('code');
  if (!code) return fail('This sign-in link is incomplete.');
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error ? fail(error) : ok();
}

async function signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthResult> {
  const redirectTo = authRedirectUrl();
  const isWeb = Platform.OS === 'web';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: !isWeb },
  });
  if (error) return fail(error);
  if (isWeb) return ok(); // the browser navigates to the provider and back to /auth/callback

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return ok(); // user closed the sheet: not an error
  return completeAuthFromUrl(result.url);
}

/** Native Sign in with Apple on iOS (id token + nonce); OAuth redirect on web. */
async function signInWithApple(): Promise<AuthResult> {
  if (Platform.OS !== 'ios') return signInWithOAuth('apple');
  try {
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) return fail('Apple did not return an identity token.');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    return error ? fail(error) : ok();
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return ok();
    return fail(e);
  }
}

export function signInWithProvider(provider: Exclude<AuthProvider, 'email'>): Promise<AuthResult> {
  return provider === 'apple' ? signInWithApple() : signInWithOAuth('google');
}

/** Signs out and wipes everything Reed stored on this device (session, caches, offline copies). */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } finally {
    await AsyncStorage.clear();
  }
}
