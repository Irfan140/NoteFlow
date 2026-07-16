import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useApi } from "../../lib/api";
import { Link, useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { notesSchema, type Note } from "../../lib/schemas/note";
import { colors, shadows } from "../../theme/colors";

export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  const loadNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(notesSchema.parse(res.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const onLogout = async () => {
    setLogoutLoading(true);
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgAccentOne} />
      <View style={styles.bgAccentTwo} />

      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>Notebook</Text>
          <Text style={styles.welcomeText}>
            Hello, <Text style={styles.userName}>{displayName}</Text>
          </Text>
          <Text style={styles.subText}>
            Capture ideas before they disappear.
          </Text>
        </View>

        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutButton}
          disabled={logoutLoading}
        >
          <Text style={styles.logoutText}>
            {logoutLoading ? "..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.heading}>All notes</Text>
        <Text style={styles.countText}>{notes.length} total</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Link href={`/note/${item.id}`} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.noteCard,
                  pressed && styles.noteCardPressed,
                ]}
              >
                <View style={styles.noteMeta}>
                  <View style={styles.initialBadge}>
                    <Text style={styles.initialText}>
                      {item.title.trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.noteIndex}>Note {index + 1}</Text>
                </View>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text numberOfLines={3} style={styles.noteContent}>
                  {item.content}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Open note</Text>
                  <Text style={styles.cardFooterArrow}>&gt;</Text>
                </View>
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptyText}>
                Start with a quick note and build from there.
              </Text>
            </View>
          }
        />
      )}

      <Link href="/note/create" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ New note</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.bg,
  },
  bgAccentOne: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    opacity: 0.9,
  },
  bgAccentTwo: {
    position: "absolute",
    bottom: 70,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "#ede9fe",
    opacity: 0.7,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    ...shadows.card,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.accent,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  userName: {
    color: colors.primary,
  },
  subText: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  countText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
  noteCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  noteCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  noteMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  initialBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  noteIndex: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  initialText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  noteContent: {
    color: colors.textMuted,
    lineHeight: 21,
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardFooterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  cardFooterArrow: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 18,
    position: "absolute",
    bottom: 18,
    left: 20,
    right: 20,
    alignItems: "center",
    ...shadows.button,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
