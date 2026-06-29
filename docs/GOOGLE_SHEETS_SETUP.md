# GOOGLE_SHEETS_SETUP
1. Tạo Google Cloud Project.
2. APIs & Services → Library → bật Google Sheets API.
3. Credentials → Create Credentials → Service Account.
4. Tạo key JSON.
5. Lấy `client_email` đưa vào `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Lấy `private_key` đưa vào `GOOGLE_PRIVATE_KEY`, giữ dạng `\n`.
7. Tạo Google Sheet, copy spreadsheet ID vào `GOOGLE_SHEETS_ID`.
8. Share Google Sheet cho service account quyền Editor.
9. Chạy app, đăng ký user đầu tiên để app tự tạo sheet hệ thống và U_001_*.
