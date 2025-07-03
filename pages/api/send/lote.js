// pages/api/send/lote.js

import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Supabase init
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

  if (!Array.isArray(numeros) || !mensagem) {
    return res.status(400).json({ error: "Números e mensagem são obrigatórios" });
  }

  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  let sucesso = 0;
  let falha = 0;
  let resultados = [];

  for (const numero of numeros) {
    try {
      const response = await axios.post(url, {
        token,
        to: numero,
        body: mensagem,
      });

      if (response.data?.sent === "true" || response.data?.message === "ok") {
        sucesso++;
        resultados.push({ numero, status: "sucesso" });
      } else {
        falha++;
        resultados.push({ numero, status: "falha", resposta: response.data });
      }
    } catch (error) {
      falha++;
      resultados.push({ numero, status: "falha", erro: error.response?.data || error.message });
    }
  }

  // Salvar no Supabase
  const { error } = await supabase.from("campanhas").insert([
    {
      tema,
      mensagem,
      numeros: numeros.join(", "),
      sucesso,
      falha,
      resultados,
    },
  ]);

  if (error) {
    return res.status(500).json({
      error: "Erro ao salvar campanha no Supabase",
      detalhes: error.message,
    });
  }

  return res.status(200).json({
    status: "Campanha finalizada",
    sucesso,
    falha,
    resultados,
  });
}
