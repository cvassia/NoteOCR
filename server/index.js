import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import cors from "cors";
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";
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
app.use(express.static(uploadDir));

/* ------------------ Multer config ------------------ */
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

/* ------------------ Document AI client ------------------ */
const projectId = "noteocr-483011";
const location = "eu";
const processorId = "788d10a6fba8bc6a";

const client = new DocumentProcessorServiceClient({
    keyFilename: path.join(__dirname, "vision-key.json"),
    apiEndpoint: "eu-documentai.googleapis.com", // must match processor region
});

/* ------------------ Helpers ------------------ */

// Convert HEIC/PNG/TIFF → JPEG
const convertToJPEG = async (inputPath) => {
    const ext = path.extname(inputPath).toLowerCase();
    if ([".heic", ".heif", ".png", ".tiff", ".tif", ".gif"].includes(ext)) {
        const outputPath = inputPath.replace(/\.[^.]+$/, "_converted.jpg");
        await sharp(inputPath).jpeg({ quality: 90 }).toFile(outputPath);
        return outputPath;
    }
    return inputPath;
};

// Downscale large images (>20 MB)
const downscaleImage = async (inputPath) => {
    const stats = fs.statSync(inputPath);
    if (stats.size > 20 * 1024 * 1024) {
        const outputPath = inputPath.replace(/\.[^.]+$/, "_resized.jpg");
        await sharp(inputPath).resize({ width: 2000 }).jpeg({ quality: 90 }).toFile(outputPath);
        return outputPath;
    }
    return inputPath;
};

/* ------------------ OCR Endpoint ------------------ */
app.post("/ocr", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let filePath = req.file.path;

    try {
        // Convert HEIC/PNG/TIFF → JPEG
        filePath = await convertToJPEG(filePath);

        // Downscale if >20 MB
        filePath = await downscaleImage(filePath);

        const rawBytes = fs.readFileSync(filePath);
        console.log("Sending file to Document AI. Size (bytes):", rawBytes.length);

        const request = {
            name: client.processorPath(projectId, location, processorId),
            rawDocument: {
                content: rawBytes,
                mimeType: "image/jpeg",
            },
        };

        const [result] = await client.processDocument(request);
        const doc = result.document;
        const text = doc?.text || "";

        /* ------------------ Build DOCX ------------------ */
        const paragraphs = [];

        (doc.pages || []).forEach((page) => {
            (page.paragraphs || []).forEach((para) => {
                const textRuns = (para.layout?.textAnchor?.textSegments || []).map((segment) => {
                    const start = parseInt(segment.startIndex || "0");
                    const end = parseInt(segment.endIndex || "0");
                    const wordText = text.slice(start, end);
                    return new TextRun({ text: wordText + " " });
                });

                paragraphs.push(
                    new Paragraph({
                        children: textRuns,
                        alignment: AlignmentType.LEFT,
                    })
                );
            });
        });

        const docx = new Document({ sections: [{ children: paragraphs }] });
        const docFileName = `ocr_${Date.now()}.docx`;
        const docPath = path.join(uploadDir, docFileName);
        const buffer = await Packer.toBuffer(docx);
        fs.writeFileSync(docPath, buffer);

        /* ------------------ Respond with text + DOCX URL ------------------ */
        res.json({
            text,
            docxUrl: `http://192.168.1.3:3000/${docFileName}`,
        });

        // Cleanup uploaded/converted images
        fs.unlinkSync(req.file.path);
        if (filePath !== req.file.path) fs.unlinkSync(filePath);
    } catch (err) {
        console.error("Document AI OCR error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ------------------ Health check ------------------ */
app.get("/", (req, res) => res.send("OCR server running"));

/* ------------------ Start server ------------------ */
app.listen(PORT, () => {
    console.log(`OCR server running at http://localhost:${PORT}`);
});
