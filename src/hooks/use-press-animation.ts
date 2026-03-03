import { Platform } from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export const PRESS_SPRING = { mass: 1, damping: 100, stiffness: 275 } as const;

type Options = {
  scale?: number;
  opacity?: number;
  disabled?: boolean;
};

export function usePressAnimation({ scale = 0.975, opacity = 0.9, disabled }: Options = {}) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const s = interpolate(pressed.value, [0, 1], [1, scale]);
    if (Platform.OS === "ios") {
      const o = interpolate(pressed.value, [0, 1], [1, opacity]);
      return { transform: [{ scale: s }], opacity: o };
    }
    return { transform: [{ scale: s }] };
  });

  const onPressIn = () => {
    if (!disabled) pressed.value = withSpring(1, PRESS_SPRING);
  };

  const onPressOut = () => {
    pressed.value = withSpring(0, PRESS_SPRING);
  };

  return { animatedStyle, onPressIn, onPressOut } as const;
}
