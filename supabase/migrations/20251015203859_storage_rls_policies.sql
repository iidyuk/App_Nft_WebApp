-- Migration: Setup RLS policies for Storage and images table
-- Created: 2025-10-15 20:38:59
-- Updated: 2025-10-16
-- Description: Configure Row Level Security policies for Storage bucket and images table

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- Drop existing policies if they exist to ensure idempotency
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert files into their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

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

-- =====================================================
-- RLS Policies for images table
-- =====================================================

-- Enable RLS on images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own images" ON public.images;
DROP POLICY IF EXISTS "Users can insert their own images" ON public.images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.images;

-- Policy: Users can view their own images
CREATE POLICY "Users can view their own images"
ON public.images FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can insert their own images
CREATE POLICY "Users can insert their own images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
ON public.images FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON public.images FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  )
);
