import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db, { initDb, seedDb } from "./db.ts";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "risksphere-secret-key-2024";

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  console.log("Starting RiskSphere server...");
  try {
    initDb();
    await seedDb();
    console.log("Database initialized and seeded.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      db: !!db,
      time: new Date().toISOString()
    });
  });

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const authorizeRoles = (...roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password, role, department } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Default to first organization for now
      const org = db.prepare("SELECT id FROM organizations LIMIT 1").get() as any;
      const orgId = org ? org.id : 1;
      
      const stmt = db.prepare("INSERT INTO users (org_id, username, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)");
      const result = stmt.run(orgId, username, email, hashedPassword, role || 'employee', department || 'General');
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      console.log("Login failed: User not found", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Login failed: Invalid password for", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      department: user.department,
      org_id: user.org_id 
    }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        org_id: user.org_id,
        username: user.username, 
        role: user.role, 
        department: user.department, 
        email: user.email 
      } 
    });
  });

  // --- Risk Routes ---
  app.get("/api/risks", authenticateToken, (req: any, res) => {
    const risks = db.prepare("SELECT r.*, u.username as owner_name FROM risks r LEFT JOIN users u ON r.owner_id = u.id WHERE r.org_id = ?").all(req.user.org_id);
    res.json(risks);
  });

  app.post("/api/risks", authenticateToken, authorizeRoles('super_admin', 'risk_manager'), (req: any, res) => {
    const { title, description, category, department, likelihood, impact, mitigation_plan, owner_id, review_date, status } = req.body;
    const score = likelihood * impact;
    let priority = 'low';
    if (score >= 20) priority = 'critical';
    else if (score >= 12) priority = 'high';
    else if (score >= 6) priority = 'medium';

    const stmt = db.prepare(`
      INSERT INTO risks (org_id, title, description, category, department, likelihood, impact, score, priority, mitigation_plan, owner_id, review_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(req.user.org_id, title, description, category, department, likelihood, impact, score, priority, mitigation_plan, owner_id || req.user.id, review_date, status || 'active');
    
    // Log activity
    db.prepare("INSERT INTO activity_logs (org_id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)")
      .run(req.user.org_id, req.user.id, 'CREATE', 'RISK', `Created risk: ${title}`);

    res.status(201).json({ id: result.lastInsertRowid });
  });

  app.put("/api/risks/:id", authenticateToken, authorizeRoles('super_admin', 'risk_manager'), (req: any, res) => {
    const { id } = req.params;
    const { title, description, category, department, likelihood, impact, mitigation_plan, owner_id, review_date, status } = req.body;
    const score = likelihood * impact;
    let priority = 'low';
    if (score >= 20) priority = 'critical';
    else if (score >= 12) priority = 'high';
    else if (score >= 6) priority = 'medium';

    try {
      const stmt = db.prepare(`
        UPDATE risks 
        SET title = ?, description = ?, category = ?, department = ?, likelihood = ?, impact = ?, score = ?, priority = ?, mitigation_plan = ?, owner_id = ?, review_date = ?, status = ?
        WHERE id = ? AND org_id = ?
      `);
      const result = stmt.run(title, description, category, department, likelihood, impact, score, priority, mitigation_plan, owner_id, review_date, status, id, req.user.org_id);
      
      if (result.changes === 0) return res.status(404).json({ message: "Risk not found" });

      // Log activity
      db.prepare("INSERT INTO activity_logs (org_id, user_id, action, module, details) VALUES (?, ?, ?, ?, ?)")
        .run(req.user.org_id, req.user.id, 'UPDATE', 'RISK', `Updated risk: ${title}`);

      res.json({ message: "Risk updated successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Risk Template Routes ---
  app.get("/api/risk-templates", authenticateToken, (req: any, res) => {
    const templates = db.prepare("SELECT * FROM risk_templates WHERE org_id = ?").all(req.user.org_id);
    res.json(templates);
  });

  app.post("/api/risk-templates", authenticateToken, authorizeRoles('super_admin', 'risk_manager'), (req: any, res) => {
    const { name, description, category, department, likelihood, impact, mitigation_plan } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO risk_templates (org_id, name, description, category, department, likelihood, impact, mitigation_plan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(req.user.org_id, name, description, category, department, likelihood, impact, mitigation_plan);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Compliance Routes ---
  app.get("/api/compliance", authenticateToken, (req: any, res) => {
    const compliance = db.prepare("SELECT c.*, u.username as owner_name FROM compliance c LEFT JOIN users u ON c.owner_id = u.id WHERE c.org_id = ?").all(req.user.org_id);
    res.json(compliance);
  });

  app.post("/api/compliance", authenticateToken, (req: any, res) => {
    const { framework, requirement, description, status, progress } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO compliance (org_id, framework, requirement, description, status, progress, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(req.user.org_id, framework, requirement, description, status || 'under_review', progress || 0, req.user.id);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Audit Routes ---
  app.get("/api/audits", authenticateToken, (req: any, res) => {
    const audits = db.prepare("SELECT a.*, u.username as auditor_name FROM audits a LEFT JOIN users u ON a.auditor_id = u.id WHERE a.org_id = ?").all(req.user.org_id);
    res.json(audits);
  });

  // --- Incident Routes ---
  app.get("/api/incidents", authenticateToken, (req: any, res) => {
    const incidents = db.prepare("SELECT i.*, r.username as reporter_name, inv.username as investigator_name FROM incidents i LEFT JOIN users r ON i.reporter_id = r.id LEFT JOIN users inv ON i.investigator_id = inv.id WHERE i.org_id = ?").all(req.user.org_id);
    res.json(incidents);
  });

  app.post("/api/incidents", authenticateToken, (req: any, res) => {
    const { title, description, type, severity } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO incidents (org_id, title, description, type, severity, reporter_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(req.user.org_id, title, description, type, severity, req.user.id, 'reported');
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users", authenticateToken, (req: any, res) => {
    // Basic user info for assignment
    const users = db.prepare("SELECT id, org_id, username, email, role, department, created_at FROM users WHERE org_id = ?").all(req.user.org_id);
    res.json(users);
  });

  // --- Task Routes ---
  app.get("/api/tasks", authenticateToken, (req: any, res) => {
    const tasks = db.prepare("SELECT t.*, u.username as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.org_id = ?").all(req.user.org_id);
    res.json(tasks);
  });

  app.post("/api/tasks", authenticateToken, (req: any, res) => {
    const { title, description, deadline, priority } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO tasks (org_id, title, description, deadline, priority, assignee_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(req.user.org_id, title, description, deadline, priority || 'medium', req.user.id, 'pending');
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Dashboard Stats ---
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    const orgId = req.user.org_id;
    const totalRisks = db.prepare("SELECT COUNT(*) as count FROM risks WHERE org_id = ?").get(orgId) as any;
    const highPriorityRisks = db.prepare("SELECT COUNT(*) as count FROM risks WHERE org_id = ? AND priority IN ('high', 'critical')").get(orgId) as any;
    const openAudits = db.prepare("SELECT COUNT(*) as count FROM audits WHERE org_id = ? AND status != 'closed'").get(orgId) as any;
    const resolvedIncidents = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE org_id = ? AND status = 'closed'").get(orgId) as any;
    
    // Compliance score (average progress)
    const complianceScore = db.prepare("SELECT AVG(progress) as avg FROM compliance WHERE org_id = ?").get(orgId) as any;

    res.json({
      totalRisks: totalRisks.count,
      highPriorityRisks: highPriorityRisks.count,
      openAudits: openAudits.count,
      resolvedIncidents: resolvedIncidents.count,
      complianceScore: Math.round(complianceScore.avg || 0)
    });
  });

  // --- Vite middleware for development ---
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        configFile: path.resolve(__dirname, "vite.config.ts"),
      });
      app.use(vite.middlewares);
      console.log("Vite middleware ready.");
    } catch (err) {
      console.error("Vite server creation failed:", err);
    }
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    
    // SPA fallback: only serve index.html for non-file requests
    app.get("*", (req, res) => {
      // If the request looks like a file (has an extension), don't serve index.html
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return res.status(404).send('Not found');
      }
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
