import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Cpu, Zap, Sparkles, Menu, X } from "lucide-react";

import Navigation from "@/components/Navigation";
import PremiumPСHero from "@/components/PremiumPСHero";
import ProductCard from "@/components/ProductCard";

const API_URL = "http://localhost:8000/api";

function HomePage() {

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/components`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети");
        return res.json();
      })
      .then((data) => {
        // Laravel отдаёт плоскую структуру, а ProductCard ждёт specs: { cpu, gpu... }
        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          inStock: p.in_stock, // Laravel snake_case → React camelCase
          specs: {
            cpu: p.cpu,
            gpu: p.gpu,
            ram: p.ram,
            ssd: p.ssd,
          },
        }));
        setProducts(formatted);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки товаров:", err);
        setIsLoading(false);
      });
  }, []);

  const handleAddToCart = (productId) => {
    setCart((prev) => [...prev, productId]);
    console.log(`✅ В корзине: ${cart.length + 1} товар(ов)`);
  };

  return (
    <div className="w-full min-h-screen">
      <PremiumPСHero />
      <div className="min-h-screen bg-(--color-background)/80 flex items-center justify-center flex-col gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
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