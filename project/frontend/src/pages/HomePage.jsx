import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, KeyRound } from "lucide-react";

import Navigation from "@/components/Navigation";
import PremiumPCHero from "@/components/PremiumPCHero";
import PrebuiltPcCard from "@/components/PrebuiltPcCard";

const API_URL = "http://localhost:8000/api";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Загружаем готовые ПК вместо компонентов
    fetch(`${API_URL}/prebuilt-pcs?with=components,tags`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети");
        return res.json();
      })
      .then((data) => {
        // Laravel возвращает вложенные данные, приводим к нужному формату
        const formatted = data.map((pc) => ({
          id: pc.id,
          name: pc.name,
          price: pc.price,
          image: pc.image,
          description: pc.description,
          tags: pc.tags || [],
          components: pc.components || [],
        }));
        setProducts(formatted);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки ПК:", err);
        setIsLoading(false);
      });
  }, []);

  const handleAddToCart = (productId) => {
    setCart((prev) => [...prev, productId]);
    console.log(`✅ В корзине: ${cart.length + 1} товар(ов)`);
  };

  // Берем только первые 6 товаров для блока "Хиты продаж"
  const bestsellers = products.slice(0, 6);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#101019]">
      <PremiumPCHero />

      {/* Блок УТП и Преимущества - объединенный с общим фоном */}
      <section className="relative py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          {/* Верхняя часть: Доставка и Windows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* Бесплатная доставка */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/30 p-8 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 min-h-[200px]">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src="/icons/arms.webp" 
                    alt="Доставка" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Бесплатная доставка
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Аккуратно и надежно<br />
                    по всей России в короткие сроки.
                  </p>
                </div>
              </div>
            </div>

            {/* Лицензионный Windows */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/30 p-8 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 min-h-[200px]">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src="/icons/windows.webp" 
                    alt="Windows" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Лицензионный Windows
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    Запускай и играй -<br />
                    всё уже установлено.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Разделительная линия */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-auto mb-12"></div>

          {/* Преимущества компании */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
              Преимущества компании
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Почему тысячи клиентов выбирают именно нас
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Бесплатная доставка */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-8 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-300 min-h-[280px]">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-20 h-20 mb-4 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="/images/adventages/free_shipping" 
                      alt="Доставка" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Бесплатная доставка
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Аккуратно и надежно по всей России в короткие сроки.
                  </p>
                </div>
              </div>

              {/* Конфигуратор */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-8 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 min-h-[280px]">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-20 h-20 mb-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="/images/adventages/configurator.webp" 
                      alt="Конфигуратор" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Конфигуратор
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Создайте компьютер мечты – мощность, стиль и технологии по собственным правилам.
                  </p>
                </div>
              </div>

              {/* Гарантия */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-8 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 min-h-[280px]">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-20 h-20 mb-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="/images/adventages/guarantee" 
                      alt="Гарантия" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Гарантия
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Полная гарантия на все комплектующие.
                  </p>
                </div>
              </div>

              {/* Сервис и поддержка */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-8 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 min-h-[280px]">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-20 h-20 mb-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="/images/adventages/service_and_support" 
                      alt="Сервис и поддержка" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Сервис и поддержка
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Мы предоставляем услуги сервисного обслуживания даже после истечения срока вашей первичной гарантии.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Хиты продаж / Бестселлеры */}
      <section className="py-16 bg-gray-50 dark:bg-[#101019]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Хиты продаж
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Самые популярные конфигурации, выбранные нашими клиентами
          </p>
          
          {isLoading ? (
            <div className="text-center text-purple-400 animate-pulse py-12">Загрузка товаров...</div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestsellers.map((pc) => (
                <PrebuiltPcCard
                  key={pc.id}
                  pc={pc}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">Товары временно отсутствуют</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;