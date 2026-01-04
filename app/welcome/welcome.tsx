import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../components/colors";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const continueWelcome = async () => {
    await AsyncStorage.setItem("hasOpenedApp", "true");
    router.replace("/welcome/instructions");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("welcome")}</Text>

      <Text style={styles.subtitle}>
        {t("description")}
      </Text>
      <TouchableOpacity style={styles.button} onPress={continueWelcome}>
        <Text style={styles.buttonText}>{t("instructions")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.secondary,
    marginBottom: 50,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
    color: Colors.secondary,
    marginBottom: 60,
  },
  button: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: "#404040ff",
    fontWeight: "700",
    fontSize: 16,
  },
});
