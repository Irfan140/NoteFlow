import { AuthProvider } from "../state/auth";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../state/auth";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar hidden />
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isLoaded } = useAuth();

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
