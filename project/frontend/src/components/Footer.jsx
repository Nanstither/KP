import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Данные для колонок
  const links = [
    { name: "Главная", to: "/" },
    { name: "Каталог", to: "/catalog" },
    { name: "О нас", to: "/about" },
    { name: "Сборка ПК", to: "/builder" },
  ];

  const categories = [
    { name: "Процессоры (CPU)" },
    { name: "Видеокарты (GPU)" },
    { name: "Материнские платы" },
    { name: "Оперативная память" },
  ];

  const contacts = [
    { icon: MapPin, text: "г. Иркутск, ул. Техническая, 1" },
    { icon: Phone, text: "+7 (999) 000-00-00" },
    { icon: Mail, text: "info@techlab.ru" },
  ];

  return (
    <footer className="relative bg-white/80 dark:bg-[#0f0f10] border-t border-purple-200/30 dark:border-purple-400/10">
      {/* Декоративная линия сверху */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Колонка 1: Бренд */}
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
              Профессиональный сборка игровых и рабочих станций. 
              Гарантия качества и лучшие цены на рынке.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-gray-500 dark:text-purple-300 hover:text-pink-400 transition-colors"></a>
              <a href="#" className="text-gray-500 dark:text-purple-300 hover:text-pink-400 transition-colors"></a>
            </div>
          </motion.div>

          {/* Колонка 2: Навигация */}
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
                  <a href={item.to} className="text-sm text-gray-600 dark:text-purple-200/70 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Колонка 3: Категории */}
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
                  <a href="#" className="text-sm text-gray-600 dark:text-purple-200/70 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Колонка 4: Контакты */}
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
                  <item.icon className="w-4 h-4 text-gray-500 dark:text-purple-400" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Нижняя полоса */}
        <div className="border-t border-purple-200/30 dark:border-purple-400/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 dark:text-purple-200/50">
            © {currentYear} Tech Lab. Все права защищены.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-600 dark:text-purple-200/50 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-xs text-gray-600 dark:text-purple-200/50 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;