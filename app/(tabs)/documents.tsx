import * as Sharing from 'expo-sharing';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../components/colors';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { useDocuments } from '../context/DocumentsContext';

export default function DocumentsScreen() {
  const { documents } = useDocuments();

  const shareDocument = async (url: string) => {
    try {
      await Sharing.shareAsync(url, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Share Word file',
        UTI: 'com.microsoft.word.doc',
      });
    } catch (err) {
      console.error('Error sharing document:', err);
    }
  };

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
          onPress={() => shareDocument(doc.url)}
        >
          <View style={styles.docRow}>
            <IconSymbol name="doc.text" size={24} color={Colors.secondary} />
            <Text style={styles.docText}>{doc.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  docButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docText: {
    color: '#312C51',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#A9A4C7',
  },
});
