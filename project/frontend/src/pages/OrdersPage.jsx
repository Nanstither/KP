import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Clock, CheckCircle, Truck, AlertCircle, ArrowLeft,
  CreditCard, MapPin, List, X, ExternalLink, Loader2,
} from "lucide-react";
import api from "@/services/api";
import PrebuiltPcSpecsModal from "@/components/PrebuiltPcSpecsModal";

const ROLE_LABELS = {
  cpu: "Процессор",
  motherboard: "Мат. плата",
  gpu: "Видеокарта",
  ram: "ОЗУ",
  storage: "Накопитель",
  psu: "Блок питания",
  cooler: "Охлаждение",
  case: "Корпус",
};

const TYPE_LABELS = {
  prebuilt: "Готовый ПК",
  custom: "Сборка",
  component: "Компонент",
};

function getItemComponents(item) {
  if (item.components_data?.length) return item.components_data;
  if (Array.isArray(item.components)) return item.components;
  return [];
}

function getOrderItemType(item) {
  if (item.prebuilt_pc_id) return "prebuilt";
  const comps = getItemComponents(item);
  if (comps.length > 1) return "custom";
  if (comps.length === 1) return "component";
  return "unknown";
}

function getLineTotal(item) {
  return Number(item.price || 0) * (item.quantity || 1);
}

