import { NextResponse } from "next/server";
import formidable, { Files } from "formidable";
import fs from "fs";
import PDFParser from "pdf2json";

export const config = { api: { bodyParser: false } };

function parseForm(req: Request): Promise<{ fields: formidable.Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    const { files } = await parseForm(req);
    const file = (files.file as formidable.File[])[0];

    if (!file || !file.filepath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const dataBuffer = fs.readFileSync(file.filepath);
    const pdfParser = new PDFParser();

    const text: string = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (err: any) => reject(err?.parserError || err));
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const pages = pdfData.Pages.map((p: any) =>
          p.Texts.map((t: any) => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n\n");
        resolve(pages);
      });
      pdfParser.parseBuffer(dataBuffer);
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("PDF2JSON Error:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }
}