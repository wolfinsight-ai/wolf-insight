import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const UPLOADS_DIR = path.resolve(__dirname, "uploads");
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function sanitizePdfFilename(rawName: string): string {
  const base = path.basename(rawName, path.extname(rawName));
  const cleaned = base.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return (cleaned || "policy-document").slice(0, 60);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  // Upload an official PDF circular for a policy brief
  app.post("/api/upload-pdf", (req, res) => {
    const fileName = typeof req.body?.fileName === "string" ? req.body.fileName.trim() : "policy.pdf";
    const base64Input = typeof req.body?.base64Data === "string" ? req.body.base64Data.trim() : "";

    if (!base64Input) {
      res.status(400).json({ error: "No PDF file payload received." });
      return;
    }

    const cleanBase64 = base64Input.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    if (buffer.length === 0 || buffer.length > MAX_PDF_BYTES) {
      res.status(400).json({ error: "PDF file must be non-empty and under 15 MB." });
      return;
    }

    // Verify PDF magic header (%PDF-)
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      res.status(400).json({ error: "Invalid file format. Please upload a valid PDF document." });
      return;
    }

    const safeStem = sanitizePdfFilename(fileName);
    const storedName = `${Date.now()}-${safeStem}.pdf`;
    const targetPath = path.join(UPLOADS_DIR, storedName);

    try {
      fs.writeFileSync(targetPath, buffer);
      res.json({
        pdfUrl: `/api/pdfs/${encodeURIComponent(storedName)}`,
        fileName: path.basename(fileName),
        sizeBytes: buffer.length,
      });
    } catch {
      res.status(500).json({ error: "Failed to store PDF on server." });
    }
  });

  // Serve uploaded PDF documents inline
  app.get("/api/pdfs/:filename", (req, res) => {
    const safeName = path.basename(req.params.filename || "");
    if (!safeName.toLowerCase().endsWith(".pdf")) {
      res.status(400).json({ error: "Invalid document name." });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "PDF document not found." });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
    res.sendFile(filePath);
  });

  app.post("/api/analyze-policy", async (req, res) => {
    const rawText = typeof req.body?.rawText === "string" ? req.body.rawText.trim() : "";
    const pdfBase64 = typeof req.body?.pdfBase64 === "string" ? req.body.pdfBase64.trim() : "";

    if (!pdfBase64 && (!rawText || rawText.length < 30)) {
      res.status(400).json({
        error: "Please upload a PDF or paste at least 30 characters of regulatory text.",
      });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          "AI extraction requires GEMINI_API_KEY in Settings > Secrets. Your uploaded PDF is still attached and you can fill fields manually.",
      });
      return;
    }

    try {
      const contents = pdfBase64
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
                },
              },
              {
                text: "Analyze this attached Indian renewable energy / climate policy PDF circular and extract structured executive intelligence for Wolf Insights.",
              },
            ],
          }
        : `Analyze the following Indian renewable energy or climate policy circular/announcement and extract structured intelligence for Wolf Insights:\n\n${rawText}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents,
        config: {
          systemInstruction:
            "You are a senior Indian energy regulatory analyst. Extract concise, factual boardroom policy intelligence. Keep each executive summary bullet under 26 words. Choose the exact closest enum values for source, sector, and policyType. Generate tailored, concrete business/financial impact notes for all 8 Indian market personas.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              source: {
                type: Type.STRING,
                description: "One of: MNRE, PIB, CERC, MoP, CEA, SECI, IREDA, e-Gazette",
              },
              sector: {
                type: Type.STRING,
                description:
                  "One of: Solar & Manufacturing, Biogas & CBG, Grid & Open Access, Green Hydrogen, Storage (BESS)",
              },
              policyType: {
                type: Type.STRING,
                description:
                  "One of: Subsidy / Scheme, Tariff Order, Amendment, Tender / Bid, Compliance Guideline",
              },
              publishedDate: {
                type: Type.STRING,
                description: "ISO date YYYY-MM-DD",
              },
              referenceNumber: {
                type: Type.STRING,
                description: "Official circular, gazette, or notification number if present",
              },
              relevanceScore: {
                type: Type.INTEGER,
                description: "Integer between 70 and 99",
              },
              executiveSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 concise executive summary bullets",
              },
              isAmendment: { type: Type.BOOLEAN },
              oldRule: { type: Type.STRING },
              newRule: { type: Type.STRING },
              personaImpacts: {
                type: Type.OBJECT,
                properties: {
                  "Investor / Family Office": { type: Type.STRING },
                  "Renewable Energy Startup": { type: Type.STRING },
                  "Biogas Plant Operator": { type: Type.STRING },
                  "Climate Tech Companies": { type: Type.STRING },
                  "Energy Consultants": { type: Type.STRING },
                  "Corporate Strategy Teams": { type: Type.STRING },
                  "Industry Association": { type: Type.STRING },
                  "Policy Research Organization": { type: Type.STRING },
                },
                required: [
                  "Investor / Family Office",
                  "Renewable Energy Startup",
                  "Biogas Plant Operator",
                  "Climate Tech Companies",
                  "Energy Consultants",
                  "Corporate Strategy Teams",
                  "Industry Association",
                  "Policy Research Organization",
                ],
              },
            },
            required: [
              "title",
              "source",
              "sector",
              "policyType",
              "publishedDate",
              "relevanceScore",
              "executiveSummary",
              "isAmendment",
              "personaImpacts",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json({ policy: parsed });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to analyze policy notification.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wolf Insights server listening on http://localhost:${PORT}`);
  });
}

startServer();
