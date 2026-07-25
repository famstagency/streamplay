const axios = require("axios");

const PREFIX = "https:/";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter." });
  }

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const tokenMatch = html.match(
      /document\.getElementById.*?\('norobotlink'\)\.innerHTML =.*?token=(.*?)'/s
    );

    const infixMatch = html.match(
      /<div id="ideoooolink" style="display:none;">(.*?token=).*?<\/div>/s
    );

    const titleMatch = html.match(/<meta name="og:title" content="(.*?)">/s);

    if (!tokenMatch) {
      return res.status(404).json({ error: "Could not extract token from page." });
    }

    if (!infixMatch) {
      return res.status(404).json({ error: "Could not extract download URL from page." });
    }

    const token = tokenMatch[1];
    const infix = infixMatch[1];
    const title = titleMatch ? titleMatch[1] : "streamtape_video";

    const finalURL = `${PREFIX}${infix}${token}`;

    return res.status(200).json({ title, directURL: finalURL });
  } catch (err) {
    const message =
      err.response && err.response.status
        ? `Upstream returned ${err.response.status}`
        : err.message;
    return res.status(500).json({ error: message });
  }
};
