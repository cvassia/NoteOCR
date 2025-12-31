import cors from "cors";
import { Document, Packer, Paragraph, TextRun } from "docx";
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

        // fs.unlinkSync(imagePath);

        const text = data.text || "No text detected";


        // ---------- Create Word document ----------
        const doc = new Document({
            creator: "NoteOCR",
            title: "OCR Output",
            description: "Generated from OCR",
            sections: [],
        });
        const paragraphs = text.split(/\n+/).filter(p => p.trim() !== "");

        paragraphs.forEach(p => {
            doc.addSection({
                children: [new Paragraph({ children: [new TextRun(p)] })],
            });
        });


        const docFileName = `ocr_${Date.now()}.docx`;
        const docPath = path.join(uploadDir, docFileName);
        const buffer = await Packer.toBuffer(doc);

        fs.writeFileSync(docPath, buffer);

        // ---------- Send Word file to client ----------
        // res.download(docPath, "ocr-text.docx", (err) => {
        //     if (err) console.error(err);
        //     // Clean up files after sending
        //     // fs.unlinkSync(docPath);
        //     fs.unlinkSync(imagePath);
        // });
        res.json({
            text: data.text,
            docPath,
            docxUrl: `http://localhost:${PORT}/${docFileName}`,
        });


        // delete image after processing
        fs.unlinkSync(imagePath);

    } catch (err) {
        console.error("OCR error:", err);
        res.status(500).json({ error: "OCR failed" });
    }
});

app.listen(PORT, () => {
    console.log(`OCR server running at http://localhost:${PORT}`);
});
