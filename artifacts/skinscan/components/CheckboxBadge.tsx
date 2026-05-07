import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CheckboxBadgeProps {
  label: string;
  value: boolean;
}

export function CheckboxBadge({ label, value }: CheckboxBadgeProps) {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: value ? colors.successDim : colors.dangerDim, borderColor: value ? `${colors.success}40` : `${colors.danger}40` }]}>
      <Feather
        name={value ? "check" : "x"}
        size={12}
        color={value ? colors.success : colors.danger}
      />
      <Text style={[styles.label, { color: value ? colors.success : colors.danger }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
