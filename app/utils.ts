import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


// translations
const resources = {
    en: {
        translation: {
            pickImage: "Pick Image",
            takePhoto: "Take Photo",
            takeAnotherPhoto: "Take Another Photo",
            pickAnotherImage: "Pick Another Image",
            downloadDocx: "Download Word file",
            homeText: "Take a photo or choose an image from your gallery to convert it into an editable Word file",
            translate: "Translate",
            logInOrSignUp: "Log in or Sign up to see your documents",
            ocrText: "OCR Text",
            noDocuments: "No documents yet.",
            rename: "Rename",
            renameDocument: "Rename Document",
            enterNewName: "Enter new name",
            cancel: "Cancel",
            save: "Save",
            deleteDocument: "Delete Document",
            deleteConfirm: 'Are you sure you want to delete "{{name}}"?',
            login: "Log in with Google",
            signInApple: "Sign in with Apple",
            signOut: "Sign Out",
            continueWithGoogle: "Continue with Google",
            continueWithApple: "Continue with Apple",
            signIn: "Sign in to sync your documents.",
            help: "Help",
            license: "License",
            language: "Language",
            greek: "Greek",
            english: "English",
            helpText1: "This app lets you turn photos of documents into editable Word files.",
            helpText2: "Simply upload an image, and the app uses advanced OCR technology to extract text while preserving formatting.",
            helpText3: "Your documents are securely stored and can be accessed anytime after signing in.",
            helpText4: "Please note:",
            helpText5: "The success of text recognition relates directly to the quality of your scan.",
            helpText6: "For best results scan your document in a well-lighted area, and make sure the paper is straightened and not folded or skewed.",
            helpText7: "If unsuccessful, just try scanning again, it might make all the difference.",
            helpText8: "The app supports Latin and Greek script.",
            helpText9: "Significant time and effort are invested in this app in order to provide an efficient quality.",
            helpText10: "We hope you find this app useful and enjoy using it to convert your photos to text. We welcome all feedback and are always happy to hear from our users.",
            helpText11: "If you like our app, an app review will be well appreciated :-)",
            helpText12: "If you encounter a problem, please contact us at: c.vassia@live.com,so we can provide you assistance and support.",
            licenseText1: "This app uses the following open-source libraries:",
            licenseText2: "All trademarks and services belong to their respective owners.",
        }
    },
    el: {
        translation: {
            pickImage: "Επιλέξτε εικόνα",
            takePhoto: "Τραβήξτε φωτογραφία",
            takeAnotherPhoto: "Τραβήξτε άλλη φωτογραφία",
            pickAnotherImage: "Επιλέξτε άλλη εικόνα",
            homeText: "Τραβήξτε μια φωτογραφία ή επιλέξτε μια εικόνα από τη συλλογή σας για να τη μετατρέψετε σε επεξεργάσιμο αρχείο Word",
            downloadDocx: "Κατεβάστε το αρχείο Word",
            translate: "Μετάφραση",
            rename: "Μετονομασία",
            cancel: "Ακύρωση",
            save: "Αποθήκευση",
            deleteDocument: "Διαγραφή εγγράφου",
            deleteConfirm: 'Είστε σίγουροι ότι θέλετε να διαγράψετε το "{{name}}" ;',
            enterNewName: "Εισάγετε νέο όνομα",
            renameDocument: "Μετονομασία εγγράφου",
            logInOrSignUp: "Συνδεθείτε ή εγγραφείτε για να δείτε τα έγγραφά σας",
            ocrText: "Κείμενο OCR",
            noDocuments: "Δεν υπάρχουν έγγραφα.",
            login: "Σύνδεση με Google",
            signInApple: "Σύνδεση με Apple",
            signOut: "Αποσύνδεση",
            signIn: "Συνδεθείτε για να συγχρονίσετε τα έγγραφά σας.",
            continueWithGoogle: "Συνέχεια με Google",
            continueWithApple: "Συνέχεια με Apple",
            help: "Βοήθεια",
            license: "Άδεια",
            language: "Γλώσσα",
            greek: "Ελληνικά",
            english: "Αγγλικά",
            helpText1: "Αυτή η εφαρμογή σας επιτρέπει να μετατρέπετε φωτογραφίες εγγράφων σε επεξεργάσιμα αρχεία Word.",
            helpText2: "Απλώς ανεβάστε μια εικόνα και η εφαρμογή χρησιμοποιεί προηγμένη τεχνολογία OCR για την εξαγωγή κειμένου διατηρώντας τη μορφοποίηση.",
            helpText3: "Τα έγγραφά σας αποθηκεύονται με ασφάλεια και μπορείτε να τα έχετε πρόσβαση οποιαδήποτε στιγμή μετά τη σύνδεση.",
            helpText4: "Παρακαλώ σημειώστε:",
            helpText5: "Η επιτυχία της αναγνώρισης κειμένου σχετίζεται άμεσα με την ποιότητα της σάρωσής σας.",
            helpText6: "Για καλύτερα αποτελέσματα, σαρώστε το έγγραφό σας σε καλά φωτισμένο χώρο και βεβαιωθείτε ότι το χαρτί είναι ισιωμένο και δεν είναι διπλωμένο ή στραβό.",
            helpText7: "Εάν δεν είναι επιτυχής η αναγνώρηση, απλώς δοκιμάστε να σαρώσετε ξανά, μπορεί να κάνει όλη τη διαφορά.",
            helpText8: "Η εφαρμογή υποστηρίζει λατινικό και ελληνικό κείμενο.",
            helpText9: "Επενδύθηκε σημαντικός χρόνος και προσπάθεια σε αυτήν την εφαρμογή προκειμένου να παρέχεται αποδοτική ποιότητα.",
            helpText10: "Ελπίζουμε  να βρείτε αυτήν την εφαρμογή χρήσιμη και να απολαύσετε τη χρήση της για τη μετατροπή των φωτογραφιών σας σε κείμενο. Καλωσορίζουμε όλα τα σχόλια και είμαστε πάντα χαρούμενοι να ακούμε από τους χρήστες μας.",
            helpText11: "Εάν σας αρέσει η εφαρμογή μας, μια κριτική εφαρμογής θα εκτιμηθεί ιδιαίτερα :-)",
            helpText12: "Εάν αντιμετωπίσετε κάποιο πρόβλημα, παρακαλούμε επικοινωνήστε μαζί μας στο: c.vassia@live.com, so we can provide you assistance and support.",
            licenseText1: "Αυτή η εφαρμογή χρησιμοποιεί τις ακόλουθες βιβλιοθήκες ανοιχτού κώδικα:",
            licenseText2: "Όλα τα εμπορικά σήματα και οι υπηρεσίες ανήκουν στους αντίστοιχους ιδιοκτήτες τους.",
        }
    }
};


const deviceLanguage = ((Localization as any).locale || 'en').split('-')[0];

// eslint-disable-next-line import/no-named-as-default-member
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: deviceLanguage,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

export default i18n;
