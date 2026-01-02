import React, { createContext, ReactNode, useContext, useState } from "react";

type DocumentItem = {
    id: string;
    name: string;
    url: string;
    text: string;
};

type DocumentsContextType = {
    documents: DocumentItem[];
    addDocument: (doc: DocumentItem) => void;
};

const DocumentsContext = createContext<DocumentsContextType>({
    documents: [],
    addDocument: () => { },
});

export const DocumentsProvider = ({ children }: { children: ReactNode }) => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);

    const addDocument = (doc: DocumentItem) => {
        setDocuments((prev) => [doc, ...prev]); // newest on top
    };

    return (
        <DocumentsContext.Provider value={{ documents, addDocument }}>
            {children}
        </DocumentsContext.Provider>
    );
};

export const useDocuments = () => useContext(DocumentsContext);

export default DocumentsContext