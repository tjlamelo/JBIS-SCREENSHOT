require("dotenv").config();

const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const PORT = Number(process.env.PORT || 3100);
const TOKEN = process.env.INTERNAL_TOKEN || "";

chromium.setGraphicsMode = false;

const app = express();
app.use(express.json({ limit: "5mb" }));

function authorize(req, res, next) {
  if (!TOKEN) {
    return res.status(500).json({ error: "INTERNAL_TOKEN not configured" });
  }
  const header = req.get("Authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = req.get("X-Internal-Token") || "";
  if (bearer !== TOKEN && alt !== TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function launchBrowser() {
  const localChrome = process.env.CHROME_EXECUTABLE_PATH?.trim();
  if (localChrome) {
    return puppeteer.launch({
      executablePath: localChrome,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  return puppeteer.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "jbis-screenshot" });
});

app.post("/v1/pdf/from-html", authorize, async (req, res) => {
  const { html, paper = "a4", margins } = req.body || {};

  if (!html || typeof html !== "string") {
    return res.status(422).json({ error: "html is required (string)" });
  }

  const margin = {
    top: `${margins?.top ?? 12}mm`,
    right: `${margins?.right ?? 12}mm`,
    bottom: `${margins?.bottom ?? 14}mm`,
    left: `${margins?.left ?? 12}mm`,
  };

  let browser;
  try {
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });

    const pdf = await page.pdf({
      format: paper,
      printBackground: true,
      margin,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
    res.send(pdf);
  } catch (err) {
    console.error("[pdf/from-html]", err);
    res.status(500).json({
      error: "PDF generation failed",
      message: err instanceof Error ? err.message : String(err),
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
});

app.listen(PORT, () => {
  console.log(`jbis-screenshot listening on http://127.0.0.1:${PORT}`);
});
