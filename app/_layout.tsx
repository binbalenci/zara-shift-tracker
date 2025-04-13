import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast, BaseToastProps } from "react-native-toast-message";
import { SalaryProfileProvider } from "./contexts/SalaryProfileContext";
import { PaperProvider } from "react-native-paper";

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#4CAF50" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "bold" }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#FF0000" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "bold" }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#FFA500" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "bold" }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#2196F3" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "bold" }}
      text2Style={{ fontSize: 13 }}
    />
  ),
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SalaryProfileProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
          </SafeAreaView>
        </SalaryProfileProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
