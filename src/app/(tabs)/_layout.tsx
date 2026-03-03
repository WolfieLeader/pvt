import { Tabs } from "expo-router";
import { House, ListChecks, Receipt, Settings } from "lucide-react-native";
import { useCSSVariable } from "uniwind";
import { FAB } from "~/components/fab";
import { hapticFeedback } from "~/consts/haptics";
import { FONTS, FONT_SIZE } from "~/consts/typography";
import { ScrollProvider } from "~/contexts/scroll";

export default function TabLayout() {
  const [accent, muted, cardBg, border] = useCSSVariable([
    "--color-accent",
    "--color-muted",
    "--color-card",
    "--color-border",
  ]) as string[];

  return (
    <ScrollProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
          tabBarStyle: {
            backgroundColor: cardBg,
            borderTopColor: border,
            borderTopWidth: 0.5,
          },
          tabBarLabelStyle: {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZE.caption,
          },
        }}
        screenListeners={{
          tabPress: () => hapticFeedback("tabPress"),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <House size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "Expenses",
            tabBarIcon: ({ color, size }) => (
              <Receipt size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            tabBarIcon: ({ color, size }) => (
              <ListChecks size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <FAB />
    </ScrollProvider>
  );
}
