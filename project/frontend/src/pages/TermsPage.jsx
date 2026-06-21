import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-500/30 bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300">
            <FileText className="w-3 h-3" /> Документы
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Условия использования
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="prose prose-gray dark:prose-invert max-w-none space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed"
        >
          <p>
            Настоящая страница является заглушкой. Полный текст пользовательского соглашения
            будет опубликован после юридической проверки.
          </p>
          <p>
            Используя сайт Tech Lab, вы соглашаетесь с тем, что информация о товарах и ценах
            носит справочный характер и может быть изменена без предварительного уведомления.
          </p>
          <p>
            Оформление заказа на сайте означает ваше согласие с указанными условиями покупки,
            включая сроки сборки, доставки и гарантийные обязательства, которые уточняются
            при подтверждении заказа.
          </p>
          <p>
            Администрация сайта оставляет за собой право ограничить доступ к сервису при
            нарушении правил использования или попытках злоупотребления функционалом.
          </p>
        </motion.div>

        <Link
          to="/"
          className="inline-block text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          ← На главную
        </Link>
      </div>
    </div>
  );
}
