import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { ROLE_LABELS } from "@/lib/buildComponents";

export default function BuildComponentsModal({
  isOpen,
  onClose,
  title,
  subtitle,
  components = [],
  totalPrice,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>

            <div className="space-y-2">
              {components.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Состав недоступен
                </p>
              ) : (
                components.map((comp, idx) => {
                  const component = comp.component;
                  if (!component) return null;
                  const quantity = comp.quantity || 1;
                  const roleLabel =
                    ROLE_LABELS[comp.role] ||
                    component.category?.name ||
                    "Компонент";

                  return (
                    <div
                      key={comp.id || `${component.id}-${idx}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5"
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {component.model || "Компонент"}
                          </p>
                          {quantity > 1 && (
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                              x{quantity}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {component.price != null && (
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-300 whitespace-nowrap">
                            {Number(component.price).toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                        {component.id && (
                          <Link
                            to={`/components/${component.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors"
                            title="Подробнее"
                            onClick={onClose}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {totalPrice != null && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Итого:</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-300">
                  {Number(totalPrice).toLocaleString("ru-RU")} ₽
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
