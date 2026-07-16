import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useAuth } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { env } from "../config/env";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <StatusBar style="dark" backgroundColor="#f5f7fb" />
      <AppRoutes />
    </ClerkProvider>
  );
}

function AppRoutes() {
  const { isLoaded } = useAuth();

  // Do not mount a route until Clerk has restored the saved session.
  if (!isLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#208aef" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fb",
  },
});
