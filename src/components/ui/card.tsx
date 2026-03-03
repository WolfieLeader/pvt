import { Platform, View, type ViewProps } from "react-native";
import { hapticFeedback } from "~/consts/haptics";
import { usePressAnimation } from "~/hooks/use-press-animation";
import { cn } from "~/utils/cn";
import { AnimatedPressable } from "./animated-pressable";

const ANDROID_RIPPLE = { color: "rgba(0,0,0,0.06)" } as const;

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  android: { elevation: 2 },
});

type Props = ViewProps & {
  pressable?: boolean;
  onPress?: () => void;
  className?: string;
};

function PressableCard({ onPress, className, style, children, ...props }: Omit<Props, "pressable">) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation({
    scale: 0.985,
    opacity: 0.95,
  });

  const handlePress = () => {
    hapticFeedback("tap");
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      android_ripple={Platform.OS === "android" ? ANDROID_RIPPLE : undefined}
      className={cn("bg-card rounded-card p-[20px]", className)}
      style={[shadowStyle, animatedStyle, style]}
      {...props}>
      {children}
    </AnimatedPressable>
  );
}

export function Card({ pressable, onPress, className, style, children, ...props }: Props) {
  if (pressable || onPress) {
    return (
      <PressableCard onPress={onPress} className={className} style={style} {...props}>
        {children}
      </PressableCard>
    );
  }

  return (
    <View className={cn("bg-card rounded-card p-[20px]", className)} style={[shadowStyle, style]} {...props}>
      {children}
    </View>
  );
}
