import type { ReactNode } from "react";
import { Platform, type PressableProps } from "react-native";
import { hapticFeedback } from "~/consts/haptics";
import { usePressAnimation } from "~/hooks/use-press-animation";
import { cn } from "~/utils/cn";
import { AnimatedPressable } from "./animated-pressable";

const ANDROID_RIPPLE = { color: "rgba(0,0,0,0.1)" } as const;

const variantStyles = {
  primary: "bg-accent",
  secondary: "bg-card border border-border",
  danger: "bg-danger",
  ghost: "",
} as const;

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
} as const;

type Props = Omit<PressableProps, "children" | "style"> & {
  icon: ReactNode;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizes;
  disabled?: boolean;
  className?: string;
};

export function IconButton({
  icon,
  variant = "secondary",
  size = "md",
  disabled,
  className,
  onPress,
  ...props
}: Props) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation({
    disabled,
  });

  const handlePress: PressableProps["onPress"] = (e) => {
    if (disabled) return;
    hapticFeedback("tap");
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      disabled={disabled}
      android_ripple={
        Platform.OS === "android" && !disabled ? ANDROID_RIPPLE : undefined
      }
      className={cn(
        "items-center justify-center rounded-full",
        variantStyles[variant],
        sizes[size],
        disabled && "opacity-50",
        className,
      )}
      style={animatedStyle}
      {...props}
    >
      {icon}
    </AnimatedPressable>
  );
}
