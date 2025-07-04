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

  const { numeros, mensagem, tema } = req.body;
  console.log("🎯 Dados recebidos no body:", req.body);

  // Verificação dos parâmetros
  if (!Array.isArray(numeros) || !mensagem || !tema) {
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

  // ⛔ Supabase temporariamente desativado para testes
  console.log("📦 Simulação: campanha não salva no Supabase (modo de teste)");

  // Resposta com o status da campanha (sem salvar no Supabase)
  return res.status(200).json({
    status: "Campanha finalizada (teste sem Supabase)",
    sucesso,
    falha,
    erros,
  });
}
