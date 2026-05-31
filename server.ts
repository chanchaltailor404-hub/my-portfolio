import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

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

// Root read-only source files (where the default portfolio values are/were deployed with the code)
const SOURCE_DATA_DIR = path.join(process.cwd(), "data");
const SOURCE_PORTFOLIO_FILE = path.join(SOURCE_DATA_DIR, "portfolio.json");
const SOURCE_MESSAGES_FILE = path.join(SOURCE_DATA_DIR, "messages.json");

// Ensure dynamic directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial full-fidelity portfolio dataset
const defaultPortfolio = {
  aboutHeading: "about",
  aboutText: "Hi, I'm Chanchal Tailor — a first-year B.Tech student at MBM University. I'm passionate about web development. I love turning ideas into projects, and this portfolio is my first step. Always learning, always building.",
  aboutLocation: "India (IST)",
  aboutDisciplines: "Engineering, vibe coding",
  socialEmail: "urmiraka2005@gmail.com",
  socialGithub: "https://github.com/urmiraka2005",
  socialLinkedin: "https://linkedin.com/in/chanchal-tailor",
  userProjects: [
    {
      title: "Interactive Fluid Canvas V1",
      category: "Creative Technology",
      year: "2026",
      tech: "Vite / React / GLSL / Canvas",
      description: "A high-fidelity hardware-accelerated interactive particle system with real-time mouse-interaction wave mechanics, dynamic lighting modifiers, and performance-tuned mobile viewport adaptivity.",
      githubLink: "https://github.com/urmiraka2005/particle-fluid-canvas",
      liveLink: "https://particle-fluid-canvas.vercel.app",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Modular Tactile Design System",
      category: "UI Engineering",
      year: "2025",
      tech: "Next.js / Tailwind CSS / Framer-Motion",
      description: "A comprehensive organic component playground emphasizing luxurious negative space, flawless page state transitions, fluid scaling fonts, and deep-contrast dark interfaces.",
      githubLink: "https://github.com/urmiraka2005/modular-tactile-system",
      liveLink: "https://tactile-design-playground.vercel.app",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Cosmic Kinetic Studio",
      category: "Frontend Engineering",
      year: "2026",
      tech: "Three.js / React-Three-Fiber / Camera-Logic",
      description: "Immersive 3D stellar orbital sandbox simulating solar system orbital physics with editable gravity multipliers, camera focal transitions, and reactive typography systems.",
      githubLink: "https://github.com/urmiraka2005/cosmic-stellar-sandbox",
      liveLink: "https://cosmic-stellar-sandbox.vercel.app",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop"
    }
  ]
};

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
  const authorizedEmail = process.env.ADMIN_EMAIL || "urmiraka2005@gmail.com";

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
