const SKIP_KEYS = new Set(['id', 'created_at', 'updated_at', 'component_id']);

const RELATION_ID_MAP = {
  socket_id: { rel: 'socket', label: 'Сокет' },
  ram_type_id: { rel: 'ram_type', label: 'Тип ОЗУ' },
  form_factor_id: { rel: 'form_factor', label: 'Форм-фактор' },
  case_type_id: { rel: 'case_type', label: 'Тип корпуса' },
  material_id: { rel: 'material', label: 'Материал' },
  vram_type_id: { rel: 'vram_type', label: 'Тип видеопамяти' },
};

const RELATION_OBJECT_KEYS = new Set(Object.values(RELATION_ID_MAP).map((r) => r.rel));

const FIELD_LABELS = {
  cores: 'Ядра',
  threads: 'Потоки',
  base_clock_mhz: 'Базовая частота (МГц)',
  boost_clock_mhz: 'Буст частота (МГц)',
  tdp_watts: 'TDP (Вт)',
  vram_gb: 'Объём VRAM (ГБ)',
  memory_bus_bit: 'Разрядность шины (бит)',
  length_mm: 'Длина (мм)',
  width_mm: 'Ширина (мм)',
  height: 'Высота (мм)',
  pcie_slots_required: 'Занимаемых слотов PCIe',
  pcie_gen: 'Версия PCIe',
  power_requires: 'Доп. питание',
  total_capacity_gb: 'Объём (ГБ)',
  speed_mhz: 'Частота (МГц)',
  type: 'Тип',
  latency_cl: 'Тайминги (CL)',
  modules_count: 'Количество модулей',
  ram_slots: 'Слоты ОЗУ',
  m2_slots: 'Слоты M.2',
  pcie_x16_slots: 'Слоты PCIe x16',
  sata_ports: 'SATA-порты',
  wattage: 'Мощность (Вт)',
  efficiency: 'Сертификат 80 Plus',
  modularity: 'Модульность',
  pcie_cables_count: 'Кабелей PCIe',
  pcie_cable_type: 'Тип кабелей PCIe',
  capacity_gb: 'Объём (ГБ)',
  read_speed_mbps: 'Скорость чтения (МБ/с)',
  write_speed_mbps: 'Скорость записи (МБ/с)',
  tdp_rating_watts: 'Рассеиваемая мощность (Вт)',
  fan_count: 'Количество вентиляторов',
  top_fan_slots: 'Слоты для верхних вентиляторов',
  fans_included: 'Вентиляторов в комплекте',
  drive_bays_3_5: 'Отсеки 3.5"',
  drive_bays_2_5: 'Отсеки 2.5"',
  front_usb_a: 'USB-A спереди',
  front_usb_c: 'USB-C спереди',
  front_audio_jack: 'Аудиоразъём спереди',
  max_length_gpu: 'Макс. длина видеокарты (мм)',
  length: 'Длина (мм)',
  width: 'Ширина (мм)',
};

function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  return value;
}

/** Преобразует объект specs API в пары { label, value } для отображения */
export function formatComponentSpecs(specs, componentId) {
  if (!specs || typeof specs !== 'object') return [];

  const result = [];

  if (componentId != null) {
    result.push({ label: 'Номер товара', value: componentId });
  }

  for (const [idKey, { rel, label }] of Object.entries(RELATION_ID_MAP)) {
    const relObj = specs[rel];
    const name = relObj?.name;
    if (name) {
      result.push({ label, value: name });
    }
  }

  for (const [key, value] of Object.entries(specs)) {
    if (value === null || value === undefined) continue;
    if (SKIP_KEYS.has(key)) continue;
    if (key.endsWith('_id')) continue;
    if (RELATION_OBJECT_KEYS.has(key)) continue;
    if (typeof value === 'object') continue;

    result.push({
      label: FIELD_LABELS[key] || key,
      value: formatValue(value),
    });
  }

  return result;
}
