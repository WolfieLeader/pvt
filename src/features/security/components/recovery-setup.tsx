import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { Button, Card, Text } from "~/components";
import { hapticFeedback } from "~/consts/haptics";
import { cn } from "~/utils/cn";
import { RECOVERY_QUESTIONS } from "../consts";
import { storeRecoveryAnswers } from "../crypto";

type Props = {
  onComplete: () => void;
  onCancel?: () => void;
};

export function RecoverySetup({ onComplete }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const toggleQuestion = (id: number) => {
    hapticFeedback("tap");
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((q) => q !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const canSubmit = selected.length === 2 && selected.every((id) => answers[id]?.trim());

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      hapticFeedback("tap");
      const [q1, q2] = selected;
      await storeRecoveryAnswers(q1, answers[q1], q2, answers[q2]);
      hapticFeedback("success");
      onComplete();
    } catch {
      hapticFeedback("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-lg gap-lg"
      keyboardShouldPersistTaps="handled">
      <View className="gap-xs">
        <Text variant="title">Recovery Questions</Text>
        <Text color="muted">Pick 2 questions. If you forget your passcode, you can answer these to reset it.</Text>
      </View>

      <View className="gap-sm">
        {RECOVERY_QUESTIONS.map((q) => {
          const isSelected = selected.includes(q.id);
          return (
            <Card
              key={q.id}
              pressable
              onPress={() => toggleQuestion(q.id)}
              className={cn(isSelected && "border border-accent")}>
              <Text variant="label">{q.label}</Text>
              {isSelected && (
                <TextInput
                  className="font-sans text-body text-text mt-sm border-b border-border pb-xs"
                  style={{ includeFontPadding: false }}
                  placeholder="Your answer"
                  placeholderTextColor="#999"
                  value={answers[q.id] ?? ""}
                  onChangeText={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            </Card>
          );
        })}
      </View>

      <Text variant="caption" color="muted">
        Answers are case-insensitive
      </Text>

      <Button label="Continue" onPress={handleSubmit} disabled={!canSubmit} loading={saving} />
    </ScrollView>
  );
}
