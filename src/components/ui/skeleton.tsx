import { useEffect } from "react";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "~/utils/cn";

type Props = {
  width: number;
  height: number;
  radius?: number;
  circle?: boolean;
  className?: string;
};

export function Skeleton({ width, height, radius, circle, className }: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const size = circle ? width : height;

  return (
    <Animated.View
      className={cn("bg-border", className)}
      style={[
        {
          width,
          height: size,
          borderRadius: circle ? width / 2 : (radius ?? 8),
        },
        animatedStyle,
      ]}
    />
  );
}
