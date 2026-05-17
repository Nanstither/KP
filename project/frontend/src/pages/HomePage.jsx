import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Cpu, Zap, Sparkles, Menu, X, Truck, KeyRound, Shield, Headphones } from "lucide-react";

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
      <section className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-lg">Бесплатная доставка по России</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-lg">Лицензионный Windows</span>
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

      {/* Преимущества компании */}
      <section className="py-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Преимущества компании
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Почему тысячи клиентов выбирают именно нас
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Бесплатная доставка */}
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                <Truck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">
                Бесплатная доставка
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Аккуратно и надежно по всей России в короткие сроки.
              </p>
            </div>

            {/* Конфигуратор */}
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">
                Конфигуратор
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Создайте компьютер мечты – мощность, стиль и технологии по собственным правилам.
              </p>
            </div>

            {/* Гарантия */}
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">
                Гарантия
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Полная гарантия на все комплектующие.
              </p>
            </div>

            {/* Сервис и поддержка */}
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Headphones className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">
                Сервис и поддержка
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Мы предоставляем услуги сервисного обслуживания даже после истечения срока вашей первичной гарантии.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;