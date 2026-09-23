const express = require("express");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "cp-demo-2026";

app.use(express.json());

let browser = null;
let page = null;

function checkToken(req, res, next) {
  const token = req.headers["x-access-token"];

  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  next();
}

app.get("/", (req, res) => {
  res.json({
    name: "CP Remote Chromium",
    status: "online"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.post("/start", checkToken, async (req, res) => {
  try {

    if (!browser) {
      browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu"
        ]
      });
    }

    if (!page) {

      page = await browser.newPage({
        viewport: {
          width: 1366,
          height: 768
        },

        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36"
      });

    }

    await page.goto(
      "https://web.whatsapp.com/",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );

    res.json({
      success: true,
      message: "Remote Chromium started",
      url: page.url()
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

app.get("/screenshot", checkToken, async (req, res) => {

  try {

    if (!page) {
      return res.status(400).json({
        error: "Browser is not started"
      });
    }

    const image = await page.screenshot({
      type: "jpeg",
      quality: 70
    });

    res.set("Content-Type", "image/jpeg");

    res.send(image);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.post("/open", checkToken, async (req, res) => {

  try {

    if (!page) {
      return res.status(400).json({
        error: "Browser is not started"
      });
    }

    const url = req.body.url;

    if (!url) {
      return res.status(400).json({
        error: "URL is required"
      });
    }

    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS URLs are allowed"
      });
    }

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    res.json({
      success: true,
      url: page.url()
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.post("/back", checkToken, async (req, res) => {

  try {

    if (!page) {
      return res.status(400).json({
        error: "Browser is not started"
      });
    }

    await page.goBack({
      waitUntil: "domcontentloaded",
      timeout: 30000
    }).catch(() => {});

    res.json({
      success: true,
      url: page.url()
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.post("/forward", checkToken, async (req, res) => {

  try {

    if (!page) {
      return res.status(400).json({
        error: "Browser is not started"
      });
    }

    await page.goForward({
      waitUntil: "domcontentloaded",
      timeout: 30000
    }).catch(() => {});

    res.json({
      success: true,
      url: page.url()
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.post("/reload", checkToken, async (req, res) => {

  try {

    if (!page) {
      return res.status(400).json({
        error: "Browser is not started"
      });
    }

    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    res.json({
      success: true,
      url: page.url()
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.listen(PORT, () => {

  console.log(
    `CP Remote Chromium running on port ${PORT}`
  );

});
