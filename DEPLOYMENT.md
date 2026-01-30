# Публикация проекта на Yandex Cloud

Инструкция по деплою приложения «Скриншотница» в Yandex Object Storage.

## Что потребуется

- [x] Проект (собран Figma Make)
- [x] Репозиторий GitHub: https://github.com/khasanovska/design-project-01/
- [x] Бакет Object Storage: `design-projects`
- [x] Ключи сервисного аккаунта

---

## Шаг 1. Подготовка бакета

1. Откройте [консоль Yandex Cloud](https://console.yandex.cloud) → Object Storage → бакет `design-projects`.

2. **Публичный доступ:**
   - Вкладка «Настройки» → «Публичный доступ к списку объектов» → **Публичный**.

3. **Статический хостинг:**
   - Вкладка «Настройки» → «Сайт».
   - Включите хостинг.
   - Главная страница: `index.html`
   - Страница ошибки: `index.html` (для SPA и React Router).

4. **CORS** (если нужны запросы с других доменов):
   - Вкладка «Настройки» → «CORS».
   - Добавьте правило с разрешёнными origin.

---

## Шаг 2. Установка AWS CLI

Yandex Object Storage поддерживает S3-совместимый API. Используется AWS CLI:

```bash
# macOS (Homebrew)
brew install awscli

# или через pip
pip install awscli
```

---

## Шаг 3. Переменные окружения

Получите ключи сервисного аккаунта в консоли Yandex Cloud и задайте переменные:

```bash
export AWS_ACCESS_KEY_ID="ваш_access_key_id"
export AWS_SECRET_ACCESS_KEY="ваш_secret_access_key"
```

Для постоянного использования добавьте в `~/.zshrc` или `~/.bashrc`.

---

## Шаг 4. Сборка и деплой

```bash
# Установка зависимостей (если ещё не сделано)
pnpm install

# Запуск скрипта деплоя
./deploy.sh
```

Скрипт:

- собирает проект (`pnpm run build`);
- загружает содержимое `dist/` в бакет `design-projects`;
- задаёт корректные заголовки кеширования.

---

## Шаг 5. Проверка

Сайт будет доступен по адресу:

**https://design-projects.website.yandexcloud.net**

---

## Свой домен (опционально)

1. В настройках бакета → «Сайт» укажите свой домен.
2. В DNS провайдере добавьте CNAME-запись:
   - Имя: `www` (или поддомен)
   - Значение: `design-projects.website.yandexcloud.net`

Документация: [Подключение своего домена к Object Storage](https://yandex.cloud/en/docs/storage/operations/hosting/own-domain)

---

## GitHub Actions (автодеплой)

Можно настроить деплой при push в репозиторий.

1. В GitHub: Settings → Secrets and variables → Actions.
2. Добавьте секреты:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
3. Создайте workflow по примеру ниже.

Workflow уже создан в `.github/workflows/deploy.yml`.

---

## Устранение проблем

| Проблема | Решение |
|----------|---------|
| 403 Forbidden | Проверьте публичный доступ и права сервисного аккаунта |
| 404 на подстраницах | Страница ошибки бакета должна быть `index.html` |
| Старая версия после деплоя | Очистите кеш браузера или используйте Ctrl+Shift+R |
