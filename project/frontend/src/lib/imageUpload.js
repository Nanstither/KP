export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
export const ALLOWED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.svg';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return null;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Недопустимый формат изображения. Разрешены: JPG, PNG, WebP, SVG.';
  }

  if (file.size > MAX_SIZE_BYTES) {
    return 'Файл слишком большой. Максимум 2 МБ.';
  }

  return null;
}
