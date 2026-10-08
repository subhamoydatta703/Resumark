import { StyleSheet, Text, View } from 'react-native';
import { useResumarkTheme } from './resumark-theme';

export function BrandMark() {
  const { colors } = useResumarkTheme();
  return <View style={styles.wrap}><View style={[styles.mark, { borderColor: colors.border, backgroundColor: colors.panel }]}><Text style={[styles.markText, { color: colors.red }]}>[RM]</Text></View><View><Text style={[styles.name, { color: colors.ink }]}>Resumark</Text><Text style={[styles.sub, { color: colors.muted }]}>Structured Auditing</Text></View></View>;
}

const styles = StyleSheet.create({ wrap: { flexDirection: 'row', alignItems: 'center', gap: 9 }, mark: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 }, markText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '900' }, name: { fontSize: 15, fontWeight: '700', letterSpacing: -.2 }, sub: { fontFamily: 'monospace', fontSize: 9, marginTop: 1 } });
