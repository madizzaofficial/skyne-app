import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function NotFoundScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryDim }]}>
        <Feather name="compass" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Page introuvable</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Cette page n'existe pas ou a été déplacée.
      </Text>
      <Pressable
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => router.replace("/(tabs)/index" as any)}
      >
        <Feather name="home" size={16} color="#fff" />
        <Text style={styles.btnText}>Retour à l'accueil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  iconWrap: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
