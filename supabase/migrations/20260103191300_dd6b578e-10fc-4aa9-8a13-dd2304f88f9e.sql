-- Drop existing policy that might conflict
DROP POLICY IF EXISTS "Public can read shop settings" ON public.admin_settings;

-- Create updated policy to include landing_review_videos
CREATE POLICY "Public can read shop settings" 
ON public.admin_settings 
FOR SELECT 
USING (key = ANY (ARRAY['shop_name'::text, 'shop_logo_url'::text, 'favicon_url'::text, 'landing_product_video'::text, 'landing_review_video'::text, 'landing_review_videos'::text]));