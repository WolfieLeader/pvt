import { ActivityIndicator, Platform, type PressableProps } from "react-native";
import { Text as RNText } from "react-native";
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

const variantText = {
  primary: "text-white font-sans-semibold",
  secondary: "text-text font-sans-medium",
  danger: "text-white font-sans-semibold",
  ghost: "text-accent font-sans-medium",
} as const;

const sizeStyles = {
  sm: "py-xs px-md rounded-button",
  md: "py-sm px-lg rounded-button",
  lg: "py-md px-xl rounded-button",
} as const;

const sizeText = {
  sm: "text-caption",
  md: "text-body",
  lg: "text-subtitle",
} as const;

type Props = Omit<PressableProps, "children" | "style"> & {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  disabled?: boolean;
  loading?: boolean;
  children: string;
  className?: string;
  activeScale?: number;
  activeOpacity?: number;
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  loading,
  children,
  className,
  activeScale = 0.975,
  activeOpacity = 0.9,
  onPress,
  ...props
}: Props) {
  const isDisabled = disabled || loading;
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation({
    scale: activeScale,
    opacity: activeOpacity,
    disabled: isDisabled,
  });

  const handlePress: PressableProps["onPress"] = (e) => {
    if (isDisabled) return;
    hapticFeedback("tap");
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      disabled={isDisabled}
      android_ripple={
        Platform.OS === "android" && !isDisabled ? ANDROID_RIPPLE : undefined
      }
      className={cn(
        "items-center justify-center flex-row",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "opacity-50",
        className,
      )}
      style={animatedStyle}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" || variant === "ghost" ? undefined : "#fff"}
        />
      ) : (
        <RNText
          className={cn(variantText[variant], sizeText[size])}
          style={{ includeFontPadding: false }}
        >
          {children}
        </RNText>
      )}
    </AnimatedPressable>
  );
}
