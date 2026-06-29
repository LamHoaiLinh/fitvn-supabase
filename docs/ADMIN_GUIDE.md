# ADMIN_GUIDE – FitVN v2

Vào `/admin/login`. Admin password lấy từ `ADMIN_PASSWORD_HASH` hoặc `ADMIN_PASSWORD` trong biến môi trường server.

## Chức năng
- Xem danh sách tối đa 20 tài khoản.
- Xem hồ sơ, số đo, assessment, workout plans, workout logs, workout session events và pending sync của từng user từ PostgreSQL.
- Khóa/mở tài khoản.
- Soft delete: đổi trạng thái user sang `soft_deleted`, chặn đăng nhập nhưng còn dữ liệu.
- Hard delete: xóa dữ liệu riêng trong các bảng user-related, sau đó đánh dấu user `deleted`.
- Ghi audit vào bảng `admin_actions`.

## Thông báo giữa màn hình
Sau thao tác admin, app phải hiện Center Modal: “Đã cập nhật tài khoản”, “Đã khoá tài khoản”, “Đã mở khoá tài khoản”, “Đã xoá dữ liệu”, “Không tìm thấy tài khoản”.

## Lưu ý vận hành
Trước hard delete nên export/backup database nếu dữ liệu quan trọng. Với gia đình/người thân, soft delete trước rồi chờ vài ngày là an toàn hơn.
