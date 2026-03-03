import { Delete } from "lucide-react-native";
import { Text as RNText, View } from "react-native";
import { hapticFeedback } from "~/consts/haptics";
import { PIN_LENGTH } from "~/consts/security";
import { usePressAnimation } from "~/hooks/use-press-animation";
import { cn } from "~/utils/cn";
import { AnimatedPressable } from "./animated-pressable";

type SoftKeyboardProps = {
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
  variant: keyof typeof SOFT_KEYBOARD_VARIANTS;
  disabled?: boolean;
};

type KeyProps = {
  value: string | number | "del" | "";
  onPress: () => void;
  disabled?: boolean;
};

const MAX_AMOUNT_LENGTH = 13;
const MAX_DECIMALS = 2;

const SOFT_KEYBOARD_VARIANTS = {
  pin: {
    rows: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ["", 0, "del"],
    ],
    applyFn: (prev: string, key: string): string => {
      if (key === "del") return prev.slice(0, -1);
      if (prev.length >= PIN_LENGTH) return prev;
      return prev + key;
    },
  },
  amount: {
    rows: [
      [7, 8, 9],
      [4, 5, 6],
      [1, 2, 3],
      [".", 0, "del"],
    ],
    applyFn: (prev: string, key: string): string => {
      if (key === "del") return prev.slice(0, -1);
      if (prev.length >= MAX_AMOUNT_LENGTH) return prev;

      if (key === ".") {
        if (prev.includes(".")) return prev;
        if (prev.length >= MAX_AMOUNT_LENGTH - 1) return prev;
        return `${prev || "0"}.`;
      }

      const decimalIdx = prev.indexOf(".");
      if (decimalIdx !== -1 && prev.length - decimalIdx > MAX_DECIMALS) return prev;

      if (prev === "0" && key !== ".") return String(key);

      return prev + key;
    },
  },
} as const;

export function SoftKeyboard({ value, onChange, variant, disabled }: SoftKeyboardProps) {
  const layout = SOFT_KEYBOARD_VARIANTS[variant];

  const handlePress = (key: string | number) => {
    onChange((prev) => layout.applyFn(typeof prev === "string" ? prev : "", String(key)));
  };

  return (
    <View className="gap-xs px-md">
      {layout.rows.map((row, i) => (
        <View key={i} className="flex-row gap-xs">
          {row.map((key, j) => (
            <Key key={`${i}-${j}`} value={key} onPress={() => handlePress(key)} disabled={disabled} />
          ))}
        </View>
      ))}
    </View>
  );
}

function Key({ value, onPress, disabled }: KeyProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation({
    scale: 0.92,
    opacity: 0.7,
    disabled: disabled || value === "",
  });

  if (value === "") return <View className="flex-1 min-h-18" />;

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => {
        if (disabled) return;
        hapticFeedback("tap");
        onPress();
      }}
      disabled={disabled}
      className={cn("flex-1 min-h-18 items-center justify-center rounded-button", disabled && "opacity-30")}
      style={animatedStyle}>
      {value === "del" ? (
        <Delete size={24} className="text-text" />
      ) : (
        <RNText className="font-sans-semibold text-text" style={{ fontSize: 28, includeFontPadding: false }}>
          {value}
        </RNText>
      )}
    </AnimatedPressable>
  );
}
