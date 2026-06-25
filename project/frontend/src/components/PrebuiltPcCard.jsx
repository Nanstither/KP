import { useState } from "react";
import { ShoppingCart, Check, Cpu, Monitor, Zap } from "lucide-react";
import { STORAGE_URL } from "@/lib/config";
import api from "@/services/api";
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/lib/parseApiError';
import PrebuiltPcSpecsModal from "@/components/PrebuiltPcSpecsModal";

const ROLE_CONFIG = {
  cpu: { icon: Cpu, label: "CPU" },
  gpu: { icon: Monitor, label: "GPU" },
  ram: { icon: Zap, label: "RAM" },
};

export default function PrebuiltPcCard({ pc }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const components = pc.components || {};

  const handleAddToCart = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);
    try {
      const componentIds = [];
      Object.values(components).forEach(comp => {
        if (comp?.id) {
          componentIds.push(comp.id);
        }
      });

      if (componentIds.length === 0) {
        toast.warning('Сборка пуста');
        setIsLoading(false);
        return;
      }

      const payload = {
        type: 'prebuilt',
        name: pc.name,
        components: componentIds,
        prebuilt_id: pc.id
      };

      await api.post('/cart', payload);

      setIsAdded(true);
      toast.success('Сборка добавлена в корзину');
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      toast.error(parseApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <article className="group relative bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.08)] transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-[#0a0a0c]">
          <img
            src={pc.image ? `${STORAGE_URL}/${pc.image}` : "/placeholder-pc.png"}
            alt={pc.name}
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-pc.png'; }}
            className="mx-auto scale-90 h-full object-center object-cover opacity-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f0f10] via-transparent to-transparent" />

          {pc.tags?.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {pc.tags.slice(0, 2).map(tag => (
                <span key={tag.slug || tag.name} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/60 dark:bg-black/40 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight line-clamp-1">{pc.name}</h3>
            <p className="text-2xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-300 dark:via-pink-300 dark:to-purple-400 bg-clip-text text-transparent">
              {Number(pc.price).toLocaleString('ru-RU')} ₽
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['cpu', 'gpu', 'ram'].map(role => {
              const data = components[role];
              const { icon: Icon } = ROLE_CONFIG[role];
              return (
                <div key={role} className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 text-center">
                  <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1.5" />
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight line-clamp-2 font-mono">
                    {data?.model || '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
            >
              Характеристики
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                         ${isAdded
                           ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                           : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-purple-500/20'}`}
            >
              {isLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-gray-300 dark:border-white/30 border-t-white rounded-full" />
              ) : isAdded ? (
                <> <Check className="w-4 h-4" /> Готово </>
              ) : (
                <> <ShoppingCart className="w-4 h-4" /> В корзину </>
              )}
            </button>
          </div>
        </div>
      </article>

      <PrebuiltPcSpecsModal
        pc={pc}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
