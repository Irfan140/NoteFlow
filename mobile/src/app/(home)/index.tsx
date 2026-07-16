import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { useApi } from "../../lib/api";
import { Link, useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { notesSchema, type Note } from "../../schemas/note";

export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser(); // <-- Clerk User Info

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Create display name logic
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
      <Text style={styles.welcomeText}>
        Hello, <Text style={styles.userName}>{displayName}</Text>
      </Text>

      <View style={styles.headerRow}>
        <Text style={styles.heading}>All notes</Text>

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

      {/* Notes Loading */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/note/${item.id}`} asChild>
              <TouchableOpacity style={styles.noteCard}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.noteContent}>
                  {item.content}
                </Text>
              </TouchableOpacity>
            </Link>
          )}
        />
      )}

      <Link href="/note/create" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Note</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  welcomeText: {
    fontSize: 22,
    fontWeight: "500",
  },

  userName: {
    fontWeight: "700",
    color: "#2563eb",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  heading: {
    fontSize: 18,
    fontWeight: "500",
  },

  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },

  noteCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  noteContent: {
    color: "#555",
  },

  addButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },

  addButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
