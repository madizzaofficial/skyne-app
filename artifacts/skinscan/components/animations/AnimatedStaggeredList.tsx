import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface AnimatedStaggeredItemProps {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  staggerDelay?: number;
  duration?: number;
  listKey?: string;
}

const EASING = Easing.out(Easing.cubic);

export function AnimatedStaggeredItem({
  index,
  children,
  style,
  staggerDelay = 35,
  duration = 200,
  listKey,
}: AnimatedStaggeredItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 10;
    const delay = index * staggerDelay;
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: EASING }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration, easing: EASING })
    );
  }, [listKey, index, staggerDelay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}
