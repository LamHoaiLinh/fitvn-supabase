# DEPLOY_CHECKLIST – FitVN v2 Supabase/PostgreSQL

## A. Test local trước khi deploy
```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

## B. Supabase
- Tạo Supabase project.
- Copy `DATABASE_URL` dạng URI vào `.env.local` hoặc Render env.
- Chạy `supabase/migrations/001_fitvn_schema.sql` trong SQL Editor.
- Chạy `supabase/migrations/002_storage.sql` nếu muốn dùng Supabase Storage.
- Chạy `npm run db:seed` để seed 190 bài tập và mẫu lịch.
- Chạy `npm run assets:upload` nếu muốn upload 190 SVG lên Storage.

## C. Render
- Push source lên GitHub.
- Tạo Render Web Service từ GitHub repo.
- Runtime Node 22 hoặc bản Node LTS Render hỗ trợ.
- Build command: `npm install && npm run build`.
- Start command: `npm run start`.
- Điền env bắt buộc: `APP_ENV=production`, `APP_URL`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH` hoặc `ADMIN_PASSWORD`, `DATA_BACKEND=supabase`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## D. Test bắt buộc
- Tạo user 1 và user 2, nhập tiến độ khác nhau, dữ liệu không ghi đè.
- User chỉ nhập chiều cao + cân nặng vẫn tính BMI.
- User thiếu vòng cổ/vòng eo vẫn dùng app, chỉ báo chỉ số còn thiếu.
- User đủ dữ liệu tính được BMR/TDEE/% mỡ/macro.
- Tạo workout plan có ảnh minh họa từng bài.
- Workout Mode hiển thị ảnh lớn, timer, voice/tick/còi.
- Bấm “Bài tiếp theo” vì quá mệt, app lưu skip reason vào event/log.
- Tắt tab giữa buổi, app lưu session partial ở localStorage.
- Mở lại app, pending sync tự gửi lại.
- Admin soft delete user, user không đăng nhập được.
- Admin hard delete user, dữ liệu riêng bị xóa khỏi các bảng user-related.
- Tạo user thứ 21 bị từ chối bằng tiếng Việt.
