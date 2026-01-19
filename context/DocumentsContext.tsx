

// import { EXPO_PUBLIC_REACT_NATIVE_SERVER_URL } from "@env";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";




export type DocumentItem = {
    id: string;
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
// const SERVER_URL = EXPO_PUBLIC_REACT_NATIVE_SERVER_URL;
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
            const res = await fetch(
                `${SERVER_URL}/documents?userId=${user.id}`
            );

            if (!res.ok) console.warn("Failed to fetch documents");

            const data = await res.json();
            setDocuments(data);
        } catch (err) {
            console.error("Fetch documents error:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);



    // Add document locally (after OCR)
    const addLocal = (doc: DocumentItem) => {
        console.log("Adding local document:", doc);

        setDocuments(prev => [doc, ...prev]);
        refresh()
    };

    /**
     * Rename document
     */
    const rename = async (id: string, newName: string) => {
        const previous = documents;

        // optimistic update
        setDocuments(docs =>
            docs.map(d => (d.id === id ? { ...d, name: newName } : d))
        );
        try {
            const res = await fetch(`${SERVER_URL}/documents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName, userId: user && user.id
                }),
            });
            if (!res.ok) console.warn("Rename failed");
        } catch (err) {
            console.error("Rename document error:", err);
            setDocuments(previous);
            console.warn(t("error"), t("renameFailed"));
        }
        refresh()
    };

    /**
     * Delete document
     */
    const remove = async (id: string) => {
        const doc = documents.find(d => d.id === id);


        if (!doc) return;

        // console.warn(
        //     t("deleteDocument"),
        //     t("deleteConfirm", { name: doc.name }),
        //     [
        //         { text: t("cancel"), style: "cancel" },
        //         {
        //             text: t("delete"),
        //             style: "destructive",
        //             onPress: async () => {
        const previous = documents;
        setDocuments(docs => docs.filter(d => d.id !== id));

        try {
            const res = await fetch(
                `${SERVER_URL}/documents/${id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user && user.id })
                }
            );

            if (!res.ok) console.warn("Delete failed");
        } catch (err) {
            console.error("Delete document error:", err);
            setDocuments(previous);
            console.warn(t("error"), t("deleteFailed"));
        }
        // },
        // },
        // ]
        // );
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
