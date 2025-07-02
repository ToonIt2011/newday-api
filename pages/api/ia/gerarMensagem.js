import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
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
      model: "mixtral-8x7b-32768", // ou outro compatível
    });

    const textoGerado = resposta.choices[0]?.message?.content;

    res.status(200).json({ mensagem: textoGerado || "Mensagem gerada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar mensagem com IA", detalhes: error.message });
  }
}
