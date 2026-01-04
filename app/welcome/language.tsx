import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../components/colors";

export default function LanguageScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();

    const chooseLanguage = async (lang: "en" | "el") => {
        await i18n.changeLanguage(lang);
        await AsyncStorage.setItem("appLanguage", lang);
        router.push("/welcome/welcome");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Image2Doc</Text>
            <Text style={styles.subtitle}>Please choose your language</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => chooseLanguage("en")}
            >
                <Text style={styles.buttonText}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.secondary]}
                onPress={() => chooseLanguage("el")}
            >
                <Text style={styles.buttonText}>Ελληνικά</Text>
            </TouchableOpacity>
            <Text style={styles.textLanguage}>You can change the language anytime from the settings.</Text>

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
        fontSize: 28,
        fontWeight: "700",
        color: Colors.secondary,
        marginBottom: 70,
    },
    textLanguage: {
        fontSize: 16,
        color: Colors.primary,
        marginTop: 40,
        textAlign: "center",
        lineHeight: 24,
    },
    subtitle: {
        fontSize: 19,
        marginBottom: 40,
        color: Colors.primary,
        textAlign: "center",
    },
    button: {
        backgroundColor: Colors.secondary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        marginBottom: 16,
        width: "100%",
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 20,
        textAlign: "center",
    },
});
