# Giới hạn MVP và hướng nâng cấp

## Giới hạn hiện tại
- Ảnh minh họa là SVG vector đồng bộ, chưa phải ảnh chụp/AI render chi tiết từng phase.
- Reset password hiện là token demo trả về API response; production nên tích hợp email thật như Resend/Gmail SMTP.
- Custom auth dùng bcrypt + JWT riêng, chưa dùng Supabase Auth.
- Chưa có realtime multi-device conflict resolution phức tạp.
- Dinh dưỡng mới ở mức macro/calo cơ bản, chưa có database món ăn Việt Nam.

## Nên nâng cấp tiếp
- Chuyển reset password sang email thật.
- Dùng Supabase Storage CDN cho toàn bộ ảnh/video demo.
- Thêm ảnh 3 phase cho từng bài: bắt đầu, giữa động tác, kết thúc.
- Thêm PostgreSQL materialized view cho dashboard nếu log nhiều.
- Thêm rate limit API login/register/reset password.
- Thêm backup tự động database định kỳ.
