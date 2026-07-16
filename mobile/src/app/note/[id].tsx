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
} from "../../schemas/note";

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
      <ActivityIndicator size="large" color="#2563eb" style={styles.loading} />
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{note?.title}</Text>

        <Text style={styles.content}>{note?.content}</Text>

        <TouchableOpacity
          onPress={summarizeNote}
          style={styles.summarizeBtn}
          disabled={summarizing}
        >
          <Text style={styles.summarizeBtnText}>
            {summarizing ? "Summarizing..." : "Summarize with AI"}
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
  },

  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },

  content: {
    color: "#555",
    marginBottom: 25,
    fontSize: 16,
    lineHeight: 24,
  },

  summarizeBtn: {
    backgroundColor: "#8b5cf6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  summarizeBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  editBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  editBtnText: {
    color: "#fff",
    textAlign: "center",
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  deleteBtnText: {
    color: "#fff",
    textAlign: "center",
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
    borderRadius: 15,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },

  summaryScroll: {
    maxHeight: 400,
  },

  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 20,
  },

  closeBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
  },

  closeBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
