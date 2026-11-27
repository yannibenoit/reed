import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { completeAuthFromUrl } from '../../lib/auth';
import { useSession } from '../../lib/session';

/**
 * Landing route for OAuth and magic-link redirects.
 * Web: supabase-js exchanges ?code= itself (detectSessionInUrl). Native: we exchange it here.
 */
/** On web, the provider's error (or a missing code) is readable straight from the URL. */
function webRedirectError(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const description = params.get('error_description');
  if (description) return description;
  return params.get('code') ? null : 'This sign-in link is incomplete.';
}

export default function AuthCallbackScreen() {
  const { session } = useSession();
  const url = Linking.useLinkingURL();
  const [error, setError] = useState<string | null>(webRedirectError);

  useEffect(() => {
    if (session) router.replace('/');
  }, [session]);

  useEffect(() => {
    if (Platform.OS === 'web' || session || !url) return;
    completeAuthFromUrl(url).then((r) => {
      if (!r.ok) setError(r.error);
    });
  }, [url, session]);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
          <Pressable onPress={() => router.replace('/sign-in')} accessibilityRole="button">
            <Text style={styles.link}>Back to sign in</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator />
          <Text style={styles.text}>Signing you in…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: '#FFFFFF' },
  text: { fontSize: 15, color: '#555555' },
  error: { fontSize: 15, color: '#B3261E', textAlign: 'center' },
  link: { fontSize: 14, color: '#000000', textDecorationLine: 'underline' },
});
