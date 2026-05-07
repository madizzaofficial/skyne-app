import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Accueil</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalogue">
        <Icon sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }} />
        <Label>Catalogue</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favoris">
        <Icon sf={{ default: "bookmark", selected: "bookmark.fill" }} />
        <Label>Favoris</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="routine">
        <Icon sf={{ default: "list.bullet.clipboard", selected: "list.bullet.clipboard.fill" }} />
        <Label>Routine</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ScannerFAB() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Pressable
      style={[
        styles.fab,
        {
          backgroundColor: colors.primary,
          bottom: insets.bottom + (Platform.OS === "web" ? 90 : 68),
          shadowColor: colors.primary,
        },
      ]}
      onPress={() => {
        router.push("/scanner-modal");
      }}
    >
      <Feather name="camera" size={22} color="#fff" />
    </Pressable>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : "#0A0A0A",
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            height: isWeb ? 84 : 60,
            paddingBottom: isWeb ? 34 : 8,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={80}
                tint="dark"
                style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,10,10,0.9)" }]}
              />
            ) : null,
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: "Inter_500Medium",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="house" tintColor={color} size={22} />
              ) : (
                <Feather name="home" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="catalogue"
          options={{
            title: "Catalogue",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="square.grid.2x2" tintColor={color} size={22} />
              ) : (
                <Feather name="grid" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="favoris"
          options={{
            title: "Favoris",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="bookmark" tintColor={color} size={22} />
              ) : (
                <Feather name="bookmark" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: "Routine",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="list.bullet" tintColor={color} size={22} />
              ) : (
                <Feather name="list" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="person.circle" tintColor={color} size={22} />
              ) : (
                <Feather name="user" size={22} color={color} />
              ),
          }}
        />
        {/* Hidden screens */}
        <Tabs.Screen name="scanner" options={{ tabBarButton: () => null }} />
      </Tabs>

      <ScannerFAB />
    </View>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
