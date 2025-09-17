# FlatFinder MIN (MySQL + Express + Docker)

## 🚀 Start the App
```bash
docker compose up --build -d
✅ Health Check
bash
コードをコピーする
curl -s http://localhost:3000/ | jq .
curl -s http://localhost:3000/db-ping | jq .
🛢 Adminer
URL: http://localhost:8080

System: MySQL

Server: mysql

User: root

Pass: rootpassword

DB: mydb

📌 Teacher's Rule
Every table must have createdAt TIMESTAMP NOT NULL

All INSERT statements must explicitly use NOW() for createdAt

📚 API Reference
All INSERT statements must explicitly set
createdAt TIMESTAMP NOT NULL with NOW() (teacher’s rule).
Authentication uses Bearer JWT — get a token from /users/register or /users/login.

👤 Auth & Users
bash
コードをコピーする
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
curl -s http://localhost:3000/users/me \
  -H "Authorization: Bearer $TOKEN" | jq .
🏢 Flats
bash
コードをコピーする
# POST /flats
curl -s -X POST http://localhost:3000/flats \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"city":"Vancouver","street_name":"Davie St","street_number":"500","area_size":58,"has_ac":true,"year_built":2014,"rent_price":2350,"date_available":"2025-10-15"}' | jq .

# GET /flats
curl -s http://localhost:3000/flats \
  -H "Authorization: Bearer $TOKEN" | jq .

# PATCH /flats/:id
curl -s -X PATCH http://localhost:3000/flats/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rent_price":2290,"has_ac":false}' | jq .
💬 Messages
bash
コードをコピーする
# POST /flats/:id/messages
curl -s -X POST http://localhost:3000/flats/1/messages \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"content":"Hi! Is a viewing possible this weekend?"}' | jq .

# GET /flats/:id/messages
curl -s http://localhost:3000/flats/1/messages \
  -H "Authorization: Bearer $TOKEN" | jq .
💓 Health
bash
コードをコピーする
curl -s http://localhost:3000/ | jq .
curl -s http://localhost:3000/db-ping | jq .
🗃 ER Diagram (Mermaid)
mermaid
コードをコピーする
erDiagram
  user_table {
    INT id PK
    VARCHAR email "UNIQUE"
    VARCHAR password_hash
    VARCHAR first_name
    VARCHAR last_name
    DATE    birth_date
    TINYINT is_admin
    TIMESTAMP createdAt "NOT NULL, set by NOW() on INSERT"
  }

  flat_table {
    INT id PK
    VARCHAR city
    VARCHAR street_name
    VARCHAR street_number
    INT area_size
    TINYINT has_ac
    INT year_built
    DECIMAL rent_price
    DATE date_available
    INT owner_id FK
    TIMESTAMP createdAt "NOT NULL, set by NOW() on INSERT"
  }

  message_table {
    INT id PK
    TEXT content
    INT flat_id FK
    INT sender_id FK
    TIMESTAMP createdAt "NOT NULL, set by NOW() on INSERT"
  }

  user_table ||--o{ flat_table : "owns (owner_id)"
  user_table ||--o{ message_table : "sends (sender_id)"
  flat_table ||--o{ message_table : "has (flat_id)"