import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";

export type DocumentItem = {
    _id: string;
    name: string;
    url: string;
    uploadedAt?: string;
    text?: string;
};

type DocumentsContextType = {
    documents: DocumentItem[];
    loading: boolean;
    addLocal: (doc: DocumentItem) => void;
    refresh: () => Promise<void>;
    rename: (id: string, newName: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
};

// Use only base server URL
const SERVER_URL = process.env.EXPO_PUBLIC_API_URL!;

const DocumentsContext = createContext<DocumentsContextType>({
    documents: [],
    loading: false,
    addLocal: () => { },
    refresh: async () => { },
    rename: async () => { },
    remove: async () => { },
});

export const DocumentsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { t } = useTranslation();


    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Fetch user documents
     */
    const refresh = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${SERVER_URL}/documents?userId=${user.id}`);

            const data = await res.json();

            if (!res.ok || !Array.isArray(data)) {
                console.warn("Failed to fetch documents", data);
                Alert.alert(t("error"), "Failed to fetch documents");
                setDocuments([]); // fallback to empty array
                return;
            }
            setDocuments(data);
        } catch (err) {
            console.warn("Fetch documents error:", err);
            Alert.alert(t("error"), t("fetchDocumentsFailed"));
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [user, t]);

    // Add document locally (after OCR)
    const addLocal = (doc: DocumentItem) => {
        console.log("Adding local document:", doc);

        setDocuments((prev) => [doc, ...prev]);
        refresh();
    };

    /**
     * Rename document
     */
    const rename = async (id: string, newName: string) => {
        if (!user) return;

        try {
            const res = await fetch(`${SERVER_URL}/documents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    userId: user && user.id,
                }),
            });
            if (!res.ok) {
                console.warn("Rename failed");
                Alert.alert(t("renameFailed"));
            }
        } catch (err) {
            console.warn("Rename document error:", err);
            Alert.alert(t("renameFailed"));
        }
        refresh();
    };

    /**
     * Delete document
     */
    const remove = async (id: string) => {
        const doc = documents.find((d) => d._id === id);

        if (!doc) return;

        Alert.alert(
            t("deleteDocument"),
            t("deleteConfirm", { name: doc.name }),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("delete"),
                    style: "destructive",
                    onPress: async () => {

                        try {
                            const res = await fetch(`${SERVER_URL}/documents/${id}`, {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ userId: user && user.id }),
                            });

                            if (!res.ok) {
                                console.error("Delete failed");
                                Alert.alert(t("error"), t("deleteFailed"));
                            }
                        } catch (err) {
                            console.warn(err, t("deleteFailed"));
                        }
                        refresh();
                    },
                },
            ]
        );
    };

    /**
     * Auto-fetch when user logs in
     */
    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <DocumentsContext.Provider
            value={{
                documents,
                loading,
                addLocal,
                refresh,
                rename,
                remove,
            }}
        >
            {children}
        </DocumentsContext.Provider>
    );
};

export const useDocuments = () => useContext(DocumentsContext);
