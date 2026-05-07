import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuestGate } from "@/components/GuestGate";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function FavorisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, getProductById } = useApp();
  const [showGate, setShowGate] = useState(false);

  const favProducts = favorites.map((id) => getProductById(id)).filter(Boolean);

  // Show guest lock screen if not authenticated
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Mes favoris</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.lockIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="lock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Connecte-toi pour voir tes favoris
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Crée un compte gratuit pour sauvegarder des produits et y accéder depuis n'importe quel appareil.
          </Text>
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/auth");
            }}
          >
            <Feather name="user" size={16} color="#fff" />
            <Text style={styles.loginBtnText}>Créer un compte</Text>
          </Pressable>
          <Pressable
            style={[styles.browseBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/catalogue");
            }}
          >
            <Text style={[styles.browseBtnText, { color: colors.textSecondary }]}>
              Parcourir le catalogue
            </Text>
          </Pressable>
        </View>
        <GuestGate
          visible={showGate}
          onClose={() => setShowGate(false)}
          feature="les favoris"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Mes favoris</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favProducts.length} produit{favProducts.length !== 1 ? "s" : ""} sauvegardé{favProducts.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {favProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.lockIcon, { backgroundColor: colors.primaryDim }]}>
            <Feather name="bookmark" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Aucun favori pour l'instant
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Sauvegarde des produits depuis leur fiche en appuyant sur le marque-page
          </Text>
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/catalogue");
            }}
          >
            <Feather name="grid" size={16} color="#fff" />
            <Text style={styles.loginBtnText}>Parcourir le catalogue</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {favProducts.map((p) => (
            <ProductCard key={p!.id} product={p!} personalScore={80} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  browseBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  browseBtnText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
