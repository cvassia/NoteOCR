import * as AppleAuthentication from "expo-apple-authentication";
import React, { useEffect, useState } from "react";
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

/* Enable animation on Android */
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
    const { user, signInWithGoogle, signInWithApple, signOut } = useAuth();

    const [showHelp, setShowHelp] = useState(false);
    const [showLicenses, setShowLicenses] = useState(false);
    const [appleAvailable, setAppleAvailable] = useState(false);

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

    console.log(user)

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
                        <Text style={styles.authText}>Sign in to sync your documents</Text>

                        <TouchableOpacity style={styles.authButton} onPress={signInWithGoogle}>
                            <Text style={styles.authButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {appleAvailable && (
                            <TouchableOpacity
                                style={[styles.authButton, styles.appleButton]}
                                onPress={signInWithApple}
                            >
                                <Text style={styles.appleButtonText}>Continue with Apple</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>

            {/* HELP */}
            <TouchableOpacity style={styles.row} onPress={() => toggle(setShowHelp)}>
                <Text style={styles.rowTitle}>Help</Text>
            </TouchableOpacity>

            {showHelp && (
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        This app lets you turn photos of documents into editable Word files.
                        {"\n\n"}
                        Simply upload an image, and the app uses advanced OCR technology to
                        extract text while preserving formatting.
                        {"\n\n"}
                        Your documents are securely stored and can be accessed anytime after
                        signing in.
                    </Text>
                </View>
            )}

            {/* LICENSES */}
            <TouchableOpacity style={styles.row} onPress={() => toggle(setShowLicenses)}>
                <Text style={styles.rowTitle}>License</Text>
            </TouchableOpacity>

            {showLicenses && (
                <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                        This app uses open-source software and third-party services:
                        {"\n\n"}
                        • Google Document AI – OCR processing{"\n"}
                        • Expo SDK – Mobile framework{"\n"}
                        • React Native – UI framework{"\n"}
                        • docx – Word document generation
                        {"\n\n"}
                        All trademarks and services belong to their respective owners.
                    </Text>
                </View>
            )}

            {/* SIGN OUT */}
            {user && (
                <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
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
});
