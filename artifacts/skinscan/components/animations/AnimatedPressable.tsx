import React, { useCallback } from "react";
import {
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface AnimatedPressableProps {
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleTo?: number;
  opacityTo?: number;
  duration?: number;
  hitSlop?: number;
  disabled?: boolean;
}

export function AnimatedPressable({
  onPress,
  style,
  children,
  scaleTo = 0.96,
  opacityTo = 0.75,
  duration = 120,
  disabled = false,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      if (disabled) return;
      scale.value = withTiming(scaleTo, { duration });
      opacity.value = withTiming(opacityTo, { duration });
    })
    .onFinalize((e) => {
      scale.value = withTiming(1, { duration });
      opacity.value = withTiming(1, { duration });
      if (!disabled && onPress) {
        onPress(e as unknown as GestureResponderEvent);
      }
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}
