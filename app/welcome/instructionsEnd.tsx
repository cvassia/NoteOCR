import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../components/colors";

export default function WelcomeScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const finishWelcome = async () => {
        await AsyncStorage.setItem("hasOpenedApp", "true");
        router.replace("/(tabs)");
    };

    return (
        <View style={styles.container}>

            <Text style={styles.subtitle}>
                {t("welcomeText3")}
            </Text>
            <Text style={styles.subtitle}>
                {t("welcomeText4")}
            </Text>

            <TouchableOpacity style={styles.button} onPress={finishWelcome}>
                <Text style={styles.buttonText}>{t("getStarted")}</Text>
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
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        color: Colors.secondary,
        marginBottom: 32,
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
