FROM node:20-alpine
WORKDIR /usr/src/app

# 依存だけ先に入れてキャッシュ効かせる
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# アプリ本体をコピー
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
