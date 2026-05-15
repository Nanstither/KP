import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  Cpu, Monitor, Zap, HardDrive, Thermometer, AlertTriangle,
  ChevronRight, ChevronDown, Menu, X, ExternalLink
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const KnowledgeBase = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(["gpu"]);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const sections = [
    {
      id: "intro",
      title: "Введение",
      icon: ExternalLink,
    },
    {
      id: "gpu",
      title: "Видеокарты",
      icon: Monitor,
      subsections: [
        { id: "why_balance_is_important", title: "Почему важен баланс, а не только мощность"},
        { id: "gpu-role", title: "Роль видеокарты в игровой сборке"},
        { id: "gpu-imbalance", title: "Признаки дисбаланса процессора и видеокарты"},
        { id: "gpu-algorithm", title: "Алгоритм подбора" },
        { id: "gpu-compatibility", title: "Таблица совместимости 2026" },
        { id: "gpu-mistakes", title: "Распространённые ошибки" },
        { id: "gpu-bottleneck", title: "Ботлнекинг" },
      ]
    },
    {
      id: "cpu",
      title: "Процессоры",
      icon: Cpu,
      subsections: [
        { id: "cpu-selection", title: "Как выбрать" },
        { id: "cpu-cores", title: "Ядра и потоки" },
        { id: "cpu-frequency", title: "Частота и кэш" },
        { id: "cpu-gaming", title: "Для игр" },
      ]
    },
    {
      id: "ram",
      title: "Оперативная память",
      icon: Zap,
      subsections: [
        { id: "ram-capacity", title: "Объём памяти" },
        { id: "ram-frequency", title: "Частота и тайминги" },
        { id: "ram-channels", title: "Канальность" },
      ]
    },
    {
      id: "psu",
      title: "Блок питания",
      icon: Thermometer,
      subsections: [
        { id: "psu-power", title: "Расчёт мощности" },
        { id: "psu-efficiency", title: "Сертификаты эффективности" },
        { id: "psu-connectors", title: "Разъёмы" },
      ]
    },
    {
      id: "storage",
      title: "Накопители",
      icon: HardDrive,
      subsections: [
        { id: "storage-types", title: "Типы накопителей" },
        { id: "storage-speed", title: "Скорость работы" },
      ]
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            if (section.subsections) {
              setExpandedSections([section.id]);
            }
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101019]">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-purple-500 origin-left z-50"
        style={{ scaleX }}
      />
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              <nav className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                  Содержание
                </h3>
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => {
                        scrollToSection(section.id);
                        if (section.subsections) toggleSection(section.id);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === section.id
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      {section.icon && <section.icon className="w-4 h-4" />}
                      {section.title}
                      {section.subsections && (
                        <ChevronDown 
                          className={`w-4 h-4 ml-auto transition-transform ${
                            expandedSections.includes(section.id) ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>
                    
                    {section.subsections && expandedSections.includes(section.id) && (
                      <div className="mt-1 space-y-1 pl-6">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => scrollToSection(sub.id)}
                            className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                              activeSection === sub.id
                                ? "text-purple-700 dark:text-purple-300"
                                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile menu button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>Содержание</span>
            </button>
            
            {mobileMenuOpen && (
              <div className="mt-2 space-y-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => {
                        scrollToSection(section.id);
                        if (section.subsections) toggleSection(section.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {section.title}
                    </button>
                    {section.subsections && expandedSections.includes(section.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => scrollToSection(sub.id)}
                            className="block w-full text-left px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main content */}
          <main className="lg:col-span-9">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              {/* Введение */}
              <section id="intro" className="scroll-mt-24 mb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  База знаний по сборке ПК
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  Полное руководство по подбору комплектующих для игрового компьютера. 
                  Здесь вы найдёте актуальную информацию о совместимости компонентов, 
                  алгоритмы подбора и распространённые ошибки.
                </p>
              </section>

              {/* Видеокарты */}
              <section id="gpu" className="scroll-mt-24 mb-16">
                <div className="relative">
                  <picture>
                    <img className="rounded-2xl h-[572px] w-full object-cover object-bottom" 
                    src="/bcb7c339ee7dbc8b7af2c5f6f61eacf17f3434ee831ec7e81f7b343852e7febb.webp" 
                    alt="Как подобрать видеокарту к процессору: полный гайд по совместимости 2026" 
                    fetchPriority="high"/>
                  </picture>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-10 flex flex-col justify-end">
                    <h2 className="text-3xl font-bold text-white mb-8 items-center">
                      {/* <Monitor className="w-8 h-8 text-purple-500" /> */}
                      Как подобрать видеокарту к процессору: полный гайд по совместимости 2026
                    </h2>
                  </div>
                </div>
                <div className="my-8 text-gray-600 dark:text-gray-400  text-lg leading-relaxed text-justify flex flex-col gap-8">
                  <p>
                    Какую выбрать видеокарту к своему процессору и какой процессор раскроет всю мощь твоей видеокарты? 
                    Рассказываем, как распределяется нагрузка между CPU и GPU, почему возникает «бутылочное горлышко», 
                    как на производительность влияют разрешение, настройки графики и частота обновления монитора. 
                    Отдельно затронем техническую сторону: питание, PCIe, охлаждение и габариты — те вещи, из-за которых даже мощное железо может работать хуже, чем должно.
                  </p>
                  <p>
                    Главная проблема в теме подбора проста: бытует мнение, что для игр достаточно «просто взять видеокарту помощнее». 
                    В итоге получаем дисбаланс — процессор не успевает подготавливать кадры для GPU.
                  </p>
                  <p>
                    Этот гайд нужен, чтобы ты понимал, где именно рождается FPS, что ограничивает твой ПК и как собрать сбалансированную систему, где каждый компонент работает на результат, а не простаивает.
                  </p>
                </div>
                <div id="why_balance_is_important" className="scroll-mt-24 mb-10">
                  <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                    Почему важен баланс, а не только мощность
                  </h3>
                  <div className="my-8 text-gray-600 dark:text-gray-400  text-lg leading-relaxed text-justify flex flex-col gap-8">
                    <p>
                      Игровой ПК — это всегда командная работа. Процессор и видеокарта находятся в постоянном диалоге, обмениваясь гигабайтами данных, и именно от их слаженности зависит итоговый FPS. 
                      Заблуждение считать, что производительность в играх зависит только от видеокарты.
                    </p>
                    <p>
                      Если один из компонентов заметно слабее другого, возникает эффект «бутылочного горлышка» (bottleneck). 
                      Это ситуация, когда система работает со скоростью самого медленного звена. В играх это проявляется в двух вариант  
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-300 font-bold">Отстающий процессор:</span> не успевает подготавливать кадры для видеокарты. В итоге GPU простаивает, а ты видишь на экране фризы, рывки и нестабильный график кадра.
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-300 font-bold">Отстающая видеокарта:</span> работает на пределе своих возможностей, но FPS упирается в её потолок. В тяжёлых сценах со сложным освещением неизбежны просадки.
                    </p>
                    <p>
                      Именно поэтому ставить мощную видеокарту к слабому процессору и наоборот экономически невыгодно: значительная часть мощности (за которую ты заплатил!) останется невостребованной.
                    </p>
                    <p>
                      Чтобы избежать подобных перекосов при сборке, удобно воспользоваться <Link to="/config"><span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-bold">конфигуратором</span></Link> — он помогает подобрать сбалансированную связку процессора и видеокарты за пару шагов.
                    </p>
                  </div>
                </div>
                <div id="gpu-role" className="scroll-mt-24 mb-10">
                  <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
                    Роли видеокарты в игровой сборке
                  </h3>
                  <h3 className="text-left text-2xl font-semibold text-gray-900 dark:text-white mt-8">
                    За что отвечает видеокарта (GPU)
                  </h3>
                  <div className="my-8 text-gray-600 dark:text-gray-400 text-lg leading-relaxed text-justify flex flex-col gap-4">
                    <p>
                      Видеокарта — это главный декоратор. Она берёт черновой набросок, который создал процессор, и превращает его в шедевр. 
                      Её работа — «раскрасить» мир: натянуть текстуры на модели, просчитать игру света и теней и отправить готовую красивую картинку тебе на экран.
                    </p>
                    <p>
                      Основные задачи GPU:
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-300 font-bold">Расчёт освещения и теней. </span> 
                      Самая ресурсоемкая часть. Трассировка лучей (Ray Tracing) и путей (Path Tracing) полностью ложится на плечи графического процессора. 
                      Чем сложнее свет, тем мощнее должна быть карта.
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-300 font-bold">Наложение текстур. </span> 
                       Видеокарта «одевает» полигональные модели в реалистичные материалы: металл, кожу, ткань. 
                       Для этого ей нужен большой объём видеопамяти (VRAM), чтобы хранить текстуры высокого разрешения.
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-300 font-bold">Постобработка. </span> 
                      Сглаживание, цветокоррекция, эффекты глубины резкости (DoF) и работа технологий апскейлинга (DLSS, FSR) — это финальные штрихи, 
                      которые делает GPU перед выдачей кадра.
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-300 font-bold">Вывод изображения на экран. </span> 
                      Видеокарта формирует итоговый сигнал для твоего монитора, обеспечивая нужное разрешение (например, 4K) и частоту обновления (герцовку).
                    </p>
                    <div className="mt-6">
                      <picture><img className="rounded-2xl h-[572px] w-full object-cover" src="/d081df56c1042a478328e3241687b9c9.webp" alt="Кадр из игры Unchartred" /></picture>
                      <i className="block w-full text-center mt-4 text-base text-slate-500">Кадр из игры Uncharted 4: GPU накладывает текстуры, тени, освещение и выводит изображение на экран.</i>
                    </div>
                  </div>
                </div>

                {/* Признаки дисбаланса процессора и видеокарты */}
                <div id="gpu-imbalance" className="scroll-mt-24 mb-10">
                  <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                    Признаки дисбаланса процессора и видеокарты
                  </h3>
                  <div className="my-8 text-gray-600 dark:text-gray-400 text-lg leading-relaxed text-justify flex flex-col gap-4">
                    <div className="mb-4 flex flex-col gap-4">
                      <p>
                        Если в игре появляются рывки, просадки FPS возможно систему ограничивает один из компонентов. Вот признаки, которые можно заметить сразу:
                      </p>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-10 grid-cols-1 grid-rows-1 place-content-center border-1 border-transparent [border-image:linear-gradient(60deg,theme(colors.purple.300),theme(colors.pink.500))_1] font-mono text-[16px]/7 font-medium text-gray-950 dark:border-white/50 dark:text-white my-auto">
                          <div className="col-start-1 row-start-1 grid place-content-center">
                            <div className="h-10 w-7 bg-gray-50 dark:bg-[#101019]">
                            </div>
                          </div>
                          <div className="col-start-1 row-start-1 grid place-content-center tracking-widest bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                          01
                          </div>
                        </div>
                        <div className="col-start-2 col-end-auto">
                          <span className="text-gray-500 dark:text-gray-300 font-bold">Рывки и микрофризы при движении по локации. </span>Картинка «дёргается» при поворотах камеры или быстром перемещении, даже если средний FPS выглядит приемлемым.
                        </div>
                      </div>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-10 grid-cols-1 grid-rows-1 place-content-center border-1 border-transparent [border-image:linear-gradient(60deg,theme(colors.purple.300),theme(colors.pink.500))_1] font-mono text-[16px]/7 font-medium text-gray-950 dark:border-white/50 dark:text-white my-auto">
                          <div className="col-start-1 row-start-1 grid place-content-center">
                            <div className="h-10 w-7 bg-gray-50 dark:bg-[#101019]">
                            </div>
                          </div>
                          <div className="col-start-1 row-start-1 grid place-content-center tracking-widest bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                          02
                          </div>
                        </div>
                        <div className="col-start-2 col-end-auto">
                          <span className="text-gray-500 dark:text-gray-300 font-bold">Просадки в насыщенных сценах. </span>Резкое падение FPS в городах, массовых боях, сценах с большим количеством NPC и объектов.
                        </div>
                      </div>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-10 grid-cols-1 grid-rows-1 place-content-center border-1 border-transparent [border-image:linear-gradient(60deg,theme(colors.purple.300),theme(colors.pink.500))_1] font-mono text-[16px]/7 font-medium text-gray-950 dark:border-white/50 dark:text-white my-auto">
                          <div className="col-start-1 row-start-1 grid place-content-center">
                            <div className="h-10 w-7 bg-gray-50 dark:bg-[#101019]">
                            </div>
                          </div>
                          <div className="col-start-1 row-start-1 grid place-content-center tracking-widest bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                          03
                          </div>
                        </div>
                        <div className="col-start-2 col-end-auto">
                          <span className="text-gray-500 dark:text-gray-300 font-bold">Подтормаживания во время взрывов, разрушений, скоплений объектов. </span>Система теряет плавность в моменты активных расчётов физики и логики сцены.
                        </div>
                      </div>
                    </div>
                    <p>
                      Чтобы понять, что именно тормозит систему, не обязательно быть инженером. Достаточно провести простой эксперимент прямо в игре
                    </p>
                    <p>
                      Суть теста: зайди в требовательную игру и снизь все настройки графики на минимум. 
                      Разрешение экрана тоже опусти (например, с 4K или 2K до Full HD). Выключи сглаживание, трассировку лучей, V-Sync и лимит FPS.
                    </p>                
                    <div className="mb-4 flex flex-col gap-4">
                      <p>А теперь наблюдай за игрой:</p>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-4 grid-cols-1 rounded-sm border-transparent bg-gradient-to-tr from-purple-300 to-pink-500 bg-clip-border [background-origin:border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] mt-2"></div>
                        <div className="col-start-2 col-end-auto">
                          <p>FPS резко вырос при снижении настроек — ограничение со стороны видеокарты. Процессор способен готовить больше кадров, но GPU не справляется с графической нагрузкой. Решение: более мощная видеокарта или умеренные настройки графики;</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-4 grid-cols-1 rounded-sm border-transparent bg-gradient-to-tr from-purple-300 to-pink-500 bg-clip-border [background-origin:border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] mt-2"></div>
                        <div className="col-start-2 col-end-auto">
                          <p>FPS почти не изменился — значит систему тормозит процессор. Даже при снижении графики система упирается в возможности CPU, который не успевает подготавливать кадры. Поможет апгрейд процессора (возможно придётся добавить оперативной памяти).</p>
                        </div>
                      </div>
                    </div>
                    <p>Есть ещё один безотказный метод — используй утилиту для мониторинга <a className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-bold" href="https://www.msi.com/page/afterburner" target="_blank" rel="noopener noreferrer">MSI Afterburner</a> или её аналог.</p>
                    <div className="mb-4 flex flex-col gap-4">
                      <p>Запусти игру и включи MSI Afterburner. </p>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-4 grid-cols-1 rounded-sm border-transparent bg-gradient-to-tr from-purple-300 to-pink-500 bg-clip-border [background-origin:border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] mt-2"></div>
                        <div className="col-start-2 col-end-auto">
                          <p>Если GPU постоянно загружен на 95–100%, а FPS растёт при снижении графики — видеокарта не вытягивает;</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-auto gap-6">
                        <div className="grid size-4 grid-cols-1 rounded-sm border-transparent bg-gradient-to-tr from-purple-300 to-pink-500 bg-clip-border [background-origin:border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] mt-2"></div>
                        <div className="col-start-2 col-end-auto">
                          <p>Если загрузка видеокарты заметно ниже, а один или несколько потоков процессора работают на пределе — система упирается в CPU.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <picture><img className="rounded-2xl h-[572px] w-full object-cover object-[x:25%]" src="/MSI-Afterburner-guide-01b-Troubleshooting-Uncheck-Start-with-Windows.jpg" alt="Интерфейс MSI Afterburner" /></picture>
                      <i className="block w-full text-center mt-4 text-base text-slate-500">Интерфейс MSI Afterburner</i>
                    </div>
                  </div>
                </div>

                <div id="gpu-algorithm" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Алгоритм подбора видеокарты к процессору
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
                    <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                        <div>
                          <strong>Определите бюджет</strong> — оптимальное соотношение: 30-40% бюджета на видеокарту
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                        <div>
                          <strong>Выберите разрешение</strong> — 1080p, 1440p или 4K
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                        <div>
                          <strong>Подберите процессор</strong> — избегайте ботлнекинга (см. таблицу ниже)
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                        <div>
                          <strong>Проверьте блок питания</strong> — запас 20-30% от TDP системы
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
                <div id="gpu-compatibility" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Таблица совместимости процессоров и видеокарт (2026)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="px-6 py-3 rounded-tl-lg">Видеокарта</th>
                          <th className="px-6 py-3">Мин. процессор</th>
                          <th className="px-6 py-3">Рекомендуемый</th>
                          <th className="px-6 py-3 rounded-tr-lg">Разрешение</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">RTX 4060</td>
                          <td className="px-6 py-4">i3-12100F / Ryzen 5 5500</td>
                          <td className="px-6 py-4">i5-13400F / Ryzen 5 7600</td>
                          <td className="px-6 py-4">1080p</td>
                        </tr>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">RTX 4070</td>
                          <td className="px-6 py-4">i5-12400F / Ryzen 5 5600</td>
                          <td className="px-6 py-4">i5-13600K / Ryzen 7 7700X</td>
                          <td className="px-6 py-4">1440p</td>
                        </tr>
                        <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">RTX 4080</td>
                          <td className="px-6 py-4">i5-13600K / Ryzen 7 7700X</td>
                          <td className="px-6 py-4">i7-13700K / Ryzen 7 7800X3D</td>
                          <td className="px-6 py-4">1440p/4K</td>
                        </tr>
                        <tr className="bg-gray-50 dark:bg-gray-900">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">RTX 4090</td>
                          <td className="px-6 py-4">i7-13700K / Ryzen 7 7800X3D</td>
                          <td className="px-6 py-4">i9-13900K / Ryzen 9 7950X3D</td>
                          <td className="px-6 py-4">4K</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div id="gpu-mistakes" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Распространённые ошибки при подборе
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                            Слабый процессор для мощной видеокарты
                          </h4>
                          <p className="text-red-700 dark:text-red-400 text-sm">
                            RTX 4090 с i3-12100F — видеокарта будет простаивать 30-40% времени
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                            Недостаточный блок питания
                          </h4>
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            Для RTX 4080 нужен БП минимум 750W, а не 550W
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            PCIe 3.0 для новых видеокарт
                          </h4>
                          <p className="text-blue-700 dark:text-blue-400 text-sm">
                            RTX 4060 на PCIe 3.0 теряет до 10% производительности
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="gpu-bottleneck" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Что такое ботлнекинг (узкое место)
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Ботлнекинг возникает, когда один компонент системы ограничивает 
                    производительность другого. В случае с CPU и GPU:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>CPU bottleneck</strong> — процессор не успевает готовить кадры для видеокарты</li>
                    <li><strong>GPU bottleneck</strong> — идеальный сценарий, видеокарта загружена на 95-100%</li>
                    <li>Проверяйте загрузку в MSI Afterburner во время игр</li>
                  </ul>
                </div>
              </section>

              {/* Процессоры */}
              <section id="cpu" className="scroll-mt-24 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <Cpu className="w-8 h-8 text-purple-500" />
                  Процессоры
                </h2>

                <div id="cpu-selection" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Как выбрать процессор
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    При выборе процессора для игрового ПК учитывайте:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Intel</h4>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>• i3 — бюджетные сборки</li>
                        <li>• i5 — оптимальный выбор</li>
                        <li>• i7 — мощные игровые ПК</li>
                        <li>• i9 — топовые рабочие станции</li>
                      </ul>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AMD</h4>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>• Ryzen 5 — аналог i5</li>
                        <li>• Ryzen 7 — аналог i7</li>
                        <li>• Ryzen 9 — флагманы</li>
                        <li>• X3D — лучший выбор для игр</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div id="cpu-cores" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ядра и потоки
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Для игр в 2026 году:
                  </p>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Конфигурация</th>
                        <th className="px-4 py-2 text-left">Для чего</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300">
                      <tr className="border-b dark:border-gray-700">
                        <td className="px-4 py-3">6 ядер / 12 потоков</td>
                        <td className="px-4 py-3">Минимум для современных игр</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <td className="px-4 py-3">8 ядер / 16 потоков</td>
                        <td className="px-4 py-3">Оптимально для игр + стриминг</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">12+ ядер</td>
                        <td className="px-4 py-3">Рабочие станции, рендеринг</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div id="cpu-frequency" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Частота и кэш
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Частота:</strong> для игр важна высокая частота (4.5+ ГГц). 
                    AMD X3D процессоры имеют увеличенный кэш L3, что даёт прирост 
                    10-15% в играх.
                  </p>
                </div>

                <div id="cpu-gaming" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Лучшие процессоры для игр 2026
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300">Ryzen 7 7800X3D</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-400">Лучший игровой процессор 2026</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Intel i5-13600K</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-400">Оптимальное соотношение цена/производительность</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ОЗУ */}
              <section id="ram" className="scroll-mt-24 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-purple-500" />
                  Оперативная память
                </h2>

                <div id="ram-capacity" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Объём памяти
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-500 mb-2">16 GB</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Минимум для игр 2026</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg border-2 border-purple-500">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">32 GB</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Рекомендуемый объём</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-500 mb-2">64 GB</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Для рабочих станций</p>
                    </div>
                  </div>
                </div>

                <div id="ram-frequency" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Частота и тайминги
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    <strong>DDR4:</strong> оптимально 3200-3600 МГц с таймингами CL16-18<br/>
                    <strong>DDR5:</strong> от 5600 МГц, оптимально 6000-6400 МГц
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>Важно:</strong> для AMD Ryzen 7000 используйте DDR5-6000 CL30 — 
                      это точка стабильности контроллера памяти
                    </p>
                  </div>
                </div>

                <div id="ram-channels" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Двухканальный режим
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Всегда используйте 2 планки памяти вместо одной! 
                    Двухканальный режим даёт прирост 10-20% в играх.
                  </p>
                </div>
              </section>

              {/* Блок питания */}
              <section id="psu" className="scroll-mt-24 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <Thermometer className="w-8 h-8 text-purple-500" />
                  Блок питания
                </h2>

                <div id="psu-power" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Расчёт мощности
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-4">
                    <h4 className="font-semibold mb-4">Формула:</h4>
                    <code className="block bg-gray-200 dark:bg-gray-700 p-3 rounded text-lg">
                      (TDP CPU + TDP GPU + 100W) × 1.3 = Рекомендуемая мощность
                    </code>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Пример: i5-13600K (181W) + RTX 4070 (200W) + 100W = 481W × 1.3 = <strong>625W</strong>
                  </p>
                </div>

                <div id="psu-efficiency" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Сертификаты эффективности
                  </h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2">Сертификат</th>
                        <th className="px-4 py-2">КПД</th>
                        <th className="px-4 py-2">Для чего</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300">
                      <tr className="border-b dark:border-gray-700">
                        <td className="px-4 py-3">80 Plus Bronze</td>
                        <td className="px-4 py-3">85%</td>
                        <td className="px-4 py-3">Бюджетные сборки</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <td className="px-4 py-3">80 Plus Gold</td>
                        <td className="px-4 py-3">90%</td>
                        <td className="px-4 py-3">Рекомендуемый выбор</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">80 Plus Platinum</td>
                        <td className="px-4 py-3">92%</td>
                        <td className="px-4 py-3">Топовые системы</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div id="psu-connectors" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Необходимые разъёмы
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>24-pin ATX</strong> — питание материнской платы</li>
                    <li><strong>8-pin EPS</strong> — питание процессора (может быть 2 шт)</li>
                    <li><strong>PCIe 6+2 pin</strong> — для видеокарты (RTX 4070: 2 шт, RTX 4090: 4 шт)</li>
                    <li><strong>SATA</strong> — для SSD/HDD</li>
                  </ul>
                </div>
              </section>

              {/* Накопители */}
              <section id="storage" className="scroll-mt-24 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <HardDrive className="w-8 h-8 text-purple-500" />
                  Накопители
                </h2>

                <div id="storage-types" className="scroll-mt-24 mb-10">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Типы накопителей
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">NVMe SSD (M.2)</h4>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>• Скорость: 3500-7000 MB/s</li>
                        <li>• Подключение: PCIe x4</li>
                        <li>• Для системы и игр</li>
                      </ul>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">SATA SSD (2.5")</h4>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>• Скорость: 500-550 MB/s</li>
                        <li>• Подключение: SATA III</li>
                        <li>• Для хранения файлов</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div id="storage-speed" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Скорость работы
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>PCIe 4.0:</strong> до 7000 MB/s (Samsung 980 Pro, WD SN850X)<br/>
                    <strong>PCIe 3.0:</strong> до 3500 MB/s (достаточно для игр)<br/>
                    <strong>Рекомендация:</strong> минимум 1 TB NVMe для системы + игр
                  </p>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;