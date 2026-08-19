import { useState } from "react";
import {
  Text, TextInput, TouchableOpacity, View, StyleSheet,
} from "react-native";
import { useAuth } from "../../state/auth";
import { Link, useRouter } from "expo-router";
import { signUpSchema } from "../../schemas/auth";
import { colors, shadows } from "../../theme/colors";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [friendlyError, setFriendlyError] = useState("");

  const onSignUpPress = async () => {
    const parsed = signUpSchema.safeParse({ emailAddress, password });
    if (!parsed.success) {
      setFriendlyError(parsed.error.issues[0]?.message || "Please check your input");
      return;
    }

    if (!name.trim()) {
      setFriendlyError("Name is required");
      return;
    }

    setLoading(true);
    try {
      await signUp(parsed.data.emailAddress, parsed.data.password, name.trim());
      router.replace("/");
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Something went wrong";
      setFriendlyError(message);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const parsed = verificationCodeSchemaForm.safeParse({ code });
      if (!parsed.success) {
        setFriendlyError(
          parsed.error.issues[0]?.message || "Please enter the code",
        );
        return;
      }

      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: parsed.data.code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setFriendlyError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setFriendlyError("Invalid or expired code.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Get started</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subText}>
          A clean place to save ideas, drafts, and reminders.
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Fast setup</Text>
        </View>

        <TextInput
          autoCapitalize="words"
          value={name}
          placeholder="Enter name"
          placeholderTextColor="#94a3b8"
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#94a3b8"
          onChangeText={setEmailAddress}
          style={styles.input}
        />

        <TextInput
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#94a3b8"
          secureTextEntry={true}
          onChangeText={setPassword}
          style={styles.input}
        />

        {friendlyError !== "" && (
          <Text style={styles.errorText}>{friendlyError}</Text>
        )}

        <TouchableOpacity
          onPress={onSignUpPress}
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.7 }]}
        >
          <Text style={styles.buttonText}>{loading ? "Creating..." : "Continue >"}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerCopy}>Already have an account?</Text>
          <Link href="/sign-in">
            <Text style={styles.footerLink}>Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.bg,
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
  errorText: {
    color: colors.danger,
    marginBottom: 14,
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
