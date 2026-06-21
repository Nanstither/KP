import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ContactModal from "@/components/ContactModal";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [contactOpen, setContactOpen] = useState(false);

  const links = [
    { name: "Каталог", to: "/catalog" },
    { name: "Конфигуратор", to: "/config" },
    { name: "База знаний", to: "/knowledge" },
    { name: "О нас", to: "/about" },
    { name: "Корзина", to: "/cart" },
  ];

  const categories = [
    { name: "Процессоры", label: "Процессоры" },
    { name: "Видеокарты", label: "Видеокарты" },
    { name: "Материнские платы", label: "Материнские платы" },
    { name: "ОЗУ", label: "ОЗУ" },
    { name: "Накопители", label: "Накопители" },
    { name: "Блоки питания", label: "Блоки питания" },
  ];

  const contacts = [
    { icon: MapPin, text: "г. Иркутск, ул. Техническая, 1" },
    { icon: Phone, text: "+7 (999) 000-00-00" },
    { icon: Mail, text: "info@techlab.ru" },
  ];

  const linkClass =
    "text-sm text-gray-600 dark:text-purple-200/70 hover:text-purple-700 dark:hover:text-purple-300 transition-colors";

  return (
    <>
      <footer className="relative bg-white dark:bg-[#0f0f10] border-t border-purple-200/30 dark:border-purple-400/10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TECH LAB
              </h3>
              <p className="text-sm text-gray-600 dark:text-purple-200/60 leading-relaxed">
                Профессиональная сборка игровых и рабочих станций.
                Гарантия качества и лучшие цены на рынке.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-700 dark:text-white">Навигация</h4>
              <ul className="space-y-2">
                {links.map((item) => (
                  <li key={item.name}>
                    <Link to={item.to} className={linkClass}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-700 dark:text-white">Каталог</h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      to={`/catalog?view=components&category=${encodeURIComponent(cat.name)}`}
                      className={linkClass}
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-700 dark:text-white">Контакты</h4>
              <ul className="space-y-3">
                {contacts.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-600 dark:text-purple-200/70">
                    <item.icon className="w-4 h-4 shrink-0 text-gray-500 dark:text-purple-400" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Напишите нам
              </button>
            </motion.div>
          </div>

          <div className="border-t border-purple-200/30 dark:border-purple-400/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600 dark:text-purple-200/50">
              © {currentYear} Tech Lab. Все права защищены.
            </p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-xs text-gray-600 dark:text-purple-200/50 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                to="/terms"
                className="text-xs text-gray-600 dark:text-purple-200/50 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};

export default Footer;
