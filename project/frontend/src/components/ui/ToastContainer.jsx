import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useToastContainer } from '@/context/ToastContext';

const styles = {
  success: {
    icon: CheckCircle,
    border: 'border-green-200 dark:border-green-500/30',
    bg: 'bg-green-50 dark:bg-green-500/10',
    text: 'text-green-800 dark:text-green-300',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: AlertCircle,
    border: 'border-red-200 dark:border-red-500/30',
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: Info,
    border: 'border-amber-200 dark:border-amber-500/30',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-900 dark:text-amber-200',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastContainer();

  return (
    <div
      className="fixed top-24 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(({ id, type, message }) => {
          const style = styles[type] || styles.error;
          const Icon = style.icon;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${style.border} ${style.bg} bg-white/95 dark:bg-[#141416]/95`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
              <p className={`flex-1 text-sm leading-snug ${style.text}`}>{message}</p>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="flex-shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
