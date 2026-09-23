const express = require("express");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 10000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "cp-demo-2026";

app.use(express.json({ limit: "1mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Access-Token");
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

// Server status
app.get("/", (req, res) => {
  res.json({
    name: "CP Remote Chromium",
    status: "online"
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

// Start Chromium
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
          width: 1280,
          height: 720
        },

        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36"
      });
    }

    await page.goto("https://www.google.com/", {
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

// Screenshot
app.get("/screenshot", checkToken, async (req, res) => {
  try {
    if (!page) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const image = await page.screenshot({
      type: "jpeg",
      quality: 65
    });

    res.set("Content-Type", "image/jpeg");
    res.send(image);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Open URL
app.post("/open", checkToken, async (req, res) => {
  try {
    if (!page) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    let url = req.body.url;

    if (!url) {
      return res.status(400).json({
        error: "URL is required"
      });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
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

// Back
app.post("/back", checkToken, async (req, res) => {
  try {
    if (!page) {
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

// Forward
app.post("/forward", checkToken, async (req, res) => {
  try {
    if (!page) {
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

// Reload
app.post("/reload", checkToken, async (req, res) => {
  try {
    if (!page) {
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
      error: error.message
    });
  }
});

// Mouse click
app.post("/click", checkToken, async (req, res) => {
  try {
    if (!page) {
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

// Keyboard
app.post("/key", checkToken, async (req, res) => {
  try {
    if (!page) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const key = req.body.key;

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

// Text input
app.post("/type", checkToken, async (req, res) => {
  try {
    if (!page) {
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

// Scroll
app.post("/scroll", checkToken, async (req, res) => {
  try {
    if (!page) {
      return res.status(400).json({
        error: "Browser not started"
      });
    }

    const amount = Number(req.body.amount || 500);

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `CP Remote Chromium running on port ${PORT}`
  );
});
