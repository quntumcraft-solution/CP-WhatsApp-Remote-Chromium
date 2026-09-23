const express = require("express");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 10000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "cp-demo-2026";

app.use(express.json({ limit: "1mb" }));

// ===============================
// CORS
// ===============================

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
let page = null;


// ===============================
// TOKEN CHECK
// ===============================

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


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

  res.json({
    name: "CP Remote Chromium",
    status: "online"
  });

});


// ===============================
// HEALTH
// ===============================

app.get("/health", (req, res) => {

  res.json({
    status: "ok"
  });

});


// ===============================
// TEST
// ===============================

app.get("/test", (req, res) => {

  res.json({
    test: "SUCCESS",
    message: "New server.js is running"
  });

});


// ===============================
// START CHROMIUM - GET
// ===============================

app.get("/start", checkToken, async (req, res) => {

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


    await page.goto(
      "https://www.google.com/",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );


    res.json({

      success: true,
      url: page.url()

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,
      error: error.message

    });

  }

});


// ===============================
// START CHROMIUM - POST
// ===============================

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


    await page.goto(
      "https://www.google.com/",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );


    res.json({

      success: true,
      url: page.url()

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,
      error: error.message

    });

  }

});


// ===============================
// SCREENSHOT
// ===============================

app.get("/screenshot", checkToken, async (req, res) => {

  try {

    if (!page) {

      return res.status(400).json({
        error: "Browser not started"
      });

    }


    const image =
      await page.screenshot({

        type: "jpeg",
        quality: 65

      });


    res.set(
      "Content-Type",
      "image/jpeg"
    );

    res.send(image);

  }

  catch (error) {

    res.status(500).json({

      error: error.message

    });

  }

});


// ===============================
// OPEN URL
// ===============================

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

      url =
        "https://" + url;

    }


    await page.goto(
      url,
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );


    res.json({

      success: true,
      url: page.url()

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,
      error: error.message

    });

  }

});


// ===============================
// BACK
// ===============================

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

  }

  catch (error) {

    res.status(500).json({

      error: error.message

    });

  }

});


// ===============================
// FORWARD
// ===============================

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

  }

  catch (error) {

    res.status(500).json({

      error: error.message

    });

  }

});


// ===============================
// RELOAD
// ===============================

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

  }

  catch (error) {

    res.status(500).json({

      success: false,
      error: error.message

    });

  }

});


// ===============================
// CLICK
// ===============================

app.post("/click", checkToken, async (req, res) => {

  try {

    if (!page) {

      return res.status(400).json({
        error: "Browser not started"
      });

    }


    const x =
      Number(req.body.x);

    const y =
      Number(req.body.y);


    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {

      return res.status(400).json({
        error: "Invalid coordinates"
      });

    }


    await page.mouse.click(x, y);


    res.json({

      success: true

    });

  }

  catch (error) {

    res.status(500).json({

      error: error.message

    });

  }

});


// ===============================
// KEYBOARD
// ===============================

app.post("/key", checkToken, async (req, res) => {

  try {

    if (!page) {

      return res.status(400).json({
        error: "Browser not started"
      });

    }


    const key =
      req.body.key;


    if (!key) {

      return res.status(400).json({
        error: "Key is required"
      });

    }


    await page.keyboard.press(key);


    res.json({

      success: true

    });

  }

  catch (error) {

    res.status(500).json({

      error: error.message

    });

  }

});


// ===============================
// TYPE TEXT
// ===============================

app.post("/type", checkToken, async (req, res) => {

  try {

    if (!
