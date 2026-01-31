import { useFocusEffect } from "@react-navigation/native";
import * as AppleAuthentication from "expo-apple-authentication";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../components/colors";
import { IconSymbol } from "../../components/ui/icon-symbol";
import { useAuth } from "../../context/AuthContext";
import { DocumentItem, useDocuments } from "../../context/DocumentsContext";
import { shareDocument } from "./index";

/* -------------------------------------------------------------------------- */
/*                                   Apple                                    */
/* -------------------------------------------------------------------------- */

type AppleButtonProps = {
  signIn: (event: GestureResponderEvent) => void;
};

export function AppleButton({ signIn }: AppleButtonProps) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      if (Platform.OS === "ios") {
        const available = await AppleAuthentication.isAvailableAsync();
        setAppleAvailable(available);
      }
    })();
  }, []);

  if (!appleAvailable) return null;

  return (
    <TouchableOpacity
      style={{
        padding: 16,
        backgroundColor: Colors.textPrimary,
        borderRadius: 12,
        width: 200,
      }}
      onPress={signIn}
    >
      <Text
        style={{
          fontWeight: "bold",
          textAlign: "center",
          color: Colors.background,
        }}
      >
        {t("signInApple")}
      </Text>
    </TouchableOpacity>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Documents Screen                              */
/* -------------------------------------------------------------------------- */

export default function DocumentsScreen() {
  const { t } = useTranslation();

  const { user, loading, signInWithGoogle, signInWithApple } = useAuth();
  const {
    documents,
    loading: docsLoading,
    rename,
    remove,
    refresh,
  } = useDocuments();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [newName, setNewName] = useState("");

  /* ----------------------------- Open document ----------------------------- */
  const openDocument = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(t("cannotOpenDocument"));
      }
    } catch (err) {
      console.error(err);
      console.warn(t("errorOpeningDocument"));
    }
  };

  /* ------------------------------ Loading UI ------------------------------- */
  if (loading || docsLoading) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  /* --------------------------- Not authenticated --------------------------- */
  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>{t("logInOrSignUp")}</Text>

        <TouchableOpacity style={styles.authButton} onPress={signInWithGoogle}>
          <Text style={styles.authButtonText}>{t("login")}</Text>
        </TouchableOpacity>

        <AppleButton signIn={signInWithApple} />
      </View>
    );
  }

  /* ------------------------------ Empty state ------------------------------ */
  if (!Array.isArray(documents) || documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("noDocuments")}</Text>
      </View>
    );
  }
  /* --------------------------------- List --------------------------------- */
  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {documents.map((doc) => (
          <View key={doc._id} style={styles.docRowContainer}>
            <TouchableOpacity
              style={styles.iconRow}
              onPress={() => openDocument(doc.url)}
            >
              <View style={styles.docRow}>
                <IconSymbol name="doc.text" size={24} color={Colors.card} />
                <Text style={styles.docText}>{doc.name}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.iconRow}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDoc(doc);
                  setNewName(doc.name);
                  setRenameModalVisible(true);
                }}
              >
                <IconSymbol
                  name="pencil.and.outline"
                  size={22}
                  color={Colors.background}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => remove(doc._id)}>
                <IconSymbol name="trash" size={22} color="red" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => shareDocument(doc.url, doc.name)}
              >
                <IconSymbol
                  name="paperplane"
                  size={22}
                  color={Colors.background}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ----------------------------- Rename modal ----------------------------- */}
      {renameModalVisible && selectedDoc && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t("renameDocument")}</Text>

            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder={t("enterNewName")}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.secondary },
                ]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.primary },
                ]}
                onPress={() => {
                  if (newName.trim()) {
                    rename(selectedDoc._id, newName.trim());
                    setRenameModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>{t("rename")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 70,
  },
  docRowContainer: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    borderRadius: 20,
  },
  iconRow: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  docText: {
    color: "#312C51",
    fontWeight: "600",
    fontSize: 16,
    maxWidth: 150
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#A9A4C7",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  authText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: "center",
    color: "#312C51",
  },
  authButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  authButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContainer: {
    width: "80%",
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.primary,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    color: Colors.primary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 16,
  },
});
