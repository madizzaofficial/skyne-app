import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  action: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
