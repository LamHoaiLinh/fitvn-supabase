-- Chạy file này trong Supabase SQL Editor nếu muốn quản lý bucket bằng SQL.
-- Bucket public để trình duyệt tải ảnh minh họa nhanh. Không để user upload trực tiếp từ frontend.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fitvn-exercise-images', 'fitvn-exercise-images', true, 1048576, array['image/svg+xml','image/png','image/webp'])
on conflict (id) do update set public=true;

-- Cho phép đọc public. Upload chỉ dùng service role từ script server/local.
drop policy if exists "Public read FitVN exercise images" on storage.objects;
create policy "Public read FitVN exercise images" on storage.objects
for select using (bucket_id = 'fitvn-exercise-images');
