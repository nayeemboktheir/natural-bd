-- Add RLS policy to allow public read of shop settings (favicon, shop_name)
CREATE POLICY "Public can read shop settings" 
ON public.admin_settings 
FOR SELECT 
USING (key = ANY (ARRAY['shop_name'::text, 'shop_logo_url'::text, 'favicon_url'::text, 'landing_product_video'::text, 'landing_review_video'::text]));