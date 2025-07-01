import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { data } = await axios.get("https://trends.google.com/trends/trendingsearches/daily?geo=BR");
    const $ = cheerio.load(data);

    const resultados = [];

    $(".feed-list-wrapper .feed-item").each((i, el) => {
      const title = $(el).find(".details-top a").text().trim();
      const link = "https://trends.google.com" + $(el).find(".details-top a").attr("href");
      const buscas = $(el).find(".search-count-title").text().trim();
      const categoria = $(el).find(".search-count-subtitle").text().trim();

      resultados.push({
        titulo: title || "Sem título",
        link: link || "",
        buscas: buscas || "Número de buscas não identificado",
        categoria: categoria || "Categoria não informada",
      });
    });

    if (resultados.length === 0) {
      return res.status(200).json({
        status: "Sem resultados visíveis no momento.",
        resultados: [],
      });
    }

    res.status(200).json({
      status: "Tópicos em alta carregados com sucesso",
      resultados,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar tópicos em alta com Cheerio",
      detalhes: error.message,
    });
  }
}
