import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  signUpSchema,
  verificationCodeSchemaForm,
} from "../../lib/schemas/auth";
import { colors, shadows } from "../../theme/colors";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [friendlyError, setFriendlyError] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      const parsed = signUpSchema.safeParse({ emailAddress, password });
      if (!parsed.success) {
        setFriendlyError(
          parsed.error.issues[0]?.message || "Please check your input",
        );
        return;
      }

      await signUp.create({
        emailAddress: parsed.data.emailAddress,
        password: parsed.data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setFriendlyError("");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setFriendlyError(
        err?.errors?.[0]?.message || "Something went wrong. Please try again.",
      );
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

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.kicker}>Verify email</Text>
          <Text style={styles.title}>Enter code</Text>
          <Text style={styles.subText}>
            We sent a one-time code to your inbox.
          </Text>

          <TextInput
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor="#94a3b8"
            onChangeText={(code) => setCode(code)}
            style={styles.input}
          />

          {friendlyError !== "" && (
            <Text style={styles.errorText}>{friendlyError}</Text>
          )}

          <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#94a3b8"
          onChangeText={(email) => setEmailAddress(email)}
          style={styles.input}
        />

        <TextInput
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#94a3b8"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          style={styles.input}
        />

        {friendlyError !== "" && (
          <Text style={styles.errorText}>{friendlyError}</Text>
        )}

        <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
          <Text style={styles.buttonText}>Continue &gt;</Text>
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
