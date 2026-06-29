# SYNC_STRATEGY
1. UI optimistic: hiện Center Modal ngay.
2. Lưu vào localStorage pending queue.
3. Gửi `/api/sync` nền.
4. Thành công thì xóa pending.
5. Lỗi thì retry 3 lần.
6. Vẫn lỗi thì giữ pending queue và ghi Sync_Logs.
7. Mở app lại/online lại thì PwaSyncBoot tự flush.
8. Thoát ngang Workout Mode dùng pagehide/beforeunload để lưu partial.
