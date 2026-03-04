import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import router from "./src/routes.js";
import "./src/db.js";

const app = express();

// CORS for web origins (cloud and localhost)
app.use(
  cors({
    origin: ["https://cloud.defcomm.ng", "https://meet.defcomm.ng"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

// Middleware to check if request is from desktop app
const desktopAppMiddleware = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Check if it's from desktop app (Tauri)
  const isDesktopApp =
    userAgent.includes("Tauri") ||
    userAgent.includes("WebView2") ||
    origin === "tauri://localhost" ||
    (referer && referer.includes("localhost:1420"));

  // If it's from desktop app, require API key
  if (isDesktopApp) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== process.env.DESKTOP_API_KEY) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid desktop app API key",
      });
    }
  }

  // If it's from web (allowed CORS origins), no API key needed
  next();
};

// Apply middleware to all /api routes
app.use("/api", desktopAppMiddleware, router);

app.get("/", (req, res) => {
  res.send("Meeting Server starting up");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`VideoSDK Server running on port http://localhost:${PORT}`),
);
