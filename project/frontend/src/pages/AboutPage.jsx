import { motion } from "framer-motion";
import {
  Sparkles, Award, Shield, Rocket, Heart,
  Target, Globe, Users, Cpu, Monitor, Zap,
  Code, Eye, MessageCircle, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ContactModal from "@/components/ContactModal";

export default function AboutPage() {
  const [contactOpen, setContactOpen] = useState(false);
  // Статистика
  const stats = [
    { number: "500+", label: "Собранных ПК", icon: Cpu },
    { number: "98%", label: "Довольных клиентов", icon: Heart },
    { number: "5 лет", label: "На рынке", icon: Clock },
    { number: "24/7", label: "Поддержка", icon: Shield },
  ];
  
  // Ценности компании
  const values = [
    {
      icon: Award,
      title: "Качество",
      desc: "Только проверенные комплектующие от ведущих мировых производителей. Каждый компонент проходит тестирование.",
      gradient: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-200 dark:border-purple-500/20",
      iconBg: "bg-purple-100 dark:bg-purple-600/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Shield,
      title: "Гарантия",
      desc: "Официальная гарантия на все сборки до 3 лет. Бесплатная диагностика и ремонт в гарантийный период.",
      gradient: "from-pink-500/10 to-pink-600/5",
      border: "border-pink-200 dark:border-pink-500/20",
      iconBg: "bg-pink-100 dark:bg-pink-600/20",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
    {
      icon: Rocket,
      title: "Скорость",
      desc: "Сборка, установка ОС и стресс-тестирование за 24 часа. Быстрая доставка по всей России.",
      gradient: "from-purple-500/10 to-pink-500/5",
      border: "border-purple-200 dark:border-purple-500/20",
      iconBg: "bg-purple-100 dark:bg-purple-600/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Heart,
      title: "Поддержка",
      desc: "Пожизненная техническая поддержка и консультации. Поможем с апгрейдом и тюнингом.",
      gradient: "from-pink-500/10 to-purple-600/5",
      border: "border-pink-200 dark:border-pink-500/20",
      iconBg: "bg-pink-100 dark:bg-pink-600/20",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
  ];

  // Услуги
  const services = [
    { icon: Cpu, title: "Кастомные сборки", desc: "Индивидуальный подбор компонентов под ваши задачи и бюджет" },
    { icon: Monitor, title: "Игровые станции", desc: "Максимальная производительность для AAA-игр в 4K разрешении" },
    { icon: Code, title: "Рабочие станции", desc: "Для видеомонтажа, 3D-рендеринга и профессиональных задач" },
    { icon: Zap, title: "Оверклокинг", desc: "Безопасный разгон процессоров и видеокарт для максимальной мощности" },
    { icon: Eye, title: "RGB-кастомизация", desc: "Синхронизированная подсветка и уникальный дизайн корпуса" },
    { icon: MessageCircle, title: "Консультации", desc: "Помощь в выборе компонентов и оптимизации конфигурации" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-none dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ═══════ ШАПКА ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-500/30 bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-3 h-3" /> О нашей компании
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            TECH LAB
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Мы — команда энтузиастов и профессионалов, которые живут и дышат технологиями. 
            С 2019 года мы создаём идеальные компьютерные системы для геймеров, дизайнеров и корпоративных клиентов.
          </p>
        </motion.div>

        {/* ═══════ СТАТИСТИКА ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.03 }}
              className="text-center p-6 rounded-xl bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
            >
              <stat.icon className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.number}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════ МИССИЯ И ВИДЕНИЕ ═══════ */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-xl bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Наша миссия</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Сделать высокопроизводительные компьютеры доступными для каждого. 
              Мы стремимся к идеальному балансу цены, производительности и эстетики в каждой сборке.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-xl bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-600/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Наше видение</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Стать лидером в сегменте кастомных компьютерных сборок в России. 
              Мы видим будущее за персонализацией и максимальным вниманием к каждому клиенту.
            </p>
          </motion.div>
        </div>

        {/* ═══════ ЦЕННОСТИ ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Наши принципы
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`flex gap-4 p-6 rounded-xl bg-gradient-to-br ${value.gradient} border ${value.border} hover:border-purple-300 dark:hover:border-purple-500/40 transition-all duration-300`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${value.iconBg} flex items-center justify-center`}>
                  <value.icon className={`w-6 h-6 ${value.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">{value.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════ УСЛУГИ ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Что мы предлагаем
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all duration-300 text-center shadow-sm dark:shadow-none"
              >
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════ CTA БЛОК ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center p-8 md:p-10 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-500/30"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Готовы собрать ПК мечты?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Свяжитесь с нами для бесплатной консультации. Мы поможем подобрать идеальную конфигурацию под ваши задачи.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="px-8 py-3 rounded-lg font-medium transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 active:scale-95"
            >
              Связаться с нами
            </button>
            <Link to="/catalog">
              <button className="px-8 py-3 rounded-lg font-medium transition-all cursor-pointer border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-600/20 active:scale-95">
                Перейти в каталог
              </button>
            </Link>
          </div>
        </motion.div>

      </div>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
