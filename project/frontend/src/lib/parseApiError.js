const MESSAGE_MAP = [
  {
    test: (msg) => /image field must be a file of type/i.test(msg),
    ru: 'Недопустимый формат изображения. Разрешены: JPG, PNG, WebP, SVG.',
  },
  {
    test: (msg) => /image field must not be greater than/i.test(msg),
    ru: 'Файл слишком большой. Максимум 2 МБ.',
  },
  {
    test: (msg) => /model field is required/i.test(msg),
    ru: 'Укажите модель компонента.',
  },
  {
    test: (msg) => /category id field is required/i.test(msg),
    ru: 'Выберите категорию.',
  },
  {
    test: (msg) => /brand id field is required/i.test(msg),
    ru: 'Выберите бренд.',
  },
  {
    test: (msg) => /price field is required/i.test(msg),
    ru: 'Укажите цену.',
  },
  {
    test: (msg) => /stock field is required/i.test(msg),
    ru: 'Укажите наличие.',
  },
  {
    test: (msg) => /name field is required/i.test(msg),
    ru: 'Укажите имя.',
  },
  {
    test: (msg) => /email field is required/i.test(msg),
    ru: 'Укажите email.',
  },
  {
    test: (msg) => /email field must be a valid email/i.test(msg),
    ru: 'Укажите корректный email.',
  },
  {
    test: (msg) => /message field is required/i.test(msg),
    ru: 'Напишите сообщение.',
  },
  {
    test: (msg) => /message field must be at least/i.test(msg),
    ru: 'Сообщение должно содержать не менее 10 символов.',
  },
  {
    test: (msg) => /too many attempts/i.test(msg),
    ru: 'Слишком много попыток. Подождите минуту и попробуйте снова.',
  },
];

function translateMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }
  const match = MESSAGE_MAP.find(({ test }) => test(message));
  return match ? match.ru : null;
}

function extractRawMessage(error) {
  const data = error?.response?.data;
  if (!data) {
    return error?.message || null;
  }

  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return data.message || null;
}

export function parseApiError(error) {
  const raw = extractRawMessage(error);
  if (!raw) {
    return 'Произошла ошибка. Попробуйте ещё раз.';
  }

  const translated = translateMessage(raw);
  if (translated) {
    return translated;
  }

  if (/[а-яА-ЯёЁ]/.test(raw)) {
    return raw;
  }

  return 'Произошла ошибка. Попробуйте ещё раз.';
}
