import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import { ResumarkThemeProvider } from '@/components/resumark-theme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to mobile/.env.');
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ResumarkThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
      </ResumarkThemeProvider>
    </ClerkProvider>
  );
}
