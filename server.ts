import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_REPORTS, 
  INITIAL_SCHOOL_SETTINGS 
} from "./src/data/mockData";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "school_database.json");

interface SchoolDatabase {
  version: number;
  lastUpdated: string;
  updatedByDevice?: string;
  students: any[];
  teachers: any[];
  reports: Record<string, any>;
  settings: any;
}

// In-memory cache for ultra-fast response
let dbCache: SchoolDatabase | null = null;

// Initialize or load database from persistent file
function getDatabase(): SchoolDatabase {
  if (dbCache) return dbCache;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      if (parsed && parsed.students && parsed.reports) {
        dbCache = parsed;
        return dbCache!;
      }
    }
  } catch (err) {
    console.error("Error reading database file, initializing default:", err);
  }

  // Seed default database
  dbCache = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    updatedByDevice: "Server Initializer",
    students: INITIAL_STUDENTS,
    teachers: INITIAL_TEACHERS,
    reports: INITIAL_REPORTS,
    settings: INITIAL_SCHOOL_SETTINGS,
  };

  saveDatabaseToFile(dbCache);
  return dbCache;
}

function saveDatabaseToFile(data: SchoolDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

async function startServer() {
  const app = express();

  // Large payload limit for batch report sync
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS headers if needed for multi-domain preview
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Lightweight status check for multi-device polling (every 5-6s)
  app.get("/api/sync/status", (req, res) => {
    try {
      const db = getDatabase();
      res.json({
        version: db.version,
        lastUpdated: db.lastUpdated,
        updatedByDevice: db.updatedByDevice || "unknown",
        studentsCount: db.students?.length || 0,
        reportsCount: Object.keys(db.reports || {}).length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Full database fetch (called when HP / iPad / Laptop opens or when version changes)
  app.get("/api/sync", (req, res) => {
    try {
      const db = getDatabase();
      res.json({
        success: true,
        version: db.version,
        lastUpdated: db.lastUpdated,
        students: db.students,
        teachers: db.teachers,
        reports: db.reports,
        settings: db.settings,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Full sync update (save all state or imported data)
  app.post("/api/sync", (req, res) => {
    try {
      const db = getDatabase();
      const { students, teachers, reports, settings, deviceName } = req.body;

      if (students) db.students = students;
      if (teachers) db.teachers = teachers;
      if (reports) db.reports = reports;
      if (settings) db.settings = settings;

      db.version = (db.version || 1) + 1;
      db.lastUpdated = new Date().toISOString();
      if (deviceName) db.updatedByDevice = deviceName;

      saveDatabaseToFile(db);

      res.json({
        success: true,
        version: db.version,
        lastUpdated: db.lastUpdated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Single student report update (modal grade input, etc.)
  app.post("/api/sync/report", (req, res) => {
    try {
      const { studentId, report, deviceName } = req.body;
      if (!studentId || !report) {
        return res.status(400).json({ error: "Missing studentId or report" });
      }

      const db = getDatabase();
      if (!db.reports) db.reports = {};
      db.reports[studentId] = report;

      db.version = (db.version || 1) + 1;
      db.lastUpdated = new Date().toISOString();
      if (deviceName) db.updatedByDevice = deviceName;

      saveDatabaseToFile(db);

      res.json({
        success: true,
        version: db.version,
        lastUpdated: db.lastUpdated,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Batch reports update (Pengolahan Nilai Excel matrix save)
  app.post("/api/sync/reports-batch", (req, res) => {
    try {
      const { reports, deviceName } = req.body;
      if (!reports || typeof reports !== "object") {
        return res.status(400).json({ error: "Missing or invalid reports object" });
      }

      const db = getDatabase();
      if (!db.reports) db.reports = {};

      Object.assign(db.reports, reports);

      db.version = (db.version || 1) + 1;
      db.lastUpdated = new Date().toISOString();
      if (deviceName) db.updatedByDevice = deviceName;

      saveDatabaseToFile(db);

      res.json({
        success: true,
        version: db.version,
        lastUpdated: db.lastUpdated,
        updatedCount: Object.keys(reports).length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset database back to default seed
  app.post("/api/sync/reset", (req, res) => {
    try {
      dbCache = {
        version: (dbCache?.version || 1) + 1,
        lastUpdated: new Date().toISOString(),
        updatedByDevice: "Admin Reset",
        students: INITIAL_STUDENTS,
        teachers: INITIAL_TEACHERS,
        reports: INITIAL_REPORTS,
        settings: INITIAL_SCHOOL_SETTINGS,
      };

      saveDatabaseToFile(dbCache);

      res.json({
        success: true,
        version: dbCache.version,
        lastUpdated: dbCache.lastUpdated,
        message: "Database berhasil direset ke data awal",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development middleware or static production handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIA Tahsin & Tahfiz Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
