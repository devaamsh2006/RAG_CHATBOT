// utils/extractText.js

// Ensure this file runs only in server environment
export const dynamic = "force-dynamic";

// utils/text-processor.js

export async function extractText(fileBuffer, fileType) {
    try {
        if (fileType === "application/pdf") {
            const pdfParse = await import("pdf-parse-fixed");
            const pdf = pdfParse.default;
            const { text } = await pdf(fileBuffer);
            return text;
        }



        if (
            fileType.includes("word") ||
            fileType.includes("docx") ||
            fileType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const mammoth = await import("mammoth");
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            return result.value;
        }

        if (fileType.startsWith("text/")) {
            return fileBuffer.toString("utf-8");
        }

        throw new Error("Unsupported file type");
    } catch (error) {
        console.error("Error extracting text:", error);
        throw error;
    }
}

export function splitText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}
