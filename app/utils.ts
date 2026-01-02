import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


// translations
const resources = {
    en: {
        translation: {
            pickImage: "Pick Image",
            takePhoto: "Take Photo",
            homeText: "Take a photo or choose an image from your gallery to convert it into an editable Word file",
            translate: "Translate",
            ocrText: "OCR Text",
            noDocuments: "No documents yet.",
            login: "Log in with Google",
            signInApple: "Sign in with Apple",
            signOut: "Sign Out",
            help: "Help",
            license: "License",
            helpText1: "This app lets you turn photos of documents into editable Word files.",
            helpText2: "Simply upload an image, and the app uses advanced OCR technology to extract text while preserving formatting.",
            helpText3: "Your documents are securely stored and can be accessed anytime after signing in.",
            licenseText1: "This app uses the following open-source libraries:",
            licenseText2: "All trademarks and services belong to their respective owners.",
        }
    },
    el: {
        translation: {
            pickImage: "Επιλέξτε εικόνα",
            takePhoto: "Τραβήξτε φωτογραφία",
            homeText: "Τραβήξτε μια φωτογραφία ή επιλέξτε μια εικόνα από τη συλλογή σας για να τη μετατρέψετε σε επεξεργάσιμο αρχείο Word",
            translate: "Μετάφραση",
            ocrText: "Κείμενο OCR",
            noDocuments: "Δεν υπάρχουν έγγραφα.",
            login: "Σύνδεση με Google",
            signInApple: "Σύνδεση με Apple",
            signOut: "Αποσύνδεση",
            help: "Βοήθεια",
            license: "Άδεια",
            helpText1: "Αυτή η εφαρμογή σας επιτρέπει να μετατρέπετε φωτογραφίες εγγράφων σε επεξεργάσιμα αρχεία Word.",
            helpText2: "Απλώς ανεβάστε μια εικόνα και η εφαρμογή χρησιμοποιεί προηγμένη τεχνολογία OCR για την εξαγωγή κειμένου διατηρώντας τη μορφοποίηση.",
            helpText3: "Τα έγγραφά σας αποθηκεύονται με ασφάλεια και μπορείτε να τα έχετε πρόσβαση οποιαδήποτε στιγμή μετά τη σύνδεση.",
            licenseText1: "Αυτή η εφαρμογή χρησιμοποιεί τις ακόλουθες βιβλιοθήκες ανοιχτού κώδικα:",
            licenseText2: "Όλα τα εμπορικά σήματα και οι υπηρεσίες ανήκουν στους αντίστοιχους ιδιοκτήτες τους.",
        }
    }
};


const deviceLanguage = ((Localization as any).locale || 'en').split('-')[0];

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: deviceLanguage,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

export default i18n;
