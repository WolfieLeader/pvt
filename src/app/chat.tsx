import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { AnimatedPressable } from "~/components/ui/animated-pressable";
import { hapticFeedback } from "~/consts/haptics";
import { usePressAnimation } from "~/hooks/use-press-animation";

export default function ChatScreen() {
  const router = useRouter();
  const textColor = useCSSVariable("--color-text") as string;
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation();

  const dismiss = () => {
    hapticFeedback("press");
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-[20px] py-sm">
        <AnimatedPressable
          onPress={dismiss}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={10}
          className="flex-row items-center gap-xs h-[44px]"
          style={animatedStyle}
        >
          <X size={20} color={textColor} />
          <Text className="text-text font-sans-medium text-body">Close</Text>
        </AnimatedPressable>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-text font-sans-semibold text-subtitle">Chat</Text>
      </View>
    </SafeAreaView>
  );
}
