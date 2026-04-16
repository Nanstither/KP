import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

function CatalogPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await api.get('/components');
        setComponents(response.data);
      } catch (error) {
        console.error('❌ Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-950 via-purple-950/20 to-pink-950/20">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-purple-300 mb-8">Каталог компонентов</h1>
        
        {loading ? (
          <div className="text-purple-300 text-center">Загрузка...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-purple-950/30 border border-purple-400/20 backdrop-blur-xl p-6"
              >
                <h3 className="text-xl font-bold text-purple-200 mb-2">{component.model}</h3>
                <p className="text-purple-300/70 mb-4">{component.category?.name}</p>
                <p className="text-2xl font-bold text-purple-400">{component.price} ₽</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;