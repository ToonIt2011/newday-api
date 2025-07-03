import axios from "axios";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { numeros, mensagem } = req.body;

  if (!Array.isArray(numeros) || !mensagem) {
    return res.status(400).json({ error: "Números e mensagem são obrigatórios" });
  }

  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  let sucesso = 0;
  let falha = 0;
  let erros = [];

  for (const numero of numeros) {
    try {
      const response = await axios.post(url, {
        token,
        to: numero,
        body: mensagem,
      });

      const enviado =
        response.data?.sent === true ||
        response.data?.sent === "true" ||
        response.data?.message === "ok";

      if (enviado) {
        sucesso++;
      } else {
        falha++;
        erros.push({ numero, resposta: response.data });
      }
    } catch (error) {
      falha++;
      erros.push({ numero, erro: error.response?.data || error.message });
    }
  }

  return res.status(200).json({
    status: "Campanha finalizada",
    sucesso,
    falha,
    erros,
  });
}
