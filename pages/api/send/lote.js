import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

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

  // Log para verificar os dados recebidos no backend
  console.log("🎯 Dados recebidos no body:", req.body);

  const { numeros, mensagem, tema } = req.body;

  // Verificação dos parâmetros obrigatórios
  if (!Array.isArray(numeros) || !numeros.length || !mensagem || !tema) {
    console.error("Erro: Dados incompletos", req.body);
    return res.status(400).json({ error: "Números, mensagem e tema são obrigatórios" });
  }

  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  let sucesso = 0;
  let falha = 0;
  let erros = [];

  // Envio das mensagens para os números
  for (const numero of numeros) {
    try {
      const response = await axios.post(url, {
        token,
        to: numero,
        body: mensagem,
      });

      if (response.data?.sent === "true" || response.data?.message === "ok") {
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

  // Log para depurar dados da campanha
  console.log("📤 Campanha enviada para:", numeros);
  console.log("💬 Mensagem:", mensagem);
  console.log("🏷️ Tema:", tema);

  // Removido: parte de salvar no Supabase

  // Resposta com o status da campanha
  return res.status(200).json({
    status: "Campanha finalizada",
    sucesso,
    falha,
    erros,
  });
}
