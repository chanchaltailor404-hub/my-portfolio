import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ProjectCard from "./components/ProjectCard";
import { 
  Mail, ArrowRight, X, ExternalLink, Sparkles, Check, 
  Send, Edit, Plus, Trash2, Lock, Unlock, LogOut, 
  MessageSquare, Calendar, User, Shield, AlertCircle,
  Github, Linkedin
} from "lucide-react";

// Inline High-Fidelity SVG paths to avoid any missing external asset errors
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
    <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.011-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.164 0 7.397 2.967 7.397 6.932 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.63 0 12-5.373 12-12 0-6.628-5.37-12-12-12z"/>
  </svg>
);

interface Project {
  title: string;
  category: string;
  year: string;
  tech: string;
  description: string;
  link?: string;
  githubLink?: string;
  liveLink?: string;
  image?: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

const SPIDER_GWEN_IMAGES = [
  "https://i.pinimg.com/736x/ec/d7/33/ecd7334ccd280596ff106a4b13aacede.jpg",
  "https://i.pinimg.com/736x/83/7d/51/837d51ee0e4a7a13dabb283b7f113e31.jpg",
  "https://i.pinimg.com/736x/8a/a5/cb/8aa5cb4818fa671dfcaeecdb1ee4bf62.jpg",
  "https://images.wallpaperflare.com/wallpaper/32/385/381/spider-man-into-the-spider-verse-spider-gwen-marvel-comics-spider-man-gwen-stacy-hd-wallpaper-preview.jpg",
  "https://images.wallpaperflare.com/wallpaper/52/640/731/spider-man-into-the-spider-verse-spider-gwen-gwen-stacy-hd-wallpaper-preview.jpg"
];

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // Img loading
  const [gwenImageIndex, setGwenImageIndex] = useState(0);
  const [useBackupArt, setUseBackupArt] = useState(false);
  
