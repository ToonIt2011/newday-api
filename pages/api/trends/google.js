import googleTrends from "google-trends-api";

export default async function handler(req, res) {
  const { term = "IA", geo = "BR" } = req.query;

  try {
    const results = await googleTrends.interestOverTime({
      keyword: term,
      geo,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // últimos 7 dias
    });

    const parsed = JSON.parse(results);
    const timelineData = parsed.default.timelineData;

    // ✅ Caso não haja dados suficientes
    if (!timelineData || timelineData.length === 0) {
      return res.status(200).json({
        termo: term,
        periodo: "últimos 7 dias",
        local: geo,
        popularidade: 0,
        status: "Sem dados suficientes para esse termo",
      });
    }

    const ultimaEntrada = timelineData[timelineData.length - 1];
    const popularidade = ultimaEntrada.value[0];

    res.status(200).json({
      termo: term,
      periodo: "últimos 7 dias",
      local: geo,
      popularidade,
      status: "Tendência detectada com sucesso",
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar dados de tendência via google-trends-api",
      detalhes: err.message,
    });
  }
}
