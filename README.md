    # Nuxt Minimal Starter

# Как я бы развернул на PROD

## Предварительные требования

- Node.js 16+
- npm
- SSH доступ к серверу
- Домен (опционально)

## Шаги деплоя

### 1. Подготовка проекта

```bash
# Проверка сборки локально
npm run build
```

### 2. Настройка сервера

```bash
# Подключение к серверу
ssh user@server_ip

# Установка зависимостей
apt update
apt install nodejs npm
npm install -g pm2
```

### 3. Деплой кода

```bash
# Создание директории
mkdir -p /var/www/nuxt-app
cd /var/www/nuxt-app

# Клонирование репозитория
git clone <repo_url> .
# или копирование файлов
# scp -r ./* user@server_ip:/var/www/nuxt-app/

# Установка зависимостей и сборка
npm install
npm run build
```

### 4. Запуск приложения

```bash
# Запуск через PM2
pm2 start npm --name "nuxt-app" -- start

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

### 5. Настройка Nginx

```bash
# Установка
apt install nginx

# Конфигурация
cat > /etc/nginx/sites-available/nuxt-app << EOF
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активация
ln -s /etc/nginx/sites-available/nuxt-app /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. SSL (если нужно)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

## Обновление приложения

```bash
cd /var/www/nuxt-app
git pull
npm install
npm run build
pm2 restart nuxt-app
```

## Проверка

- Открваем сайт в браузере
- Проверяем логи: `pm2 logs nuxt-app`

# Пояснение к архитектуре проекта

## Общая структура

Для реализации проекта была выбрана модульная архитектура с чётким разделением ответственности между компонентами
системы.

## Ключевые решения

### Аутентификация

- **store/auth.ts** - отдельное хранилище для состояния аутентификации
- **components/Login.vue, Account.vue** - компоненты интерфейса
- **users.json** - хранение данных пользователей

Реализовал аутентификацию через отдельный store для простоты масштабирования и возможности добавления различных
провайдеров авторизации.

### Маршрутизация

- **plugins/router.ts**
- **app/router.options.ts**

Вынес настройки маршрутизации в отдельные файлы для лучшей организации и возможности легко добавлять middleware для
защиты маршрутов.

### Работа с данными

- **store/products.ts**
- **products.json**

В реальном проекте эти данные были бы получены через API.

### Стилизация

- **assets/styles/styles.sass**

## Дальнейшие улучшения

Если бы это был реальный проект, мне бы следовало:

1. Подключить реальный бэкенд с API
2. Добавить тесты
3. Настроить CI/CD для автоматического деплоя
4. Улучшить UX компоненты авторизации и работы с продуктами
5. Внедрить удобства для разработки:
    - Сокращение обращения к объектам через плагины ($router, $route, $t(i18n)) и другим константам, например к именам
      маршрутов ($routenames)
    - Создание самих структурированных файлов констант (RouteNames.ts, Endpoints.ts, ValidationMessages.ts)
    - Настройка автоимпорты для компонентов и хелперов
6. Реорганизовать структуру для большей масштабируемости

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
