# FITVN_SHEETS_SCHEMA – Legacy fallback

File này chỉ còn dùng khi `DATA_BACKEND=sheets`. Bản v2 mặc định dùng Supabase/PostgreSQL, xem `docs/POSTGRES_SCHEMA.md`.

# FITVN_SHEETS_SCHEMA
## System sheets
System_Config: key, value, updatedAt
Users_Index: userId, email, name, sheetPrefix, role, status, passwordHash, resetTokenHash, resetExpiresAt, createdAt, updatedAt, deletedAt, note
Admin_Actions: actionId, actionType, targetUserId, targetEmail, detail, adminName, createdAt
Sync_Logs: logId, userId, sheetName, actionType, status, errorMessage, retryCount, createdAt, updatedAt
Delete_Requests: requestId, userId, email, deleteType, status, requestedAt, completedAt, note
Exercise_Library: tối thiểu 180 bài tập có metadata chuẩn
Workout_Templates: templateId, sessionsPerWeek, name, split
## User sheets
U_001_Profile, U_001_Measurements, U_001_Assessments, U_001_WorkoutPlans, U_001_WorkoutLogs, U_001_WorkoutSessionEvents, U_001_NutritionLogs, U_001_Notifications, U_001_PendingSync
## Chống ghi đè
Không dùng email làm tên sheet. Backend lấy userId từ JWT, đọc sheetPrefix trong Users_Index, rồi ghi đúng sheet riêng.
