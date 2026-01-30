#!/bin/bash
# Скрипт деплоя проекта «Скриншотница» в Yandex Object Storage
# Требует: AWS CLI (для S3-совместимого API), переменные окружения

set -e

BUCKET="design-projects"
ENDPOINT="https://storage.yandexcloud.net"
DIST_DIR="dist"

echo "📦 Сборка проекта..."
pnpm run build

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Папка dist не найдена. Проверьте сборку."
  exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "❌ Установите переменные окружения:"
  echo "   export AWS_ACCESS_KEY_ID=ваш_ключ"
  echo "   export AWS_SECRET_ACCESS_KEY=ваш_секретный_ключ"
  exit 1
fi

echo "📤 Загрузка файлов в бакет $BUCKET..."

# Сначала загружаем все файлы
aws s3 sync "$DIST_DIR/" "s3://$BUCKET/" \
  --endpoint-url "$ENDPOINT" \
  --delete \
  --acl public-read

# Перезаписываем index.html с коротким кешем (важно для SPA)
aws s3 cp "$DIST_DIR/index.html" "s3://$BUCKET/index.html" \
  --endpoint-url "$ENDPOINT" \
  --acl public-read \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, no-store, must-revalidate"

echo "✅ Деплой завершён!"
echo ""
echo "Сайт доступен по адресу:"
echo "  https://$BUCKET.website.yandexcloud.net"
echo ""
echo "Или (если настроен свой домен):"
echo "  https://ваш-домен.ru"
