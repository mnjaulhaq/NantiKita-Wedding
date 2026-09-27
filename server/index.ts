import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routers/auth.router";
import adminRouter from "./routers/admin.router";
import weddingRouter from "./routers/wedding.router";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api", weddingRouter);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`NantiKita API server jalan di http://localhost:${PORT}`);
});
