import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { hapticFeedback } from "~/consts/haptics";
import { cn } from "~/utils/cn";
import { Text } from "./text";

const variantStyles = {
  default: "bg-card border border-border",
  accent: "bg-primary-50 dark:bg-primary-950",
  success: "bg-success/10",
  danger: "bg-danger/10",
} as const;

const variantText = {
  default: "text-muted",
  accent: "text-accent",
  success: "text-success",
  danger: "text-danger",
} as const;

type Props = {
  label: string;
  icon?: string | ReactNode;
  variant?: keyof typeof variantStyles;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
};

export function Chip({
  label,
  icon,
  variant = "default",
  selected,
  onPress,
  className,
}: Props) {
  const content = (
    <>
      {icon != null && (
        typeof icon === "string" ? (
          <Text variant="caption">{icon}</Text>
        ) : (
          icon
        )
      )}
      <Text
        variant="caption"
        className={cn("font-sans-medium", variantText[variant])}
      >
        {label}
      </Text>
    </>
  );

  const baseClass = cn(
    "flex-row items-center gap-xs px-sm py-xs rounded-full",
    variantStyles[variant],
    selected && "border border-accent",
    className,
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          hapticFeedback("tap");
          onPress();
        }}
        className={baseClass}
      >
        {content}
      </Pressable>
    );
  }

  return <View className={baseClass}>{content}</View>;
}
