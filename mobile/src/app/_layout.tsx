import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { env } from "../config/env";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <StatusBar style="dark" backgroundColor="#f5f7fb" />
      <Slot />
    </ClerkProvider>
  );
}
