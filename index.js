import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
import router from "./src/routes.js";
import "./src/db.js";

const app = express();

// Store valid app instances (in production, use a database)
const validAppInstances = new Map();

// Generate a unique app secret during build/installation
const APP_SECRET =
  process.env.APP_SECRET || crypto.randomBytes(32).toString("hex");
const API_KEY = process.env.API_KEY || crypto.randomBytes(16).toString("hex");

// CORS configuration - restrict to your app only
app.use(
  cors({
    origin: (origin, callback) => {
      // Only allow requests from your Tauri app
      const allowedOrigins = [
        "tauri://localhost",
        "http://localhost:1420",
        "https://localhost:1420",
        "http://127.0.0.1:1420",
        // Add your production app origin here
        "tauri://ng.defcomm.chat", // Using your app identifier
      ];

      // In development, you might want to allow localhost
      if (process.env.NODE_ENV === "development") {
        if (
          !origin ||
          origin.includes("localhost") ||
          origin.includes("127.0.0.1")
        ) {
          return callback(null, true);
        }
      }

      // In production, strictly check origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Access denied: Unauthorized application"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const timestamp = req.headers["x-timestamp"];
  const signature = req.headers["x-signature"];

  if (!apiKey || !timestamp || !signature) {
    return res.status(401).json({ error: "Missing authentication headers" });
  }

  // Check if API key is valid
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Prevent replay attacks (timestamp should be within 5 minutes)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (isNaN(requestTime) || Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return res.status(401).json({ error: "Request expired" });
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", APP_SECRET)
    .update(`${apiKey}:${timestamp}:${req.method}:${req.path}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};

// App Registration Endpoint
app.post("/api/register-app", authenticateApiKey, (req, res) => {
  const { appId, deviceId, publicKey } = req.body;

  if (!appId || !deviceId || !publicKey) {
    return res.status(400).json({ error: "Missing registration data" });
  }

  // Generate a unique token for this app instance
  const appToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  // Store app instance
  validAppInstances.set(appToken, {
    appId,
    deviceId,
    publicKey,
    expiresAt,
    createdAt: Date.now(),
  });

  res.json({
    token: appToken,
    expiresAt,
    message: "App registered successfully",
  });
});

// App Instance Authentication Middleware
const authenticateAppInstance = (req, res, next) => {
  const appToken = req.headers["x-app-token"];

  if (!appToken) {
    return res.status(401).json({ error: "Missing app token" });
  }

  const appInstance = validAppInstances.get(appToken);

  if (!appInstance) {
    return res.status(401).json({ error: "Invalid app token" });
  }

  if (appInstance.expiresAt < Date.now()) {
    validAppInstances.delete(appToken);
    return res.status(401).json({ error: "App token expired" });
  }

  req.appInstance = appInstance;
  next();
};

// Apply authentication to all API routes
app.use("/api", authenticateApiKey, authenticateAppInstance, router);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "Meeting Server running",
    environment: process.env.NODE_ENV,
    timestamp: Date.now(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`VideoSDK Server running on port http://localhost:${PORT}`),
);
