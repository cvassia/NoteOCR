import vision from "@google-cloud/vision";
import cors from "cors";
import { Document, Packer, Paragraph } from "docx";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

/* ------------------ Setup ------------------ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* ------------------ Upload directory ------------------ */

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* Serve generated DOCX files */
app.use(express.static(uploadDir));

/* ------------------ Multer config ------------------ */

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

/* ------------------ Google Vision Client ------------------ */

const client = new vision.ImageAnnotatorClient();

/* ------------------ OCR Endpoint ------------------ */

app.post("/ocr", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;
    console.log("OCR image path:", imagePath);

    try {
        /* -------- Google Vision OCR -------- */
        const [result] = await client.documentTextDetection(imagePath);
        const fullText = result.fullTextAnnotation?.text || "";

        /* -------- Build Word document -------- */
        const paragraphs = fullText
            .split(/\n+/)
            .map(p => p.trim())
            .filter(Boolean)
            .map(
                text =>
                    new Paragraph({
                        text,
                    })
            );

        const doc = new Document({
            sections: [
                {
                    children: paragraphs,
                },
            ],
        });

        const docFileName = `ocr_${Date.now()}.docx`;
        const docPath = path.join(uploadDir, docFileName);
        const buffer = await Packer.toBuffer(doc);

        fs.writeFileSync(docPath, buffer);

        /* Cleanup uploaded image */
        fs.unlinkSync(imagePath);

        /* -------- Send response -------- */
        res.json({
            text: fullText,
            docxUrl: `http://192.168.1.3:3000/${docFileName}`,
        });
    } catch (err) {
        console.error("OCR error:", err);
        res.status(500).json({ error: "OCR failed" });
    }
});

/* ------------------ Health check ------------------ */

app.get("/", (req, res) => {
    res.send("OCR server running");
});

/* ------------------ Start server ------------------ */

app.listen(PORT, () => {
    console.log(`OCR server running at http://localhost:${PORT}`);
});
