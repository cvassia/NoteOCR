// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Import your env vars

import {
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    // eslint-disable-next-line import/no-unresolved
} from '@env';
import * as jwtDecode from 'jwt-decode';

type MyTokenType = {
    email: string;
    name: string;
    sub: string; // Google user ID
    picture?: string;
};

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
};

const STORAGE_KEY = 'APP_USER';

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithApple: async () => { },
    signOut: () => { },
});

const getGoogleClientConfig = () =>
    Platform.select({
        web: { clientId: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID },
        ios: { clientId: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID },
        android: { clientId: EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID },
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
    const [request, response, promptAsync] = Google.useAuthRequest(getGoogleClientConfig());

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.idToken) {
                const decoded = (jwtDecode as unknown as (token: string) => MyTokenType)(authentication?.idToken);

                try {
                    // Decode the ID token for real user info
                    const payload: any = decoded;
                    const userData: User = {
                        id: payload.sub,
                        name: payload.name,
                        email: payload.email,
                    };
                    setUser(userData);
                    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
                } catch (err) {
                    console.error('Failed to decode Google ID token:', err);
                    Alert.alert('Login Error', 'Failed to sign in with Google. Please try again.');
                }
            }
        } else if (response?.type === 'error') {
            Alert.alert('Login Error', 'Google sign-in failed. Please try again.');
        }
    }, [response]);

    const signInWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (err) {
            console.error('Google sign-in error:', err);
            Alert.alert('Login Error', 'Failed to start Google login. Please try again.');
        }
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
                email: credential.email ?? undefined, // Only first login
            };

            setUser(userData);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        } catch (err) {
            console.log('Apple login canceled or failed', err);
            Alert.alert('Login Error', 'Apple sign-in failed. Please try again.');
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, signInWithGoogle, signInWithApple, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
