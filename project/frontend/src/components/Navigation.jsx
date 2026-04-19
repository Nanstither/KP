import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Monitor } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Главная", to: "/" },
    { name: "Каталог", to: "/catalog" },
    { name: "Услуги", to: "/services" },
    { name: "Контакты", to: "/contact" },
    { name: "О нас", to: "/about" },
    { name: "Конфигуратор", to: "/config" },
    { name: "База знаний", to: "/knowledge" },
    // { name: "Вход", to: "/login" },
    ...(user 
      ? [{ name: "Выход", to: "#", action: logout, isLogout: true }] 
      : [{ name: "Вход", to: "/login" }]
    ),
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: "Админ", to: "/admin" });
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${
        window.screen.width <= 768 
        ? "bg-[#0f0f10]/80 border-b border-purple-400/10 backdrop-blur-xl" 
        : scrolled 
        ? "bg-[#0f0f10]/80 border-b border-purple-400/10 backdrop-blur-xl"
        : "bg-transaprent border-b border-transparent backdrop-blur-none"
      }`}
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  TECH LAB
              </span>
            </motion.div>
          </Link>
          
          {/* Десктопное меню */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.p
                key={item.name}
                // href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 * index }}
                className="text-sm text-purple-200/70 hover:text-purple-300 transition-colors relative group block"
              >
                {item.isLogout ? (
                  <>
                    <button onClick={item.action} className="text-purple-200/70 hover:text-red-400 transition-colors cursor-pointer">
                      {item.name}
                    </button>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-400/80 to-red-400/60 group-hover:w-full transition-all duration-300" />
                  </>
                ) : (
                  <>
                    <Link to={item.to}>{item.name}</Link>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </>
                )}
              </motion.p>
            ))}
          </div>
          
          {/* Кнопка мобильного меню */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-purple-300 hover:text-purple-200 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Мобильное меню */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden pb-6 space-y-4"
          >
            {navItems.map((item, index) => (
              <motion.p
                key={item.name}
                // href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                onClick={() => setIsOpen(false)}
                className="block text-sm text-purple-200/70 hover:text-purple-300 transition-colors py-2"
              >
                {item.isLogout ? (
                  <>
                    <button onClick={item.action} className="text-red-400/70 hover:text-red-400 transition-colors cursor-pointer">
                      {item.name}
                    </button>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-400/80 to-red-400/60 group-hover:w-full transition-all duration-300" />
                  </>
                ) : (
                  <>
                    <Link to={item.to}>{item.name}</Link>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </>
                )}
              </motion.p>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;