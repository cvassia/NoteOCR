import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
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
    const [ocrText, setOcrText] = useState("");
    const [loading, setLoading] = useState(false);

    // Convert ANY image (HEIC / PNG) → REAL JPEG
    const convertToJpeg = async (uri: string): Promise<string> => {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
                compress: 1,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );
        return result.uri;
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
            const jpegUri = await convertToJpeg(originalUri);

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
        } catch (err) {
            console.error("OCR error:", err);
            setOcrText("OCR failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Button title="Pick Image" onPress={pickImage} />

            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

            {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.image} />
            )}

            {ocrText !== "" && (
                <Text style={styles.text}>{ocrText}</Text>
            )}
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
