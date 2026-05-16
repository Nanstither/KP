import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Monitor, Sun, Moon, User as UserIcon, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // Состояние темы
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light'; // по умолчанию тёмная
  });

  // Синхронизация с глобальной темой
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

  // Обработчик переключения темы
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Обработчик клика вне dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-dropdown')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const navItems = [
    // { name: "Главная", to: "/" },
    { name: "Каталог", to: "/catalog" },
    // { name: "Услуги", to: "/services" },
    // { name: "Контакты", to: "/contact" },
    { name: "Конфигуратор", to: "/config" },
    { name: "База знаний", to: "/knowledge" },
    { name: "О нас", to: "/about" },
    { name: "Корзина", to: "/cart" },
  ];

  if (user?.role === 'admin' || user?.role === 'manager') {
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
        ? "bg-white/80 dark:bg-[#0f0f10]/80 border-b border-purple-200/30 dark:border-purple-400/10 backdrop-blur-xl" 
        : scrolled 
        ? "bg-white/80 dark:bg-[#0f0f10]/80 border-b border-purple-200/30 dark:border-purple-400/10 backdrop-blur-xl"
        : "bg-transparent border-b border-transparent backdrop-blur-none"
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
              {/* <div className="w-auto h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />                
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  TECH LAB
              </span> */}
              <img src={isDark ? '/logo.svg' : '/dark_logo.svg' } alt="TechLab" className="transition h-20 w-auto hover:scale-[0.95]"/>
            </motion.div>
          </Link>
          
          {/* Десктопное меню */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.p
                key={item.name}
                // href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 * index }}
                className="text-sm rounded-xl p-2.5 font-medium text-gray-600 dark:text-purple-200/70 dark:hover:text-purple-300 hover:text-purple-700 transition-colors relative group block"
              >
                {item.isLogout ? (
                  <>
                    <button onClick={item.action} className="text-purple-600/70 dark:text-purple-200/70 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors cursor-pointer">
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
            
            {/* Кнопка переключения темы */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="cursor-pointer flex aspect-square items-center justify-center p-2 rounded-full border border-gray-300/70 dark:border-purple-400/30 bg-purple-100/50 dark:bg-white/5 hover:border-purple-400 dark:hover:border-purple-400 transition-colors group"
            >
              {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-gray-700 group-hover:text-purple-700" />}
            </motion.button>

            {/* Профиль пользователя с dropdown */}
            {user && (
              <div className="relative profile-dropdown">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="cursor-pointer flex aspect-square items-center justify-center p-2 rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:border-purple-400 dark:hover:border-purple-400 transition-all group"
                >
                  <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200" />
                </motion.button>

                {/* Dropdown меню */}
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#0f0f10]/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-400/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* Информация о пользователе */}
                    <div className="px-4 py-3 border-b border-purple-200/20 dark:border-purple-400/10">
                      <p className="text-sm font-semibold text-gray-800 dark:text-purple-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-purple-200/50 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Settings className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-300 capitalize">
                          {user.role === 'admin' ? 'Администратор' : 
                           user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
                        </span>
                      </div>
                    </div>

                    {/* Кнопки меню */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-purple-200/70 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-purple-500" />
                        Профиль
                      </Link>
                      
                      {user?.role === 'admin' || user?.role === 'manager' ? (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-purple-200/70 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-purple-500" />
                          Админ-панель
                        </Link>
                      ) : null}
                      
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Выход
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
          
          {/* Кнопка мобильного меню */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gary-700 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors"
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
                className="block text-sm text-gray-700 dark:text-purple-200/70 hover:text-purple-700 dark:hover:text-purple-300 transition-colors py-2"
              >
                {item.isLogout ? (
                  <>
                    <button onClick={item.action} className="text-red-500/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
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

            {/* Кнопка переключения темы в мобильном меню */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { toggleTheme(); setIsOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-300/50 dark:border-purple-400/30 bg-purple-100/50 dark:bg-white/5 hover:border-purple-400 transition-colors w-full mt-2"
            >
              {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-purple-600" />}
              <span className="text-sm text-purple-600 dark:text-purple-200/70">{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
            </motion.button>

            {/* Профиль пользователя в мобильном меню */}
            {user && (
              <div className="pt-4 border-t border-purple-200/20 dark:border-purple-400/10">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-purple-100">{user.name}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-300 capitalize">
                      {user.role === 'admin' ? 'Администратор' : 
                       user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
                    </p>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-purple-200/70 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 transition-colors rounded-lg"
                >
                  <UserIcon className="w-4 h-4 text-purple-500" />
                  Профиль
                </Link>
                
                {user?.role === 'admin' || user?.role === 'manager' ? (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-purple-200/70 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 transition-colors rounded-lg"
                  >
                    <Settings className="w-4 h-4 text-purple-500" />
                    Админ-панель
                  </Link>
                ) : null}
                
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Выход
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;