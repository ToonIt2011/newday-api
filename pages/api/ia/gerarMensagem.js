import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  // 👇 Cabeçalhos CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 👇 Tratamento para pré-requisição (preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { tema } = req.body;

  if (!tema) {
    return res.status(400).json({ error: "Tema não fornecido" });
  }

  try {
    const prompt = `Crie uma mensagem envolvente e persuasiva para WhatsApp com base no seguinte tema: "${tema}". Use emojis, linguagem jovem e chame o leitor para agir.`;

    const resposta = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
    });

    const textoGerado = resposta.choices[0]?.message?.content?.replace(/^"+|"+$/g, '');

    res.status(200).json({
      mensagem: textoGerado || "Mensagem gerada com sucesso!",
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao gerar mensagem com IA",
      detalhes: error.message,
    });
  }
}
