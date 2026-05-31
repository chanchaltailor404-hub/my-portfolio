import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Edit, Trash2, ExternalLink, Globe, Github } from "lucide-react";

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

interface ProjectCardProps {
  project: Project;
  index: number;
  authToken: string;
  onEditStart: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function ProjectCard({
  project,
  index,
  authToken,
  onEditStart,
  onDelete,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Measure the scroll position of the individual card relative to the viewport
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Map viewport percentage progress to vertical translation for subtle vertical parallax
  const yParallax = useTransform(scrollYProgress, [0, 1], [35, -35]);

  // Fallback high-fidelity placeholder image if no mockup image is set
  const fallbackImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop", // Abstract Fluid Digital Pink
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop", // Tactile Organic Violet
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop", // Next/TypeScript Cyber blue
  ];
  const imageSrc = project.image && project.image.trim() !== "" 
    ? project.image 
    : fallbackImages[index % fallbackImages.length];

  // Parse comma-separated or slash-separated tech tags into distinct arrays
  const techTags = project.tech
    ? project.tech.split(/[,/|]+/).map((t) => t.trim()).filter((t) => t.length > 0)
    : ["React", "Custom UI"];

  return (
    <div ref={cardRef} className="h-full">
      <motion.div
        style={{ y: yParallax }}
        className="h-full"
      >
        <motion.div
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="group p-5 bg-black/45 backdrop-blur-md hover:bg-black/60 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative overflow-hidden"
        >
          {/* Laser glitch scanline effect on hover */}
          <div className="glitch-scanline" />

          {/* Shimmer sweep container */}
          <div className="shimmer-sweep absolute inset-0 pointer-events-none select-none rounded-2xl z-0 opacity-40 group-hover:opacity-100 transition-opacity" />

          <div className="flex-1 z-10 w-full">
            {/* Project Card Photo Overlay */}
            {imageSrc && (
              <div className="w-full h-40 overflow-hidden rounded-xl mb-4 relative bg-black/20 border border-white/5">
                <img
                  src={imageSrc}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                {/* Category overlay */}
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-[9px] font-mono text-pink-300 px-2.5 py-1 rounded-full border border-pink-400/20 tracking-widest uppercase">
                  {project.category}
                </div>
              </div>
            )}

            <div className="flex justify-between items-start text-[10px] font-mono text-[#F094E6] mb-3">
              <span className="tracking-wider uppercase">{project.category}</span>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-white/5 px-2 py-0.5 rounded text-white/60">{project.year}</span>

                {/* Editorial Actions - Authenticated Administration only */}
                {authToken && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStart(index);
                      }}
                      className="p-1 hover:text-pink-300 hover:bg-white/10 rounded transition-colors text-white/40 cursor-pointer focus:outline-none"
                      title="Edit project specs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(index);
                      }}
                      className="p-1 hover:text-red-400 hover:bg-white/10 rounded transition-colors text-white/40 cursor-pointer focus:outline-none"
                      title="Delete project from portfolio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <h4 className="font-serif font-bold text-xl text-white mb-2 leading-snug group-hover:text-[#F094E6] transition-colors">
              {project.title}
            </h4>
            <p className="text-xs text-white/70 line-clamp-4 mb-4 font-light leading-relaxed font-sans">
              {project.description}
            </p>
          </div>

          <div className="mt-auto z-10 w-full space-y-4">
            {/* Split Tech tag pills */}
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
              {techTags.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-white/[0.04] text-[#00f2ff] font-mono text-[9px] tracking-wide uppercase px-2 py-1 rounded border border-white/[0.03] transition-colors hover:bg-pink-500/5 hover:text-[#F094E6]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* GitHub and Live Demo Action keys */}
            <div className="flex items-center gap-2 pt-1">
              {project.githubLink && project.githubLink.trim() !== "" ? (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-[10.5px] font-mono font-medium rounded-lg border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub</span>
                </a>
              ) : (
                <a
                  href="https://github.com/urmiraka2005"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-[10.5px] font-mono font-medium rounded-lg border border-white/5 text-white/45 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Github className="w-3 h-3 opacity-60" />
                  <span>Repo</span>
                </a>
              )}

              {(project.liveLink && project.liveLink.trim() !== "") || (project.link && project.link.trim() !== "") ? (
                <a
                  href={project.liveLink || project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-[10.5px] font-mono font-semibold rounded-lg bg-[#F094E6] text-zinc-950 hover:bg-[#eb7fda] transition-all hover:shadow-lg hover:shadow-pink-500/15"
                >
                  <Globe className="w-3 h-3" />
                  <span>Live Demo</span>
                </a>
              ) : (
                <span className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-[10.5px] font-mono rounded-lg border border-dashed border-white/5 text-white/20">
                  <ExternalLink className="w-3 h-3 opacity-40" />
                  <span>Hidden Link</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
