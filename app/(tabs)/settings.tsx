import * as AppleAuthentication from "expo-apple-authentication";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import { Colors } from "../../components/colors";
import { useAuth } from "../context/AuthContext";
import i18n from "../utils";


/* Enable animation on Android */
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
    const { user, signInWithGoogle, signInWithApple, signOut } = useAuth();
    const { t } = useTranslation();

    const [showHelp, setShowHelp] = useState(false);
    const [showLicenses, setShowLicenses] = useState(false);
    const [appleAvailable, setAppleAvailable] = useState(false);
    const [showLanguage, setShowLanguage] = useState(false);
    const [showInstruction, setShowInstruction] = useState(false);



    useEffect(() => {
        (async () => {
            if (Platform.OS === "ios") {
                setAppleAvailable(await AppleAuthentication.isAvailableAsync());
            }
        })();
    }, []);

    const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setter((prev) => !prev);
    };

    const changeLanguage = (lang: "en" | "el") => {
        i18n.changeLanguage(lang);
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* USER HEADER */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/avatar.png')} // your illustration
                    style={styles.avatarImage}
                    resizeMode="contain"
                />
                {user ? (
                    <Text style={styles.email}>{user.email}</Text>
                ) : (
                    <>
                        <Text style={styles.authText}>{t("signIn")}</Text>

                        <TouchableOpacity style={styles.authButton} onPress={signInWithGoogle}>
                            <Text style={styles.authButtonText}>{t("continueWithGoogle")}</Text>
                        </TouchableOpacity>

                        {appleAvailable && (
                            <TouchableOpacity
                                style={[styles.authButton, styles.appleButton]}
                                onPress={signInWithApple}
                            >
                                <Text style={styles.appleButtonText}>{t("continueWithApple")}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
            {/* LANGUAGE */}
            <TouchableOpacity style={styles.row} onPress={() => { toggle(setShowLanguage) }}>
                <Text style={styles.rowTitle}>{t("language")}</Text>
            </TouchableOpacity>

            {showLanguage && (
                <View style={styles.dropdown}>
                    <TouchableOpacity
                        style={styles.languageOption}
                        onPress={() => {
                            changeLanguage("en");
                            toggle(setShowLanguage)
                        }}
                    >
                        <Text style={styles.languageText}>🇬🇧 English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.languageOption}
                        onPress={() => {
                            changeLanguage("el");
                            toggle(setShowLanguage)
                        }}
                    >
                        <Text style={styles.languageText}>🇬🇷 Ελληνικά</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* INSTRUCTIONS */}
            <TouchableOpacity style={styles.row} onPress={() => {
                toggle(setShowInstruction);
                showLicenses && toggle(setShowLicenses);
                showHelp && toggle(setShowHelp);

            }}>
                <Text style={styles.rowTitle}>{t("instructions")}</Text>
            </TouchableOpacity>

            {showInstruction && (
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        {t("welcomeText1")}
                        {"\n\n"}
                        {t("welcomeText2")}
                        {"\n\n"}
                        {t("welcomeText3")}
                        {"\n\n"}
                        {t("welcomeText4")}
                    </Text>
                </View>
            )}

            {/* HELP */}
            <TouchableOpacity style={styles.row} onPress={() => {
                toggle(setShowHelp);
                showLicenses && toggle(setShowLicenses);
                showInstruction && toggle(setShowInstruction);
            }}>
                <Text style={styles.rowTitle}>{t("help")}</Text>
            </TouchableOpacity>

            {showHelp && (
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        {t("helpText1")}
                        {"\n\n"}
                        {t("helpText2")}
                        {"\n\n"}
                        {t("helpText3")}
                        {"\n\n"}
                        {t("helpText4")}
                        {"\n\n"}
                        {t("helpText5")}
                        {"\n\n"}
                        {t("helpText6")}
                        {"\n\n"}
                        {t("helpText7")}
                        {"\n\n"}
                        {t("helpText8")}
                        {"\n\n"}
                        {t("helpText9")}
                        {"\n\n"}
                        {t("helpText10")}
                        {"\n\n"}
                        {t("helpText11")}
                        {"\n\n"}
                        {t("helpText12")}
                    </Text>
                </View>
            )}

            {/* LICENSES */}
            <TouchableOpacity style={styles.row} onPress={() => {
                showHelp && toggle(setShowHelp);
                showInstruction && toggle(setShowInstruction);
                toggle(setShowLicenses)
            }}>
                <Text style={styles.rowTitle}>{t("license")}</Text>
            </TouchableOpacity>

            {showLicenses && (
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        {t("licenseText1")}
                        {"\n\n"}
                        • Google Document AI – OCR processing{"\n"}
                        • Expo SDK – Mobile framework{"\n"}
                        • React Native – UI framework{"\n"}
                        • docx – Word document generation
                        {"\n\n"}
                        {t("licenseText2")}
                    </Text>
                </View>
            )}

            {/* SIGN OUT */}
            {user && (
                <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                    <Text style={styles.signOutText}>{t("signOut")}</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 80,
        padding: 24,
        backgroundColor: Colors.background,
    },

    /* Header */
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    // avatar: {
    //     width: 88,
    //     height: 88,
    //     borderRadius: 44,
    //     backgroundColor: Colors.primary,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     marginBottom: 12,
    // },
    avatarImage: {
        width: 140,
        height: 140,
        borderRadius: 75,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "700",
        color: Colors.background,
    },
    email: {
        fontSize: 16,
        color: Colors.secondary,
    },

    authText: {
        textAlign: "center",
        fontSize: 16,
        marginBottom: 16,
        color: Colors.secondary,
    },
    authButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        marginBottom: 12,
        width: "100%",
    },
    authButtonText: {
        color: Colors.background,
        fontWeight: "600",
        textAlign: "center",
    },
    appleButton: {
        backgroundColor: Colors.textPrimary,
    },
    appleButtonText: {
        color: Colors.background,
        fontWeight: "600",
        textAlign: "center",
    },

    /* Rows */
    row: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    rowTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.secondary,
    },

    dropdown: {
        paddingVertical: 12,
    },
    dropdownText: {
        color: Colors.secondary,
        lineHeight: 22,
        fontSize: 15,
    },

    signOutButton: {
        marginTop: 32,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: "#FF5A5F",
    },
    signOutText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    languageOption: {
        paddingVertical: 10,
    },
    languageText: {
        fontSize: 19,
        color: Colors.secondary,
        lineHeight: 22,
    },

});
