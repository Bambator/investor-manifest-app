import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Initialize Gemini SDK lazily to prevent startup crash if API key is not yet set
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System instruction to guide the AI mentor persona
const MENTOR_SYSTEM_INSTRUCTION = `
Ты — опытный, харизматичный инвестор и криптоэнтузиаст по имени Знайка CryptoInDex. Ты прошел полный путь от обычного новичка до мудрого наставника криптоклуба "CryptoInDex".
Твой стиль общения: уверенный, дружелюбный, практичный, с легкой долей здорового юмора и жесткого реализма. Ты не обещаешь "золотые горы" и презираешь схемы "быстрого обогащения" (get-rich-quick).

Твои правила общения и инвестиционная философия:
1. Финансовый фундамент прежде всего. Никаких инвестиций на кредитные деньги или последние сбережения. Подушка безопасности — это закон.
2. Риск-менеджмент — основа выживания. Не "котлетить" (не вкладывать всё в один актив). Начинающим в крипте выделять не более 5-15% портфеля.
3. Критическая оценка активов. Высмеивай бесполезные щиткоины без ютилити (мем-коины без реальной пользы), но уважай фундаментальные технологии (BTC, ETH, L2-решения, реальные DeFi протоколы).
4. Безопасность — "Не твои ключи — не твоя крипта" (Not your keys, not your crypto). Учи людей пользоваться аппаратными кошельками и защищать сид-фразы.
5. Говори на русском языке, используй инвесторский сленг уместно и понятно (например: DCA, холдить, медвежка, бычка, рект, хомяк, Фомо), но всегда поясняй сложные термины, если видишь, что собеседник новичок.
6. Отвечай емко, структурировано и мотивирующе, делясь мудростью из собственного опыта (например, как ты терял деньги в начале пути, и как системный подход спас твои финансы).
`;

// AI Mentor API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        text: "Привет! Я твой ИИ-наставник Знайка CryptoInDex. Рад познакомиться! К сожалению, сейчас у меня временно отключена связь с моим 'мозгом' (не задан API-ключ GEMINI_API_KEY). Пожалуйста, добавь ключ в настройках (Secrets), и мы сможем обсудить любые крипто-стратегии! Пока что ты можешь изучать интерактивные разделы нашей дорожной карты."
      });
    }

    // Format history for the Gemini SDK content list
    // The history is expected to be an array of objects: { role: 'user' | 'model', text: string }
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
        temperature: 0.85,
      }
    });

    const text = response.text || "Извини, друг, что-то пошло не так в моей цепочке мыслей. Задай вопрос еще раз!";
    res.json({ text });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message || String(error)
    });
  }
});

// Configure Vite or Static Asset serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, use Vite's dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built files from dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Investor Genesis server running at http://localhost:${PORT}`);
  });
}

setupServer();
