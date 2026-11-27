import { authProvidersFor, isValidEmail, MIN_PASSWORD_LENGTH } from '@reed/core';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  type AuthResult,
  sendMagicLink,
  signInWithPassword,
  signInWithProvider,
  signUpWithPassword,
} from '../lib/auth';

type Mode = 'sign-in' | 'sign-up';
type Busy = null | 'apple' | 'google' | 'password' | 'magic';

const providers = authProvidersFor(Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web');

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [nativeApple, setNativeApple] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setNativeApple);
  }, []);

  async function run(kind: Exclude<Busy, null>, action: () => Promise<AuthResult>) {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      const result = await action();
      if (result.ok) setNotice(result.message ?? null);
      else setError(result.error);
    } finally {
      setBusy(null);
    }
  }

  function submitPassword() {
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (password.length < MIN_PASSWORD_LENGTH)
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    run('password', () =>
      mode === 'sign-in' ? signInWithPassword(email, password) : signUpWithPassword(email, password),
    );
  }

  function submitMagicLink() {
    if (!isValidEmail(email)) return setError('Enter your email address first.');
    run('magic', () => sendMagicLink(email));
  }

  const disabled = busy !== null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            Reed
          </Text>
          <Text style={styles.subtitle}>Sign in to keep your library and progress in sync across devices.</Text>

          {providers.includes('apple') &&
            (nativeApple ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={10}
                style={styles.appleNative}
                onPress={() => run('apple', () => signInWithProvider('apple'))}
              />
            ) : (
              <ProviderButton
                label="Continue with Apple"
                dark
                loading={busy === 'apple'}
                disabled={disabled}
                onPress={() => run('apple', () => signInWithProvider('apple'))}
              />
            ))}
          {providers.includes('google') && (
            <ProviderButton
              label="Continue with Google"
              loading={busy === 'google'}
              disabled={disabled}
              onPress={() => run('google', () => signInWithProvider('google'))}
            />
          )}

          <View style={styles.divider}>
            <View style={styles.rule} />
            <Text style={styles.dividerText}>or with email</Text>
            <View style={styles.rule} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8A8A8A"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8A8A8A"
            secureTextEntry
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submitPassword}
            accessibilityLabel="Password"
          />

          <ProviderButton
            label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
            dark
            loading={busy === 'password'}
            disabled={disabled}
            onPress={submitPassword}
          />

          {error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          {notice && (
            <Text style={styles.notice} accessibilityLiveRegion="polite">
              {notice}
            </Text>
          )}

          <Pressable onPress={submitMagicLink} disabled={disabled} accessibilityRole="button">
            <Text style={styles.link}>{busy === 'magic' ? 'Sending…' : 'Email me a sign-in link instead'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError(null);
              setNotice(null);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.link}>
              {mode === 'sign-in' ? 'New to Reed? Create an account' : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProviderButton(props: {
  label: string;
  onPress: () => void;
  dark?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      disabled={props.disabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.button,
        props.dark ? styles.buttonDark : styles.buttonLight,
        (pressed || props.disabled) && styles.buttonDim,
      ]}
    >
      {props.loading ? (
        <ActivityIndicator color={props.dark ? '#FFFFFF' : '#000000'} />
      ) : (
        <Text style={[styles.buttonText, props.dark && styles.buttonTextDark]}>{props.label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, alignSelf: 'center', gap: 12 },
  title: { fontSize: 32, fontWeight: '700', color: '#000000', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555555', textAlign: 'center', marginBottom: 12 },
  appleNative: { height: 48, width: '100%' },
  button: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonDark: { backgroundColor: '#000000' },
  buttonLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D0D0D0' },
  buttonDim: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  buttonTextDark: { color: '#FFFFFF' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#C8C8C8' },
  dividerText: { fontSize: 13, color: '#6B6B6B' },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#000000',
  },
  error: { color: '#B3261E', fontSize: 14, textAlign: 'center' },
  notice: { color: '#1F5E2E', fontSize: 14, textAlign: 'center' },
  link: { color: '#000000', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 4 },
});
