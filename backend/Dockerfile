# Node.jsの公式イメージをベースにする
FROM node:22

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# entrypoint.sh をコピーし、実行権限を設定
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# ポートを開放
EXPOSE 3000

# アプリを起動
ENTRYPOINT ["/app/entrypoint.sh"]
