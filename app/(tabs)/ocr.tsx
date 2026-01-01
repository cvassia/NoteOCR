import { REACT_NATIVE_SERVER_URL } from "@env";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text
} from "react-native";



const SERVER_URL = `${REACT_NATIVE_SERVER_URL}/ocr`; // <-- include /ocr

console.log("Server URL:", SERVER_URL);// const SERVER_URL = Platform.select({
//     ios: ENV_SERVER_URL,
//     android: ENV_SERVER_URL.includes("localhost") ? "http://10.0.2.2:3000" : ENV_SERVER_URL,
//     default: ENV_SERVER_URL,
// });

export default function OCRScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState<string>("");
    const [docxUrl, setDocxUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        } catch (err) {
            console.error("OCR error:", err);
            setOcrText("OCR failed");
        } finally {
            setLoading(false);
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>

            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

            {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.image} />
            )}

            {ocrText !== "" && (
                <Text style={styles.text}>{ocrText}</Text>
            )}

            {docxUrl && (
                <Button
                    title="Download Word file"
                    onPress={() => downloadDocx(docxUrl)}
                />
            )}
            <Button title="Pick Image" onPress={pickImage} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 50,
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
    },
});
