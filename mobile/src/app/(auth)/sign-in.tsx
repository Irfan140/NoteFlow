import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { signInSchema } from "../../lib/schemas/auth";
import { colors, shadows } from "../../theme/colors";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setError("");

    const parsed = signInSchema.safeParse({ emailAddress, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your input");
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: parsed.data.emailAddress,
        password: parsed.data.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error("SIGN_IN_ERROR::", JSON.stringify(err, null, 2));
      const message = err?.errors?.[0]?.message || "Something went wrong";
      setError(message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Welcome back</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subText}>
          Pick up your notes right where you left off.
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Secure sign in</Text>
        </View>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#94a3b8"
          onChangeText={(v) => setEmailAddress(v)}
        />

        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#94a3b8"
          secureTextEntry={true}
          onChangeText={(v) => setPassword(v)}
        />

        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerCopy}>New here?</Text>
          <Link href="/sign-up">
            <Text style={styles.footerLink}>Create account</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.bg,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    color: colors.text,
    textAlign: "center",
  },
  subText: {
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },
  pill: {
    alignSelf: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  pillText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  input: {
    width: "100%",
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: colors.surfaceMuted,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    ...shadows.button,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    gap: 6,
    flexWrap: "wrap",
  },
  footerCopy: {
    color: colors.textMuted,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
