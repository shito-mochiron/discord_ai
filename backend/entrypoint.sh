#!/bin/sh

# データベースが起動するまで待機
echo "🔍 データベースの起動を待機中..."
sleep 15

# Prisma generateを実行
echo "🌱 Prisma generateを実行中..."
npx prisma generate

# 環境に基づいてマイグレーションコマンドを選択
echo "🚀 データベースマイグレーションを実行中..."
if [ "$NODE_ENV" = "production" ]; then
  # 本番環境用
  npx prisma migrate deploy
else
  # 開発環境用
  npx prisma migrate dev
fi

# 環境に基づいて起動コマンドを選択
echo "🚀 NestJSアプリケーションを起動中..."
if [ "$NODE_ENV" = "production" ]; then
  # 本番環境用
  npm run start:prod
else
  # 開発環境用
  npm run start
fi
