import React, { useEffect, useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Direction = "forward" | "backward" | "none";

interface AnimatedScreenTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  direction?: Direction;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  slideDistance?: number;
}

const EASING = Easing.out(Easing.cubic);

export function AnimatedScreenTransition({
  children,
  transitionKey,
  direction = "forward",
  style,
  duration = 220,
  slideDistance = 32,
}: AnimatedScreenTransitionProps) {
  const translateX = useSharedValue(
    direction === "forward"
      ? slideDistance
      : direction === "backward"
      ? -slideDistance
      : 0
  );
  const opacity = useSharedValue(0);

  const prevKey = useRef(transitionKey);

  useEffect(() => {
    if (prevKey.current !== transitionKey) {
      const startX =
        direction === "forward"
          ? slideDistance
          : direction === "backward"
          ? -slideDistance
          : 0;
      translateX.value = startX;
      opacity.value = 0;
      prevKey.current = transitionKey;
    }

    translateX.value = withTiming(0, { duration, easing: EASING });
    opacity.value = withTiming(1, { duration: duration * 0.85, easing: EASING });
  }, [transitionKey, direction, duration, slideDistance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
