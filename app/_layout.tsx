import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, View } from "react-native";
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
    <PaperProvider>
      <SalaryProfileProvider>
        <View style={{ flex: 1 }}>
          <Tabs>
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <MaterialIcons name="home" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="shifts"
              options={{
                title: "Shifts",
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <MaterialIcons name="list" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="statistics"
              options={{
                title: "Statistics",
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <MaterialIcons name="bar-chart" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: "Settings",
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <MaterialIcons name="settings" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
          <Toast config={toastConfig} />
        </View>
      </SalaryProfileProvider>
    </PaperProvider>
  );
}
