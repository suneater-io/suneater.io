import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Database, 
  Code2, 
  Workflow, 
  FileTerminal, 
  Github, 
  Linkedin, 
  Menu, 
  X, 
  ChevronDown,
  Search,
  User,
  Cpu,
  Terminal,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

// --- Configuration ---

const PLANET_TEXTURE_URL = "https://www.transparenttextures.com/patterns/stardust.png";

// GitHub Configuration
// Update these to match your actual GitHub username and repository name
const GITHUB_USERNAME = "grant"; 
const GITHUB_REPO = "suneater-data"; 

// --- Data (Fallbacks) ---

const WORKFLOW_ITEMS = [
  { 
    title: "Daily Backup Ritual", 
    description: "GitHub Actions workflow that archives local data to encrypted cloud storage.", 
    icon: Workflow, 
    tags: ['CI/CD', 'YAML', 'Security'], 
    link: "#" 
  },
  { 
    title: "Data Ingestion Pipeline", 
    description: "Airflow DAGs designed to scrape, clean, and validate incoming data streams.", 
    icon: Workflow, 
    tags: ['Airflow', 'Python', 'ETL'], 
    link: "#" 
  },
  { 
    title: "Docker Container Registry", 
    description: "Automated build and push pipeline for private container images.", 
    icon: Workflow, 
    tags: ['Docker', 'GitHub Actions'], 
    link: "#" 
  },
  { 
    title: "SSL Certificate Renewal", 
    description: "Certbot automation with DNS challenge hooks for wildcard domains.", 
    icon: Workflow, 
    tags: ['Security', 'Bash', 'LetsEncrypt'], 
    link: "#" 
  },
  { 
    title: "Weekly Report Generator", 
    description: "Cron job that aggregates metrics and emails a PDF summary every Monday.", 
    icon: Workflow, 
    tags: ['Python', 'Cron', 'SMTP'], 
    link: "#" 
  },
  { 
    title: "Staging Environment Sync", 
    description: "Sanitizes production database dumps and restores them to staging automatically.", 
    icon: Workflow, 
    tags: ['SQL', 'Bash', 'DevOps'], 
    link: "#" 
  }
];

const PROMPT_ITEMS = [
  { 
    title: "Code Refactor Expert", 
    description: "A system prompt that turns an LLM into a senior engineer focused on clean, DRY code.", 
    icon: MessageSquare, 
    tags: ['LLM', 'System Prompt', 'Coding'], 
    link: "#" 
  },
  { 
    title: "Infrastructure Architect", 
    description: "Prompt for generating Terraform boilerplate based on high-level requirements.", 
    icon: MessageSquare, 
    tags: ['DevOps', 'IaC', 'Architecture'], 
    link: "#" 
  },
  { 
    title: "Data Storyteller", 
    description: "Instructions for transforming raw CSV data into compelling narrative summaries.", 
    icon: MessageSquare, 
    tags: ['Analysis', 'Writing', 'Reporting'], 
    link: "#" 
  },
  { 
    title: "Cyberpunk Writer", 
    description: "A creative writing persona for generating gritty, neon-soaked narratives.", 
    icon: MessageSquare, 
    tags: ['Creative', 'Fiction'], 
    link: "#" 
  },
  { 
    title: "SQL Optimizer", 
    description: "Transforms natural language requests into highly optimized PostgreSQL queries.", 
    icon: MessageSquare, 
    tags: ['Database', 'SQL'], 
    link: "#" 
  },
  { 
    title: "React Component Gen", 
    description: "Specialized prompt for generating accessible, Tailwind-styled React components.", 
    icon: MessageSquare, 
    tags: ['React', 'Frontend'], 
    link: "#" 
  },
  { 
    title: "API Documentation Writer", 
    description: "Generates Swagger/OpenAPI specs from raw code snippets.", 
    icon: MessageSquare, 
    tags: ['Docs', 'API'], 
    link: "#" 
  }
];

