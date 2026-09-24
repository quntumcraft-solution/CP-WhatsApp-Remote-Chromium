const express = require("express");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 10000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "cp-demo-2026";

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Access-Token"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

let browser = null;
let context = null;
let page = null;

function checkToken(req, res, next) {
  const token =
    req.headers["x-access-token"] ||
    req.query.token;

  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  next();
}

async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer"
      ]
    });
  }

  if (!context) {
    context = await browser.newContext({
      viewport: {
        width: 1280,
        height: 720
      },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      acceptDownloads: true
    });
  }

  if (!page || page.isClosed()) {
    page = await context.newPage();

    page.on("download", download => {
      console.log(
        "Download started:",
        download.suggestedFilename()
      );
    });

    page.on("console", msg => {
      console.log("PAGE:", msg.text());
    });
  }

  return page;
}

// HOME
app.get("/", (req, res) => {
  res.json({
    name: "CP Powerful Remote Chromium",
    status: "online"
  });
});

// HEALTH
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

// TEST
app.get("/test", (req, res) => {
  res.json({
    test: "SUCCESS",
    message: "Powerful browser server is running"
  });
});

// START
app.get("/start", checkToken, async (req, res) => {
  try {
    const currentPage = await ensureBrowser();

    res.json({
      success: true,
      url: currentPage.url()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// STATUS
app.get("/status", checkToken, async (req, res) => {
  res.json({
    browser: !!browser,
    page: !!page && !page.isClosed(),
    url: page && !page.isClosed()
      ? page.url()
      : null
  });
});

// SCREENSHOT
app.get("/screenshot", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const image = await page.screenshot({
      type: "jpeg",
      quality: 60
    });

    res.type("image/jpeg");
    res.send(image);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// OPEN
app.post("/open", checkToken, async (req, res) => {
  try {
    const currentPage = await ensureBrowser();

    let url = String(req.body.url || "").trim();

    if (!url) {
      return res.status(400).json({
        error: "URL is required"
      });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      await currentPage.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });
    } catch (error) {
      console.log(
        "Navigation warning:",
        error.message
      );

      // Some websites continue loading after
      // domcontentloaded/navigation events.
      if (currentPage.url() === "about:blank") {
        throw error;
      }
    }

    res.json({
      success: true,
      url: currentPage.url()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// BACK
app.post("/back", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
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

// FORWARD
app.post("/forward", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
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

// RELOAD
app.post("/reload", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
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
      success: false,
      error: error.message
    });
  }
});

// CLICK
app.post("/click", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const x = Number(req.body.x);
    const y = Number(req.body.y);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return res.status(400).json({
        error: "Invalid coordinates"
      });
    }

    await page.mouse.click(x, y);

    res.json({
      success: true
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// KEY
app.post("/key", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const key = String(req.body.key || "");

    if (!key) {
      return res.status(400).json({
        error: "Key is required"
      });
    }

    await page.keyboard.press(key);

    res.json({
      success: true
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// TYPE
app.post("/type", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const text = String(req.body.text || "");

    await page.keyboard.type(text);

    res.json({
      success: true
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// SCROLL
app.post("/scroll", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const amount = Number(
      req.body.amount || 500
    );

    await page.mouse.wheel(0, amount);

    res.json({
      success: true
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ZOOM
app.post("/zoom", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const amount = Number(
      req.body.amount || 0
    );

    const zoom = Math.max(
      0.5,
      Math.min(2.5, 1 + amount)
    );

    await page.evaluate(value => {
      document.documentElement.style.zoom =
        String(value);
    }, zoom);

    res.json({
      success: true,
      zoom: zoom
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// RESET ZOOM
app.post("/zoom/reset", checkToken, async (req, res) => {
  try {
    if (!page || page.isClosed()) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    await page.evaluate(() => {
      document.documentElement.style.zoom = "1";
    });

    res.json({
      success: true,
      zoom: 1
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// DOWNLOAD INFO
app.get("/downloads", checkToken, async (req, res) => {
  try {
    if (!context) {
      return res.json({
        downloads: []
      });
    }

    res.json({
      downloads: []
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `CP Powerful Remote Chromium running on port ${PORT}`
  );
});
