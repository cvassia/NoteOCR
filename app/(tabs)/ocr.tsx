import { encode } from "base64-arraybuffer";
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





const SERVER_URL = "http://192.168.1.3:3000/ocr"; // 🔴 change if needed

export default function OCRScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState<string | null>("");
    const [docxUrl, setDocxUrl] = useState<string | null>("");

    const [loading, setLoading] = useState(false);

    // Convert ANY image (HEIC / PNG) → REAL PNG
    const convertToPNG = async (uri: string): Promise<string> => {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
                compress: 1,
                format: ImageManipulator.SaveFormat.PNG,
            }
        );
        return result.uri;
    };

    const downloadDocx = async (docUrl: string) => {
        try {
            // Use cacheDirectory for temporary storage
            const fileUri = FileSystem.cacheDirectory + "ocr-text.docx";

            // Fetch DOCX as arrayBuffer
            const response = await fetch(docUrl);
            const arrayBuffer = await response.arrayBuffer();

            // Convert to Base64
            const base64Data = encode(arrayBuffer);

            // Write Base64 to local file
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Open share dialog
            await Sharing.shareAsync(fileUri);
        } catch (err) {
            console.error("Error downloading/sharing DOCX:", err);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"], // ✅ correct enum
                quality: 1,
            });

            if (result.canceled) return;

            setLoading(true);
            setOcrText("");

            const originalUri = result.assets[0].uri;
            const jpegUri = await convertToPNG(originalUri);

            setImageUri(jpegUri);

            const formData = new FormData();
            formData.append("file", {
                uri: jpegUri,
                name: "image.png",
                type: "image/png",
            } as any);

            const response = await fetch(SERVER_URL, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // const fileUri: string = FileSystem.documentDirectory! + "ocr-text.docx";

            // // const fileUri = FileSystem.documentDirectory + "ocr-text.docx";
            // const blob = await response.blob();
            // const buffer = await blob.arrayBuffer();
            // await FileSystem.writeAsStringAsync(fileUri, Buffer.from(buffer).toString("base64"), { encoding: FileSystem.EncodingType.Base64 });
            // await Sharing.shareAsync(fileUri);

            const data = await response.json();

            // console.log("sdgsdgfsdfg", data)

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

    console.log("docxUrl", docxUrl)

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Button title="Pick Image" onPress={pickImage} />

            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

            {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.image} />
            )}

            {ocrText !== "" && (
                <Text style={[styles.text, { fontFamily: "System" }]}>{ocrText}</Text>
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
        padding: 20,
        justifyContent: "center",
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
