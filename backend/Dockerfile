# Node.jsの公式イメージをベースにする
FROM node:18

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# ポートを開放
EXPOSE 3000

# アプリを起動
CMD ["npm", "run", "start"]
