import { useRef, useEffect, useState, useMemo, memo, Suspense, lazy, ComponentType } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Brain, Cpu, Sparkles, Zap, Activity, Bot, Globe, BarChart3 } from "lucide-react";

let DISABLE_3D = true;
let Canvas: ComponentType<any> | null = null;
let Float: ComponentType<any> | null = null;
let MeshDistortMaterial: ComponentType<any> | null = null;
let Sphere: ComponentType<any> | null = null;
let Box: ComponentType<any> | null = null;
let Environment: ComponentType<any> | null = null;

const AI_MODELS = {
  openai: { name: "GPT-4o", color: "#10A37F", icon: Brain },
  anthropic: { name: "Claude", color: "#D97706", icon: Bot },
  gemini: { name: "Gemini", color: "#4285F4", icon: Sparkles },
  perplexity: { name: "Perplexity", color: "#20B2AA", icon: Globe },
  grok: { name: "Grok", color: "#1DA1F2", icon: Zap },
} as const;

export function VideoBackdrop({ 
  src, 
  poster,
  overlay = true,
  overlayOpacity = 0.7,
  overlayColor = "#0A1628",
  className = ""
}: {
  src: string;
  poster?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (videoRef.current && !isMobile) {
      videoRef.current.play().catch(() => {});
    }
  }, [isMobile]);

  if (isMobile && poster) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
        {overlay && (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        onLoadedData={() => setIsLoaded(true)}
      />
      {overlay && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}

export const ParticleField = memo(function ParticleField({ 
  count = 50,
  color = "#C8A661",
  speed = 1,
  size = 2,
  className = ""
}: {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-100px" });

  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20,
      size: size * (0.5 + Math.random() * 0.5),
      opacity: 0.2 + Math.random() * 0.4
    })),
  [count, size]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {isInView && particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${color}`
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(p.id) * 20, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration / speed,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
});

export const DataStream = memo(function DataStream({
  direction = "up",
  color = "#C8A661",
  className = ""
}: {
  direction?: "up" | "down" | "left" | "right";
  color?: string;
  className?: string;
}) {
  const streams = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      offset: i * 12.5,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2
    })),
  []);

  const isVertical = direction === "up" || direction === "down";
  const isReverse = direction === "down" || direction === "right";

  return (
    <div className={`absolute overflow-hidden pointer-events-none ${className}`}>
      {streams.map(s => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{
            [isVertical ? 'left' : 'top']: `${s.offset}%`,
            [isVertical ? 'width' : 'height']: '2px',
            [isVertical ? 'height' : 'width']: '40px',
            background: `linear-gradient(${isVertical ? (isReverse ? '0deg' : '180deg') : (isReverse ? '90deg' : '270deg')}, ${color}, transparent)`,
          }}
          animate={{
            [isVertical ? 'y' : 'x']: isReverse ? ['0%', '100%'] : ['100%', '0%'],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
});

function FloatingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  if (!Float || !Sphere || !MeshDistortMaterial) return null;
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[0.5 * scale, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function DataCube({ position, color }: { position: [number, number, number]; color: string }) {
  if (!Float || !Box) return null;
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
      <Box args={[0.4, 0.4, 0.4]} position={position}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} wireframe />
      </Box>
    </Float>
  );
}

export function Scene3D({ 
  variant = "orbs",
  primaryColor = "#C8A661",
  secondaryColor = "#0A1628",
  className = "" 
}: {
  variant?: "orbs" | "data" | "globe" | "minimal";
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-50px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (DISABLE_3D || isMobile || !Canvas) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`}>
      {isInView && (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color={primaryColor} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={secondaryColor} />
          
          {variant === "orbs" && (
            <>
              <FloatingOrb position={[-2, 1, 0]} color={primaryColor} scale={1.2} />
              <FloatingOrb position={[2, -1, -1]} color={primaryColor} scale={0.8} />
              <FloatingOrb position={[0, 2, -2]} color={secondaryColor} scale={0.6} />
              <DataCube position={[1.5, 1.5, 0]} color={primaryColor} />
              <DataCube position={[-1.5, -1.5, -1]} color={primaryColor} />
            </>
          )}
          
          {variant === "data" && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <DataCube 
                  key={i} 
                  position={[
                    Math.cos(i * Math.PI / 6) * 2,
                    Math.sin(i * Math.PI / 6) * 2,
                    (i % 3 - 1) * 0.5
                  ]} 
                  color={i % 2 === 0 ? primaryColor : secondaryColor} 
                />
              ))}
            </>
          )}
          
          {variant === "minimal" && (
            <>
              <FloatingOrb position={[2, 0, -1]} color={primaryColor} scale={1.5} />
            </>
          )}
          
          <Environment preset="city" />
        </Canvas>
      )}
    </div>
  );
}

