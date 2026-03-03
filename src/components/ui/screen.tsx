import { ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { SCREEN } from "~/consts/spacing";
import { cn } from "~/utils/cn";

const DEFAULT_EDGES: Edge[] = ["top"];
const SCROLL_CONTENT = { flexGrow: 1, paddingHorizontal: SCREEN.padding } as const;
const PADDING_STYLE = { paddingHorizontal: SCREEN.padding } as const;

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  edges?: Edge[];
};

export function Screen({ children, scroll, className, edges = DEFAULT_EDGES }: Props) {
  return (
    <SafeAreaView edges={edges} className={cn("flex-1 bg-background", className)}>
      {scroll ? (
        <ScrollView contentContainerStyle={SCROLL_CONTENT}>
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1" style={PADDING_STYLE}>{children}</View>
      )}
    </SafeAreaView>
  );
}
