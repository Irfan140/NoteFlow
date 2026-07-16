import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useApi } from "../../lib/api";
import { useRouter } from "expo-router";
import { noteInputSchema } from "../../lib/schemas/note";
import { colors, shadows } from "../../theme/colors";

export default function CreateNote() {
  const router = useRouter();
  const api = useApi();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onCreate = async () => {
    const parsed = noteInputSchema.safeParse({ title, content });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please complete the note");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/notes", parsed.data);
      router.back();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>New note</Text>
        <Text style={styles.heading}>Create Note</Text>
        <Text style={styles.subText}>
          Keep it short. You can always expand later.
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Draft mode</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          placeholder="Title"
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Content"
          placeholderTextColor="#94a3b8"
          multiline
          value={content}
          onChangeText={setContent}
          style={styles.textArea}
        />

        <TouchableOpacity
          onPress={onCreate}
          disabled={loading}
          style={[styles.saveBtn, loading && styles.saveBtnLoading]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save note &gt;</Text>
          )}
        </TouchableOpacity>
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
    borderRadius: 24,
    padding: 22,
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
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subText: {
    marginTop: 8,
    marginBottom: 18,
    color: colors.textMuted,
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
    fontWeight: "600",
  },
  pill: {
    alignSelf: "flex-start",
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    minHeight: 150,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
    ...shadows.button,
  },
  saveBtnLoading: {
    opacity: 0.8,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
