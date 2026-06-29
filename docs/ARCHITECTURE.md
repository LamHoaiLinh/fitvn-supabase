# Kiến trúc FitVN v2 – Supabase/PostgreSQL

## Vì sao nâng từ Google Sheets sang PostgreSQL/Supabase
Google Sheets phù hợp MVP gia đình ít dữ liệu, dễ xem và sửa tay. Khi workout logs, session events, pending sync, biểu đồ và admin audit tăng nhanh, Sheets bắt đầu có rủi ro chậm, khó query, khó lọc theo user/session và khó đảm bảo tính toàn vẹn. PostgreSQL phù hợp hơn vì có index, transaction, foreign key, JSONB và truy vấn lớn ổn định.

## Mô hình dữ liệu
- `users`: tài khoản, trạng thái, hash mật khẩu, reset token hash.
- `user_profiles`: hồ sơ hiện tại của user.
- `measurements`: lịch sử số đo, luôn append.
- `assessments`: lịch sử đánh giá thể lực.
- `workout_plans`: lịch tập đã sinh.
- `workout_logs`: log tổng hợp từng bài/buổi.
- `workout_session_events`: event chi tiết trong phiên tập.
- `pending_sync`: hàng đợi dữ liệu client gửi lại khi mạng chậm/mất mạng.
- `admin_actions`, `sync_logs`, `delete_requests`: audit hệ thống.
- `exercise_library`, `workout_templates`: seed bài tập và mẫu lịch.

## Data backend switch
`lib/dataRepository.ts` là lớp chuyển hướng dữ liệu:
- `DATA_BACKEND=supabase` hoặc `postgres`: dùng `lib/repositories/postgresRepository.ts`.
- `DATA_BACKEND=sheets`: dùng Google Sheets legacy.

## Bảo mật
- User password hash bằng bcrypt.
- JWT nằm trong cookie httpOnly.
- `DATABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server/scripts.
- API routes luôn gọi `requireUserSession()` hoặc `requireAdminSession()`.
- Không gọi database trực tiếp từ frontend.

## Ảnh minh họa bài tập
Bản này có 190 SVG nội bộ trong `public/exercise-images`. Đây là asset thật dạng vector, không phải placeholder trống. Nếu muốn CDN, upload lên Supabase Storage bằng `npm run assets:upload`, sau đó có thể dùng `EXERCISE_IMAGES_BASE_URL` để map về bucket public.
