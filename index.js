import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import router from "./src/routes.js";
import "./src/db.js";

const app = express();
// Enable CORS for Tauri app
app.use(
  cors({
    origin: [
      "https://cloud.defcomm.ng",
      "http://localhost:1420", // Tauri dev server
      "http://localhost:5173", // Vite dev server
      "tauri://localhost", // Tauri production
      "http://tauri.localhost", // Tauri alternative
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Meeting Server starting up");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`VideoSDK Server running on port http://localhost:${PORT}`),
);
