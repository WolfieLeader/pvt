import { useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { Platform, StyleSheet } from "react-native";
import { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { AnimatedPressable } from "~/components/ui/animated-pressable";
import { hapticFeedback } from "~/consts/haptics";
import { SPACING, TAB_BAR_HEIGHT } from "~/consts/spacing";
import { useScrollContext } from "~/contexts/scroll";
import { usePressAnimation } from "~/hooks/use-press-animation";
const SIZE = 56;
const HIDE_OFFSET = SIZE + SPACING.md + TAB_BAR_HEIGHT;

export function FAB() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useCSSVariable("--color-accent") as string;
  const { isScrollingDown } = useScrollContext();
  const { animatedStyle: pressAnimatedStyle, onPressIn, onPressOut } = usePressAnimation();

  const scrollAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(isScrollingDown.value ? HIDE_OFFSET : 0, {
          damping: 15,
          stiffness: 120,
        }),
      },
    ],
  }));

  const handlePress = () => {
    hapticFeedback("press");
    router.push("/chat");
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.fab,
        { bottom: insets.bottom + TAB_BAR_HEIGHT + SPACING.md, backgroundColor: accent },
        scrollAnimatedStyle,
        pressAnimatedStyle,
      ]}>
      <MessageCircle size={24} color="#fff" fill="#fff" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: SPACING.md,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
});
