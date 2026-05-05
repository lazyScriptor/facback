const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// 1. Setup CORS to allow React to see the session headers
// In your proxy.js on the server
app.use(
  cors({
    // Remove the trailing slash from your Vercel URL
    origin: "https://geargrid-frontend.vercel.app",
    // Change this to lowercase 'l' to match what Nginx/Express is actually sending
    exposedHeaders: ["X-Final-Url"],
  }),
);

// ... inside your app.use('/api/faculty' ...
// Change the header name to match standard lowercase normalization
res.set("X-Final-Url", response.request.res.responseUrl);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BASE_URL = "http://www.science.kln.ac.lk:8080";

// 2. Use app.use as a mount point.
// This captures everything starting with /api/faculty without needing a regex.
app.use("/api/faculty", async (req, res) => {
  try {
    // req.url will contain everything AFTER '/api/faculty'
    // e.g., if you call /api/faculty/(S(xyz))/sfkn.aspx, req.url is /(S(xyz))/sfkn.aspx
    const capturedPath = req.url || "/sfkn.aspx";
    const url = `${BASE_URL}${capturedPath}`;

    console.log(`[Proxy] ${req.method} -> ${url}`);

    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    // 3. Send the final URL back so React can update its sessionUrl state
    res.set("X-Final-URL", response.request.res.responseUrl);
    res.send(response.data);
  } catch (error) {
    console.error("[Proxy Error]:", error.message);
    res.status(500).send(error.message);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Proxy running on http://localhost:${PORT}`);
});
