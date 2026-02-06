# Image2Doc (NoteOCR)

A cross-platform mobile application that converts photos of printed documents into editable Word (.docx) files using **Google Document AI OCR**, with full document management and secure authentication.

---

## 🚀 Live Demo

➡️ https://apps.apple.com/za/app/image2word/id6757700644


![Image2Doc GIF](https://github.com/cvassia/NoteOCR/raw/main/assets/demo.gif)  


---

## 🧠 Overview

Image2Word is a mobile-first document digitization tool built with **React Native** and **TypeScript**. Users can take a photo or upload a document image, extract the text using Google Document AI, and download the output as an editable Word file. The app supports Greek and all Latin-based languages and provides user-friendly document management.

This app is designed primarily for **documents**, such as:
- Legal documents
- Government forms
- Printed pages
- Typed Greek/English text

---

## 👨‍💻 Role & Contribution

I developed this project end-to-end as a solo developer:

Built mobile frontend with React Native and TypeScript
Developed backend API using Node.js and Express
Integrated Google Document AI for OCR
Implemented secure authentication and document management
Managed the workflow from image capture to .docx generation

---


## 🏗 Architecture

React Native Client
↳ Image Capture / Upload
↳ Client-side image preprocessing

Backend API (Node.js + Express)
↳ OCR request handling
↳ Google Document AI integration
↳ Docx file creation
↳ Auth & document storage

Google Document AI
↳ Multi-language OCR
↳ High-accuracy extraction


---

## 🧩 Key Features

- 📸 Capture or upload images of documents  
- 🧠 OCR support for Greek and Latin languages  
- 📄 Export recognized text as editable Word files  
- 🔐 Secure login with Google & Apple  
- 📂 Save, rename, delete, download & share documents  

---

## ⚠️ Challenges & Solutions

OCR Accuracy: Improved preprocessing for better recognition
Large Uploads: Optimized mobile image handling
Async Workflows: Smooth, reliable asynchronous processes
Word Generation: Clean conversion of OCR results into .docx

---

## Key Learnings

Full-stack TypeScript development
AI service integration in mobile apps
Secure file pipelines
Mobile authentication best practices

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
- Google Document AI
- MS Word (.docx) generation
- Authentication (Google & Apple)

---


## 📁 Project Structure

📦 client
┣ 📂 src
┃ ┣ 📂 assets
┃ ┣ 📂 components
┃ ┣ 📂 screens
┃ ┗ 📜 App.tsx
📦 server
┣ 📂 controllers
┣ 📂 routes
┣ 📂 utils
┗ 📜 index.js


---

## 📱 Mobile App Flow

1. User taps Pick Image or Take Photo
2. Image is selected from gallery
3. Image is converted to **real JPEG**
4. Image is uploaded to the OCR server
5. OCR is performed
6. Recognized text is:
   - Displayed on screen
   - Exported to a Word document
7. User can **download or share** the `.docx` file
8. User logs in (optional but enables document management)



## 🖼 Image Preprocessing (Client Side)

Before uploading, the image is:

- Converted to **JPEG**
- Preserved at full quality
- Normalized to avoid HEIC / PNG issues

---

## 🔎 OCR Details

- OCR Engine: **GoogleDocumentAI**
- Languages: all


### ⚠️ OCR Limitations (Important)

Due to OCR engine limitations:

- ❌ **Exact text alignment (center/right) is NOT preserved**
- ⚠️ Some characters may be misrecognized (common with Greek accents)


---




## 🧪 Local Development

1. Clone the repository  
git clone https://github.com/cvassia/NoteOCR.git

2. Install client and server dependencies
cd client && npm install
cd ../server && npm install

3. Configure environment variables (Google AI keys, etc.)
4. Run client and backend
expo start
node server/index.js


---

## 📦 Deployment

- Mobile app deployed via **Expo**
- Backend hosted with environment-protected services
- Google Document AI setup via **Google Cloud console**

---

## 🧠 Future Improvements

- Add automated testing (end-to-end + unit)
- Improve error handling & offline support
- Add pagination and document search
- Enhance UI animations and accessibility

---

## 📎 Links

- 🟦 Live App: https://image2word.cvassia.com/  
- 🐙 GitHub Repo: https://github.com/cvassia/NoteOCR

---

## 📜 License

MIT © 2026




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