# FlatFinder MIN (MySQL + Express + Docker)

## 起動
docker compose up --build -d

## 動作確認
curl -s http://localhost:3000/ | jq .
curl -s http://localhost:3000/db-ping | jq .

## Adminer
- URL: http://localhost:8080
- System: MySQL
- Server: mysql
- User: root
- Pass: rootpassword
- DB: mydb

## 先生ルール
- すべてのテーブルに `createdAt TIMESTAMP NOT NULL`
- INSERT 時は必ず `NOW()` を明示する
