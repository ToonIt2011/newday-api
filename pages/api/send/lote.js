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
  console.log("Campanha enviada para:", numeros);
  console.log("Mensagem:", mensagem);
  console.log("Tema:", tema);

  // Salvando os dados da campanha na tabela do Supabase
  try {
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
      console.error("Erro ao salvar no Supabase:", error);
      return res.status(500).json({ error: "Erro ao salvar a campanha no Supabase", detalhes: error.message });
    }

    // Resposta com o status da campanha
    return res.status(200).json({
      status: "Campanha finalizada",
      sucesso,
      falha,
      erros,
      campanha_salva: data, // Retorna a campanha salva
    });
  } catch (error) {
    console.error("Erro ao tentar salvar no Supabase:", error);
    return res.status(500).json({ error: "Erro ao tentar salvar a campanha no Supabase", detalhes: error.message });
  }
}