const SCRIPT_ITEMS = [
  { 
    title: "deploy.sh", 
    description: "One-click deployment script for the Suneater infrastructure stack.", 
    icon: FileTerminal, 
    tags: ['Bash', 'DevOps'], 
    link: "#" 
  },
  { 
    title: "monitor.py", 
    description: "Lightweight background process to watch for system anomalies.", 
    icon: FileTerminal, 
    tags: ['Python', 'Automation'], 
    link: "#" 
  },
  { 
    title: "config_gen.js", 
    description: "Node script to generate environment configurations based on mood.", 
    icon: FileTerminal, 
    tags: ['Node', 'Config'], 
    link: "#" 
  }
];

const DATA_ITEMS = [
  { 
    title: "Solar Flare Logs", 
    description: "Time-series data capturing solar activity over the last decade. Formatted for ML ingestion.", 
    icon: Database, 
    tags: ['CSV', 'Time-Series', 'Physics'], 
    link: "#" 
  },
  { 
    title: "Mythology Graph", 
    description: "A Neo4j dump of interconnected Norse entities, relationships, and events leading to Ragnarok.", 
    icon: Database, 
    tags: ['GraphDB', 'JSON', 'NLP'], 
    link: "#" 
  },
  { 
    title: "System Telemetry", 
    description: "Aggregated server logs and performance metrics from the homelab cluster.", 
    icon: Database, 
    tags: ['Parquet', 'Logs', 'Monitoring'], 
    link: "#" 
  }
];

const CODE_ITEMS = [
  { 
    title: "Fenrir-CLI", 
    description: "A command-line utility for devouring temporary files and cleaning up development environments.", 
    icon: Code2, 
    tags: ['Rust', 'CLI', 'Utility'], 
    link: "#" 
  },
  { 
    title: "Eclipse UI", 
    description: "A React component library focused on dark-mode first design systems.", 
    icon: Code2, 
    tags: ['React', 'TypeScript', 'Tailwind'], 
    link: "#" 
  },
  { 
    title: "Rune Parser", 
    description: "Python library for analyzing and translating ancient runic scripts into unicode.", 
    icon: Code2, 
    tags: ['Python', 'Text-Processing'], 
    link: "#" 
  }
];

// --- Custom Hooks ---

