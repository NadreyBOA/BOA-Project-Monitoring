import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { CodeBadge } from './CodeBadge';

export function CountryFlag({ code, size = 22 }: { code: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <CodeBadge code={code} />;

  return (
    <Image
      source={{ uri: `https://flagcdn.com/w40/${code.toLowerCase()}.png` }}
      style={[styles.flag, { width: size * 1.4, height: size }]}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  flag: {
    borderRadius: 3,
    resizeMode: 'cover',
  },
});