function OrderProductBlock({ item, onShowSpecs }) {
  const itemType = getOrderItemType(item);
  const typeLabel = TYPE_LABELS[itemType] || "Товар";
  const canShowSpecs = itemType !== "unknown";
  const specsLabel = itemType === "component" ? "Подробнее" : "Характеристики";
  const compCount = getItemComponents(item).length;

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#0a0a0c] rounded-xl border border-gray-200 dark:border-white/5">
      <div className="flex-1 min-w-0 text-left">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
            {typeLabel}
          </span>
          {(item.quantity || 1) > 1 && (
            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
              x{item.quantity}
            </span>
          )}
          {itemType === "custom" && compCount > 0 && (
            <span className="text-[10px] text-gray-500 dark:text-gray-500">
              {compCount} компонент{compCount === 1 ? "" : compCount < 5 ? "а" : "ов"}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
          {item.name}
        </p>
        <p className="text-sm font-bold text-purple-600 dark:text-purple-300 font-mono mt-1">
          {getLineTotal(item).toLocaleString("ru-RU")} ₽
        </p>
      </div>

      {canShowSpecs && (
        <button
          type="button"
          onClick={() => onShowSpecs(item)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-purple-600/10 hover:text-purple-600 dark:hover:text-purple-300 hover:border-purple-500/30 transition-colors"
          title={specsLabel}
        >
          <List className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{specsLabel}</span>
        </button>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listScope, setListScope] = useState("active");

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [prebuiltPc, setPrebuiltPc] = useState(null);
  const [prebuiltModalOpen, setPrebuiltModalOpen] = useState(false);
  const [specsLoading, setSpecsLoading] = useState(false);

  useEffect(() => {
    loadOrders(listScope);
  }, [listScope]);

  const loadOrders = async (scope) => {
    setLoading(true);
    try {
      const response = await api.get("/orders", { params: { scope } });
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
    } finally {
      setLoading(false);
    }
  };

  const openItemSpecs = async (item) => {
    const itemType = getOrderItemType(item);

    if (itemType === "component") {
      const comps = getItemComponents(item);
      const compId = comps[0]?.component_id || comps[0]?.component?.id;
      if (compId) navigate(`/components/${compId}`);
      return;
    }

    if (itemType === "prebuilt" && item.prebuilt_pc_id) {
      setSpecsLoading(true);
      setPrebuiltPc(null);
      setPrebuiltModalOpen(true);
      try {
        const res = await api.get("/prebuilt-pcs");
        const pc = (res.data || []).find((p) => p.id === item.prebuilt_pc_id);
        setPrebuiltPc(pc || { id: item.prebuilt_pc_id, name: item.name, components: {} });
      } catch (err) {
        console.error("Ошибка загрузки характеристик ПК:", err);
        setPrebuiltPc({ id: item.prebuilt_pc_id, name: item.name, components: {} });
      } finally {
        setSpecsLoading(false);
      }
      return;
    }

    if (itemType === "custom") {
      setSelectedOrderItem(item);
      setCustomModalOpen(true);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { label: "Ожидает оплаты", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Clock };
      case "paid":
        return { label: "Оплачен", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: CheckCircle };
      case "preparing":
        return { label: "Готовится", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Package };
      case "shipped":
        return { label: "Отправлен", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: Truck };
      case "delivered":
        return { label: "Доставлен", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: CheckCircle };
      case "cancelled":
        return { label: "Отменён", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertCircle };
      default:
        return { label: status, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/30", icon: Package };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const customComponents = selectedOrderItem ? getItemComponents(selectedOrderItem) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] text-gray-800 dark:text-gray-200 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в профиль
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            Мои заказы
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {listScope === "active"
              ? "Текущие заказы в обработке и доставке"
              : "Завершённые и отменённые заказы"}
          </p>
        </motion.div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setListScope("active")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              listScope === "active"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Активные
          </button>
          <button
            type="button"
            onClick={() => setListScope("archive")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              listScope === "archive"
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Завершённые
          </button>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl"
          >
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {listScope === "active" ? "Нет активных заказов" : "Нет завершённых заказов"}
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              {listScope === "active"
                ? "Оформите заказ в каталоге — он появится здесь"
                : "Здесь будут доставленные и отменённые заказы"}
            </p>
            {listScope === "active" && (
              <button
                type="button"
                onClick={() => navigate("/catalog")}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Перейти в каталог
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-white/10 rounded-xl p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Заказ #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        Товары
                        {order.items?.length > 0 && (
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-500">
                            ({order.items.length})
                          </span>
                        )}
                      </p>
                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <OrderProductBlock
                              key={item.id}
                              item={item}
                              onShowSpecs={openItemSpecs}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500 p-3 bg-gray-50 dark:bg-[#0a0a0c] rounded-xl">
                            Нет данных
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        Доставка
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        {order.delivery_address ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">СДЭК</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.delivery_address}
                            </p>
                            {order.cdek_code && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Код ПВЗ: {order.cdek_code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500">Нет данных</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        Оплата
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-300">
                          {typeof order.total_amount === "number"
                            ? order.total_amount.toLocaleString("ru-RU")
                            : Number(order.total_amount || 0).toLocaleString("ru-RU")}{" "}
                          ₽
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Оплачено онлайн
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Получатель
                      </p>
                      <div className="bg-gray-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-900 dark:text-white">{order.recipient_name}</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.recipient_phone}</p>
                          {order.recipient_email && (
                            <p className="text-gray-600 dark:text-gray-400">{order.recipient_email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.comment && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Комментарий к заказу
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#0a0a0c] rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        {order.comment}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <PrebuiltPcSpecsModal
        pc={prebuiltPc}
        isOpen={prebuiltModalOpen && !specsLoading && !!prebuiltPc}
        onClose={() => {
          setPrebuiltModalOpen(false);
          setPrebuiltPc(null);
        }}
      />

      {specsLoading && prebuiltModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        </div>
      )}

      <AnimatePresence>
        {customModalOpen && selectedOrderItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setCustomModalOpen(false)}
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
                onClick={() => setCustomModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedOrderItem.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Состав сборки</p>
              </div>

              <div className="space-y-2">
                {customComponents.map((comp, idx) => {
                  const component = comp.component;
                  if (!component) return null;
                  const quantity = comp.quantity || 1;
                  const roleLabel =
                    ROLE_LABELS[comp.role] ||
                    component.category?.name ||
                    "Компонент";

                  return (
                    <div
                      key={comp.id || idx}
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
                            onClick={() => setCustomModalOpen(false)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Итого:</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-300">
                  {getLineTotal(selectedOrderItem).toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
