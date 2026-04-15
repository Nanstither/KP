import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Cpu, Zap, Sparkles, Menu, X } from "lucide-react";

import Navigation from "@/components/Navigation";
import PremiumPСHero from "@/components/PremiumPСHero";
import ProductCard from "@/components/ProductCard";

function HomePage() {
  return (
    <div className="w-full min-h-screen">
      <Navigation />
      <PremiumPСHero />
      <div className="min-h-screen bg-(--color-background)/80 flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <h2 className="text-4xl font-bold text-white">
            Продолжайте своё путешествие
          </h2>
          <p className="text-purple-300/70 max-w-md mx-auto">
            Изучите дополнительные функции и возможности настройки для сборки ПК вашей мечты.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;