import { createContext, useContext, type PropsWithChildren } from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

interface ScrollContextValue {
  scrollY: SharedValue<number>;
  prevScrollY: SharedValue<number>;
  isScrollingDown: SharedValue<boolean>;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function ScrollProvider({ children }: PropsWithChildren) {
  const scrollY = useSharedValue(0);
  const prevScrollY = useSharedValue(0);
  const isScrollingDown = useSharedValue(false);

  return <ScrollContext.Provider value={{ scrollY, prevScrollY, isScrollingDown }}>{children}</ScrollContext.Provider>;
}

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScrollContext must be inside ScrollProvider");
  return ctx;
}
