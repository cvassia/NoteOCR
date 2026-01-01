# NoteOCR 📄📱  
Offline-Capable OCR Mobile App with Greek & English Support and Word Export

---

## 📌 Overview

**NoteOCR** is a mobile application built with **Expo (React Native)** and a **Node.js OCR server** that allows users to:

- Pick an image from their device
- Perform OCR (Optical Character Recognition)
- Recognize **Greek (Ελληνικά)** and **English** text
- Preserve paragraph structure as much as possible
- Export the recognized text into a **Microsoft Word (.docx)** file
- Download or share the Word document from the mobile device

This app is designed primarily for **documents**, such as:
- Legal documents
- Government forms
- Printed pages
- Typed Greek/English text

---

## 🧠 Architecture

The app consists of **two parts**:

### 1️⃣ Mobile Client (Expo / React Native)
- Image selection
- Image preprocessing
- OCR request handling
- Display OCR results
- Download & share Word documents

### 2️⃣ OCR Server (Node.js / Express)
- Receives images
- Runs OCR using **Tesseract.js**
- Supports **Greek (ell)** and **English (eng)**
- Generates `.docx` files
- Serves generated Word files to the client

---

## 🛠 Tech Stack

### Frontend
- Expo (React Native)
- TypeScript
- expo-image-picker
- expo-image-manipulator
- expo-sharing

### Backend
- Node.js
- Express
- Multer (file uploads)
- Tesseract.js v7
- docx (Word document generation)
- cors

---

## 📂 Project Structure

NoteOCR/
├── app/
│ └── (tabs)/
│ └── ocr.tsx # OCR screen
├── server/
│ ├── index.js # OCR server
│ ├── uploads/ # Uploaded images + generated DOCX
│ └── package.json
├── README.md
---

## 📱 Mobile App Flow

1. User taps **Pick Image**
2. Image is selected from gallery
3. Image is converted to **real JPEG**
4. Image is uploaded to the OCR server
5. OCR is performed
6. Recognized text is:
   - Displayed on screen
   - Exported to a Word document
7. User can **download or share** the `.docx` file

---

## 🖼 Image Preprocessing (Client Side)

Before uploading, the image is:

- Converted to **JPEG**
- Preserved at full quality
- Normalized to avoid HEIC / PNG issues

This ensures compatibility with Tesseract.

---

## 🔎 OCR Details

- OCR Engine: **Tesseract.js**
- Languages:
  - English: `eng`
  - Greek: `ell`
- Combined mode:   `eng + ell`



### ⚠️ OCR Limitations (Important)

Due to OCR engine limitations:

- ❌ **Exact text alignment (center/right) is NOT preserved**
- ⚠️ Some characters may be misrecognized (common with Greek accents)


---

## 📄 Word (.docx) Export

After OCR, the server:

- Splits text into paragraphs
- Creates a **single Word document**
- Keeps paragraphs on the **same page**
- Avoids page breaks per line

The document is generated using the **docx** library and saved on the server.

---

## 📥 Downloading the Word File (Mobile)

- The server exposes the generated `.docx` via HTTP
- The mobile app fetches the file
- The user can:
- Save it
- Share it via email / cloud / messaging apps

---

## 🌐 Server API

### POST `/ocr`

Uploads an image and returns OCR results.

### Running the Project

1️⃣ Start the Server

cd server
npm install
node index.js



2️⃣ Start the Mobile App

npm install
npx expo start

Run on:

iOS Simulator
Android Emulator
Physical device 



### ⚖️ Disclaimer

This app is intended for assistance only.
OCR results must be manually reviewed, especially for:

Legal documents

Government forms

Court submissions

The developers are not responsible for OCR inaccuracies.


### 👨‍💻 Author

Built with persistence, debugging, and patience 💪
For educational and productivity use.

### 📜 License

MIT License