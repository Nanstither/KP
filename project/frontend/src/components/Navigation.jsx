import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Custom hook for theme management
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light'; // по умолчанию тёмная
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  return { isDark, toggleTheme };
};

// Custom hook for scroll detection
const useScrollPosition = (threshold = 20) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
};

// Navigation item configuration
const NAV_ITEM_CONFIG = {
  base: "text-sm rounded-xl dark:bg-transparent p-2.5 text-purple-200/70 hover:text-purple-300 transition-colors relative group block",
  logout: "text-purple-200/70 group-hover:text-red-400 transition-colors cursor-pointer",
  underline: "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300",
  logoutUnderline: "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-400/80 to-red-400/60 group-hover:w-full transition-all duration-300",
};

// Animation variants
const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const getNavAnimation = (index, isDesktop) => ({
  initial: "hidden",
  animate: "visible",
  transition: {
    duration: 0.6,
    delay: isDesktop ? 0.3 * index : 0.1 * index,
  },
});

// Navigation item component
const NavItem = ({ item, index, isDesktop }) => {
  const { base, logout, underline, logoutUnderline } = NAV_ITEM_CONFIG;
  const isLogout = item.isLogout;

  return (
    <motion.div
      key={item.name}
      custom={index}
      variants={navItemVariants}
      {...getNavAnimation(index, isDesktop)}
      className={base}
    >
      {isLogout ? (
        <>
          <button onClick={item.action} className={logout}>
            {item.name}
          </button>
          <span className={logoutUnderline} />
        </>
      ) : (
        <>
          <Link to={item.to}>{item.name}</Link>
          <span className={underline} />
        </>
      )}
    </motion.div>
  );
};

// Theme toggle button component
const ThemeToggleButton = ({ isDark, onClick, variant = "desktop" }) => {
  const isMobile = variant === "mobile";
  
  const baseClasses = isMobile
    ? "flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-400/30 bg-white/5 dark:bg-white/10 hover:border-purple-400 transition-colors w-full mt-2"
    : "flex aspect-square items-center justify-center p-2 rounded-full border border-purple-400/30 bg-white/5 dark:bg-white/10 hover:border-purple-400 transition-colors";
  
  const iconClasses = isMobile
    ? "w-4 h-4 text-yellow-500"
    : "w-4 h-4";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={baseClasses}
      aria-label="Переключить тему"
    >
      {isDark ? (
        <Sun className={isMobile ? iconClasses : `${iconClasses} text-white`} />
      ) : (
        <Moon className={isMobile ? iconClasses : `${iconClasses} text-purple-600`} />
      )}
      {isMobile && (
        <span className="text-sm text-purple-200/70">
          {isDark ? 'Светлая тема' : 'Тёмная тема'}
        </span>
      )}
    </motion.button>
  );
};

// Mobile menu content component
const MobileMenuContent = ({ navItems, isDark, onThemeToggle }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="md:hidden pb-6 space-y-4"
  >
    {navItems.map((item, index) => (
      <NavItem 
        key={item.name} 
        item={item} 
        index={index} 
        isDesktop={false}
      />
    ))}
    <ThemeToggleButton 
      isDark={isDark} 
      onClick={onThemeToggle} 
      variant="mobile" 
    />
  </motion.div>
);

// Navigation constants
const BASE_NAV_ITEMS = [
  { name: "Каталог", to: "/catalog" },
  { name: "Конфигуратор", to: "/config" },
  { name: "База знаний", to: "/knowledge" },
  { name: "О нас", to: "/about" },
  { name: "Корзина", to: "/cart" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const scrolled = useScrollPosition();
  const location = useLocation();

  // Memoize navigation items to prevent recreation on every render
  const navItems = useMemo(() => {
    const authItem = user 
      ? [{ name: "Выход", action: logout, isLogout: true }] 
      : [{ name: "Вход", to: "/login" }];

    const adminItem = (user?.role === 'admin' || user?.role === 'manager')
      ? [{ name: "Админ", to: "/admin" }]
      : [];

    return [...BASE_NAV_ITEMS, ...authItem, ...adminItem];
  }, [user, logout]);

  const handleThemeToggleMobile = useCallback(() => {
    toggleTheme();
    setIsOpen(false);
  }, [toggleTheme]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const navBackground = scrolled || window.screen.width <= 768
    ? "bg-[#0f0f10]/80 border-b border-purple-400/10 backdrop-blur-xl"
    : "bg-transparent border-b border-transparent backdrop-blur-none";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${navBackground}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to='/'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <img src="/logo.svg" alt="TechLab" className="transition h-20 w-auto hover:scale-[0.95]"/>
            </motion.div>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <NavItem key={item.name} item={item} index={index} isDesktop={true} />
            ))}
            
            <ThemeToggleButton 
              isDark={isDark} 
              onClick={toggleTheme} 
              variant="desktop" 
            />
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-purple-300 hover:text-purple-200 transition-colors"
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <MobileMenuContent 
              navItems={navItems}
              isDark={isDark}
              onThemeToggle={handleThemeToggleMobile}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;
