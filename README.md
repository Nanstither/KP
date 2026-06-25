# PC Builder Shop - Интернет-магазин компьютерных комплектующих

## Описание проекта

Полнофункциональный интернет-магазин компьютерных комплектующих и готовых ПК с возможностью сборки собственных конфигураций через онлайн-конфигуратор.

## Архитектура проекта

### Backend (Laravel 13 + PHP 8.3)

- **Фреймворк**: Laravel 13.x
- **Аутентификация**: Laravel Sanctum
- **База данных**: SQLite (по умолчанию)
- **API**: RESTful API

### Frontend (React 19 + Vite)

- **Библиотека**: React 19.x
- **Сборщик**: Vite 8.x
- **Стили**: TailwindCSS 4.x
- **Роутинг**: React Router DOM 7.x
- **HTTP клиент**: Axios
- **Анимации**: Framer Motion
- **Иконки**: Lucide React

## Функциональность

### Для пользователей:

- Просмотр каталога компонентов и готовых ПК
- Фильтрация и поиск товаров
- Конфигуратор сборки ПК (проверка совместимости)
- Корзина (поддержка гостей и авторизованных пользователей)
- Оформление заказов
- Личный кабинет с историей заказов
- База знаний о комплектующих

### Для администраторов/менеджеров:

- Панель управления (Dashboard)
- CRUD компонентов
- CRUD готовых ПК
- Управление заказами (смена статусов)
- Управление пользователями
- Настройки системы

## Структура проекта

```
project/
├── backend/                    # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── CartController.php
│   │   │   ├── ComponentController.php
│   │   │   ├── OrderController.php
│   │   │   ├── PrebuiltPcController.php
│   │   │   └── UserController.php
│   │   └── Models/            # Eloquent модели
│   ├── database/
│   │   ├── migrations/        # Миграции БД
│   │   │   └── ...
│   │   └── seeders/           # Сидеры данных
│   ├── routes/
│   │   └── api.php            # API маршруты
│   └── composer.json
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── components/        # Переиспользуемые компоненты
    │   ├── pages/             # Страницы приложения
    │   │   ├── admin/         # Админ-панель
    │   │   └── ...
    │   ├── context/           # React контексты (AuthContext)
    │   ├── services/          # API сервисы
    │   └── lib/               # Утилиты и конфиги
    └── package.json
```

## Установка и запуск

### Требования

- PHP >= 8.3
- Composer
- Node.js >= 18
- npm

### Backend

```bash
cd project/backend

# Установка зависимостей
composer install

# Копирование .env файла
cp .env.example .env

# Генерация ключа приложения
php artisan key:generate

# Создание базы данных и миграции
php artisan migrate --force

# Заполнение базы данных (опционально)
php artisan db:seed

# Запуск сервера разработки
php artisan serve
```

### Frontend

```bash
cd project/frontend

# Установка зависимостей
npm install

# Запуск сервера разработки (прокси на backend: http://localhost:8000)
npm run dev

# Сборка для продакшена
npm run build
```

## API Endpoints

### Публичные маршруты

- `POST /api/register` - Регистрация
- `POST /api/login` - Вход
- `GET /api/components` - Список компонентов
- `GET /api/components/{id}` - Детали компонента
- `GET /api/prebuilt-pcs` - Список готовых ПК
- `GET /api/prebuilt-pcs/{slug}` - Детали готового ПК
- `GET /api/cart` - Корзина
- `POST /api/cart` - Добавить в корзину
- `PUT /api/cart/{id}` - Обновить корзину
- `DELETE /api/cart/{id}` - Удалить из корзины

### Защищённые маршруты (auth:sanctum)

- `GET /api/me` - Текущий пользователь
- `POST /api/logout` - Выход
- `PUT /api/profile` - Обновление профиля
- `GET /api/orders` - Заказы пользователя
- `GET /api/orders/{id}` - Детали заказа
- `POST /api/orders` - Создать заказ

### Админ-панель (role: admin)

- `GET /api/users` - Список пользователей
- `PUT /api/users/{user}/role` - Изменить роль
- `DELETE /api/users/{user}` - Удалить пользователя
- `GET /api/admin/refs/{type}` - Справочники
- `POST /api/admin/refs/{type}` - Создать запись справочника
- `PUT /api/admin/refs/{type}/{id}` - Обновить справочник
- `DELETE /api/admin/refs/{type}/{id}` - Удалить из справочника

### Менеджер + Админ (role: manager)

- `GET /api/admin/orders` - Все заказы
- `PATCH /api/admin/orders/{orderId}/status` - Статус заказа
- `PATCH /api/admin/components/{component}` - Обновить компонент
- `DELETE /api/admin/components/{component}` - Удалить компонент
- `POST /api/admin/components` - Создать компонент
- `GET /api/admin/prebuilt-pcs` - Готовые ПК
- `POST /api/admin/prebuilt-pcs` - Создать готовый ПК
- `PUT /api/admin/prebuilt-pcs/{id}` - Обновить готовый ПК
- `DELETE /api/admin/prebuilt-pcs/{id}` - Удалить готовый ПК

## Роли пользователей


| Роль      | Права доступа                                  |
| --------- | ---------------------------------------------- |
| `user`    | Покупка, просмотр, сборка ПК                   |
| `manager` | Управление заказами, компонентами, готовыми ПК |
| `admin`   | Полный доступ + управление пользователями      |


## Основные модели данных

### Компоненты

- Component - основной товар
- ComponentCategory - категория компонента
- Brand - бренд
- CpuSpec, GpuSpec, RamSpec, StorageSpec, etc. - спецификации

### Пользователи и заказы

- User - пользователь
- Cart - корзина
- CartItem - элемент корзины
- Order - заказ
- OrderItem - элемент заказа

### Готовые ПК

- PrebuiltPc - готовая сборка
- PrebuiltPcComponent - компоненты в сборке
- Tag - теги
- PrebuiltPcTag - связь ПК и тегов

## Аутентификация

Проект использует Laravel Sanctum для API аутентификации:

- Сессионная аутентификация для SPA
- CSRF защита
- Поддержка гостевых корзин через X-Session-ID

## UI/UX

- Адаптивный дизайн (TailwindCSS)
- Анимации переходов (Framer Motion)
- Интуитивная навигация
- Современный интерфейс админ-панели

## Лицензия

MIT License

---

**Разработано с использованием:**

- [Laravel](https://laravel.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)

