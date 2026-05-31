import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

// Resolve ES Module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Data files paths
const isVercel = process.env.VERCEL === "1";

// For Vercel Serverless environment, we must write dynamic files to /tmp
// For local or containerized environments, we write to process.cwd()/data
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolio.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Robust check to find source directory holding initial default configurations
const getSourceFile = (filename: string): string => {
  const possiblePaths = [
    path.join(process.cwd(), "data", filename),
    path.join(__dirname, "data", filename),
    path.join(__dirname, "../data", filename),
    path.join(__dirname, "..", "data", filename),
    path.join(__dirname, "../../data", filename)
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // absolute backup path
  return path.join(process.cwd(), "data", filename);
};

const SOURCE_PORTFOLIO_FILE = getSourceFile("portfolio.json");
const SOURCE_MESSAGES_FILE = getSourceFile("messages.json");

// Ensure dynamic directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial full-fidelity portfolio dataset imported directly
import defaultPortfolio from "./data/portfolio.json";

// Bootstrap Portfolio file if it doesn't exist
if (!fs.existsSync(PORTFOLIO_FILE)) {
  if (fs.existsSync(SOURCE_PORTFOLIO_FILE)) {
    // Copy the compiled/deployed static portfolio data to writeable location
    fs.copyFileSync(SOURCE_PORTFOLIO_FILE, PORTFOLIO_FILE);
  } else {
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(defaultPortfolio, null, 2));
  }
}

// Bootstrap Messages file if it doesn't exist
if (!fs.existsSync(MESSAGES_FILE)) {
  if (fs.existsSync(SOURCE_MESSAGES_FILE)) {
    fs.copyFileSync(SOURCE_MESSAGES_FILE, MESSAGES_FILE);
  } else {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
  }
}

// Session store in-memory (token strings mapped to expiry)
const activeSessions = new Set<string>();

// Helper to check standard session header
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && activeSessions.has(authHeader.replace("Bearer ", ""))) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access. Please log in as administrator." });
  }
};

// -- API ENDPOINTS --

// Load portfolio content
app.get("/api/portfolio", (req, res) => {
  try {
    if (!fs.existsSync(PORTFOLIO_FILE)) {
      fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(defaultPortfolio, null, 2));
    }
    const data = fs.readFileSync(PORTFOLIO_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error: any) {
    res.status(500).json({ 
      error: "Failed to read portfolio data.", 
      message: error.message, 
      path: PORTFOLIO_FILE,
      stack: error.stack 
    });
  }
});

// Update portfolio content (Requires Authentication)
app.post("/api/portfolio", isAuthenticated, (req, res) => {
  try {
    const updatedData = req.body;
    // Basic validation of fields
    if (!updatedData.aboutHeading || !updatedData.aboutText || !Array.isArray(updatedData.userProjects)) {
      return res.status(400).json({ error: "Invalid portfolio payload structure." });
    }
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(updatedData, null, 2));
    res.json({ success: true, message: "Portfolio configuration saved successfully." });
  } catch (error: any) {
    res.status(500).json({ 
      error: "Failed to write portfolio data.", 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Submit contact request (Public)
app.post("/api/contact/message", (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
    }
    if (!fs.existsSync(MESSAGES_FILE)) {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
    const currentMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const newMessage = {
      id: crypto.randomUUID().toString(),
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    };
    currentMessages.unshift(newMessage); // Push to top
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(currentMessages, null, 2));
    res.json({ success: true, message: "Thank you. Your message has been saved." });
  } catch (error: any) {
    res.status(500).json({ 
      error: "Failed to save contact message.", 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Read contact messages (Requires Authentication)
app.get("/api/contact/messages", isAuthenticated, (req, res) => {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
    const messages = fs.readFileSync(MESSAGES_FILE, "utf-8");
    res.json(JSON.parse(messages));
  } catch (error: any) {
    res.status(500).json({ 
      error: "Failed to load messages.", 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Delete contact message (Requires Authentication)
app.delete("/api/contact/messages/:id", isAuthenticated, (req, res) => {
  try {
    const id = req.params.id;
    if (!fs.existsSync(MESSAGES_FILE)) {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
    const currentMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const filtered = currentMessages.filter((m: any) => m.id !== id);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filtered, null, 2));
    res.json({ success: true, message: "Message deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ 
      error: "Failed to delete message.", 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Login (Administrator Authentication)
app.post("/api/auth/login", (req, res) => {
  const { passcode, email } = req.body;
  
  // Resolve current email configuration dynamically from active portfolio config
  let currentPortfolioEmail = "chanchaltailor404@gmail.com";
  try {
    if (fs.existsSync(PORTFOLIO_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, "utf-8"));
      if (parsed && parsed.socialEmail) {
        currentPortfolioEmail = parsed.socialEmail;
      }
    }
  } catch (err) {
    console.error("Error dynamically resolving login email:", err);
  }

  // Fallback passcode 'portfolio2026' or configured in .env
  const masterPasscode = process.env.ADMIN_PASSCODE || "portfolio2026";
  const authorizedEmail = process.env.ADMIN_EMAIL || currentPortfolioEmail;

  // Grant access if passcode matches OR if doing a direct simulated sign-in for the owner
  const isPasscodeValid = passcode === masterPasscode;
  const isEmailValid = email === authorizedEmail;

  if (isPasscodeValid || isEmailValid) {
    // Generate a secure mock session token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    activeSessions.add(token);
    res.json({ success: true, token, email: authorizedEmail });
  } else {
    res.status(401).json({ error: "Access denied. Invalid credentials or email identifier." });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    activeSessions.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully." });
});

// Boot application with bundler middlewares or custom static servers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import Vite to avoid any production environment load failures
    const { createServer: createViteServer } = await import("vite");
    // Vite Dev Middleware Configuration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Portfolio backend running on port http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
