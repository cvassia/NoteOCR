import cors from "cors";
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import Tesseract from "tesseract.js";




const app = express();
const PORT = 3000;

app.use(cors());



/* ---------- upload setup ---------- */
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Serve the uploads folder so clients can download DOCX
app.use(express.static(uploadDir));

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}.png`); // FORCE jpg
    },
});

const upload = multer({ storage });



/* ---------- OCR ---------- */
app.post("/ocr", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadedPath = req.file.path;
    const pathParsed = path.parse(uploadedPath);
    const processedPath = path.join(pathParsed.dir, `${pathParsed.name}_processed.png`);

    await sharp(uploadedPath)
        .png()
        .grayscale()
        .resize({ width: 2000 })
        .normalize()
        .toFile(processedPath);

    try {

        const { data } = await Tesseract.recognize(processedPath, 'ell', {
            tessedit_char_whitelist: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω.,-:;!?()\"'/",
            tessedit_pageseg_mode: Tesseract.PSM.AUTO
        });


        const text = data.text || "No text detected";



        // ---------- Create Word document ----------
        const paragraphs = text.split(/\n+/).filter(p => p.trim() !== "");

        const doc = new Document({
            sections: [{
                children: paragraphs.map(p => new Paragraph({
                    children: [new TextRun({
                        text: p,
                        bold: /^[A-Z\s]+$/.test(p), // auto-bold if all caps
                        font: "Times New Roman",
                    })],
                    spacing: { after: 200 }, // space after paragraph
                    alignment: AlignmentType.CENTER,
                }))
            }]
        });


        const docFileName = `ocr_${Date.now()}.docx`;
        const docPath = path.join(uploadDir, docFileName);
        const buffer = await Packer.toBuffer(doc);

        fs.writeFileSync(docPath, buffer);


        res.json({
            text: data.text,
            docPath,
            docxUrl: `http://192.168.1.3:${PORT}/${docFileName}`,
        });


        // delete image after processing
        fs.unlinkSync(processedPath);

    } catch (err) {
        console.error("OCR error:", err);
        res.status(500).json({ error: "OCR failed" });
    }
});

app.listen(PORT, () => {
    console.log(`OCR server running at http://localhost:${PORT}`);
});
