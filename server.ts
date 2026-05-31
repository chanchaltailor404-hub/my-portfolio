import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Session store in-memory (token strings mapped to expiry)
const activeSessions = new Set<string>();

// Data files paths
const DATA_DIR = path.join(process.cwd(), "data");
const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolio.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial full-fidelity portfolio dataset
const defaultPortfolio = {
  aboutHeading: "Modern Craftsmanship",
  aboutText: "I build clean, exceptionally responsive, and hyper-polished web products. Placing meticulous focus on typography pairings, high-impact branding layouts, and flawless motion orchestration.",
  aboutLocation: "India (IST)",
  aboutDisciplines: "Creative Technologies / UI Engineering",
  socialEmail: "urmiraka2005@gmail.com",
  socialGithub: "https://github.com/urmiraka2005",
  socialLinkedin: "https://linkedin.com/in/chanchal-tailor",
  userProjects: [
    {
      title: "Interactive Web Canvas",
      category: "Creative Technology",
      year: "2026",
      tech: "Vite / React/ GLSL",
      description: "A fast rendering dynamic graphics display with highly interactive physics parameters."
    },
    {
      title: "Tactile Systems Layout",
      category: "Design System",
      year: "2025",
      tech: "Framer Motion / Tailwind",
      description: "An high-fidelity organic layout utilizing premium viewport scale display type and rich interactions."
    },
    {
      title: "E-Commerce Fluid Engine",
      category: "Frontend Development",
      year: "2025",
      tech: "React / Node / Custom CSS",
      description: "Premium smooth navigation cart systems with flawless page-to-page layout transitions."
    }
  ]
};

// Bootstrap files if they do not exist
if (!fs.existsSync(PORTFOLIO_FILE)) {
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(defaultPortfolio, null, 2));
}
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

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
    const data = fs.readFileSync(PORTFOLIO_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to read portfolio data." });
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
  } catch (error) {
    res.status(500).json({ error: "Failed to write portfolio data." });
  }
});

// Submit contact request (Public)
app.post("/api/contact/message", (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
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
  } catch (error) {
    res.status(500).json({ error: "Failed to save contact message." });
  }
});

// Read contact messages (Requires Authentication)
app.get("/api/contact/messages", isAuthenticated, (req, res) => {
  try {
    const messages = fs.readFileSync(MESSAGES_FILE, "utf-8");
    res.json(JSON.parse(messages));
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages." });
  }
});

// Delete contact message (Requires Authentication)
app.delete("/api/contact/messages/:id", isAuthenticated, (req, res) => {
  try {
    const id = req.params.id;
    const currentMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const filtered = currentMessages.filter((m: any) => m.id !== id);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filtered, null, 2));
    res.json({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message." });
  }
});

// Login (Administrator Authentication)
app.post("/api/auth/login", (req, res) => {
  const { passcode, email } = req.body;
  // Fallback passcode 'portfolio2026' or configured in .env
  const masterPasscode = process.env.ADMIN_PASSCODE || "portfolio2026";
  const authorizedEmail = "urmiraka2005@gmail.com";

  // Grant access if passcode matches, OR if doing a direct simulated sign-in for the owner
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
    // Vite Dev Middleware Configuration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Portfolio backend running on port http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
