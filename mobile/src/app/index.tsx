import { useAuth } from '@clerk/expo';
import { AuthView } from '@clerk/expo/native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuditLabel, PrimaryButton } from '@/components/audit-ui';
import { BrandMark } from '@/components/brand-mark';
import { useResumarkTheme } from '@/components/resumark-theme';
import { ResumeApp } from '@/components/resume-app';

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { colors } = useResumarkTheme();
  const [authOpen, setAuthOpen] = useState(false);
  if (!isLoaded) return <View style={[styles.loading, { backgroundColor: colors.paper }]}><ActivityIndicator size="large" color={colors.red} /></View>;
  return <>
    {isSignedIn ? <ResumeApp /> : <Welcome onSignIn={() => setAuthOpen(true)} />}
    <Modal visible={authOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAuthOpen(false)}><AuthView onDismiss={() => setAuthOpen(false)} /></Modal>
  </>;
}

function Welcome({ onSignIn }: { onSignIn: () => void }) {
  const { colors, mode, toggle } = useResumarkTheme();
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
    <View style={[styles.top, { borderBottomColor: colors.border }]}><BrandMark /><Pressable accessibilityRole="button" accessibilityLabel={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} onPress={toggle} style={[styles.themeButton, { borderColor: colors.border, backgroundColor: colors.panel }]}><Text style={[styles.themeGlyph, { color: colors.body }]}>{mode === 'light' ? '◐' : '☼'}</Text></Pressable></View>
    <View style={styles.hero}>
      <AuditLabel>CAREER DOCUMENT INTELLIGENCE</AuditLabel>
      <Text style={[styles.title, { color: colors.ink }]}>Know what your{`\n`}resume says before{`\n`}an ATS does.</Text>
      <Text style={[styles.body, { color: colors.body }]}>Resumark audits your resume for structure, keywords, and clarity, then gives you an actionable scorecard.</Text>
    </View>
    <View style={[styles.signalCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={[styles.signalTop, { borderBottomColor: colors.border }]}><Text style={[styles.signalTitle, { color: colors.ink }]}>AUDIT SIGNALS</Text><Text style={styles.live}>● READY</Text></View>
      <Signal number="01" title="ATS structure" text="Detect layout patterns that affect scanning." />
      <Signal number="02" title="Keyword alignment" text="Identify skills and language worth strengthening." />
      <Signal number="03" title="Clear next steps" text="Turn the report into practical improvements." last />
    </View>
    <View style={styles.footer}><PrimaryButton label="Start your audit" onPress={onSignIn} /><Pressable accessibilityRole="button" onPress={onSignIn} hitSlop={8}><Text style={styles.signIn}>Already have an account? <Text style={styles.signInBold}>Sign in</Text></Text></Pressable><Text style={styles.caption}>PDF resumes up to 5 MB · Private workspace</Text></View>
  </ScrollView></SafeAreaView>;
}

function Signal({ number, title, text, last = false }: { number: string; title: string; text: string; last?: boolean }) {
  const { colors } = useResumarkTheme(); return <View style={[styles.signal, !last && { borderBottomWidth: 1, borderColor: colors.border }]}><Text style={[styles.signalNumber, { color: colors.red }]}>{number}</Text><View style={styles.signalCopy}><Text style={[styles.signalHeading, { color: colors.ink }]}>{title}</Text><Text style={[styles.signalBody, { color: colors.muted }]}>{text}</Text></View></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 26, gap: 28 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 13 }, themeButton: { width: 36, height: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, themeGlyph: { fontSize: 18, fontWeight: '700' },
  hero: { gap: 15, paddingTop: 14 }, title: { fontSize: 39, lineHeight: 44, letterSpacing: -1.4, fontWeight: '900' }, body: { fontSize: 16, lineHeight: 25, maxWidth: 355 },
  signalCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 17 }, signalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 }, signalTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1 }, live: { color: '#15803d', fontSize: 10, fontWeight: '900', letterSpacing: .7 },
  signal: { flexDirection: 'row', gap: 14, paddingVertical: 15 }, signalNumber: { fontSize: 11, fontWeight: '900', letterSpacing: .4, paddingTop: 2 }, signalCopy: { flex: 1, gap: 3 }, signalHeading: { fontSize: 14, fontWeight: '800' }, signalBody: { fontSize: 13, lineHeight: 19 },
  footer: { gap: 14, marginTop: 'auto' }, signIn: { color: '#57534e', textAlign: 'center', fontSize: 13 }, signInBold: { color: '#1c1917', fontWeight: '800' }, caption: { color: '#78716c', textAlign: 'center', fontSize: 10, letterSpacing: .3 },
});
