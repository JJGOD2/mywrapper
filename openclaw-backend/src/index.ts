import "dotenv/config";
import express from "express";
import { errorHandler } from "@/middleware/errorHandler";
import authRoutes      from "@/routes/auth";
import workspaceRoutes from "@/routes/workspaces";
import agentRoutes     from "@/routes/agents";
import channelRoutes   from "@/routes/channels";
import toolRoutes      from "@/routes/tools";
import secretRoutes    from "@/routes/secrets";
import securityRoutes  from "@/routes/security";
import logRoutes       from "@/routes/logs";
import usageRoutes     from "@/routes/usage";
import reviewRoutes    from "@/routes/review";
import gatewayRoutes   from "@/routes/gateway";
import templateRoutes  from "@/routes/templates";
import alertRoutes     from "@/routes/alerts";
import lineWebhook     from "@/routes/webhooks/line";

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.use("/webhook/line", express.raw({ type: "application/json" }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString("utf-8"));
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/api/auth",       authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/agents",     agentRoutes);
app.use("/api/channels",   channelRoutes);
app.use("/api/tools",      toolRoutes);
app.use("/api/secrets",    secretRoutes);
app.use("/api/security",   securityRoutes);
app.use("/api/logs",       logRoutes);
app.use("/api/usage",      usageRoutes);
app.use("/api/review",     reviewRoutes);
app.use("/api/gateway",    gatewayRoutes);
app.use("/api/templates",  templateRoutes);
app.use("/api/alerts",     alertRoutes);
app.use("/webhook/line",   lineWebhook);

app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 OpenClaw Backend  http://localhost:${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV ?? "development"}\n`);
});
export default app;
