import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
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
            <Shield className="w-3 h-3" /> Документы
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Политика конфиденциальности
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="prose prose-gray dark:prose-invert max-w-none space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed"
        >
          <p>
            Настоящая страница является заглушкой. Полный текст политики конфиденциальности
            будет опубликован после юридической проверки.
          </p>
          <p>
            Tech Lab уважает вашу конфиденциальность. При использовании сайта мы можем
            обрабатывать персональные данные, необходимые для оформления заказов, регистрации
            аккаунта и обратной связи — имя, email, телефон и адрес доставки.
          </p>
          <p>
            Мы не передаём ваши данные третьим лицам, за исключением случаев, предусмотренных
            законодательством РФ (например, службы доставки для выполнения заказа).
          </p>
          <p>
            По вопросам обработки персональных данных вы можете связаться с нами через форму
            «Напишите нам» в футере сайта или по email{" "}
            <a href="mailto:info@techlab.ru" className="text-purple-600 dark:text-purple-400 hover:underline">
              info@techlab.ru
            </a>
            .
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
