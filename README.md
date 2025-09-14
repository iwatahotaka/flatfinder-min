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

---

## API Reference

> すべての INSERT は **createdAt TIMESTAMP NOT NULL** に **NOW() を明示**（先生ルール）。  
> 認証は Bearer JWT。`/users/register` or `/users/login` で取得。

### Auth & Users

```bash
# POST /users/register
curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123","first_name":"Alice","last_name":"Nguyen"}' | jq .

# POST /users/login
curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq .

# GET /users/me
TOKEN="<paste token here>"
curl -s http://localhost:3000/users/me -H "Authorization: Bearer $TOKEN" | jq .
Flats
bash
コードをコピーする
# POST /flats
curl -s -X POST http://localhost:3000/flats \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"city":"Vancouver","street_name":"Davie St","street_number":"500","area_size":58,"has_ac":true,"year_built":2014,"rent_price":2350,"date_available":"2025-10-15"}' | jq .

# GET /flats
curl -s http://localhost:3000/flats -H "Authorization: Bearer $TOKEN" | jq .

# PATCH /flats/:id
curl -s -X PATCH http://localhost:3000/flats/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rent_price":2290,"has_ac":false}' | jq .
Messages
bash
コードをコピーする
# POST /flats/:id/messages
curl -s -X POST http://localhost:3000/flats/1/messages \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"content":"Hi! Is a viewing possible this weekend?"}' | jq .

# GET /flats/:id/messages
curl -s http://localhost:3000/flats/1/messages \
  -H "Authorization: Bearer $TOKEN" | jq .
Health
bash
コードをコピーする
curl -s http://localhost:3000/ | jq .
curl -s http://localhost:3000/db-ping | jq .

---

## API Reference

> すべての INSERT は **createdAt TIMESTAMP NOT NULL** に **NOW() を明示**（先生ルール）。  
> 認証は Bearer JWT。`/users/register` or `/users/login` で取得。

### Auth & Users

```bash
# POST /users/register
curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123","first_name":"Alice","last_name":"Nguyen"}' | jq .

# POST /users/login
curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq .

# GET /users/me
TOKEN="<paste token here>"
curl -s http://localhost:3000/users/me -H "Authorization: Bearer $TOKEN" | jq .
Flats
bash
コードをコピーする
# POST /flats
curl -s -X POST http://localhost:3000/flats \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"city":"Vancouver","street_name":"Davie St","street_number":"500","area_size":58,"has_ac":true,"year_built":2014,"rent_price":2350,"date_available":"2025-10-15"}' | jq .

# GET /flats
curl -s http://localhost:3000/flats -H "Authorization: Bearer $TOKEN" | jq .

# PATCH /flats/:id
curl -s -X PATCH http://localhost:3000/flats/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rent_price":2290,"has_ac":false}' | jq .
Messages
bash
コードをコピーする
# POST /flats/:id/messages
curl -s -X POST http://localhost:3000/flats/1/messages \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"content":"Hi! Is a viewing possible this weekend?"}' | jq .

# GET /flats/:id/messages
curl -s http://localhost:3000/flats/1/messages \
  -H "Authorization: Bearer $TOKEN" | jq .
Health
bash
コードをコピーする
curl -s http://localhost:3000/ | jq .
curl -s http://localhost:3000/db-ping | jq .
