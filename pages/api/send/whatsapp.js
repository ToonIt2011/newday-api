import axios from "axios";

export default async function handler(req, res) {
  // ✅ Cabeçalhos CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Resposta para preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { numero, mensagem } = req.body;

  if (!numero || !mensagem) {
    return res.status(400).json({ error: "Número e mensagem são obrigatórios" });
  }

  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    const token = process.env.ULTRAMSG_TOKEN;

    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

    const response = await axios.post(url, {
      token,
      to: numero,
      body: mensagem,
    });

    res.status(200).json({
      status: "Mensagem enviada com sucesso",
      resultado: response.data,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao enviar mensagem via UltraMSG",
      detalhes: error.response?.data || error.message,
    });
  }
}