  // Administrator Token and authentication state
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem("portfolio_token") || "");
  const [adminEmail, setAdminEmail] = useState<string>(() => localStorage.getItem("portfolio_admin_email") || "");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPasscode, setLoginPasscode] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Hidden/discrete admin mode trigger - visible if logged in or URL has ?edit=true or dual-clicked
  const [showAdminTrigger, setShowAdminTrigger] = useState(() => {
    return !!localStorage.getItem("portfolio_token");
  });

  // Dynamic portfolio elements fetched from Express backend
  const [aboutHeading, setAboutHeading] = useState("about");
  const [aboutText, setAboutText] = useState("Hi, I'm Chanchal Tailor — a first-year B.Tech student at MBM University. I'm passionate about web development. I love turning ideas into projects, and this portfolio is my first step. Always learning, always building.");
  const [aboutLocation, setAboutLocation] = useState("India (IST)");
  const [aboutDisciplines, setAboutDisciplines] = useState("Engineering, vibe coding");
  const [socialEmail, setSocialEmail] = useState("urmiraka2005@gmail.com");
  const [socialGithub, setSocialGithub] = useState("https://github.com/urmiraka2005");
  const [socialLinkedin, setSocialLinkedin] = useState("https://linkedin.com/in/chanchal-tailor");

  const [userProjects, setUserProjects] = useState<Project[]>([
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
  ]);
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);

  // Editing UI states
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // New project inline editor fields
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newGithubLink, setNewGithubLink] = useState("");
  const [newLiveLink, setNewLiveLink] = useState("");
  const [newImage, setNewImage] = useState("");

  // Edit existing project state
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editTech, setEditTech] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editGithubLink, setEditGithubLink] = useState("");
  const [editLiveLink, setEditLiveLink] = useState("");
  const [editImage, setEditImage] = useState("");

  // Guest Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const getSocialHandle = (urlOrStr: string, fallback: string) => {
    if (!urlOrStr) return fallback;
    if (urlOrStr.includes("@") && !urlOrStr.startsWith("http")) {
      return urlOrStr.trim().split("@")[0];
    }
    try {
      const cleanUrl = urlOrStr.trim().replace(/\/$/, "");
      const parts = cleanUrl.split("/");
      const last = parts[parts.length - 1];
      if (last && last.toLowerCase() !== "in" && last.toLowerCase() !== "github.com" && last.toLowerCase() !== "linkedin.com") {
        return last;
      }
    } catch (e) {}
    return fallback;
  };

  const navigationItems = ["My Works"];

  // Fetch standard portfolio configuration from backend on mount
  useEffect(() => {
    fetchPortfolioConfig();
    
    // Check if query parameter has edit or admin to show trigger
    if (window.location.search.includes("edit=true") || window.location.search.includes("admin=true")) {
      setShowAdminTrigger(true);
    }
  }, []);

  // Fetch messages if authenticated
  useEffect(() => {
    if (authToken) {
      fetchAdminMessages();
    }
  }, [authToken]);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setShowToast({ message, type });
    setTimeout(() => {
      setShowToast(null);
    }, 4000);
  };

  const fetchPortfolioConfig = () => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.aboutHeading) setAboutHeading(data.aboutHeading);
          if (data.aboutText) setAboutText(data.aboutText);
          if (data.aboutLocation) setAboutLocation(data.aboutLocation);
          if (data.aboutDisciplines) setAboutDisciplines(data.aboutDisciplines);
          if (data.socialEmail) setSocialEmail(data.socialEmail);
          if (data.socialGithub) setSocialGithub(data.socialGithub);
          if (data.socialLinkedin) setSocialLinkedin(data.socialLinkedin);

          if (Array.isArray(data.userProjects)) {
            setUserProjects(data.userProjects);
          }
        }
      })
      .catch((err) => {
        console.error("Error reading portfolio config:", err);
        triggerToast("Failed to connect to remote portfolio repository.", "error");
      });
  };

  const fetchAdminMessages = () => {
    fetch("/api/contact/messages", {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("portfolio_token");
          localStorage.removeItem("portfolio_admin_email");
          setAuthToken("");
          setAdminEmail("");
          throw new Error("Session expired. Please log in again.");
        }
        if (!res.ok) throw new Error("Failed to load messages.");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setAdminMessages(data);
      })
      .catch((err) => {
        console.warn("Session check:", err.message);
      });
  };

  // Helper function to submit updated payload to Express
  const syncPortfolioWithServer = (updatedPayload: any) => {
    fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(updatedPayload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not persist updates.");
        return res.json();
      })
      .then(() => {
        triggerToast("Portfolio changes successfully written and live!", "success");
      })
      .catch((err) => {
        console.error("Write error:", err);
        triggerToast("Unauthorized or failed write transmission.", "error");
      });
  };

  // Authenticate Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        passcode: loginPasscode,
        email: loginEmail
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid access passcode or unauthorized sign-in email.");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.token) {
          localStorage.setItem("portfolio_token", data.token);
          localStorage.setItem("portfolio_admin_email", data.email || "urmiraka2005@gmail.com");
          setAuthToken(data.token);
          setAdminEmail(data.email || "urmiraka2005@gmail.com");
          setIsLoginModalOpen(false);
          setLoginPasscode("");
          setLoginEmail("");
          triggerToast("Authenticated successfully. Welcome back, Chanchal!", "success");
        }
      })
      .catch((err) => {
        setLoginError(err.message || "Incorrect verification credential.");
      });
  };

  // Logout Admin
  const handleAdminLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).finally(() => {
      localStorage.removeItem("portfolio_token");
      localStorage.removeItem("portfolio_admin_email");
      setAuthToken("");
      setAdminEmail("");
      setIsLoginModalOpen(false);
      triggerToast("Logged out of administrator session.", "info");
      
      // Also hide the discrete panel trigger on outright logout
      if (!window.location.search.includes("edit=true") && !window.location.search.includes("admin=true")) {
        setShowAdminTrigger(false);
      }
    });
  };

  // Double click footer text secret activation
  const handleTrustworthyDoubleClick = () => {
    setShowAdminTrigger(true);
    setIsLoginModalOpen(true);
    triggerToast("Management authority portal activated.", "info");
  };

  // Handle updates to About section
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPayload = {
      aboutHeading,
      aboutText,
      aboutLocation,
      aboutDisciplines,
      socialEmail,
      socialGithub,
      socialLinkedin,
      userProjects
    };
    setIsEditingAbout(false);
    syncPortfolioWithServer(updatedPayload);
  };

  // Handle adding project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProject: Project = {
      title: newTitle,
      category: newCategory || "General",
      year: newYear || "2026",
      tech: newTech || "React",
      description: newDescription || "No description provided.",
      link: newLink.trim() || undefined,
      githubLink: newGithubLink.trim() || undefined,
      liveLink: newLiveLink.trim() || undefined,
      image: newImage.trim() || undefined
    };

    const updatedProjects = [...userProjects, newProject];
    setUserProjects(updatedProjects);

    const updatedPayload = {
      aboutHeading,
      aboutText,
      aboutLocation,
      aboutDisciplines,
      socialEmail,
      socialGithub,
      socialLinkedin,
      userProjects: updatedProjects
    };

    setNewTitle("");
    setNewCategory("");
    setNewYear("");
    setNewTech("");
    setNewDescription("");
    setNewLink("");
    setNewGithubLink("");
    setNewLiveLink("");
    setNewImage("");
    setIsAddingProject(false);

    syncPortfolioWithServer(updatedPayload);
  };

  // Start editing existing project
  const handleEditProjectStart = (index: number) => {
    const project = userProjects[index];
    setEditingProjectIndex(index);
    setEditTitle(project.title);
    setEditCategory(project.category);
    setEditYear(project.year);
    setEditTech(project.tech);
    setEditDescription(project.description);
    setEditLink(project.link || "");
    setEditGithubLink(project.githubLink || "");
    setEditLiveLink(project.liveLink || "");
    setEditImage(project.image || "");
  };

  // Cancel editing existing project
  const handleCancelProjectEdit = () => {
    setEditingProjectIndex(null);
  };

  // Save changes to edited project
  const handleSaveProjectEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProjectIndex === null) return;
    if (!editTitle.trim()) return;

    const updatedProjects = [...userProjects];
    updatedProjects[editingProjectIndex] = {
      ...updatedProjects[editingProjectIndex],
      title: editTitle,
      category: editCategory || "General",
      year: editYear || "2026",
      tech: editTech || "React",
      description: editDescription || "No description provided.",
      link: editLink.trim() || undefined,
      githubLink: editGithubLink.trim() || undefined,
      liveLink: editLiveLink.trim() || undefined,
      image: editImage.trim() || undefined
    };

    setUserProjects(updatedProjects);

    const updatedPayload = {
      aboutHeading,
      aboutText,
      aboutLocation,
      aboutDisciplines,
      socialEmail,
      socialGithub,
      socialLinkedin,
      userProjects: updatedProjects
    };

    setEditingProjectIndex(null);
    syncPortfolioWithServer(updatedPayload);
  };

  // Remove project
  const handleDeleteProject = (index: number) => {
    const updatedProjects = userProjects.filter((_, i) => i !== index);
    setUserProjects(updatedProjects);

    const updatedPayload = {
      aboutHeading,
      aboutText,
      aboutLocation,
      aboutDisciplines,
      socialEmail,
      socialGithub,
      socialLinkedin,
      userProjects: updatedProjects
    };

    syncPortfolioWithServer(updatedPayload);
  };

  // Submit client message
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) return;

    setContactSubmitting(true);
    fetch("/api/contact/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: contactName,
        email: contactEmail,
        message: contactMsg
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContactName("");
          setContactEmail("");
          setContactMsg("");
          triggerToast("Message sent successfully. Thank you!", "success");
        } else {
          throw new Error("Server rejected message.");
        }
      })
      .catch((err) => {
        console.error("Contact send error:", err);
        triggerToast("Failed to deliver message. Clean storage used as fallback.", "error");
      })
      .finally(() => {
        setContactSubmitting(false);
      });
  };

  // Delete message from inbox
  const handleDeleteMessage = (id: string) => {
    fetch(`/api/contact/messages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdminMessages(prev => prev.filter(msg => msg.id !== id));
          triggerToast("Client message deleted from server.", "info");
        }
      })
      .catch((err) => console.error("Error deleting message:", err));
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent text-white font-sans select-none flex flex-col justify-start overflow-x-hidden">
      
      {/* Background Video with Smart Scale-and-Crop to hide Kling AI watermark */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-112 translate-x-[3%] translate-y-[3%] pointer-events-none"
          src="https://res.cloudinary.com/dkk1k5rfd/video/upload/v1780134773/kling_20260530_Image_to_Video__3939_0_1_odbjxy.mp4"
        />
      </div>

      {/* 1. Organic Paper Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035] bg-repeat mix-blend-overlay z-10" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Hero Viewport Wrapper */}
      <div className="relative w-full min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-16 z-20">

      {/* 2. Top Navigation & Auth Control Header */}
      <header className="relative w-full z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Glowing Owner Lock Key Badge */}
        <div className="flex items-center space-x-2.5">
          {authToken ? (
            <motion.button
              onClick={handleAdminLogout}
              whileHover={{ scale: 1.03 }}
              className="group flex items-center space-x-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 rounded-full px-3.5 py-1.5 text-xs text-pink-300 font-mono tracking-wider focus:outline-none cursor-pointer"
              title="Click to sign out"
              id="admin-logout-trigger"
            >
              <Unlock className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>OWNER: {adminEmail}</span>
              <LogOut className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          ) : showAdminTrigger ? (
            <motion.button
              onClick={() => setIsLoginModalOpen(true)}
              whileHover={{ scale: 1.03 }}
              className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white/70 font-mono tracking-wider focus:outline-none cursor-pointer"
              id="admin-login-trigger"
            >
              <Lock className="w-3.5 h-3.5 text-white/50" />
              <span>LOG IN AS ONLY ME (OWNER)</span>
            </motion.button>
          ) : null}
        </div>

        {/* Home Navigation Tabs */}
        <nav className="flex space-x-6 sm:space-x-10 md:space-x-12">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item}
              id={`nav-link-${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.85, y: 0 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              onClick={() => {
                if (item === "My Works") {
                  setActiveTab(null);
                  setTimeout(() => {
                    document.getElementById("works-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                } else if (item === "About") {
                  setActiveTab(null);
                  setTimeout(() => {
                    document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                } else {
                  setActiveTab(item);
                }
              }}
              className="text-sm sm:text-base font-medium tracking-wide cursor-pointer relative py-1 focus:outline-none text-white font-sans"
            >
              {item}
              {activeTab === item && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"
                />
              )}
            </motion.button>
          ))}
        </nav>
      </header>

      {/* 3. Central Content Grid */}
      <main className="relative flex-1 flex items-center z-20 my-auto">
        <div className="grid grid-cols-12 w-full gap-4 md:gap-8 items-center">
          
          {/* Vertical Social Side rail */}
          <motion.div 
            id="social-vertical-rail"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center space-y-4 md:space-y-6 text-white"
          >
            <motion.a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer"
              whileHover={{ scale: 1.15, opacity: 1 }}
              className="opacity-80 transition-opacity p-2 hover:bg-white/10 rounded-full"
              id="social-instagram"
            >
              <InstagramIcon />
            </motion.a>
            <span className="text-white/40 font-mono text-xs select-none pointer-events-none">•</span>
            <motion.a 
              href="https://pinterest.com" 
              target="_blank" 
              rel="noreferrer"
              whileHover={{ scale: 1.15, opacity: 1 }}
              className="opacity-80 transition-opacity p-2 hover:bg-white/10 rounded-full"
              id="social-pinterest"
            >
              <PinterestIcon />
            </motion.a>
          </motion.div>

          {/* Core Master Typography Stack */}
          <div className="col-span-10 sm:col-span-11 flex flex-col justify-center items-end text-right leading-none text-white select-none mt-16 sm:mt-24 md:mt-32">
            
            {/* "I am" Row */}
            <div className="overflow-hidden h-fit py-1">
              <motion.h1
                id="hero-i-am"
                initial={{ y: "-110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-serif font-light text-[5vw] sm:text-[4.5vw] md:text-[3.8vw] lg:text-[3.2vw] tracking-normal leading-[1.05] text-white/85"
              >
                Hi, I am
              </motion.h1>
            </div>

            {/* "Chanchal Tailor" Row */}
            <div className="overflow-hidden h-fit py-1">
              <motion.h1
                id="hero-chanchal-tailor"
                initial={{ y: "-110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="font-serif font-light text-[5vw] sm:text-[4.5vw] md:text-[3.8vw] lg:text-[3.2vw] tracking-normal leading-[1.05] text-white/90"
              >
                Chanchal Tailor
              </motion.h1>
            </div>

            {/* "student developer" Row */}
            <div className="overflow-hidden h-fit py-1">
              <motion.h2
                id="hero-developer"
                initial={{ y: "-110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="font-sans font-light text-[3.5vw] sm:text-[3vw] md:text-[2.4vw] lg:text-[1.8vw] tracking-tight leading-[1.05] text-white/70 lowercase"
              >
                student developer
              </motion.h2>
            </div>

          </div>

        </div>
      </main>

      {/* 4. Footer Section */}
      <footer className="relative w-full z-20 flex items-center justify-between mt-auto">
        
        {/* Placeholder container to keep center layout perfect */}
        <div className="w-10 h-10 hidden sm:block md:w-16"></div>

        {/* Center label: "Trustworthy" */}
        <motion.div
          id="footer-trustworthy"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          onDoubleClick={handleTrustworthyDoubleClick}
          title="Owner Auth Portal // Secure Double-Click"
          className="text-sm sm:text-base md:text-lg font-sans font-normal tracking-[0.12em] text-white/90 mx-auto text-center cursor-default select-none active:text-pink-300 transition-colors"
        >
          Trustworthy
        </motion.div>

        {/* Owner Admin Access Button */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-end">
          <motion.button
            onClick={() => {
              setShowAdminTrigger(true);
              setIsLoginModalOpen(true);
            }}
            whileHover={{ scale: 1.1 }}
            className="text-white/20 hover:text-pink-300 p-2 rounded-full cursor-pointer transition-all"
            title="Owner Management Portal Lock"
          >
            {authToken ? (
              <Unlock className="w-4 h-4 text-pink-400" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </motion.button>
        </div>

      </footer>

    </div> {/* Closing Hero Viewport Wrapper */}

    {/* 4.5. Scrollable About Section */}
    <section 
      id="about-section"
      className="relative w-full max-w-5xl mx-auto py-24 px-6 sm:px-10 z-20 select-text"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        {isEditingAbout && authToken ? (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveAbout} 
            className="bg-black/40 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-2xl space-y-4 max-w-2xl mx-auto"
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <Edit className="w-4 h-4 text-[#F094E6]" />
              <span className="font-mono text-xs text-white/70 uppercase">Edit About Narrative</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/55 uppercase mb-1">Narrative Headline</label>
              <input 
                type="text" 
                required
                value={aboutHeading}
                onChange={(e) => setAboutHeading(e.target.value)}
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-4 py-2 text-white outline-none transition-all text-sm font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/55 uppercase mb-1">Meticulous Bio Paragraph</label>
              <textarea 
                rows={4}
                required
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-4 py-2 text-white outline-none transition-all text-sm resize-none font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/55 uppercase mb-1">Location / Timezone</label>
                <input 
                  type="text" 
                  required
                  value={aboutLocation}
                  onChange={(e) => setAboutLocation(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-4 py-2 text-white outline-none transition-all text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/55 uppercase mb-1">Primary Disciplines</label>
                <input 
                  type="text" 
                  required
                  value={aboutDisciplines}
                  onChange={(e) => setAboutDisciplines(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-4 py-2 text-white outline-none transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="border-t border-white/5 my-2 pt-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-pink-300">// Contact Networks (Displayed under 'Connect with me')</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/55 uppercase mb-1">Social Email</label>
                <input 
                  type="text" 
                  required
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white outline-none transition-all text-xs font-mono"
                  placeholder="e.g. name@domain.com"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/55 uppercase mb-1">GitHub Link</label>
                <input 
                  type="text" 
                  required
                  value={socialGithub}
                  onChange={(e) => setSocialGithub(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white outline-none transition-all text-xs font-mono"
                  placeholder="e.g. https://github.com/user"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/55 uppercase mb-1">LinkedIn Link</label>
                <input 
                  type="text" 
                  required
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white outline-none transition-all text-xs font-mono"
                  placeholder="e.g. https://linkedin.com/in/user"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-white hover:bg-white/90 text-zinc-950 font-bold py-2.5 rounded-lg active:scale-[0.98] transition-all text-xs cursor-pointer font-mono"
              >
                SAVE AND PUBLISH
              </button>
              <button
                type="button"
                onClick={() => setIsEditingAbout(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white py-2.5 rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all text-xs cursor-pointer font-mono"
              >
                DISCARD CHANGE
              </button>
            </div>
          </motion.form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start bg-black/35 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-white/10">
            <div className="md:col-span-7 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#F094E6]">
                // About Narrative
              </span>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3 drop-shadow-md leading-[1.1]"
              >
                {aboutHeading}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg leading-relaxed font-light text-white/95"
              >
                {aboutText}
              </motion.p>
            </div>
            
            <div className="md:col-span-1 border-r border-white/10 hidden md:block self-stretch" />

            <div className="md:col-span-4 space-y-6 md:pl-4 h-full flex flex-col justify-between font-sans">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-4 text-sm font-mono text-[#F094E6]"
              >
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">CURRENT LOCATION</p>
                  <p className="font-semibold text-base tracking-wide text-white">{aboutLocation}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">CORE DISCIPLINES</p>
                  <p className="font-semibold text-base tracking-wide text-white">{aboutDisciplines}</p>
                </div>
              </motion.div>

              {/* Editable action trigger for the owner */}
              {authToken && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="pt-6"
                >
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="flex items-center space-x-2 text-[10px] font-mono uppercase bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 text-pink-300 px-4 py-2.5 rounded-lg transition-all cursor-pointer font-bold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit About Section</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </section>

    {/* 4.6. Scrollable My Works Section with Motion Hover Cards */}
    <section 
      id="works-section"
      className="relative w-full max-w-5xl mx-auto py-24 px-6 sm:px-10 z-20 select-text border-t border-white/5"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10 mb-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#F094E6]">
              // Portfolio Repertory
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1] mt-1">
              My Works
            </h3>
          </div>

          {/* Display "Add New Work" trigger ONLY if owner logged in */}
          {authToken && (
            <button
              onClick={() => setIsAddingProject(!isAddingProject)}
              className="flex items-center space-x-1.5 bg-pink-500 hover:bg-[#eb7fda] text-zinc-950 text-xs font-mono uppercase px-3.5 py-2.5 rounded-lg font-bold transition-all cursor-pointer shadow-lg shadow-pink-500/10"
            >
              {isAddingProject ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Panel</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Curate New Work</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Curation Edit Panel */}
        {isAddingProject && authToken && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddProject} 
            className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl space-y-4 mb-8 max-w-2xl mx-auto font-sans"
          >
            <h4 className="text-xs font-bold font-mono text-[#F094E6] uppercase tracking-wide">CURATION ENGINE SPECS</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Project Title</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Kinetic Canvas Display" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Discipline Category</label>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Interaction Design" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Publish Year</label>
                <input 
                  type="text" 
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="e.g. 2026" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Tech Stack Declarations</label>
                <input 
                  type="text" 
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="e.g. React / Tailwind / GLSL" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">GitHub Repos Link (URL)</label>
                <input 
                  type="text" 
                  value={newGithubLink}
                  onChange={(e) => setNewGithubLink(e.target.value)}
                  placeholder="e.g. https://github.com/username/repo" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Live Demo Site (URL)</label>
                <input 
                  type="text" 
                  value={newLiveLink}
                  onChange={(e) => setNewLiveLink(e.target.value)}
                  placeholder="e.g. https://myproject-live.com" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Backup Link URL (Optional)</label>
                <input 
                  type="text" 
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="e.g. https://myproject.com" 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-1">Photo / Mockup Image (URL)</label>
                <input 
                  type="text" 
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..." 
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-1">Detailed Description</label>
              <textarea 
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explain the visual goals, responsive design, and creative solutions..." 
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/15 focus:border-[#F094E6]/40 rounded-lg px-3 py-2 text-white outline-none transition-all text-sm resize-none placeholder-white/20 font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-zinc-950 font-bold py-2.5 rounded-lg active:scale-[0.98] transition-all text-xs cursor-pointer font-mono flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>PUBLISH TO PORTFOLIO REPOSITORY</span>
            </button>
          </motion.form>
        )}

        {/* Project Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {userProjects.map((project, i) => (
            <motion.div key={project.title + "-" + i} variants={cardItemVariants} className="h-full">
              {editingProjectIndex === i ? (
                <motion.form
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleSaveProjectEdit}
                  className="p-5 bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-pink-500/40 text-xs text-white flex flex-col justify-between space-y-3 h-full"
                >
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#F094E6] font-mono uppercase tracking-wider">// EDIT SPECS</h4>
                    
                    <div>
                      <label className="block text-[9px] text-white/50 uppercase font-mono mb-0.5">Title</label>
                      <input 
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-mono mb-0.5">Category</label>
                        <input 
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-mono mb-0.5">Year</label>
                        <input 
                          type="text"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-white/50 uppercase font-mono mb-0.5">Tech Stack</label>
                      <input 
                        type="text"
                        value={editTech}
                        onChange={(e) => setEditTech(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] text-white/50 uppercase font-mono mb-0.5">GitHub Repos Link</label>
                        <input 
                          type="text"
                          placeholder="e.g. https://github.com/..."
                          value={editGithubLink}
                          onChange={(e) => setEditGithubLink(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-white/50 uppercase font-mono mb-0.5">Live Demo URL</label>
                        <input 
                          type="text"
                          placeholder="e.g. https://demo.com"
                          value={editLiveLink}
                          onChange={(e) => setEditLiveLink(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-white/50 uppercase font-mono mb-0.5">Backup Link URL (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. https://myproject.com"
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6] placeholder-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-white/50 uppercase font-mono mb-0.5">Photo URL (Image Mockup)</label>
                      <input 
                        type="text"
                        placeholder="e.g. URL ending in .png/.jpg"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6] placeholder-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-white/50 uppercase font-mono mb-0.5">Description</label>
                      <textarea 
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#F094E6] resize-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2 border-t border-white/10">
                    <button 
                      type="submit"
                      className="flex-1 bg-pink-500 hover:bg-pink-400 text-zinc-950 font-bold py-1.5 rounded text-xs cursor-pointer font-mono"
                    >
                      SAVE
                    </button>
                    <button 
                      type="button"
                      onClick={handleCancelProjectEdit}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-1.5 rounded text-xs cursor-pointer font-mono"
                    >
                      CANCEL
                    </button>
                  </div>
                </motion.form>
              ) : (
                <ProjectCard
                  project={project}
                  index={i}
                  authToken={authToken}
                  onEditStart={handleEditProjectStart}
                  onDelete={handleDeleteProject}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {userProjects.length === 0 && (
          <div className="text-center py-12 text-white/40 font-mono text-xs border border-dashed border-white/10 rounded-2xl bg-black/20">
            NO DYNAMIC WORKS DETECTED ON PORTFOLIO DB.
          </div>
        )}
      </motion.div>
    </section>

    {/* 4.8. Scrollable Contact Section (Footer section) */}
    <section 
      id="contact-section"
      className="relative w-full max-w-5xl mx-auto py-24 px-6 sm:px-10 z-20 select-text border-t border-white/5"
    >
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Details */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <h3 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Connect with me
            </h3>
            <p className="text-base sm:text-lg leading-relaxed font-light text-white/80">
              feel free to reach out- I'm always open to learning and collaborating.
            </p>
            
            <div className="pt-6 space-y-4">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-pink-300">// Transmissions & Networks</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <motion.a 
                  href={`mailto:${socialEmail.replace(/^(mailto:)/i, "")}`}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all text-white hover:text-[#F094E6]"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <div className="font-mono text-[10.5px] min-w-0 flex-1">
                    <span className="block text-[8px] text-white/40 uppercase">Direct Email</span>
                    <span className="font-semibold block truncate" title={socialEmail}>{getSocialHandle(socialEmail, "email")}</span>
                  </div>
                </motion.a>

                <motion.a 
                  href={socialGithub.startsWith("http") ? socialGithub : `https://github.com/${socialGithub}`}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00f2ff]/30 hover:bg-[#00f2ff]/5 transition-all text-white hover:text-[#00f2ff] min-w-0"
                >
                  <Github className="w-4 h-4 shrink-0" />
                  <div className="font-mono text-[10.5px] min-w-0 flex-1">
                    <span className="block text-[8px] text-white/40 uppercase">Code Repository</span>
                    <span className="font-semibold block truncate" title={socialGithub}>{getSocialHandle(socialGithub, "github")}</span>
                  </div>
                </motion.a>

                <motion.a 
                  href={socialLinkedin.startsWith("http") ? socialLinkedin : `https://linkedin.com/in/${socialLinkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all text-white hover:text-[#F094E6] min-w-0"
                >
                  <Linkedin className="w-4 h-4 shrink-0" />
                  <div className="font-mono text-[10.5px] min-w-0 flex-1">
                    <span className="block text-[8px] text-white/40 uppercase">LinkedIn Conn</span>
                    <span className="font-semibold block truncate" title={socialLinkedin}>{getSocialHandle(socialLinkedin, "linkedin")}</span>
                  </div>
                </motion.a>
              </div>

              <div className="pt-2 flex flex-col space-y-2.5 font-mono text-xs text-white/60">
                <div className="flex items-center space-x-2 text-[#00f2ff] bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                  <span className="text-[10px]">Response guaranteed within 24 Hours (IST Timezone)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Guest Submit Form OR Client Inbox for Chanchal */}
          <div className="lg:col-span-6 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-left">
            
            {authToken && (
              <div className="flex space-x-4 border-b border-white/10 pb-4 mb-4">
                <span className="font-mono text-xs text-pink-300 flex items-center space-x-2 font-bold bg-pink-500/10 px-3 py-1 rounded-full">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>INBOX ({adminMessages.length})</span>
                </span>
              </div>
            )}

            {authToken ? (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#F094E6]">Incoming Client Transmissions</h4>
                
                {adminMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 relative group hover:bg-white/10 transition-colors">
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute top-3 right-3 text-white/30 hover:text-red-400 p-1 hover:bg-white/10 rounded transition-colors"
                      title="Delete message from server"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="text-[10px] font-mono text-pink-300">
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {msg.name} (<a href={`mailto:${msg.email}`} className="text-[#00f2ff] hover:underline selection:bg-pink-500">{msg.email}</a>)
                    </div>
                    <div className="text-xs text-white/70 select-text font-serif leading-relaxed">
                      "{msg.message}"
                    </div>
                  </div>
                ))}

                {adminMessages.length === 0 && (
                  <div className="text-center py-8 text-white/40 font-mono text-[10px] uppercase border border-dashed border-white/10 rounded-xl">
                    Zero client messages currently stored.
                  </div>
                )}
              </div>
            ) : (
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 uppercase mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. John Doe" 
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white placeholder-white/20 outline-none transition-all text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. brand@partner.com" 
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white placeholder-white/20 outline-none transition-all text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Message Detail</label>
                  <textarea 
                    rows={3}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Explain your target design goals, timelines, or web features..." 
                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white placeholder-white/20 outline-none transition-all text-sm resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full bg-[#F094E6] hover:bg-[#eb7fda] text-zinc-950 font-bold py-2.5 rounded-lg active:scale-[0.98] transition-all text-xs cursor-pointer flex items-center justify-center space-x-2 font-mono"
                >
                  <span>{contactSubmitting ? "PUSHING TRANSMISSION..." : "TRANSMIT MESSAGE REQUEST"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </section>

      {/* 5. In-App Toasts / Interactive Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-8 z-55 flex items-center space-x-3 px-5 py-3.5 rounded-xl border font-mono text-xs tracking-wide shadow-2xl backdrop-blur-md ${
              showToast.type === "success" 
                ? "bg-zinc-950/92 border-emerald-500/40 text-emerald-300"
                : showToast.type === "error"
                ? "bg-zinc-950/92 border-red-500/40 text-red-300"
                : "bg-zinc-950/92 border-pink-500/40 text-pink-300"
            }`}
          >
            {showToast.type === "success" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            {showToast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {showToast.type === "info" && <Shield className="w-4 h-4 text-pink-400 shrink-0" />}
            <span>{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Admin Authentication Login Card */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-10 text-left shadow-[0_0_50px_rgba(240,148,230,0.15)] relative overflow-hidden"
              id="admin-auth-card"
            >
              {/* Backglow element */}
              <div className="absolute w-[200px] h-[200px] rounded-full bg-pink-500/10 blur-3xl -top-10 -right-10 pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-pink-400" />
                  <span className="font-mono text-xs tracking-widest text-[#F094E6] uppercase">
                    MANAGEMENT AUTHORITY
                  </span>
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="p-1 hover:bg-white/15 rounded-full transition-colors cursor-pointer text-white/50 hover:text-white focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-white mb-1">
                    Portals Guard
                  </h3>
                  <p className="text-xs text-white/60 mb-5 leading-relaxed">
                    Verify owner identity to switch the portfolio layout into editable administrator mode.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 uppercase mb-1.5">Owner Access Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="urmiraka2005@gmail.com"
                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-4 py-2.5 text-white outline-none transition-all text-sm font-mono placeholder-white/20"
                  />
                  <p className="text-[10px] text-white/30 font-mono mt-1">ONLY RECOGNIZES AUTHORIZED OWNER EMAIL</p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 uppercase mb-1.5 font-bold text-pink-300">ADMIN PASSCODE</label>
                  <input
                    type="password"
                    required
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    placeholder="Enter security passcode..."
                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-4 py-2.5 text-white outline-none transition-all text-sm font-mono"
                  />
                  <p className="text-[10px] text-white/35 font-mono mt-1">DEFAULT VALUE IS: <span className="text-pink-300 font-bold bg-pink-500/10 px-1 rounded">portfolio2026</span></p>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-mono text-red-400 bg-red-950/20 border border-red-500/30 p-2.5 rounded-lg flex items-center space-x-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginError}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#F094E6] hover:bg-[#eb7fda] text-zinc-950 font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all text-xs cursor-pointer shadow-lg shadow-pink-500/20 font-mono"
                >
                  TRANSMIT VERIFICATION
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Elegant Dynamic Full-Screen Overlay Pages */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-40 bg-black overflow-hidden select-none"
            id="immersive-reference-page"
          >
            {/* Minimal organic paper noise texture layer */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.035] bg-repeat mix-blend-overlay z-40" 
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
              }} 
            />

            {/* Stunning High-Contrast Spider-Gwen Cinematic Visual Layer */}
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full z-10 bg-black flex items-center justify-center overflow-hidden"
            >
              {!useBackupArt ? (
                <img
                  src={SPIDER_GWEN_IMAGES[gwenImageIndex]}
                  alt="Spider-Gwen portrait reference"
                  referrerPolicy="no-referrer"
                  style={{
                    WebkitMaskImage: "radial-gradient(ellipse 45% 65% at 50% 46%, black 35%, transparent 75%)",
                    maskImage: "radial-gradient(ellipse 45% 65% at 50% 46%, black 35%, transparent 75%)"
                  }}
                  className="w-full h-full object-cover object-center pointer-events-none transition-all duration-700 ease-in-out filter contrast-[1.20] brightness-[1.10] saturate-[1.15]"
                  onError={() => {
                    if (gwenImageIndex < SPIDER_GWEN_IMAGES.length - 1) {
                      setGwenImageIndex(gwenImageIndex + 1);
                    } else {
                      setUseBackupArt(true);
                    }
                  }}
                />
              ) : (
                /* High-Fidelity Custom animated backdrop if hotlinked images are blocked */
                <div className="w-full h-full bg-black relative flex items-center justify-end overflow-hidden" id="backup-cyber-bg">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0c030d] via-[#1a051c] to-black z-0" />
                  <svg className="absolute w-[180%] h-[180%] -right-1/3 -bottom-1/3 opacity-20 stroke-[#F094E6]" fill="none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="10" strokeWidth="0.1" />
                    <circle cx="50" cy="50" r="20" strokeWidth="0.1" />
                    <circle cx="50" cy="50" r="30" strokeWidth="0.1" />
                    <circle cx="50" cy="50" r="40" strokeWidth="0.1" />
                    <line x1="50" y1="50" x2="0" y2="0" strokeWidth="0.1" />
                    <line x1="50" y1="50" x2="100" y2="100" strokeWidth="0.1" />
                    <line x1="50" y1="50" x2="100" y2="0" strokeWidth="0.1" />
                    <line x1="50" y1="50" x2="0" y2="100" strokeWidth="0.1" />
                    <line x1="50" y1="50" x2="50" y2="0" strokeWidth="0.1" />
                    <line x1="50" y1="50" x2="50" y2="100" strokeWidth="0.1" />
                  </svg>
                  <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[100px] -right-10 -bottom-10 z-0" />
                  <div className="absolute w-[400px] h-[400px] rounded-full bg-[#00f2ff]/5 blur-[90px] right-24 top-10 z-0" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/55 z-15 pointer-events-none" />
              <div className="absolute inset-0 bg-pink-950/10 mix-blend-color-dodge pointer-events-none z-15" />
            </motion.div>

            {/* Immersive Text Content Layer - Over the background panel */}
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col justify-between p-6 sm:p-10 md:py-16 md:px-6 z-25 relative select-text overflow-y-auto">
              
              {/* Header inside pages */}
              <div className="flex items-center justify-between pb-6 shrink-0 border-b border-white/5">
                <div className="flex items-center space-x-3.5">
                  <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
                  <span className="font-mono text-[10px] tracking-widest text-[#F094E6] uppercase">
                    CHANCHAL TAILOR // PORTALS ENGINE // {activeTab}
                  </span>
                  
                  {/* Mode Indicators */}
                  {authToken ? (
                    <span className="bg-pink-500/10 border border-pink-400/20 text-pink-300 font-mono text-[8.5px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center space-x-1">
                      <Shield className="w-2.5 h-2.5 mr-0.5 text-pink-400" />
                      <span>EDIT MODE LOCKED TO ME</span>
                    </span>
                  ) : (
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="bg-zinc-800/80 border border-white/10 hover:border-pink-500/30 text-white/50 hover:text-white font-mono text-[8.5px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                      <span>READ-ONLY VALUE // LOGIN TO EDIT</span>
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setActiveTab(null);
                    setIsEditingAbout(false);
                    setIsAddingProject(false);
                  }}
                  className="group flex items-center space-x-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors cursor-pointer select-none"
                  id="immersive-exit-btn"
                >
                  <span>RETURN HOME</span>
                  <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Dynamic Pages Area */}
              <div className="flex-1 my-auto py-8 w-full">
                
                {/* Legacy My Works page removed from overlay - now rendered inline on scroll for superior access */}

                {/* ----------------- CONTACT PAGE ----------------- */}
                {activeTab === "Contact" && (
                  <div className="w-full max-h-[64vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Contact Form details */}
                      <div className="lg:col-span-6 space-y-4">
                        <motion.h3 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]"
                        >
                          Connect with me
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="text-base sm:text-lg leading-relaxed font-light text-white/80"
                        >
                          feel free to reach out- I'm always open to learning and collaborating.
                        </motion.p>
                        
                        <div className="pt-6 space-y-4">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-pink-300">// Transmissions & Networks</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.a 
                              href={`mailto:${socialEmail.replace(/^(mailto:)/i, "")}`}
                              whileHover={{ y: -3, scale: 1.02 }}
                              className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all text-white hover:text-[#F094E6] min-w-0"
                            >
                              <Mail className="w-4 h-4 shrink-0" />
                              <div className="font-mono text-[10.5px] min-w-0 flex-1">
                                <span className="block text-[8px] text-white/40 uppercase">Direct Email</span>
                                <span className="font-semibold block truncate" title={socialEmail}>{getSocialHandle(socialEmail, "email")}</span>
                              </div>
                            </motion.a>

                            <motion.a 
                              href={socialGithub.startsWith("http") ? socialGithub : `https://github.com/${socialGithub}`}
                              target="_blank"
                              rel="noreferrer"
                              whileHover={{ y: -3, scale: 1.02 }}
                              className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00f2ff]/30 hover:bg-[#00f2ff]/5 transition-all text-white hover:text-[#00f2ff] min-w-0"
                            >
                              <Github className="w-4 h-4 shrink-0" />
                              <div className="font-mono text-[10.5px] min-w-0 flex-1">
                                <span className="block text-[8px] text-white/40 uppercase">Code Repository</span>
                                <span className="font-semibold block truncate" title={socialGithub}>{getSocialHandle(socialGithub, "github")}</span>
                              </div>
                            </motion.a>

                            <motion.a 
                              href={socialLinkedin.startsWith("http") ? socialLinkedin : `https://linkedin.com/in/${socialLinkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              whileHover={{ y: -3, scale: 1.02 }}
                              className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all text-white hover:text-[#F094E6] min-w-0"
                            >
                              <Linkedin className="w-4 h-4 shrink-0" />
                              <div className="font-mono text-[10.5px] min-w-0 flex-1">
                                <span className="block text-[8px] text-white/40 uppercase">LinkedIn Conn</span>
                                <span className="font-semibold block truncate" title={socialLinkedin}>{getSocialHandle(socialLinkedin, "linkedin")}</span>
                              </div>
                            </motion.a>
                          </div>

                          <div className="pt-2 flex flex-col space-y-2.5 font-mono text-xs text-white/60">
                            <div className="flex items-center space-x-2 text-[#00f2ff] bg-white/5 p-2.5 rounded-lg border border-white/5">
                              <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                              <span className="text-[10px]">Response guaranteed within 24 Hours (IST Timezone)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Guest Submit Form OR Client Inbox for Chanchal */}
                      <div className="lg:col-span-6 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        
                        {/* If Chanchal is logged in, show tabs for Form vs Messages Inbox */}
                        {authToken && (
                          <div className="flex space-x-4 border-b border-white/10 pb-4 mb-4">
                            <span className="font-mono text-xs text-pink-300 flex items-center space-x-2 font-bold bg-pink-500/10 px-3 py-1 rounded-full">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>INBOX ({adminMessages.length})</span>
                            </span>
                          </div>
                        )}

                        {/* CLIENT MESSAGES INBOX PANEL (Locked strictly to Owner Session!) */}
                        {authToken ? (
                          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#F094E6]">Incoming Client Transmissions</h4>
                            
                            {adminMessages.map((msg) => (
                              <div key={msg.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 relative group hover:bg-white/10 transition-colors">
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="absolute top-3 right-3 text-white/30 hover:text-red-400 p-1 hover:bg-white/10 rounded transition-colors"
                                  title="Delete message from server"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="text-[10px] font-mono text-pink-300">
                                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="text-xs font-bold text-white">
                                  {msg.name} (<a href={`mailto:${msg.email}`} className="text-[#00f2ff] hover:underline selection:bg-pink-500">{msg.email}</a>)
                                </div>
                                <div className="text-xs text-white/70 select-text font-serif leading-relaxed">
                                  "{msg.message}"
                                </div>
                              </div>
                            ))}

                            {adminMessages.length === 0 && (
                              <div className="text-center py-8 text-white/40 font-mono text-[10px] uppercase border border-dashed border-white/10 rounded-xl">
                                Zero client messages currently stored.
                              </div>
                            )}
                          </div>
                        ) : (
                          
                          /* STANDARD GUEST MESSAGE TRANSMISSION FORM */
                          <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono text-white/50 uppercase mb-1">Your Name</label>
                                <input 
                                  type="text" 
                                  required
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                                  placeholder="e.g. John Doe" 
                                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white placeholder-white/20 outline-none transition-all text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono text-white/50 uppercase mb-1">Email Address</label>
                                <input 
                                  type="email" 
                                  required
                                  value={contactEmail}
                                  onChange={(e) => setContactEmail(e.target.value)}
                                  placeholder="e.g. brand@partner.com" 
                                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white placeholder-white/20 outline-none transition-all text-sm font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-white/50 uppercase mb-1">Message Detail</label>
                              <textarea 
                                rows={3}
                                required
                                value={contactMsg}
                                onChange={(e) => setContactMsg(e.target.value)}
                                placeholder="Explain your target design goals, timelines, or web features..." 
                                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-[#F094E6]/40 rounded-lg px-3.5 py-2 text-white placeholder-white/20 outline-none transition-all text-sm resize-none font-sans"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={contactSubmitting}
                              className="w-full bg-[#F094E6] hover:bg-[#eb7fda] text-zinc-950 font-bold py-2.5 rounded-lg active:scale-[0.98] transition-all text-xs cursor-pointer flex items-center justify-center space-x-2 font-mono"
                            >
                              <span>{contactSubmitting ? "PUSHING TRANSMISSION..." : "TRANSMIT MESSAGE REQUEST"}</span>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Page Footer displaying Dot closer */}
              <div className="flex items-center justify-between border-t border-white/5 pt-6 shrink-0 z-30 select-none">
                <div className="flex items-center space-x-4">
                  {/* Glowing White Interactive Dot exactly centered on empty space */}
                  <motion.button
                    onClick={() => {
                      setActiveTab(null);
                      setIsEditingAbout(false);
                      setIsAddingProject(false);
                    }}
                    whileHover={{ scale: 1.35 }}
                    className="relative w-4 h-4 rounded-full bg-white flex-shrink-0 cursor-pointer flex items-center justify-center group shadow-[0_0_20px_rgba(255,255,255,0.9)] focus:outline-none"
                    aria-label="Return home"
                    title="Return to home screen"
                  >
                    <span className="absolute inset-0 w-full h-full rounded-full bg-white opacity-50 animate-ping group-hover:hidden" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#160515]" />
                  </motion.button>
                  <span className="font-mono text-[9px] tracking-wider text-white/40 uppercase">
                    Return to home overlay grid
                  </span>
                </div>

                <div className="text-[10px] font-mono text-white/30 hidden sm:block">
                  SECURED CONTENT MANAGEMENT SERVER v1.2 // EST. 2026
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
