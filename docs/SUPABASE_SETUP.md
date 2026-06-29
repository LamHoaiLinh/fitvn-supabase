# Hướng dẫn Supabase/PostgreSQL cho FitVN

## 1. Tạo project
Vào Supabase, tạo project mới, lưu lại database password.

## 2. Lấy connection string
Vào Project Settings → Database → Connection string → URI. Dán vào `DATABASE_URL`.
Ví dụ:
```env
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```
Giữ `PGSSLMODE=require` khi deploy cloud.

## 3. Tạo schema
Mở SQL Editor và chạy:
```sql
-- copy nội dung file supabase/migrations/001_fitvn_schema.sql
```

## 4. Tạo storage bucket ảnh bài tập
Chạy file:
```sql
-- copy nội dung file supabase/migrations/002_storage.sql
```
Bucket `fitvn-exercise-images` là public read để app tải ảnh nhanh. Không cho frontend upload trực tiếp.

## 5. Seed dữ liệu
Sau khi điền `.env.local`:
```bash
npm run db:seed
```
Lệnh này seed `exercise_library` và `workout_templates`.

## 6. Upload 190 ảnh SVG lên Storage nếu cần
```bash
npm run assets:upload
```
Nếu không upload, app vẫn dùng ảnh trong thư mục local `public/exercise-images`.
