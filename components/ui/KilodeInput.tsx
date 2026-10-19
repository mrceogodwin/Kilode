import React from "react";
import { TextInput, View, Text, StyleSheet, TextInputProps } from "react-native";
import { BORDER, RADIUS, TEXT, TEXT3, WHITE, BLUE } from "../../theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function KilodeInput({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={TEXT3}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
    marginBottom: 6,
  },
  input: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
  },
  inputError: { borderColor: "#E11D48" },
  error: { marginTop: 4, fontSize: 12, color: "#E11D48" },
});
