-- Migration: Sync Storage uploads to images table
-- Created: 2025-10-15 20:57:11
-- Updated: 2025-10-15 21:00:00
-- Description: Automatically sync Storage operations (INSERT/UPDATE/DELETE) with images table

-- =====================================================
-- Function: Handle file uploads (INSERT)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_storage_upload()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_auth_user_id TEXT;
  v_file_name TEXT;
  v_image_path TEXT;
BEGIN
  -- imagesバケットのみを対象
  IF NEW.bucket_id != 'images' THEN
    RETURN NEW;
  END IF;

  -- sample.pngは除外
  IF NEW.name LIKE '%/sample.png' THEN
    RETURN NEW;
  END IF;

  -- ファイルパスから auth_user_id を抽出（パスの最初の部分）
  -- 例: "a1b2c3d4-e5f6-7890-abcd-ef1234567890/20251015-2100_image.jpg"
  v_auth_user_id := split_part(NEW.name, '/', 1);
  
  -- ファイル名を抽出（パスの最後の部分）
  v_file_name := split_part(NEW.name, '/', 2);
  
  -- フルパスを保存
  v_image_path := NEW.name;

  -- auth_user_id から public.users の id を取得
  SELECT id INTO v_user_id
  FROM public.users
  WHERE auth_user_id::text = v_auth_user_id;

  -- ユーザーが見つからない場合はスキップ
  IF v_user_id IS NULL THEN
    RAISE WARNING 'User not found for auth_user_id: %', v_auth_user_id;
    RETURN NEW;
  END IF;

  -- imagesテーブルに挿入
  INSERT INTO public.images (
    user_id,
    image_path,
    file_name,
    file_size,
    mime_type,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_image_path,
    v_file_name,
    (NEW.metadata->>'size')::BIGINT,
    (NEW.metadata->>'mimetype')::TEXT,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生してもアップロード自体は成功させる
    RAISE WARNING 'Error in handle_storage_upload: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: Handle file deletion (DELETE)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_storage_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- imagesバケットのみを対象
  IF OLD.bucket_id != 'images' THEN
    RETURN OLD;
  END IF;

  -- sample.pngは除外
  IF OLD.name LIKE '%/sample.png' THEN
    RETURN OLD;
  END IF;

  -- imagesテーブルから該当レコードを削除
  DELETE FROM public.images
  WHERE image_path = OLD.name;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生しても削除自体は成功させる
    RAISE WARNING 'Error in handle_storage_delete: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: Handle file updates (UPDATE)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_storage_update()
RETURNS TRIGGER AS $$
DECLARE
  v_file_name TEXT;
BEGIN
  -- imagesバケットのみを対象
  IF NEW.bucket_id != 'images' THEN
    RETURN NEW;
  END IF;

  -- sample.pngは除外
  IF NEW.name LIKE '%/sample.png' THEN
    RETURN NEW;
  END IF;

  -- ファイル名を抽出（パスの最後の部分）
  v_file_name := split_part(NEW.name, '/', 2);

  -- imagesテーブルの該当レコードを更新
  UPDATE public.images
  SET 
    image_path = NEW.name,
    file_name = v_file_name,
    file_size = (NEW.metadata->>'size')::BIGINT,
    mime_type = (NEW.metadata->>'mimetype')::TEXT,
    updated_at = NOW()
  WHERE image_path = OLD.name;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生しても更新自体は成功させる
    RAISE WARNING 'Error in handle_storage_update: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: File upload (INSERT)
DROP TRIGGER IF EXISTS on_storage_upload ON storage.objects;
CREATE TRIGGER on_storage_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_upload();

-- Trigger: File deletion (DELETE)
DROP TRIGGER IF EXISTS on_storage_delete ON storage.objects;
CREATE TRIGGER on_storage_delete
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_delete();

-- Trigger: File update (UPDATE)
DROP TRIGGER IF EXISTS on_storage_update ON storage.objects;
CREATE TRIGGER on_storage_update
  AFTER UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_update();

-- =====================================================
-- Permissions
-- =====================================================
GRANT INSERT, UPDATE, DELETE ON public.images TO postgres, service_role;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON FUNCTION public.handle_storage_upload() IS 'Automatically creates a record in images table when a file is uploaded to Storage';
COMMENT ON FUNCTION public.handle_storage_delete() IS 'Automatically deletes a record from images table when a file is deleted from Storage';
COMMENT ON FUNCTION public.handle_storage_update() IS 'Automatically updates a record in images table when a file is updated in Storage';
