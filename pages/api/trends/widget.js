import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { data } = await axios.get(
      "https://trends.google.com/trends/trendingsearches/daily?geo=BR",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      }
    );

    const $ = cheerio.load(data);
    const resultados = [];

    $(".feed-item").each((_, el) => {
      const titulo = $(el).find(".details-top a").text().trim();
      const link = "https://trends.google.com" + $(el).find(".details-top a").attr("href");
      const buscas = $(el).find(".search-count-title").text().trim();
      const categoria = $(el).find(".search-count-subtitle").text().trim();

      if (titulo) {
        resultados.push({
          titulo,
          link,
          buscas: buscas || "Número de buscas não informado",
          categoria: categoria || "Categoria não informada",
        });
      }
    });

    if (resultados.length === 0) {
      return res.status(200).json({
        status: "Nenhuma tendência visível neste momento",
        resultados: [],
      });
    }

    res.status(200).json({
      status: "Tendências diárias do Brasil carregadas com sucesso",
      resultados,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao processar o scraping do Google Trends",
      detalhes: error.message,
    });
  }
}
