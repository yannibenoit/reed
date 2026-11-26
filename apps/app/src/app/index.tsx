import { estimateMinutes } from '@reed/core';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reed</Text>
      <Text style={styles.subtitle}>
        Save your first article · a 2,300-word read is ≈ {estimateMinutes(2300)} min
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: { fontSize: 32, fontWeight: '700', color: '#000000' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#555555', textAlign: 'center' },
});
