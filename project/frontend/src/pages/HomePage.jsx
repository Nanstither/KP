import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

      {/* Блок УТП: Доставка и Windows */}
      <section className="relative py-16 bg-gray-50 dark:bg-[#13131f] border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Бесплатная доставка */}
            <div className="group relative overflow-hidden rounded-2xl p-8 min-h-70 flex flex-col items-center text-center bg-gray-100 dark:bg-[#1a1a2e]">
              <div className="w-32 h-32 mb-4 relative z-10 shrink-0">
                <img 
                  src="/icons/arms.webp" 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
                  Бесплатная доставка
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Аккуратно и надежно<br />
                  по всей России в короткие сроки.
                </p>
              </div>
            </div>

            {/* Лицензионный Windows */}
            <div className="group relative overflow-hidden rounded-2xl p-8 min-h-70 flex flex-col items-center text-center bg-gray-100 dark:bg-[#1a1a2e]">
              <div className="w-32 h-32 mb-4 relative z-10 shrink-0">
                <img 
                  src="/icons/windows.webp" 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
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
      </section>

      {/* Хиты продаж / Бестселлеры */}
      <section className="py-20 bg-gray-50 dark:bg-[#101019]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3! text-gray-900 dark:text-white uppercase tracking-wide font-sans!">
              Хиты продаж
            </h2>
            <h3 className="text-2xl! md:text-5xl! font-medium mb-8! font-sans!">
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent font-sans! uppercase">
                Бестселлеры
              </span>
            </h3>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans!">
              Сбалансированные игровые ПК с оптимальной производительностью и лучшим соотношением цены и возможностей.
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center text-purple-400 animate-pulse py-12">Загрузка товаров...</div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Преимущества компании */}
      <section className="relative py-16 bg-gray-50 dark:bg-[#13131f]  border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl! md:text-4xl! font-bold mb-4! text-center text-gray-900 dark:text-white uppercase">
            Преимущества компании
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Почему тысячи клиентов выбирают именно нас
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Бесплатная доставка */}
            <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-0 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-300 min-h-[320px]">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-10" />
              <div className="relative w-full flex-1">
                <img 
                  src="/images/advantages/free_shipping.webp" 
                  alt="Доставка" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 py-5 text-center relative z-10">
                <h3 className="font-bold text-lg uppercase text-gray-900 dark:text-white mb-2">
                  Бесплатная доставка
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Аккуратно и надежно по всей России в короткие сроки.
                </p>
              </div>
            </div>

            {/* Конфигуратор */}
            <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-0 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 min-h-[320px]">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-10" />
              <div className="relative w-full flex-1">
                <img 
                  src="/images/advantages/configurator.webp" 
                  alt="Конфигуратор" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 py-5 text-center relative z-10">
                <h3 className="font-bold text-lg uppercase text-gray-900 dark:text-white mb-2">
                  Конфигуратор
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Создайте компьютер мечты – мощность, стиль и технологии по собственным правилам.
                </p>
              </div>
            </div>

            {/* Гарантия */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-0 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 min-h-[320px]">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-10" />
              <div className="relative w-full flex-1">
                <img 
                  src="/images/advantages/guarantee.webp" 
                  alt="Гарантия" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 py-5 text-center relative z-10">
                <h3 className="font-bold text-lg uppercase text-gray-900 dark:text-white mb-2">
                  Гарантия
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Полная гарантия на все комплектующие.
                </p>
              </div>
            </div>

            {/* Сервис и поддержка */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-600 p-0 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 min-h-[320px]">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none z-10" />
              <div className="relative w-full flex-1">
                <img 
                  src="/images/advantages/service_and_support.webp" 
                  alt="Сервис и поддержка" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 py-5 text-center relative z-10">
                <h3 className="font-bold text-lg uppercase text-gray-900 dark:text-white mb-2">
                  Сервис и поддержка
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Мы предоставляем услуги сервисного обслуживания даже после истечения срока вашей первичной гарантии.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;