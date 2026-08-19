import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import api from "../../libs/api";
import {
  noteInputSchema,
  noteSchema,
  routeIdSchema,
} from "../../schemas/note";
import { colors, shadows } from "../../theme/colors";

export default function EditNote() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const noteId = routeIdSchema.parse(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await api.get(`/notes/${noteId}`);
      const note = noteSchema.parse(res.data);
      setTitle(note.title);
      setContent(note.content);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSave = async () => {
    const parsed = noteInputSchema.safeParse({ title, content });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please complete the note");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.put(`/notes/${noteId}`, parsed.data);
      router.back();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loading}
      />
    );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Update note</Text>
        <Text style={styles.heading}>Edit Note</Text>
        <Text style={styles.subText}>
          Refine the note without losing the original flow.
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>In progress</Text>
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
          onPress={onSave}
          disabled={saving}
          style={[styles.saveBtn, saving && styles.saveBtnLoading]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save changes &gt;</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 50,
  },
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
