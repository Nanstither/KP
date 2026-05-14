import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Cpu, Zap, Sparkles, Menu, X } from "lucide-react";

import Navigation from "@/components/Navigation";
import PremiumPCHero from "@/components/PremiumPCHero";
// import ProductCard from "@/components/ProductCard";
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
        // Компоненты уже сгруппированы по ролям благодаря pivot
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

  return (
    <div className="w-full min-h-screen">
      <PremiumPCHero />
      <div className="min-h-screen dark:bg-[#101019] flex items-center justify-center flex-col gap-8">
        <div className="text-center space-y-4 px-6">
          <h2 className="text-4xl font-bold text-white">
            Продолжайте своё путешествие
          </h2>
          <p className="text-purple-300/70 max-w-md mx-auto">
            Изучите дополнительные функции и возможности настройки для сборки ПК вашей мечты.
          </p>
        </div>
        {isLoading ? (
          <div className="text-center text-purple-300 animate-pulse py-12">Загрузка товаров...</div>
        ) : (
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((pc) => (
              <PrebuiltPcCard
                key={pc.id}
                pc={pc}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;