export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
  className = ""
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
});

export const LivePulse = memo(function LivePulse({
  color = "#22C55E",
  size = 8,
  className = ""
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
});

export const AIModelBadge = memo(function AIModelBadge({
  model,
  isActive = false,
  showName = true,
  size = "md",
  className = ""
}: {
  model: keyof typeof AI_MODELS;
  isActive?: boolean;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = AI_MODELS[model];
  const Icon = config.icon;
  const sizes = {
    sm: { icon: 12, padding: "px-1.5 py-0.5", text: "text-xs" },
    md: { icon: 14, padding: "px-2 py-1", text: "text-xs" },
    lg: { icon: 16, padding: "px-3 py-1.5", text: "text-sm" }
  };
  const s = sizes[size];

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full border ${s.padding} ${s.text} font-medium transition-all ${className}`}
      style={{ 
        borderColor: isActive ? config.color : 'transparent',
        backgroundColor: isActive ? `${config.color}20` : 'rgba(255,255,255,0.05)',
        color: isActive ? config.color : 'rgba(255,255,255,0.6)'
      }}
      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {isActive && <LivePulse color={config.color} size={6} />}
      <Icon size={s.icon} />
      {showName && <span>{config.name}</span>}
    </motion.span>
  );
});

export const AIOrchestrationPanel = memo(function AIOrchestrationPanel({
  activeModels = [],
  currentModel,
  className = ""
}: {
  activeModels?: (keyof typeof AI_MODELS)[];
  currentModel?: keyof typeof AI_MODELS;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0A1628]/80 backdrop-blur-xl border border-[#C8A661]/20 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-[#C8A661]" />
        <span className="text-xs font-semibold text-[#C8A661] uppercase tracking-wider">AI Orchestration</span>
        <LivePulse color="#22C55E" size={6} className="ml-auto" />
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(AI_MODELS) as Array<keyof typeof AI_MODELS>).map(model => (
          <AIModelBadge 
            key={model} 
            model={model} 
            isActive={currentModel === model || activeModels.includes(model)}
            size="sm"
          />
        ))}
      </div>
      {currentModel && (
        <motion.div 
          className="mt-3 pt-3 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Activity className="w-3 h-3" />
            <span>Processing with {AI_MODELS[currentModel].name}...</span>
          </div>
          <motion.div 
            className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: AI_MODELS[currentModel].color }}
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
});

export const GlowingBorder = memo(function GlowingBorder({
  children,
  color = "#C8A661",
  intensity = 0.5,
  className = ""
}: {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute -inset-[1px] rounded-xl opacity-75"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent, ${color})`,
          backgroundSize: "200% 100%"
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative bg-[#0A1628] rounded-xl">{children}</div>
    </div>
  );
});

export const HolographicCard = memo(function HolographicCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0A1628] to-[#1a2d4a] border border-[#C8A661]/20 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(45deg, transparent 30%, rgba(200,166,97,0.3) 50%, transparent 70%)",
          backgroundSize: "200% 200%"
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
});

export const ScrollReveal = memo(function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    up: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export const TypewriterText = memo(function TypewriterText({
  text,
  speed = 50,
  className = "",
  onComplete
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle"
        />
      )}
    </span>
  );
});

export const MetricCard = memo(function MetricCard({
  label,
  value,
  suffix = "",
  trend,
  trendValue,
  icon: Icon,
  color = "#C8A661",
  className = ""
}: {
  label: string;
  value: number;
  suffix?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  className?: string;
}) {
  return (
    <HolographicCard className={`p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-white/60 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4" style={{ color }} />}
      </div>
      <div className="text-2xl font-bold text-white">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend === 'up' ? '↑' : '↓'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </HolographicCard>
  );
});

export const ImmersiveSection = memo(function ImmersiveSection({
  children,
  variant = "default",
  particles = true,
  scene3d = false,
  className = ""
}: {
  children: React.ReactNode;
  variant?: "default" | "dark" | "gradient";
  particles?: boolean;
  scene3d?: boolean;
  className?: string;
}) {
  const backgrounds = {
    default: "bg-background",
    dark: "bg-[#0A1628]",
    gradient: "bg-gradient-to-b from-[#0A1628] via-[#0A1628]/95 to-background"
  };

  return (
    <section className={`relative overflow-hidden ${backgrounds[variant]} ${className}`}>
      {particles && <ParticleField count={30} color="#C8A661" />}
      {scene3d && <Scene3D variant="minimal" className="opacity-30" />}
      <div className="relative z-10">{children}</div>
    </section>
  );
});

export { AI_MODELS };
