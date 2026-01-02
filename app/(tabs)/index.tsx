import { REACT_NATIVE_SERVER_URL } from "@env";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";
import { Colors } from "../../components/colors";
import { useDocuments } from '../context/DocumentsContext';


const SERVER_URL = `${REACT_NATIVE_SERVER_URL}/ocr`; // <-- include /ocr

// const SERVER_URL = Platform.select({
//     ios: ENV_SERVER_URL,
//     android: ENV_SERVER_URL.includes("localhost") ? "http://10.0.2.2:3000" : ENV_SERVER_URL,
//     default: ENV_SERVER_URL,
// });

export default function OCRScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState<string>("");
    const [docxUrl, setDocxUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { addDocument } = useDocuments();


    // Convert ANY image → JPEG (best for OCR)
    const convertToJPEG = async (uri: string): Promise<string> => {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
                compress: 0.95,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );
        return result.uri;
    };

    const downloadDocx = async (docUrl: string) => {
        if (!docUrl) return;
        try {
            // Fetch the DOCX from your server
            const response = await fetch(docUrl);
            if (!response.ok) throw new Error("Failed to fetch DOCX from server");

            // Convert response to array buffer
            const arrayBuffer = await response.arrayBuffer();

            // Convert to base64 string
            const base64String = btoa(
                new Uint8Array(arrayBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), "")
            );

            // Save to Expo cache
            const fileUri = FileSystem.cacheDirectory + "ocr-text.docx";
            await FileSystem.writeAsStringAsync(fileUri, base64String, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Share the file
            await Sharing.shareAsync(fileUri, {
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                dialogTitle: "Share OCR Word file",
                UTI: "com.microsoft.word.doc",
            });
        } catch (err) {
            console.error("Error downloading/sharing DOCX:", err);
        }
    };


    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 1,
            });

            if (result.canceled) return;

            setLoading(true);
            setOcrText("");
            setDocxUrl(null);

            const originalUri = result.assets[0].uri;
            const jpegUri = await convertToJPEG(originalUri);

            setImageUri(jpegUri);

            const formData = new FormData();
            formData.append("file", {
                uri: jpegUri,
                name: "image.jpg",
                type: "image/jpeg",
            } as any);

            const response = await fetch(SERVER_URL, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const data = await response.json();

            setOcrText(data.text || "No text detected");

            if (data.docxUrl) {
                setDocxUrl(data.docxUrl);
            }

            addDocument({
                id: Date.now().toString(),
                name: `document ${new Date().toLocaleDateString()}`,
                url: data.docxUrl,
                text: data.text || "",
            });

        } catch (err) {
            console.error("OCR error:", err);
            setOcrText("OCR failed");
        } finally {
            setLoading(false);
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>

            {loading && <ActivityIndicator size="large" color={Colors.primary} />
            }

            {(!loading && imageUri) && (
                <Image source={{ uri: imageUri }} style={styles.image} />
            )}

            {docxUrl && (
                <TouchableOpacity style={styles.primaryButton}
                    onPress={() => downloadDocx(docxUrl)}
                >
                    <Text style={styles.primaryButtonText}>Download Word file</Text>
                </TouchableOpacity>

            )}
            {!loading &&
                <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
                    <Text style={styles.primaryButtonText}>Pick Image</Text>
                </TouchableOpacity>}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: Colors.background,
    },
    image: {
        width: "100%",
        height: 300,
        marginVertical: 20,
        resizeMode: "contain",
    },
    text: {
        fontSize: 16,
        marginTop: 10,
        color: Colors.background
    },
    primaryButton: {
        width: 100,
        height: 100,
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 16,
    },

    primaryButtonText: {
        color: "#312C51",
        fontWeight: "600",
        fontSize: 16,
    },

});
