/** Форматирует ввод телефона в вид +7 (999) 000-00-00 */
export function formatPhoneInput(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length > 0 && !digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  if (!digits.length) return '';

  const local = digits.slice(1);
  let out = '+7';

  if (local.length > 0) out += ` (${local.slice(0, 3)}`;
  if (local.length >= 3) {
    out = `+7 (${local.slice(0, 3)})`;
    if (local.length > 3) out += ` ${local.slice(3, 6)}`;
  }
  if (local.length >= 6) out += `-${local.slice(6, 8)}`;
  if (local.length >= 8) out += `-${local.slice(8, 10)}`;

  return out;
}

/** Форматирует номер карты группами по 4 цифры */
export function formatCardNumberInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** Форматирует срок действия карты MM/YY */
export function formatCardExpiryInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Проверяет, что в телефоне достаточно цифр для РФ */
export function isPhoneComplete(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
}
