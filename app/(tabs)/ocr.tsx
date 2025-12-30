import * as ImagePicker from "expo-image-picker";
import React, { JSX, useState } from "react";
import {
    ActivityIndicator,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import TextRecognition from "react-native-text-recognition";

export default function OCRScreen(): JSX.Element {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Pick image from library
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setImageUri(uri);
            processImage(uri);
        }
    };

    // Process image using text-recognition
    const processImage = async (uri: string) => {
        setLoading(true);
        setOcrText("");

        try {
            const result: string[] = await TextRecognition.recognize(uri);
            setOcrText(result.join("\n")); // Combine detected lines
        } catch (error) {
            console.error(error);
            setOcrText("Error recognizing text");
        }

        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!imageUri ? (
                <Button title="Pick Image" onPress={pickImage} />
            ) : (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <Text style={styles.text}>{ocrText}</Text>
                    )}
                    <Button
                        title="Pick Another Image"
                        onPress={() => {
                            setImageUri(null);
                            setOcrText("");
                        }}
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
        justifyContent: "center",
    },
    imageContainer: {
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: 300,
        marginBottom: 10,
        resizeMode: "contain",
    },
    text: {
        fontSize: 16,
        marginVertical: 10,
    },
});
