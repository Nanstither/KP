import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Search, Check, CreditCard, Truck, Package, ArrowLeft, Building2, Phone, User, Clock } from "lucide-react";
import api from "@/services/api";
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/lib/parseApiError';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 - доставка, 2 - оплата, 3 - подтверждение
  const [selectedPickpoint, setSelectedPickpoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickpoints, setPickpoints] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Данные формы получателя
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    comment: ""
  });

  // Данные карты
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: ""
  });

  useEffect(() => {
    loadCart();
    loadCdekPickpoints();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Ошибка загрузки корзины:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCdekPickpoints = () => {
    // Имитация данных ПВЗ СДЕК
    const mockPickpoints = [
      { id: 1, name: "СДЭК ул. Ленина", address: "ул. Ленина, 45", city: "Москва", hours: "09:00-21:00", lat: 55.7558, lng: 37.6173 },
      { id: 2, name: "СДЭК ТЦ Плаза", address: "пр. Мира, 12", city: "Москва", hours: "10:00-22:00", lat: 55.7658, lng: 37.6273 },
      { id: 3, name: "СДЭК ул. Пушкина", address: "ул. Пушкина, 8", city: "Москва", hours: "09:00-20:00", lat: 55.7458, lng: 37.6073 },
      { id: 4, name: "СДЭК Бизнес-центр", address: "ул. Тверская, 25", city: "Москва", hours: "08:00-20:00", lat: 55.7608, lng: 37.6123 },
      { id: 5, name: "СДЭК Почтамт", address: "ул. Почтовая, 3", city: "Москва", hours: "09:00-19:00", lat: 55.7508, lng: 37.6223 },
    ];
    setPickpoints(mockPickpoints);
  };

  const filteredPickpoints = pickpoints.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectPickpoint = (pickpoint) => {
    setSelectedPickpoint(pickpoint);
    setFormData(prev => ({ ...prev, address: `${pickpoint.name}, ${pickpoint.address}` }));
    setShowMapModal(false);
  };

  const handleSubmitOrder = async () => {
    if (!selectedPickpoint) {
      toast.warning("Выберите пункт выдачи");
      return;
    }
    if (!formData.name || !formData.phone) {
      toast.warning("Заполните обязательные поля");
      return;
    }

    setProcessing(true);
    try {
      // Используем компоненты напрямую из корзины (cart_item_components)
      const itemsWithComponents = (cart?.items || []).map((item) => {
        let componentsArray = [];
        
        // Если это готовый ПК или кастомная сборка и есть компоненты в корзине, используем их
        if ((item.type === 'prebuilt' || item.type === 'custom') && item.components && Array.isArray(item.components)) {
          // Преобразуем массив компонентов из корзины в формат для отправки: { component_id, price, quantity, role }
          componentsArray = item.components.map(comp => {
            // comp - это объект CartItemComponent, который имеет поля:
            // component_id, price_snapshot, quantity, role, и связанную модель component
            const componentId = comp.component_id;
            const price = Number(comp.price_snapshot || 0);
            const quantity = comp.quantity || 1;
            const role = comp.role || null;
            
            return {
              component_id: componentId,
              price: price,
              quantity: quantity,
              role: role,
            };
          });
        }
        
        return {
          cart_item_id: item.id, // Добавляем ID элемента корзины
          prebuilt_pc_id: item.type === 'prebuilt' ? (item.prebuilt_pc_id || item.prebuilt_id) : null,
          name: item.name || item.product_name,
          quantity: item.quantity || 1,
          price: Number(item.price || item.total_price || 0),
          components: componentsArray,
        };
      });

      // Формируем данные для отправки на бэкенд
      const orderPayload = {
        recipient_name: formData.name,
        recipient_phone: formData.phone,
        recipient_email: formData.email || null,
        delivery_address: selectedPickpoint.address,
        delivery_type: 'pickup',
        cdek_code: selectedPickpoint.id?.toString() || null,
        items: itemsWithComponents,
      };

      // Отправляем заказ на бэкенд
      const response = await api.post('/orders', orderPayload);
      const order = response.data.order || response.data;

      setOrderData(order);
      setStep(3);
      toast.success('Заказ успешно оформлен');

      // Очищаем корзину на бэкенде
      if (cart?.items) {
        for (const item of cart.items) {
          try {
            await api.delete(`/cart/${item.id}`);
          } catch (err) {
            console.error("Ошибка очистки корзины:", err);
          }
        }
      }
    } catch (err) {
      console.error("Ошибка оформления заказа:", err);
      toast.error(parseApiError(err));
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = cart?.items?.reduce((sum, item) => sum + Number(item.total_price || 0), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в корзину
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Оформление заказа</h1>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Доставка" },
              { num: 2, label: "Оплата" },
              { num: 3, label: "Подтверждение" }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s.num 
                    ? "border-purple-500 bg-purple-500 text-white" 
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= s.num ? "text-purple-600 dark:text-purple-300" : "text-gray-400"
                }`}>
                  {s.label}
                </span>
                {idx < 2 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    step > s.num ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-500" />
                Способ доставки
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Пункт выдачи СДЭК
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по названию, адресу или городу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowMapModal(true)}
                className="w-full mb-4 py-3 border-2 border-dashed border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Показать на карте
              </button>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredPickpoints.map(p => (
                  <div
                    key={p.id}
                    onClick={() => selectPickpoint(p)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPickpoint?.id === p.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                        : "border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{p.address}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{p.city}</p>
                      </div>
                      {selectedPickpoint?.id === p.id && (
                        <Check className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <Clock className="w-3 h-3" />
                      {p.hours}
                    </div>
                  </div>
                ))}
              </div>

              {selectedPickpoint && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✅ Выбран: <strong>{selectedPickpoint.name}</strong>, {selectedPickpoint.address}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Данные получателя
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ФИО *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Иванов Иван Иванович"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Телефон *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 000-00-00"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.ru"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Комментарий к заказу
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Пожелания к доставке..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedPickpoint || !formData.name || !formData.phone}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Продолжить →
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                Оплата заказа
              </h2>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Введите данные банковской карты для оплаты
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Номер карты
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Срок действия
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardData(prev => ({ ...prev, expiry: value }));
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVC/CVV
                      </label>
                      <input
                        type="password"
                        value={cardData.cvc}
                        onChange={(e) => setCardData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Товары:</span>
                  <span>{totalPrice.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Доставка:</span>
                  <span className="text-green-600 dark:text-green-400">Бесплатно</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/10">
                  <span>К оплате:</span>
                  <span className="text-purple-600 dark:text-purple-300">{totalPrice.toLocaleString()} ₽</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                ← Назад
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={processing || !cardData.number || !cardData.expiry || !cardData.cvc}
                className="flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Обработка...
                  </>
                ) : (
                  <>
                    Оплатить {totalPrice.toLocaleString()} ₽
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && orderData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Заказ оформлен!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Номер заказа: <strong>#{orderData.id}</strong>
              </p>

              <div className="text-left bg-gray-50 dark:bg-[#0a0a0c] rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Товаров:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{orderData.items?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Доставка:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {orderData.delivery_address || orderData.delivery?.name || selectedPickpoint?.name || "Пункт выдачи СДЭК"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {orderData.delivery_address || orderData.delivery?.address || selectedPickpoint?.address || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Оплачено:</p>
                    <p className="font-semibold text-purple-600 dark:text-purple-300">{(orderData.total_amount || orderData.total || totalPrice).toLocaleString()} ₽</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Мы отправили подтверждение на вашу почту. Менеджер свяжется с вами в ближайшее время.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-colors"
                >
                  В профиль
                </button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="flex-1 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  В каталог
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {showMapModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowMapModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-[#141416] border border-purple-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white z-10"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Выберите пункт выдачи СДЭК
            </h3>

            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center mb-4">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Здесь будет интерактивная карта СДЭК</p>
                <p className="text-sm">Для реальной интеграции используйте виджет СДЭК</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500">
              Выберите пункт из списка выше или нажмите на карту (функционал в разработке)
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
