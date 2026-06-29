# POSTGRES_SCHEMA – FitVN v2

Schema chính nằm ở `supabase/migrations/001_fitvn_schema.sql`.

## Nhóm bảng hệ thống
- `app_config`: cấu hình app.
- `users`: tài khoản, trạng thái, hash mật khẩu, reset token hash.
- `admin_actions`: audit thao tác admin.
- `sync_logs`: log đồng bộ.
- `delete_requests`: lịch sử yêu cầu xóa.
- `exercise_library`: thư viện bài tập JSONB.
- `workout_templates`: mẫu lịch tập JSONB.

## Nhóm bảng user
- `user_profiles`: hồ sơ hiện tại, update theo user.
- `measurements`: lịch sử số đo, luôn append.
- `assessments`: lịch sử đánh giá thể lực.
- `workout_plans`: lịch tập đã sinh.
- `workout_logs`: log hoàn thành/bỏ qua/partial/abandoned.
- `workout_session_events`: event chi tiết theo phiên.
- `nutrition_logs`: log dinh dưỡng cơ bản.
- `notifications`: thông báo cho user.
- `pending_sync`: dữ liệu client giữ lại khi offline/mạng chậm.

## Nguyên tắc chống ghi đè
- Dùng `user_id` làm khóa liên kết.
- Measurement, workout log, session event là append-only theo id riêng.
- Profile hiện tại dùng upsert theo `user_id`, nhưng mỗi lần lưu vẫn append thêm row vào `measurements`.
- Các bảng log có index `(user_id, created_at desc)` để dashboard/admin đọc nhanh.
