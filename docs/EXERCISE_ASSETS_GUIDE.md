# Bộ ảnh minh họa 190 bài tập

## Nội dung
Thư mục `public/exercise-images` có 190 file SVG, mỗi file map theo `exerciseId`, ví dụ:
- `ex_001_squat.svg`
- `ex_065_dumbbell-goblet-squat.svg`
- `ex_096_band-row.svg`
- `ex_115_dead-hang.svg`

Các SVG này là asset vector thật, có tên bài, nhóm cơ, màu phân loại và dáng minh họa theo nhóm động tác. Đây không phải ảnh chụp người thật. Nếu cần ảnh chân thực/photo-realistic cho từng bài, nên làm asset pack riêng theo từng lô 20–30 bài để kiểm tra form chính xác.

## Tái tạo ảnh
```bash
npm run assets:generate
```
Script đọc `data/exercises.seed.ts` và tạo lại toàn bộ SVG.

## Upload lên Supabase Storage
```bash
npm run assets:upload
```
Sau đó public URL có dạng:
```text
https://PROJECT_ID.supabase.co/storage/v1/object/public/fitvn-exercise-images/ex_001_squat.svg
```
