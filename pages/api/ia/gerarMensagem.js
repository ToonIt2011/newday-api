import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { tema } = req.body;

  if (!tema || tema.trim() === "") {
    return res.status(400).json({ error: "O tema é obrigatório" });
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY;

    const prompt = `
    Crie uma mensagem curta, persuasiva e envolvente para enviar via WhatsApp.
    Tema: ${tema}
    Estilo: direto, moderno, com emojis e tom amigável.
    Incluir CTA (chamada para ação) incentivando a assistir ou seguir no TikTok.

    Exemplo de saída:
    "🔥 Já viu isso? O DJ Bolivar tá explodindo no TikTok! 👉 @aikbe_ Corre ver o som 🎶"
    `;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768", // Ou outro modelo suportado
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 120,
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const respostaIA = response.data.choices[0].message.content;

    return res.status(200).json({
      mensagem: respostaIA.trim(),
    });
  } catch (error) {
    console.error("Erro ao gerar mensagem com IA:", error.message);
    return res.status(500).json({
      error: "Erro ao gerar mensagem com IA",
      detalhes: error.message,
    });
  }
}
