import { estimateMinutes } from '@reed/core';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signOut } from '../lib/auth';
import { useSession } from '../lib/session';

export default function HomeScreen() {
  const { session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reed</Text>
      <Text style={styles.subtitle}>
        Save your first article · a 2,300-word read is ≈ {estimateMinutes(2300)} min
      </Text>
      {session?.user.email && <Text style={styles.account}>Signed in as {session.user.email}</Text>}
      <Pressable
        accessibilityRole="button"
        disabled={signingOut}
        onPress={async () => {
          setSigningOut(true);
          try {
            await signOut();
          } finally {
            setSigningOut(false);
          }
        }}
      >
        <Text style={styles.link}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: { fontSize: 32, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 14, color: '#555555', textAlign: 'center' },
  account: { marginTop: 16, fontSize: 13, color: '#6B6B6B' },
  link: { fontSize: 14, color: '#000000', textDecorationLine: 'underline', paddingVertical: 4 },
});
