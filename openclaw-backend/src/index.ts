import "dotenv/config";
import http from "http";
import express from "express";
import { errorHandler }   from "@/middleware/errorHandler";
import { attachWebSocket } from "@/lib/websocket";
import { startScheduler }  from "@/jobs/scheduler";

// Phase 1
import authRoutes      from "@/routes/auth";
import workspaceRoutes from "@/routes/workspaces";
import agentRoutes     from "@/routes/agents";
import channelRoutes   from "@/routes/channels";
import toolRoutes      from "@/routes/tools";
import secretRoutes    from "@/routes/secrets";
import securityRoutes  from "@/routes/security";
import logRoutes       from "@/routes/logs";
import usageRoutes     from "@/routes/usage";
// Phase 2
import reviewRoutes    from "@/routes/review";
import gatewayRoutes   from "@/routes/gateway";
import templateRoutes  from "@/routes/templates";
import alertRoutes     from "@/routes/alerts";
import lineWebhook     from "@/routes/webhooks/line";
import tgWebhook       from "@/routes/webhooks/telegram";
// Phase 3
import whitelabelRoutes   from "@/routes/whitelabel";
import permissionRoutes   from "@/routes/admin/permissions";
import apiKeyRoutes       from "@/routes/admin/api-keys";
import webhookAdminRoutes from "@/routes/admin/webhooks";
import publicApiRoutes    from "@/routes/public-api";
import sheetsRoutes       from "@/routes/integrations/sheets";

// v1.7 New Features
import formsRoutes        from "@/routes/forms";
import logSearchRoutes    from "@/routes/log-search";
import mediaRoutes        from "@/routes/media";
import satisfactionRoutes from "@/routes/satisfaction";

const app    = express();
const server = http.createServer(app);
const PORT   = Number(process.env.PORT ?? 4000);

// Raw body for webhook signature
app.use(["/webhook/line","/webhook/telegram"],
  express.raw({ type:"application/json" }),
  (req: express.Request,_res: express.Response,next: express.NextFunction) => {
    if (Buffer.isBuffer(req.body)) req.body = JSON.parse(req.body.toString("utf-8"));
    next();
  }
);

app.use(express.json({ limit:"2mb" }));
app.use(express.urlencoded({ extended:true }));
app.use((req,res,next) => {
  const origin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin",  origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Api-Key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Routes
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
app.use("/webhook/telegram", tgWebhook);
app.use("/api/whitelabel",          whitelabelRoutes);
app.use("/api/admin",               permissionRoutes);
app.use("/api/admin/api-keys",      apiKeyRoutes);
app.use("/api/admin/webhooks",      webhookAdminRoutes);
app.use("/api/integrations/sheets", sheetsRoutes);
app.use("/public/v1",               publicApiRoutes);

// v1.7 New Routes
app.use("/api/forms",          formsRoutes);
app.use("/api/log-search",     logSearchRoutes);
app.use("/api/media",          mediaRoutes);
app.use("/api/satisfaction",   satisfactionRoutes);

app.get("/health",(_req,res)=>res.json({status:"ok",ts:new Date().toISOString(),version:"1.7.0"}));
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`\n🚀 OpenClaw Backend v1.0.0  http://localhost:${PORT}\n`);
  attachWebSocket(server);
  startScheduler();
});

export { server };
