import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  signUpSchema,
  verificationCodeSchemaForm,
} from "../../schemas/auth";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // For  Error handling
  const [friendlyError, setFriendlyError] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
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

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);

      // Clear friendly error
      setFriendlyError("");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // friendly message
      setFriendlyError(
        err?.errors?.[0]?.message || "Something went wrong. Please try again.",
      );
    }
  };

  // Handle submission of verification form
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

      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: parsed.data.code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 25,
          backgroundColor: "#fff",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 25,
            textAlign: "center",
          }}
        >
          Verify your email
        </Text>

        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
          style={{
            borderWidth: 1,
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            borderColor: "#ccc",
          }}
        />

        {friendlyError !== "" && (
          <Text
            style={{
              color: "red",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {friendlyError}
          </Text>
        )}

        <TouchableOpacity
          onPress={onVerifyPress}
          style={{
            backgroundColor: "#0A66FF",
            padding: 14,
            borderRadius: 12,
            marginTop: 5,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Verify
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 25,
          textAlign: "center",
        }}
      >
        Create your account
      </Text>

      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(email) => setEmailAddress(email)}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          borderColor: "#ccc",
        }}
      />

      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          borderColor: "#ccc",
        }}
      />

      {friendlyError !== "" && (
        <Text
          style={{
            color: "red",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {friendlyError}
        </Text>
      )}

      <TouchableOpacity
        onPress={onSignUpPress}
        style={{
          backgroundColor: "#0A66FF",
          padding: 14,
          borderRadius: 12,
          marginTop: 5,
        }}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          Continue
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          gap: 5,
          marginTop: 20,
          justifyContent: "center",
        }}
      >
        <Text>Already have an account?</Text>
        <Link href="/sign-in">
          <Text style={{ color: "#0A66FF", fontWeight: "500" }}>Sign in</Text>
        </Link>
      </View>
    </View>
  );
}
