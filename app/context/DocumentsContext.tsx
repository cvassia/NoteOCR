// eslint-disable-next-line import/no-unresolved
import { REACT_NATIVE_SERVER_URL } from "@env";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type DocumentItem = {
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
};

// Use only base server URL
const SERVER_URL = REACT_NATIVE_SERVER_URL;

const DocumentsContext = createContext<DocumentsContextType>({
    documents: [],
    fetchDocuments: async () => { },
    addDocument: () => { },
});

export const DocumentsProvider = ({ children }: { children: ReactNode }) => {
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

    const addDocument = (doc: DocumentItem) => {
        // Add locally
        setDocuments((prev) => [doc, ...prev]);
        // NOTE: POST to server is not supported unless you add endpoint
        // You can implement POST /documents server-side if needed
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <DocumentsContext.Provider value={{ documents, fetchDocuments, addDocument }}>
            {children}
        </DocumentsContext.Provider>
    );
};

export const useDocuments = () => useContext(DocumentsContext);
