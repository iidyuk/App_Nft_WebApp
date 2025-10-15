-- Migration: Setup Storage RLS policies for user-specific folders
-- Created: 2025-10-15 20:38:59
-- Description: Configure Row Level Security policies for images bucket to restrict access to user-specific folders

-- Enable RLS on storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own files
-- ユーザーは自分のフォルダ内のファイルのみ閲覧可能
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can insert files into their own folder
-- ユーザーは自分のフォルダ内にのみファイルをアップロード可能
CREATE POLICY "Users can insert files into their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
-- ユーザーは自分のフォルダ内のファイルのみ更新可能
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
-- ユーザーは自分のフォルダ内のファイルのみ削除可能
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Grant necessary permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Comments for documentation
COMMENT ON POLICY "Users can view their own files" ON storage.objects IS 'Allows authenticated users to view files in their own folder';
COMMENT ON POLICY "Users can insert files into their own folder" ON storage.objects IS 'Allows authenticated users to upload files to their own folder';
COMMENT ON POLICY "Users can update their own files" ON storage.objects IS 'Allows authenticated users to update files in their own folder';
COMMENT ON POLICY "Users can delete their own files" ON storage.objects IS 'Allows authenticated users to delete files from their own folder';

