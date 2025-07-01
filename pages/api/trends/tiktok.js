// /api/trends/tiktok.js
import axios from "axios";
import * as cheerio from "cheerio";

const handler = async (req, res) => {
  const { tag = "tecnologia" } = req.query;
  try {
    const { data } = await axios.get(`https://www.tiktok.com/tag/${tag}`);
    const $ = cheerio.load(data);

    const result = $("title").text();
    res.status(200).json({ tag, resultado: result });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar hashtag do TikTok" });
  }
};

export default handler;
