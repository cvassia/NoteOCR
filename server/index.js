import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import Tesseract from "tesseract.js";

const app = express();
const PORT = 3000;

app.use(cors());

/* ---------- upload setup ---------- */
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}.jpg`); // FORCE jpg
    },
});

const upload = multer({ storage });

/* ---------- OCR ---------- */
app.post("/ocr", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;
    console.log("OCR image path:", imagePath);

    try {

        const { data } = await Tesseract.recognize(
            imagePath,
            "eng+ell"
        );

        fs.unlinkSync(imagePath);

        res.json({ text: data.text });
    } catch (err) {
        console.error("OCR error:", err);
        res.status(500).json({ error: "OCR failed" });
    }
});

app.listen(PORT, () => {
    console.log(`OCR server running at http://localhost:${PORT}`);
});
