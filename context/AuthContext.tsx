
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { t } from "i18next";
import { jwtDecode } from "jwt-decode";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { Alert, Platform } from "react-native";

const getGoogleClientConfig = () =>
    Platform.select({
        web: { clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID },
        ios: { clientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID },
        android: { clientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID },
    });
type User = {
    id: string;
    name?: string;
    email?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => void;
    deleteUser: () => Promise<void>;
};

const STORAGE_KEY = "APP_USER";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;


const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithApple: async () => { },
    signOut: () => { },
    deleteUser: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /** Load user from storage on mount */
    useEffect(() => {
        (async () => {
            const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedUser) setUser(JSON.parse(storedUser));
            setLoading(false);
        })();
    }, []);

    /** Sign out */
    const signOut = async () => {
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
    };

    /** Google login */

    const [request, response, promptAsync] = Google.useAuthRequest(
        getGoogleClientConfig(),
    );





    useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;

            if (authentication?.idToken) {
                const decoded: any = jwtDecode(authentication.idToken);

                const userData: User = {
                    id: decoded.sub, // ✅ STABLE GOOGLE USER ID
                    name: decoded.name,
                    email: decoded.email,
                };

                setUser(userData);
                AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            }
        }
    }, [response]);

    const signInWithGoogle = async () => {
        await promptAsync();
    };

    /** Apple login */
    const signInWithApple = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const userData: User = {
                id: credential.user,
                name: credential.fullName?.givenName ?? undefined,
                email: credential.email ?? undefined, // ⚠️ only available first login
            };

            setUser(userData);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        } catch (err) {
            console.log("Apple login canceled or failed", err);
        }
    };

    /** Delete User */
    const deleteUser = async () => {
        if (!user) return;

        Alert.alert(
            t("deleteUser"),
            t("deleteConfirm", { name: t("userName") }),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("delete"),
                    style: "destructive",
                    onPress: async () => {


                        try {
                            setLoading(true);

                            await fetch(`${SERVER_URL}/users/${user.id}`, {
                                method: "DELETE",
                            });

                            setUser(null);
                            await AsyncStorage.removeItem(STORAGE_KEY);

                        } catch (err) {
                            console.error("Delete user error:", err);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );


    };

    return (
        <AuthContext.Provider
            value={{
                user, loading,
                signInWithGoogle,
                signInWithApple, signOut, deleteUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
