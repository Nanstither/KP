import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Monitor, Cpu, Zap, Sparkles } from "lucide-react";

// ─── Декларативный фон частиц ───
const ParticlesBackground = () => {
  const particles = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 4,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-pink-400 dark:bg-white/50"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            opacity: [p.opacity, p.opacity * 0.4, p.opacity],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
};

export default function PremiumPCHero() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["10% start", "end start"] 
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
// ============================================================
  const features = [
    { icon: Cpu, label: "RTX 4090", value: "24GB VRAM" },
    { icon: Monitor, label: "4K Ready", value: "165Hz" },
    { icon: Zap, label: "Liquid Cooled", value: "AIO 360mm" },
  ];

  const specs = [
    { label: "Процессор (CPU)", value: "Intel i9-14900K" },
    { label: "ОЗУ (RAM)", value: "64GB DDR5" },
    { label: "Память (SSD)", value: "2TB NVMe Gen5" },
    { label: "Питание", value: "1000W Platinum" },
  ];
// ============================================================
  function useWindowSize(){
    const [windowSize, setWindowSize] = React.useState({
      width: 0,
      height: 0,
    });

    React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
  }

  const { height } = useWindowSize();
// ============================================================

  return (
    <div ref={containerRef} id="home" className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-pink-100 via-white to-blue-100 dark:from-slate-950 dark:via-purple-950/20 dark:to-pink-950/20">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-linear-to-t dark:from-slate-950/90 dark:via-transparent dark:to-transparent" />

      <motion.div 
        style={{ opacity: smoothOpacity, scale: smoothScale, y: smoothY }} 
        className="relative z-10 container mx-auto px-6 py-20 max-lg:py-24 min-h-screen flex items-center"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }} 
            className="space-y-8"
          >
            {height >= 1024 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-400/30 bg-purple-500/10 text-purple-300 backdrop-blur-sm mb-0">
                <Sparkles className="w-3 h-3" /> Лучшая сборка
              </span>
            </motion.div>)}

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">Идеальная</span><br />
              <span className="text-white font-['Century Gothic']">Игровая система</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mx-auto text-lg text-purple-200/80 leading-relaxed max-w-2xl">
              Оцените непревзойденную производительность с нашим премиальным настольным ПК. Корпус из закаленного стекла, RGB-подсветка и передовые компоненты обеспечат максимальную производительность в играх и творческой работе.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="grid grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="rounded-xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-sm p-4 hover:bg-purple-950/40 transition-all duration-300 cursor-default"
                >
                  <feature.icon className="w-6 h-6 text-purple-300 mb-2" />
                  <p className="text-xs text-purple-300 font-medium">{feature.label}</p>
                  <p className="text-xs text-purple-200/60">{feature.value}</p>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-purple-400/10">
                  <span className="text-sm text-purple-300/70">{spec.label}</span>
                  <span className="text-sm text-purple-200 font-medium">{spec.value}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="flex gap-4">
              <button className="px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 active:scale-95">
                Создать сборку
              </button>
              <button className="px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer border border-purple-400/30 text-purple-300 hover:bg-purple-500/10 active:scale-95">
                Характеристики
              </button>
            </motion.div>
          </motion.div>

          {/* ПРАВАЯ КОЛОНКА */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.4 }} 
            className="relative"
          >
            <div className="relative aspect-square max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-4/5 h-4/5 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-lg border border-purple-400/30 backdrop-blur-xl shadow-2xl shadow-purple-500/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
                  
                  <div className="absolute top-4 left-4 right-4 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400/60 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-pink-400/60 animate-pulse delay-75" />
                    <div className="w-3 h-3 rounded-full bg-purple-400/60 animate-pulse delay-150" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <Monitor className="w-16 h-16 text-purple-300 mx-auto animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-2 w-32 bg-purple-400/30 rounded mx-auto" />
                        <div className="h-2 w-24 bg-pink-400/30 rounded mx-auto" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 h-8 bg-gradient-to-t from-purple-400/60 to-transparent rounded-full" 
                          style={{ animationDelay: `${i * 0.1}s`, animation: "pulse 2s ease-in-out infinite" }} 
                        />
                      ))}
                    </div>
                    <div className="text-xs text-purple-300/60 font-mono">RTX ON</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse delay-75" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 1, repeat: Infinity, repeatType: "reverse" }} 
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-purple-300/60 uppercase tracking-wider">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-purple-400/30 rounded-full flex items-start justify-center p-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
              className="w-1.5 h-1.5 bg-purple-400 rounded-full" 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}