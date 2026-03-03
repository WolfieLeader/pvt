import { Text as RNText, type TextProps } from "react-native";
import { cn } from "~/utils/cn";

const BASE_STYLE = { includeFontPadding: false } as const;

const variants = {
  body: "font-sans text-body",
  caption: "font-sans text-caption",
  subtitle: "font-sans-medium text-subtitle",
  title: "font-sans-semibold text-title",
  heading: "font-sans-bold text-heading",
  display: "font-sans-bold text-display",
  label: "font-sans-medium text-body",
} as const;

const colors = {
  default: "text-text",
  muted: "text-muted",
  accent: "text-accent",
  danger: "text-danger",
  inverted: "text-background",
} as const;

type Props = TextProps & {
  variant?: keyof typeof variants;
  color?: keyof typeof colors;
  disabled?: boolean;
};

export function Text({
  variant = "body",
  color = "default",
  disabled,
  className,
  style,
  ...props
}: Props) {
  return (
    <RNText
      className={cn(
        variants[variant],
        colors[color],
        disabled && "opacity-50",
        className,
      )}
      style={[BASE_STYLE, style]}
      {...props}
    />
  );
}
