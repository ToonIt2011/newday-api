// /api/trends/google.js
import axios from "axios";

const handler = async (req, res) => {
  const { term = "marketing", geo = "BR" } = req.query;

  try {
    const response = await axios.get(`https://trends.google.com/trends/api/explore`, {
      params: {
        hl: "pt-BR",
        tz: "-180",
        req: JSON.stringify({
          comparisonItem: [{ keyword: term, geo, time: "now 7-d" }],
          category: 0,
          property: "",
        }),
        tz: 180,
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const raw = response.data;
    const cleaned = raw.replace(")]}',", ""); // remove lixo inicial
    const json = JSON.parse(cleaned);

    const keyword = json.widgets[0].request.comparisonItem[0].keyword;
    const time = json.widgets[0].request.comparisonItem[0].time;
    const region = json.widgets[0].request.comparisonItem[0].geo;

    res.status(200).json({
      termo: keyword,
      periodo: time,
      local: region,
      status: "Tendência detectada com sucesso"
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar tendências do Google" });
  }
};

export default handler;
