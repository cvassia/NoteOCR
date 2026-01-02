import * as AppleAuthentication from 'expo-apple-authentication';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../components/colors';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentsContext';
import { shareDocument } from './index';


type AppleButtonProps = {
  signIn: (event: GestureResponderEvent) => void;
};

export function AppleButton({ signIn }: AppleButtonProps) {
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        const available = await AppleAuthentication.isAvailableAsync();
        setAppleAvailable(available);
      }
    })();
  }, []);

  if (!appleAvailable) return null; // Hide button if not available

  return (
    <TouchableOpacity style={{ padding: 16, backgroundColor: 'black', borderRadius: 12 }} onPress={signIn}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign in with Apple</Text>
    </TouchableOpacity>
  );
}

export default function DocumentsScreen() {
  const { user, loading, signInWithGoogle, signInWithApple } = useAuth();
  const { documents, fetchDocuments } = useDocuments();
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingDocs(true);
      fetchDocuments().finally(() => setLoadingDocs(false));
    }
  }, [fetchDocuments, user]);

  // Show spinner while checking login state
  if (loading || loadingDocs) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }



  // User not logged in
  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Log in or Sign up to see your documents</Text>
        <TouchableOpacity style={styles.authButton} onPress={signInWithGoogle}>
          <Text style={styles.authButtonText}>Log in with Google</Text>
        </TouchableOpacity>
        <AppleButton signIn={signInWithApple} />

      </View>
    );
  }

  if (documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No documents yet.</Text>
      </View>
    );
  }



  return (
    <ScrollView contentContainerStyle={styles.container}>
      {documents.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          style={styles.docButton}
          onPress={() => shareDocument(doc.url, doc.name)}
        >
          <View style={styles.docRow}>
            <IconSymbol name="doc.text" size={24} color={Colors.card} />
            <Text style={styles.docText}>{doc.name}</Text>
          </View>
        </TouchableOpacity>
      ))
      }
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 70
  },
  docButton: { backgroundColor: Colors.primary, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20, marginBottom: 12 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docText: { color: '#312C51', fontWeight: '600', fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#A9A4C7' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  authText: { fontSize: 18, marginBottom: 24, textAlign: 'center', color: '#312C51' },
  authButton: { backgroundColor: Colors.secondary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, marginBottom: 16 },
  authButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
