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

  if (!Array.isArray(numeros) || !mensagem || !tema) {
    return res.status(400).json({ error: "Números, mensagem e tema são obrigatórios" });
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

  // Agora vamos salvar os dados da campanha na tabela do Supabase
  const { data, error } = await supabase
    .from("campanhas")
    .insert([
      {
        tema: tema,
        mensagem: mensagem,
        numeros: numeros.join(", "),  // Salvando números como string separada por vírgulas
      }
    ]);

  if (error) {
    return res.status(500).json({ error: "Erro ao salvar a campanha no Supabase", detalhes: error.message });
  }

  return res.status(200).json({
    status: "Campanha finalizada",
    sucesso,
    falha,
    erros,
    campanha_salva: data, // Retorna a campanha salva
  });
}
