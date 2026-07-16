import { useLocalSearchParams, Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";
import { useApi } from "../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  noteSchema,
  routeIdSchema,
  summaryResponseSchema,
  type Note,
} from "../../lib/schemas/note";
import { colors, shadows } from "../../theme/colors";

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const api = useApi();
  const router = useRouter();
  const noteId = routeIdSchema.parse(id);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/notes/${noteId}`);
      setNote(noteSchema.parse(res.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteNote = async () => {
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          await api.delete(`/notes/${noteId}`);
          router.replace("/");
        },
      },
    ]);
  };

  const summarizeNote = async () => {
    try {
      setSummarizing(true);
      const res = await api.post(`/notes/${noteId}/summarize`);
      setSummary(summaryResponseSchema.parse(res.data).summary);
      setShowSummary(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to summarize note",
      );
    } finally {
      setSummarizing(false);
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Note details</Text>
          <Text style={styles.title}>{note?.title}</Text>
          <Text style={styles.content}>{note?.content}</Text>
          <View style={styles.metaRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Ready to edit</Text>
            </View>
            <Text style={styles.metaHint}>Clean view</Text>
          </View>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Text style={styles.actionHeaderText}>Actions</Text>
            <Text style={styles.actionHeaderSub}>Quick tools</Text>
          </View>
          <TouchableOpacity
            onPress={summarizeNote}
            style={styles.summarizeBtn}
            disabled={summarizing}
          >
            <Text style={styles.summarizeBtnText}>
              {summarizing ? "Summarizing..." : "Summarize"}
            </Text>
          </TouchableOpacity>

          <Link href={`/note/edit?id=${noteId}`} asChild>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity onPress={deleteNote} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>
              {deleting ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSummary}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSummary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Summary</Text>
            <ScrollView style={styles.summaryScroll}>
              <Text style={styles.summaryText}>{summary}</Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowSummary(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 40,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  actionCard: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    ...shadows.card,
  },
  actionHeader: {
    marginBottom: 4,
  },
  actionHeaderText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  actionHeaderSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
  },
  content: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 25,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaHint: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  summarizeBtn: {
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  summarizeBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  editBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  deleteBtn: {
    backgroundColor: "#fee2e2",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  deleteBtnText: {
    color: colors.danger,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
    color: colors.text,
  },
  summaryScroll: {
    maxHeight: 400,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 14,
  },
  closeBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
