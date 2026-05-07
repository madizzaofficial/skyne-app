import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ScoreBlockProps {
  score: number;
  reasons?: string[];
  compact?: boolean;
}

function CircleGauge({ score, color }: { score: number; color: string }) {
  const size = 80;
  const stroke = 7;
  return (
    <View style={[gaugeStyles.outer, { width: size, height: size }]}>
      <View
        style={[
          gaugeStyles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: "rgba(255,255,255,0.25)",
          },
        ]}
      />
      <View
        style={[
          gaugeStyles.ringAccent,
          {
            width: size - stroke * 2,
            height: size - stroke * 2,
            borderRadius: (size - stroke * 2) / 2,
            borderWidth: stroke,
            borderColor: "rgba(255,255,255,0.9)",
            borderRightColor: "transparent",
            borderBottomColor: score > 50 ? "rgba(255,255,255,0.9)" : "transparent",
            transform: [{ rotate: "-135deg" }],
          },
        ]}
      />
      <View style={gaugeStyles.center}>
        <Text style={gaugeStyles.number}>{score}</Text>
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  outer: { position: "relative", alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute" },
  ringAccent: { position: "absolute" },
  center: { position: "absolute", alignItems: "center", justifyContent: "center" },
  number: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
});

export function ScoreBlock({ score, reasons = [], compact = false }: ScoreBlockProps) {
  const colors = useColors();

  const getConfig = () => {
    if (score >= 80) {
      return {
        bg: "#3D7A54",
        label: "Super compatible",
        sub: "Excellent choix pour ta peau",
      };
    } else if (score >= 60) {
      return {
        bg: "#8B6914",
        label: "Partiellement compatible",
        sub: "Quelques points à surveiller",
      };
    } else {
      return {
        bg: "#8B2020",
        label: "Déconseillé",
        sub: "Plusieurs ingrédients problématiques",
      };
    }
  };

  const config = getConfig();

  if (compact) {
    return (
      <View style={[styles.compactBlock, { backgroundColor: config.bg }]}>
        <Text style={styles.compactLabel}>{config.label}</Text>
        <Text style={styles.compactScore}>{score}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.block, { backgroundColor: config.bg }]}>
      <View style={styles.left}>
        <Text style={styles.label}>{config.label}</Text>
        {reasons.length > 0 ? (
          reasons.map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={styles.bulletDot}>›</Text>
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sub}>{config.sub}</Text>
        )}
      </View>
      <CircleGauge score={score} color={config.bg} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  left: { flex: 1, gap: 6 },
  label: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", lineHeight: 18 },
  reasonRow: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  bulletDot: { fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 18 },
  reasonText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 18, flex: 1 },
  compactBlock: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  compactScore: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
});
