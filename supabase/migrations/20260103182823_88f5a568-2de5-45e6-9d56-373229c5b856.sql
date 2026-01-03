-- Insert video settings for landing page
INSERT INTO public.admin_settings (key, value)
VALUES 
  ('landing_product_video', ''),
  ('landing_review_video', '')
ON CONFLICT (key) DO NOTHING;

-- Add unique constraint on key if not exists
CREATE UNIQUE INDEX IF NOT EXISTS admin_settings_key_unique ON public.admin_settings (key);