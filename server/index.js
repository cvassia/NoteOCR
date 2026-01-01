import vision from "@google-cloud/vision";
import cors from "cors";
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
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
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.static(uploadDir)); // serve DOCX files

/* ------------------ Multer config ------------------ */

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const upload = multer({ storage });

/* ------------------ Google Vision Client ------------------ */

// Use your vision-key.json
const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, "vision-key.json"),
});

/* ------------------ OCR Endpoint ------------------ */

app.post("/ocr", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imagePath = req.file.path;

    try {
        // Run OCR
        const [result] = await client.documentTextDetection(imagePath);
        const fullText = result.fullTextAnnotation?.text || "";

        // Convert OCR result into formatted DOCX
        const paragraphs = [];

        const pages = result.fullTextAnnotation.pages || [];
        pages.forEach(page => {
            page.blocks.forEach(block => {
                block.paragraphs.forEach(paragraph => {
                    const textRuns = paragraph.words.map(word => {
                        const wordText = word.symbols.map(s => s.text).join("");
                        const style = word.symbols[0]?.textStyle || {};

                        return new TextRun({
                            text: wordText + " ",
                            bold: style.bold || false,
                            italics: style.italic || false,
                            underline: style.underline ? {} : undefined,
                            size: style.fontSize ? style.fontSize.size * 2 : 24, // half-points
                        });
                    });

                    paragraphs.push(
                        new Paragraph({
                            children: textRuns,
                            alignment: AlignmentType.LEFT, // simple alignment
                        })
                    );
                });
            });
        });

        const doc = new Document({ sections: [{ children: paragraphs }] });

        // Save DOCX
        const docFileName = `ocr_${Date.now()}.docx`;
        const docPath = path.join(uploadDir, docFileName);
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(docPath, buffer);

        // Cleanup uploaded image
        fs.unlinkSync(imagePath);

        // Send response with download URL
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
