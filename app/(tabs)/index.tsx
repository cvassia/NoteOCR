// eslint-disable-next-line import/no-unresolved
import { REACT_NATIVE_SERVER_URL } from "@env";
import { BlurView } from 'expo-blur';
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../components/colors";
import { useDocuments } from '../context/DocumentsContext';


const SERVER_URL = `${REACT_NATIVE_SERVER_URL}/ocr`;

export const shareDocument = async (url: string, filename: string) => {
  try {
    const localUri = `${FileSystem.cacheDirectory}${filename}`;
    const { uri } = await FileSystem.downloadAsync(url, localUri);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) throw new Error("Sharing is not available on this device");

    await Sharing.shareAsync(uri, {
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      dialogTitle: `Share ${filename}`,
      UTI: "com.microsoft.word.doc",
    });
  } catch (err) {
    console.error("Error sharing document:", err);
  }
};

export default function OCRScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addDocument } = useDocuments();

  const convertToJPEG = async (uri: string): Promise<string> => {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.95,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  };

  const downloadDocx = async (docUrl: string) => {
    if (!docUrl) return;
    try {
      const response = await fetch(docUrl);
      if (!response.ok) throw new Error("Failed to fetch DOCX from server");

      const arrayBuffer = await response.arrayBuffer();
      const base64String = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const fileUri = FileSystem.cacheDirectory + "ocr-text.docx";
      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

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
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();
      setOcrText(data.text || "No text detected");

      if (data.docxUrl) setDocxUrl(data.docxUrl);

      if (data.docxUrl) {
        addDocument({
          id: Date.now().toString(),
          name: `document ${new Date().toLocaleDateString()}`,
          url: data.docxUrl,
          text: data.text || "",
        });
      }
    } catch (err) {
      console.error("OCR error:", err);
      setOcrText("OCR failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Top image with gradient blending */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/first.jpg")}
          style={styles.headerImage}
          resizeMode="cover"
        />
        {/* Gradient overlay to blend into background */}
        <LinearGradient
          colors={['rgba(49,44,81,0)', '#312C51']} // fully transparent at top -> solid #312C51 at bottom
          style={styles.gradientOverlay}
        />
      </View>

      {/* Loading spinner */}
      {loading && (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Buttons */}
      {!loading && (
        <>
          {!docxUrl && (
            <>
              <BlurView intensity={100} tint="light" style={styles.glassContainer}>
                <Text style={styles.text}>
                  Take a photo or choose an image from your gallery to convert it in a docx file.
                </Text>
              </BlurView>

              <TouchableOpacity style={styles.pickFile} onPress={pickImage}>
                <Text style={styles.ButtonText}>Pick Image</Text>
              </TouchableOpacity>
            </>

          )}
          {docxUrl && (
            <>
              <TouchableOpacity style={styles.downloadButton} onPress={() => downloadDocx(docxUrl)}>
                <Text style={styles.DownloadButtonText}>Download Word file</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickFile} onPress={pickImage}>
                <Text style={styles.ButtonText}>Pick Another Image</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 360,
    position: "relative",
    overflow: "hidden",
    marginBottom: 50
  },
  headerImage: {
    // aspectRatio: 16 / 9,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300, // adjust how much of the bottom blends
  },
  spinnerContainer: {
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  glassContainer: {
    margin: 30,
    borderRadius: 20,
    backgroundColor: "rgba(49, 44, 81, 0.25)",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // subtle glass border
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    padding: 30,
    color: Colors.backgroundTabs,
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 25,
    fontSize: 18,
    elevation: 6,
  },
  pickFile: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 6,
  },
  downloadButton: {
    backgroundColor: Colors.backgroundTabs,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 6,
  },
  DownloadButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 18,
  },
  ButtonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 18,
  },
});