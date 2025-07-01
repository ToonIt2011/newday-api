import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { data } = await axios.get(
      "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US"
    );

    const $ = cheerio.load(data, { xmlMode: true });

    const resultados = [];

    $("item").each((i, el) => {
      const titulo = $(el).find("title").text();
      const descricao = $(el).find("ht\\:approx_traffic").text();
      const link = $(el).find("link").text();

      resultados.push({
        titulo,
        buscas: descricao || "Volume não informado",
        link,
      });
    });

    if (resultados.length === 0) {
      return res.status(200).json({
        status: "Nenhuma tendência encontrada no feed RSS dos EUA",
        resultados: [],
      });
    }

    res.status(200).json({
      status: "Tendências diárias dos EUA carregadas com sucesso",
      resultados,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao processar o feed RSS do Google Trends dos EUA",
      detalhes: error.message,
    });
  }
}
