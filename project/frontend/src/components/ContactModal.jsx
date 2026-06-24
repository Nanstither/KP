import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { parseApiError } from "@/lib/parseApiError";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1c] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors";

export default function ContactModal({ isOpen, onClose }) {
  const toast = useToast();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      email: user?.email || prev.email,
    }));
  }, [isOpen, user?.name, user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Сообщение отправлено. Мы ответим в ближайшее время.");
      setForm({ name: "", email: "", subject: "", message: "" });
      onClose();
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setSending(false);
    }
  };

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
            className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Напишите нам</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ответим на ваш email</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder="Как к вам обращаться"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className={inputClass}
                  placeholder="example@mail.ru"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Тема
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={200}
                  className={inputClass}
                  placeholder="Необязательно"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Сообщение *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Опишите ваш вопрос или пожелание..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Отправить
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
