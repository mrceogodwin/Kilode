import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { KilodeRoot } from "./KilodeRoot";

/**
 * Web-only crash guard. Keeps native App.tsx untouched.
 * If a render-time exception causes a blank page, show a useful recovery screen
 * instead of an empty white canvas.
 */
class WebPreviewBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Kilode web preview render error]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text style={styles.brand}>KILODE<Text style={styles.accent}>!</Text></Text>
          <Text style={styles.heading}>The preview hit an error.</Text>
          <Text style={styles.copy}>The page failed while rendering. Reload to try again.</Text>
          <ScrollView style={styles.details} contentContainerStyle={styles.detailsInner}>
            <Text selectable style={styles.errorText}>
              {this.state.error.message || "Unknown rendering error"}
            </Text>
          </ScrollView>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => this.setState({ error: null })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <WebPreviewBoundary>
      <KilodeRoot />
    </WebPreviewBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100vh" as any,
    backgroundColor: "#0D0D10",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brand: { color: "#F4F4F1", fontSize: 30, fontWeight: "900", letterSpacing: -1.2 },
  accent: { color: "#91C7A0" },
  heading: { color: "#F4F4F1", fontSize: 20, fontWeight: "700", marginTop: 24, textAlign: "center" },
  copy: { color: "#9A9A9E", fontSize: 14, marginTop: 10, textAlign: "center", maxWidth: 420 },
  details: { width: "100%", maxWidth: 600, maxHeight: 180, marginTop: 18, backgroundColor: "#18181C", borderRadius: 12 },
  detailsInner: { padding: 14 },
  errorText: { color: "#E5C158", fontSize: 13 },
  button: { marginTop: 20, backgroundColor: "#D4AF37", borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12 },
  buttonText: { color: "#0D0D10", fontWeight: "800" },
});
