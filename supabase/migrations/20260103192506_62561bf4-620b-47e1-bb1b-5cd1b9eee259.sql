
-- Drop existing policy and recreate with new keys
DROP POLICY IF EXISTS "Public can read shop settings" ON admin_settings;

CREATE POLICY "Public can read shop settings" 
ON admin_settings 
FOR SELECT 
USING (key = ANY (ARRAY[
  'shop_name'::text, 
  'shop_logo_url'::text, 
  'favicon_url'::text, 
  'landing_product_video'::text, 
  'landing_review_video'::text, 
  'landing_review_videos'::text,
  'landing_product_price'::text,
  'landing_product_original_price'::text,
  'landing_product_name'::text,
  'phone_number'::text
]));
