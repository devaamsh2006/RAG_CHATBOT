// app/api/upload/route.js

import { NextResponse } from "next/server";
import { extractText, splitText }from "@/lib/text-processor";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic"; // Ensure server-only

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert uploaded file into Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Processing file:", file.name);

    // 1️⃣ Extract text
    const text = await extractText(buffer, file.type);
    if (!text || text.trim().length === 0) {
      throw new Error("No text extracted from file. It may be scanned or image-based.");
    }

    // 2️⃣ Split into chunks
    const chunks = splitText(text);
    console.log(`✂️ Split into ${chunks.length} chunks`);

    // 3️⃣ Generate embeddings in parallel (faster)
    const processedChunks = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk);
        return {
          content: chunk,
          embedding,
          filename: file.name,
          file_type: file.type,
          upload_date: new Date().toISOString(),
        };
      })
    );

    // 4️⃣ Store in Supabase Vector DB
    const { error } = await supabase
      .from("documents")
      .insert(processedChunks);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      throw new Error("Database insert failed");
    }

    console.log("✔ Upload successful!");

    return NextResponse.json({
      success: true,
      file: file.name,
      chunks: chunks.length,
    });
  } catch (error) {
    console.error("🔥 Upload error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
