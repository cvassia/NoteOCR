
// eslint-disable-next-line import/no-unresolved
import { REACT_NATIVE_SERVER_URL } from "@env";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";




export type DocumentItem = {
    id: string;
    name: string;
    url: string;
    uploadedAt?: string;
    text?: string;
};

type DocumentsContextType = {
    documents: DocumentItem[];
    fetchDocuments: () => Promise<void>;
    addDocument: (doc: DocumentItem) => void;
    renameDocument: (id: string, newName: string) => void;
    deleteDocument: (id: string) => void;
};

// Use only base server URL
const SERVER_URL = REACT_NATIVE_SERVER_URL;

const DocumentsContext = createContext<DocumentsContextType>({
    documents: [],
    fetchDocuments: async () => { },
    addDocument: () => { },
    renameDocument: () => { },
    deleteDocument: () => { },
});

export const DocumentsProvider = ({ children }: { children: ReactNode }) => {
    console.log("SERVER URL:", SERVER_URL);

    const { t } = useTranslation();

    const [documents, setDocuments] = useState<DocumentItem[]>([]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/documents`);
            const data = await res.json();
            setDocuments(data.reverse()); // newest first
        } catch (err) {
            console.error("Error fetching documents:", err);
        }
    };

    // Add a document
    const addDocument = async (doc: DocumentItem) => {
        setDocuments(prev => [doc, ...prev]);
        try {
            await fetch(`${SERVER_URL}/documents`, {
                method: "POST",
                body: JSON.stringify(doc),
            });
        } catch (err) {
            console.error("Error posting document:", err);
        }
    };

    // Rename a document
    const renameDocument = async (id: string, newName: string) => {
        setDocuments(prev => prev.map(d => (d.id === id ? { ...d, name: newName } : d)));
        try {
            await fetch(`${SERVER_URL}/documents/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ name: newName }),
            });
        } catch (err) {
            console.error("Error renaming document:", err);
        }
    };

    // Delete a document
    const deleteDocument = async (id: string) => {
        // Find the document name for the alert
        const doc = documents.find(d => d.id === id);

        if (!doc) return;

        // Show confirmation alert
        Alert.alert(
            t("deleteDocument"),
            t("deleteConfirm", { name: doc.name }),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("deleteDocument"),
                    style: "destructive",
                    onPress: async () => {
                        // Remove locally
                        setDocuments(prev => prev.filter(d => d.id !== id));

                        // Remove from backend
                        try {
                            await fetch(`${SERVER_URL}/documents/${id}`, { method: "DELETE" });
                        } catch (err) {
                            console.error("Error deleting document:", err);
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <DocumentsContext.Provider value={{ documents, fetchDocuments, addDocument, renameDocument, deleteDocument }}>
            {children}
        </DocumentsContext.Provider>
    );
};

export const useDocuments = () => useContext(DocumentsContext);
