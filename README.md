# FitVN – Tư Vấn & Lịch Tập Giảm Cân Cá Nhân v2

Bản nâng cấp dùng **PostgreSQL/Supabase** làm database chính để chịu được lượng workout log/session event lớn hơn Google Sheets. Google Sheets vẫn được giữ trong mã nguồn ở chế độ legacy/fallback qua `DATA_BACKEND=sheets`, nhưng cấu hình mặc định là `DATA_BACKEND=supabase`.

## Công nghệ chính
- Next.js App Router + TypeScript + Tailwind CSS.
- API routes chạy backend trong `app/api/*`, không để secret ở frontend.
- PostgreSQL qua Supabase Database, kết nối server bằng `pg` và `DATABASE_URL`.
- Supabase Storage để lưu/serve ảnh minh họa bài tập nếu muốn đưa asset lên CDN.
- bcrypt để hash mật khẩu user.
- JWT trong cookie httpOnly.
- Zod validate dữ liệu.
- LocalStorage pending queue để người dùng thấy phản hồi ngay khi tập, sau đó sync nền lên API.

## Điểm mới v2
- Thêm schema PostgreSQL trong `supabase/migrations/001_fitvn_schema.sql`.
- Thêm bucket storage trong `supabase/migrations/002_storage.sql`.
- Thêm repository PostgreSQL: `lib/repositories/postgresRepository.ts`.
- Thêm data switch: `lib/dataRepository.ts` chọn `supabase/postgres/sheets` theo `DATA_BACKEND`.
- Thêm 190 file SVG minh họa thật trong `public/exercise-images` tương ứng 190 bài tập seed.
- Workout Mode và Workout Plan hiển thị ảnh minh họa theo `exerciseId`.
- Thêm script seed bài tập/lịch mẫu vào PostgreSQL.
- Thêm script upload ảnh lên Supabase Storage.

## Chạy local nhanh
```bash
npm install
cp .env.example .env.local
# sửa .env.local theo Supabase của bạn
npm run dev
```
Mở `http://localhost:3000`.

## Build production local
```bash
npm install
npm run typecheck
npm run build
npm run start
```

## Setup database Supabase
1. Tạo project Supabase.
2. Vào Project Settings → Database → copy connection string dạng URI, điền vào `DATABASE_URL`.
3. Vào SQL Editor chạy lần lượt:
   - `supabase/migrations/001_fitvn_schema.sql`
   - `supabase/migrations/002_storage.sql`
4. Chạy seed:
```bash
npm run db:seed
```
5. Nếu muốn upload ảnh lên Supabase Storage:
```bash
npm run assets:upload
```
Nếu không upload storage, app vẫn dùng ảnh local trong `public/exercise-images`.

## Cấu hình backend
- Mặc định: `DATA_BACKEND=supabase`.
- Dùng PostgreSQL/Supabase: cần `DATABASE_URL`.
- Dùng lại Google Sheets cũ: đặt `DATA_BACKEND=sheets` và điền Google Sheets env.

## Cảnh báo sức khỏe
FitVN chỉ hỗ trợ tham khảo, không thay thế bác sĩ hoặc huấn luyện viên. Người có bệnh nền, đau ngực, chóng mặt, chấn thương, huyết áp, tim mạch, phụ nữ mang thai hoặc sau sinh nên hỏi chuyên gia trước khi tập.
