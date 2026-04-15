import {useState} from "react";
import {Cpu, Monitor, HardDrive, Zap} from "lucide-react";

export default function ProductCard({product, onAddToCard}) {
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (isAdded || isLoading) return;
        setIsLoading(true);

        // Имитация запроса к БД/API
        await new Promise((res) => setTimeout(res, 600));

        if (onAddToCart) onAddToCart(product.id);
        setIsAdded(true);
        setIsLoading(false);
    };
    return (
    <article className="group bg-slate-900/80 border border-purple-400/20 rounded-xl overflow-hidden hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      
      {/* 🖼 Изображение */}
      <div className="aspect-video relative overflow-hidden bg-slate-800">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
            Нет в наличии
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-5 space-y-4">
        
        {/* Название и цена */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
          <p className="text-2xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            ${product.price.toLocaleString()}
          </p>
        </div>

        {/* Характеристики (сетка 2x2) */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-purple-200/70">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>{product.specs.cpu}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200/70">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span>{product.specs.gpu}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200/70">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>{product.specs.ram}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200/70">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>{product.specs.ssd}</span>
          </div>
        </div>

        {/* Кнопка в корзину */}
        <button
          onClick={handleAdd}
          disabled={isLoading || !product.inStock}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] ${
            isAdded
              ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-default"
              : !product.inStock
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-purple-500/25"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Добавляем...
            </span>
          ) : isAdded ? (
            "✓ Добавлено в корзину"
          ) : (
            "Добавить в корзину"
          )}
        </button>
      </div>
    </article>
  );
}