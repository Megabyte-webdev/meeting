import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import router from "./src/routes.js";
import "./src/db.js";

const app = express();
app.use(cors({
  origin: ["https://cloud.defcomm.ng"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Meeting Server starting up");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`VideoSDK Server running on port http://localhost:${PORT}`)
);
