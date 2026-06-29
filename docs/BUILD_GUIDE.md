# Cách build FitVN v2

## Build local trên Windows
1. Cài Node.js LTS.
2. Giải nén ZIP.
3. Mở CMD/PowerShell tại thư mục `fitvn`.
4. Chạy:
```bash
npm install
copy .env.example .env.local
npm run typecheck
npm run build
npm run start
```
5. Mở `http://localhost:3000`.

## Chạy dev
```bash
npm run dev
```

## Lỗi thường gặp
- `Thiếu DATABASE_URL`: chưa điền `.env.local` hoặc đang dùng `DATA_BACKEND=supabase` mà chưa có connection string.
- `password authentication failed`: sai database password Supabase.
- `relation users does not exist`: chưa chạy migration SQL.
- `JWT_SECRET cần tối thiểu 24 ký tự`: đổi secret dài hơn.
- `ADMIN_PASSWORD hoặc ADMIN_PASSWORD_HASH`: cần đặt một trong hai biến.
- Build lỗi native bcrypt trên Windows: chạy lại `npm install`; nếu vẫn lỗi, có thể đổi sang `bcryptjs` ở bản sau.

## Build trên Render
Build command:
```bash
npm install && npm run build
```
Start command:
```bash
npm run start
```
