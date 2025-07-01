// /api/ia/analisarTendencia.js
const handler = async (req, res) => {
  const { tendencia } = req.body;

  try {
    const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: `A seguinte tendência foi identificada: "${tendencia}". Com base nisso, gere uma ideia de campanha para WhatsApp e e-mail, incluindo CTA e nicho potencial.`
          }
        ],
        temperature: 0.7,
      })
    });

    const data = await resposta.json();
    res.status(200).json({ resultado: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar insight com IA" });
  }
};

export default handler;