const useGitHubBranch = (branchName: string, fallbackItems: any[], IconComponent: any) => {
  const [items, setItems] = useState(fallbackItems);

  useEffect(() => {
    let isMounted = true;

    const fetchBranch = async () => {
      if (!GITHUB_USERNAME || !GITHUB_REPO) return;

      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/git/trees/${branchName}?recursive=1`
        );

        if (!response.ok) {
          // Branch likely doesn't exist or rate limit exceeded. 
          // Silently keep fallback items.
          return;
        }

        const data = await response.json();

        if (isMounted && data && data.tree && Array.isArray(data.tree)) {
          const newItems = data.tree
            .filter((file: any) => file.type === 'blob') // Only files, not directories
            .map((file: any) => ({
              title: file.path.split('/').pop()?.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ') || file.path,
              description: `Auto-indexed from ${branchName} branch.`,
              icon: IconComponent,
              tags: [branchName, file.path.split('.').pop()?.toUpperCase() || 'FILE'],
              link: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/blob/${branchName}/${file.path}`
            }));

          if (newItems.length > 0) {
            setItems(newItems);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch GitHub branch: ${branchName}. Using fallback.`);
        // Keep fallback items on error
      }
    };

    fetchBranch();

    return () => {
      isMounted = false;
    };
  }, [branchName]); // IconComponent and fallbackItems are stable constants

  return items;
};

// --- Components ---

const StarBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    // Star properties
    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
    }
    
    const stars: Star[] = [];
    const numStars = 200;

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2,
          opacity: Math.random(),
          speed: Math.random() * 0.2 + 0.05
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#F8FAFC';

      stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Move star
        star.y -= star.speed;
        
        // Reset if out of bounds
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-60"
    />
  );
};

const Navbar = ({ activeSection, onNavigate }: { activeSection: string, onNavigate: (id: string) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'prompts', label: 'Prompts' },
    { id: 'scripts', label: 'Scripts' },
    { id: 'data', label: 'Data' },
    { id: 'code', label: 'Code' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-void/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="font-display font-bold text-xl md:text-2xl tracking-widest text-white cursor-pointer" onClick={() => onNavigate('hero')}>
          SUNEATER<span className="text-solar">.IO</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-sm uppercase tracking-widest transition-colors duration-300 ${activeSection === link.id ? 'text-solar' : 'text-slate-400 hover:text-white'}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-void/95 backdrop-blur-xl border-b border-white/10 py-4">
          <div className="flex flex-col space-y-4 px-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsMobileOpen(false);
                }}
                className="text-left text-sm uppercase tracking-widest text-slate-300 hover:text-solar py-2"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const EclipseGraphic = () => (
  <div className="relative w-64 h-64 md:w-96 md:h-96 mb-12 mx-auto">
    {/* The "Sun" being eaten - outer glow */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-solarDim to-solar opacity-20 blur-3xl animate-pulse-slow"></div>
    
    {/* The Corona Ring */}
    <div className="absolute inset-4 rounded-full border border-solar/30 shadow-[0_0_50px_rgba(56,189,248,0.3)] animate-spin-slow"></div>
    
    {/* The Black Body (Fenrir/Moon/Planet) */}
    <div className="absolute inset-2 rounded-full bg-void border border-white/5 shadow-inner flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: `url('${PLANET_TEXTURE_URL}')` }}
      ></div>
      {/* Subtle inner detailing */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-solar/50 to-transparent opacity-50 transform -rotate-45"></div>
    </div>
  </div>
);

const Card = ({ title, description, icon: Icon, tags, link }: { title: string, description: string, icon: any, tags: string[], link?: string }) => (
  <div className="group relative bg-white/5 border border-white/10 rounded-lg p-6 hover:border-solar/50 transition-all duration-300 hover:transform hover:-translate-y-1 overflow-hidden h-full flex flex-col">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-solar to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-void rounded-md border border-white/10 text-solar">
        <Icon size={24} />
      </div>
      {link && <Github size={16} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />}
    </div>
    
    <h3 className="font-display text-xl font-bold text-white mb-2 truncate" title={title}>{title}</h3>
    <p className="text-slate-400 text-sm mb-4 leading-relaxed flex-grow line-clamp-3">{description}</p>
    
    <div className="flex flex-wrap gap-2 mt-auto pt-4">
      {tags.slice(0, 3).map((tag, i) => (
        <span key={i} className="text-xs font-mono px-2 py-1 bg-white/5 rounded border border-white/5 text-slate-300">
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const SkillBar = ({ skill, level }: { skill: string, level: number }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-mono text-slate-300">{skill}</span>
      <span className="text-sm font-mono text-solar">{level}%</span>
    </div>
    <div className="w-full bg-white/5 rounded-full h-1.5 border border-white/5">
      <div 
        className="bg-solar h-1.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
        style={{ width: `${level}%` }}
      ></div>
    </div>
  </div>
);

const AboutSection = () => (
  <section id="about" className="py-20 md:py-32 relative z-10 border-t border-white/5 bg-void/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 tracking-wider">
            <span className="text-solar mr-2">/</span>ABOUT_GRANT
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Hi, I'm Grant. I am a <span className="text-white font-semibold">Full Stack Engineer</span> and <span className="text-white font-semibold">Data Architect</span> with a passion for building systems that scale.
            </p>
            <p>
              While this website embraces the void of space, my day-to-day work is very much grounded in reality. I focus on creating clean, maintainable code and efficient data pipelines. Suneater.io is my personal vault—a place where I keep the tools, scripts, and knowledge I've gathered over my career.
            </p>
            <p>
              I believe in automation, documentation, and the power of a well-structured database. If I'm not optimizing a SQL query, I'm probably automating a deployment pipeline or learning the latest in cloud infrastructure.
            </p>
          </div>
          
          <div className="mt-8 flex gap-4">
            <div className="flex items-center gap-2 text-sm text-solar border border-solar/20 bg-solar/5 px-4 py-2 rounded-full">
              <Terminal size={16} />
              <span>Full Stack Engineer</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-solar border border-solar/20 bg-solar/5 px-4 py-2 rounded-full">
              <Cpu size={16} />
              <span>Data Architect</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-lg backdrop-blur-sm relative overflow-hidden">
          {/* Decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-solar opacity-5 rounded-full blur-3xl"></div>
          
          <h3 className="font-display text-xl text-white mb-6 border-b border-white/10 pb-2">
            TECHNICAL_EXPERTISE
          </h3>
          
          <div className="space-y-6">
            <SkillBar skill="Python & Data Analysis" level={95} />
            <SkillBar skill="Cloud Architecture (AWS/GCP)" level={90} />
            <SkillBar skill="DevOps & CI/CD" level={85} />
            <SkillBar skill="React & Frontend" level={80} />
            <SkillBar skill="System Security" level={75} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Section = ({ id, title, subtitle, children, footer }: { id: string, title: string, subtitle?: string, children?: React.ReactNode, footer?: React.ReactNode }) => (
  <section id={id} className="py-20 md:py-32 relative z-10 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 tracking-wider">
          <span className="text-solar mr-2">/</span>{title}
        </h2>
        {subtitle && <p className="text-slate-400 max-w-2xl">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
      {footer && (
        <div className="flex justify-center mt-12">
          {footer}
        </div>
      )}
    </div>
  </section>
);

const ContentSection = ({ id, title, subtitle, items, onViewAll }: { id: string, title: string, subtitle: string, items: any[], onViewAll: () => void }) => {
  // Always limit to 5 items on the home page view
  const displayedItems = items.slice(0, 5);
  
  // The "View All" button is now always rendered, regardless of item count
  return (
    <Section 
      id={id} 
      title={title} 
      subtitle={subtitle}
      footer={
        <button 
          onClick={onViewAll}
          className="group flex items-center gap-2 px-6 py-3 border border-solar/30 text-solar hover:bg-solar/10 rounded transition-all duration-300 text-sm uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]"
        >
          View All {title}
          <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      }
    >
      {displayedItems.map((item, index) => (
        <Card key={index} {...item} />
      ))}
    </Section>
  );
};

const CategoryPage = ({ 
  title, 
  subtitle, 
  items, 
  onBack 
}: { 
  title: string, 
  subtitle: string, 
  items: any[], 
  onBack: () => void 
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-void text-slate-200 relative pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-solar mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest">Back to Void</span>
        </button>

        <div className="mb-16 border-b border-white/10 pb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
            <span className="text-solar mr-2">/</span>{title}_ARCHIVE
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="relative z-10 bg-void border-t border-white/10 py-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <div className="font-display font-bold text-lg text-white tracking-widest mb-2">
          SUNEATER<span className="text-solar">.IO</span>
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Suneater. Built by Grant.
        </p>
      </div>
      
      <div className="flex space-x-6">
        <a href="#" className="text-slate-400 hover:text-solar transition-colors"><Github size={20} /></a>
        <a href="#" className="text-slate-400 hover:text-solar transition-colors"><Linkedin size={20} /></a>
      </div>
    </div>
  </footer>
);

// --- Main App ---

const App = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [activeCategory, setActiveCategory] = useState<{
    title: string;
    subtitle: string;
    items: any[];
  } | null>(null);

  // Fetch data from GitHub with fallbacks
  const workflows = useGitHubBranch('workflows', WORKFLOW_ITEMS, Workflow);
  const prompts = useGitHubBranch('prompts', PROMPT_ITEMS, MessageSquare);
  const scripts = useGitHubBranch('scripts', SCRIPT_ITEMS, FileTerminal);
  const dataItems = useGitHubBranch('data', DATA_ITEMS, Database);
  const codeItems = useGitHubBranch('code', CODE_ITEMS, Code2);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const handleNavigation = (id: string) => {
    if (activeCategory) {
      setActiveCategory(null);
      // Allow time for the main page to render before scrolling
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    } else {
      scrollToSection(id);
    }
  };

  // Intersection Observer to update active section on scroll
  useEffect(() => {
    if (activeCategory) return; // Don't spy on scroll if we are in a sub-page

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-void text-slate-200 selection:bg-solar selection:text-black relative">
      <StarBackground />
      <Navbar activeSection={activeSection} onNavigate={handleNavigation} />

      {activeCategory ? (
        <CategoryPage 
          title={activeCategory.title}
          subtitle={activeCategory.subtitle}
          items={activeCategory.items}
          onBack={() => setActiveCategory(null)}
        />
      ) : (
        <>
          {/* Hero Section */}
          <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative z-10 px-6 pt-20">
            <EclipseGraphic />
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white text-center mb-6 tracking-tight">
              SUN<span className="text-transparent bg-clip-text bg-gradient-to-b from-solar to-solarDim">EATER</span>
            </h1>
            <p className="font-mono text-solar text-sm md:text-base tracking-[0.3em] uppercase mb-8 text-center">
              Fenrir has awoken. The cycle ends.
            </p>
            <p className="max-w-xl text-center text-slate-400 leading-relaxed mb-12">
              A personal archive of data structures, code fragments, and automated workflows. 
              Designed to survive the Ragnarok of lost information.
            </p>
            
            <button 
              onClick={() => scrollToSection('about')}
              className="group flex flex-col items-center gap-2 text-slate-500 hover:text-solar transition-colors duration-300"
            >
              <span className="text-xs tracking-widest uppercase">Enter the Void</span>
              <ChevronDown className="animate-bounce" />
            </button>
          </section>

          {/* About Section */}
          <AboutSection />

          {/* Workflows Section */}
          <ContentSection 
            id="workflows"
            title="WORKFLOWS"
            subtitle="Automated pipelines. Set them in motion and watch the universe unfold."
            items={workflows}
            onViewAll={() => setActiveCategory({
              title: "WORKFLOWS",
              subtitle: "Full archive of automated pipelines.",
              items: workflows
            })}
          />

          {/* Prompts Section */}
          <ContentSection 
            id="prompts"
            title="PROMPTS"
            subtitle="AI instructions and system prompts for generating precise outputs."
            items={prompts}
            onViewAll={() => setActiveCategory({
              title: "PROMPTS",
              subtitle: "Full archive of system prompts and AI instructions.",
              items: prompts
            })}
          />

          {/* Scripts Section */}
          <ContentSection 
            id="scripts"
            title="SCRIPTS"
            subtitle="Small, sharp tools for specific tasks."
            items={scripts}
            onViewAll={() => setActiveCategory({
              title: "SCRIPTS",
              subtitle: "Full archive of utility scripts.",
              items: scripts
            })}
          />

          {/* Data Section */}
          <ContentSection 
            id="data"
            title="DATASETS"
            subtitle="Structured chaos. Collections of raw information harvested for analysis and archival."
            items={dataItems}
            onViewAll={() => setActiveCategory({
              title: "DATASETS",
              subtitle: "Full archive of raw data collections.",
              items: dataItems
            })}
          />

          {/* Code Section */}
          <ContentSection 
            id="code"
            title="CODE_FORGE"
            subtitle="Tools and libraries forged in the heat of problem-solving."
            items={codeItems}
            onViewAll={() => setActiveCategory({
              title: "CODE",
              subtitle: "Full archive of code libraries and snippets.",
              items: codeItems
            })}
          />
        </>
      )}

      <Footer />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);