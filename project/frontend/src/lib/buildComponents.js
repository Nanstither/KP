export const ROLE_LABELS = {
  cpu: "Процессор",
  motherboard: "Мат. плата",
  gpu: "Видеокарта",
  ram: "ОЗУ",
  storage: "Накопитель",
  psu: "Блок питания",
  cooler: "Охлаждение",
  case: "Корпус",
};

/** Преобразует components из formatPc (объект по ролям) в массив для модалки */
export function prebuiltComponentsToList(componentsByRole) {
  if (!componentsByRole || typeof componentsByRole !== "object") return [];
  return Object.entries(componentsByRole).map(([role, data]) => ({
    role,
    quantity: 1,
    component: {
      id: data.id,
      model: data.model,
      price: data.price,
      category: data.category ? { name: data.category, slug: role } : { name: ROLE_LABELS[role] || role, slug: role },
    },
  }));
}

/** Нормализация cart_item_components для модалки */
export function cartItemComponentsToList(item) {
  if (!item?.components?.length) return [];
  return item.components.map((cic) => ({
    id: cic.id,
    role: cic.role || cic.component?.category?.slug,
    quantity: cic.quantity || 1,
    component: cic.component,
  }));
}
