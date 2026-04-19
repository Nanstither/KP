import { motion } from "framer-motion";
import {
  Sparkles, Award, Shield, Rocket, Heart,
  Target, Globe, Users, Cpu, Monitor, Zap,
  Code, Eye, MessageCircle, Clock
} from "lucide-react";

export default function AboutPage() {
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
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: Shield,
      title: "Гарантия",
      desc: "Официальная гарантия на все сборки до 3 лет. Бесплатная диагностика и ремонт в гарантийный период.",
      color: "from-pink-500/20 to-pink-600/10",
    },
    {
      icon: Rocket,
      title: "Скорость",
      desc: "Сборка, установка ОС и стресс-тестирование за 24 часа. Быстрая доставка по всей России.",
      color: "from-purple-500/20 to-pink-500/10",
    },
    {
      icon: Heart,
      title: "Поддержка",
      desc: "Пожизненная техническая поддержка и консультации. Поможем с апгрейдом и тюнингом.",
      color: "from-pink-500/20 to-purple-600/10",
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

  // Фоновые частицы
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 4,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/20 to-pink-950/20">
      {/* ─── Анимированный фон с частицами ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/50"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [p.opacity, p.opacity * 0.3, p.opacity],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ─── Основной контент ─── */}
      <div className="fixed inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Свечение за контейнером */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-3xl blur-3xl" />

          {/* ─── Большой тёмный контейнер ─── */}
          <div className="relative bg-[#0f0f10]/80 backdrop-blur-xl border border-purple-400/20 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10">
            
            {/* Декоративная линия сверху */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />

            <div className="p-6 md:p-10 lg:p-14 space-y-16">

              {/* ═══════ ШАПКА ═══════ */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-6"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-purple-400/30 bg-purple-500/10 text-purple-300 backdrop-blur-sm"
                >
                  <Sparkles className="w-3 h-3" /> О нашей компании
                </motion.span>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                    TECH LAB
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-purple-200/70 max-w-3xl mx-auto leading-relaxed">
                  Мы — команда энтузиастов и профессионалов, которые живут и дышат технологиями. 
                  С 2019 года мы создаём идеальные компьютерные системы для геймеров, дизайнеров и корпоративных клиентов.
                </p>
              </motion.div>

              {/* ═══════ СТАТИСТИКА ═══════ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.03, backgroundColor: "rgba(88, 28, 135, 0.2)" }}
                    className="text-center p-5 md:p-6 rounded-xl bg-purple-950/30 border border-purple-400/15 hover:border-purple-400/30 transition-all duration-300 cursor-default"
                  >
                    <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                    <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-1">
                      {stat.number}
                    </p>
                    <p className="text-xs md:text-sm text-purple-300/50">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* ═══════ МИССИЯ И ВИДЕНИЕ ═══════ */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-8 rounded-xl bg-gradient-to-br from-purple-950/50 to-transparent border border-purple-400/15 hover:border-purple-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-200">Наша миссия</h3>
                  </div>
                  <p className="text-purple-300/60 leading-relaxed">
                    Сделать высокопроизводительные компьютеры доступными для каждого. 
                    Мы стремимся к идеальному балансу цены, производительности и эстетики в каждой сборке.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-8 rounded-xl bg-gradient-to-br from-pink-950/50 to-transparent border border-pink-400/15 hover:border-pink-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-200">Наше видение</h3>
                  </div>
                  <p className="text-purple-300/60 leading-relaxed">
                    Стать лидером в сегменте кастомных компьютерных сборок в России. 
                    Мы видим будущее за персонализацией и максимальным вниманием к каждому клиенту.
                  </p>
                </motion.div>
              </div>

              {/* ═══════ ЦЕННОСТИ ═══════ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-purple-200">
                  Наши принципы
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {values.map((value, index) => (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="flex gap-4 p-6 rounded-xl bg-purple-950/20 border border-purple-400/15 hover:border-purple-400/30 hover:bg-purple-950/30 transition-all duration-300"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center`}>
                        <value.icon className="w-6 h-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-200 mb-1.5">{value.title}</h3>
                        <p className="text-sm text-purple-300/60 leading-relaxed">{value.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ═══════ УСЛУГИ ═══════ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-purple-200">
                  Что мы предлагаем
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-xl bg-purple-950/25 border border-purple-400/15 hover:border-purple-400/30 hover:bg-purple-950/40 transition-all duration-300 text-center"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center mx-auto mb-4">
                        <service.icon className="w-7 h-7 text-purple-300" />
                      </div>
                      <h3 className="text-base font-semibold text-purple-200 mb-2">{service.title}</h3>
                      <p className="text-sm text-purple-300/50 leading-relaxed">{service.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ═══════ CTA БЛОК ═══════ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-center p-8 md:p-10 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-400/20"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-purple-200 mb-4">
                  Готовы собрать ПК мечты?
                </h3>
                <p className="text-purple-300/60 mb-6 max-w-xl mx-auto">
                  Свяжитесь с нами для бесплатной консультации. Мы поможем подобрать идеальную конфигурацию под ваши задачи.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-3 rounded-lg font-medium transition-all cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 active:scale-95">
                    Связаться с нами
                  </button>
                  <button className="px-8 py-3 rounded-lg font-medium transition-all cursor-pointer border border-purple-400/30 text-purple-300 hover:bg-purple-500/10 active:scale-95">
                    Перейти в каталог
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}